import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { dbService } from './db';
import { airtableService } from './airtable';
import { Message } from '../src/types';

interface ClientMeta {
  ws: WebSocket;
  userId: string;
  userName: string;
  userRole: string;
  activeBookingId?: string;
  isAlive: boolean;
}

const clients = new Map<WebSocket, ClientMeta>();

export function setupChatWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ 
    server, 
    path: '/ws/chat' 
  });

  console.log('📡 Serveur WebSocket Chat instantané MyStay initialisé sur /ws/chat');

  // Heartbeat pour maintenir les connexions actives
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const meta = clients.get(ws);
      if (meta) {
        if (!meta.isAlive) {
          console.log(`[WS] Terminaison connexion inactive (${meta.userName || 'Anonyme'})`);
          clients.delete(ws);
          return ws.terminate();
        }
        meta.isAlive = false;
        ws.ping();
      }
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  wss.on('connection', (ws: WebSocket, req) => {
    const meta: ClientMeta = {
      ws,
      userId: '',
      userName: '',
      userRole: '',
      isAlive: true
    };
    clients.set(ws, meta);

    ws.on('pong', () => {
      const m = clients.get(ws);
      if (m) m.isAlive = true;
    });

    // Envoi du statut initial
    ws.send(JSON.stringify({
      type: 'connection_established',
      timestamp: new Date().toISOString(),
      message: 'Connecté au serveur de messagerie instantanée MyStay'
    }));

    ws.on('message', async (raw) => {
      try {
        const text = raw.toString();
        const payload = JSON.parse(text);

        switch (payload.type) {
          case 'auth': {
            meta.userId = payload.userId || 'usr_guest';
            meta.userName = payload.userName || 'Utilisateur';
            meta.userRole = payload.userRole || 'voyageur';
            meta.isAlive = true;

            // Répondre avec confirmation et liste des utilisateurs connectés
            broadcastPresence();
            ws.send(JSON.stringify({
              type: 'authenticated',
              userId: meta.userId,
              userName: meta.userName,
              onlineUsers: getOnlineUsers()
            }));
            break;
          }

          case 'join_booking': {
            meta.activeBookingId = payload.bookingId;
            meta.isAlive = true;

            // Récupérer et envoyer l'historique complet des messages pour cette réservation
            if (payload.bookingId) {
              const history = await dbService.getMessages(payload.bookingId);
              ws.send(JSON.stringify({
                type: 'messages_history',
                bookingId: payload.bookingId,
                messages: history
              }));
            }
            break;
          }

          case 'leave_booking': {
            if (meta.activeBookingId === payload.bookingId) {
              meta.activeBookingId = undefined;
            }
            break;
          }

          case 'typing': {
            meta.isAlive = true;
            const bookingId = payload.bookingId;
            const isTyping = Boolean(payload.isTyping);

            // Relayer l'indicateur de saisie aux autres clients concernés
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                const targetMeta = clients.get(client);
                if (targetMeta && (!targetMeta.activeBookingId || targetMeta.activeBookingId === bookingId)) {
                  client.send(JSON.stringify({
                    type: 'user_typing',
                    bookingId,
                    userId: meta.userId,
                    userName: meta.userName,
                    userRole: meta.userRole,
                    isTyping
                  }));
                }
              }
            });
            break;
          }

          case 'send_message': {
            meta.isAlive = true;
            const msgData = payload.data as Partial<Message>;
            if (!msgData || !msgData.content || !msgData.bookingId) {
              ws.send(JSON.stringify({ type: 'error', error: 'bookingId et content obligatoires' }));
              return;
            }

            const newMsg: Message = {
              id: msgData.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              bookingId: msgData.bookingId,
              senderId: msgData.senderId || meta.userId || 'usr_guest',
              senderName: msgData.senderName || meta.userName || 'Utilisateur',
              senderRole: (msgData.senderRole || meta.userRole || 'voyageur') as any,
              content: msgData.content.trim(),
              timestamp: msgData.timestamp || new Date().toISOString()
            };

            // Enregistrer dans la base de données (mémoire + synchronisation Supabase)
            const savedMsg = await dbService.createMessage(newMsg);
            airtableService.triggerAutoSync('Messages', savedMsg).catch(() => {});

            console.log(`💬 [WS CHAT] Message de ${savedMsg.senderName} (${savedMsg.senderRole}) sur réservation ${savedMsg.bookingId}: "${savedMsg.content.slice(0, 30)}..."`);

            // Diffuser à TOUS les clients connectés (hôte, voyageur, admin) pour mise à jour instantanée
            const broadcastPayload = JSON.stringify({
              type: 'new_message',
              data: savedMsg
            });

            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(broadcastPayload);
              }
            });
            break;
          }

          case 'ping': {
            meta.isAlive = true;
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
            break;
          }

          default:
            console.log('[WS] Type de message inconnu:', payload.type);
        }
      } catch (err: any) {
        console.error('[WS] Erreur parsing message:', err?.message);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      broadcastPresence();
    });

    ws.on('error', (err) => {
      console.warn('[WS] Erreur socket client:', err?.message);
      clients.delete(ws);
      broadcastPresence();
    });
  });

  function getOnlineUsers() {
    const userMap = new Map<string, { userId: string; userName: string; userRole: string }>();
    clients.forEach((meta) => {
      if (meta.userId) {
        userMap.set(meta.userId, {
          userId: meta.userId,
          userName: meta.userName,
          userRole: meta.userRole
        });
      }
    });
    return Array.from(userMap.values());
  }

  function broadcastPresence() {
    const online = getOnlineUsers();
    const payload = JSON.stringify({
      type: 'presence',
      onlineUsers: online,
      count: online.length
    });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  return wss;
}
