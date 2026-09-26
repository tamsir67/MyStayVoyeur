import { Message } from '../types';

export interface TypingEvent {
  bookingId: string;
  userId: string;
  userName: string;
  userRole?: string;
  isTyping: boolean;
}

export interface OnlineUser {
  userId: string;
  userName: string;
  userRole: string;
}

type MessageHandler = (message: Message) => void;
type HistoryHandler = (bookingId: string, messages: Message[]) => void;
type TypingHandler = (event: TypingEvent) => void;
type PresenceHandler = (users: OnlineUser[]) => void;
type StatusHandler = (isConnected: boolean) => void;

class ChatSocketClient {
  private ws: WebSocket | null = null;
  private currentUser: { id: string; name: string; role: string } | null = null;
  private activeBookingId: string | null = null;
  private isExplicitlyClosed = false;
  private reconnectTimeout: any = null;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 10000;

  // Listeners
  private messageListeners = new Set<MessageHandler>();
  private historyListeners = new Set<HistoryHandler>();
  private typingListeners = new Set<TypingHandler>();
  private presenceListeners = new Set<PresenceHandler>();
  private statusListeners = new Set<StatusHandler>();

  public isConnected = false;

  public connect(user: { id: string; name: string; role: string }) {
    this.currentUser = user;
    this.isExplicitlyClosed = false;

    // Si déjà connecté avec le même utilisateur, simplement renvoyer l'auth
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        type: 'auth',
        userId: user.id,
        userName: user.name,
        userRole: user.role
      });
      return;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.initSocket();
  }

  private initSocket() {
    if (typeof window === 'undefined') return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws/chat`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyStatus(true);

        // Envoyer authentification
        if (this.currentUser) {
          this.send({
            type: 'auth',
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            userRole: this.currentUser.role
          });
        }

        // Rejoindre la réservation active si existante
        if (this.activeBookingId) {
          this.send({
            type: 'join_booking',
            bookingId: this.activeBookingId
          });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.handleIncoming(payload);
        } catch (e) {
          console.warn('[WS Client] Parsing message error:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.notifyStatus(false);
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[WS Client] Erreur WebSocket:', err);
        this.isConnected = false;
        this.notifyStatus(false);
      };
    } catch (e) {
      console.warn('[WS Client] Impossible d’établir la connexion WebSocket:', e);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.isExplicitlyClosed || !this.currentUser) return;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      if (!this.isConnected && !this.isExplicitlyClosed) {
        this.initSocket();
      }
    }, delay);
  }

  private handleIncoming(payload: any) {
    switch (payload.type) {
      case 'new_message': {
        const msg = payload.data as Message;
        this.messageListeners.forEach(listener => listener(msg));
        break;
      }

      case 'messages_history': {
        const bookingId = payload.bookingId as string;
        const messages = (payload.messages || []) as Message[];
        this.historyListeners.forEach(listener => listener(bookingId, messages));
        break;
      }

      case 'user_typing': {
        const typingEvent: TypingEvent = {
          bookingId: payload.bookingId,
          userId: payload.userId,
          userName: payload.userName,
          userRole: payload.userRole,
          isTyping: Boolean(payload.isTyping)
        };
        this.typingListeners.forEach(listener => listener(typingEvent));
        break;
      }

      case 'presence': {
        const online = (payload.onlineUsers || []) as OnlineUser[];
        this.presenceListeners.forEach(listener => listener(online));
        break;
      }

      case 'authenticated': {
        if (payload.onlineUsers) {
          this.presenceListeners.forEach(listener => listener(payload.onlineUsers));
        }
        break;
      }

      case 'pong':
        break;
    }
  }

  public joinBooking(bookingId: string) {
    this.activeBookingId = bookingId;
    this.send({
      type: 'join_booking',
      bookingId
    });
  }

  public leaveBooking(bookingId: string) {
    if (this.activeBookingId === bookingId) {
      this.activeBookingId = null;
    }
    this.send({
      type: 'leave_booking',
      bookingId
    });
  }

  public sendMessage(data: Partial<Message>) {
    this.send({
      type: 'send_message',
      data
    });
  }

  public sendTyping(bookingId: string, isTyping: boolean) {
    this.send({
      type: 'typing',
      bookingId,
      isTyping
    });
  }

  public disconnect() {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.notifyStatus(false);
  }

  // Event subscription helpers
  public onMessage(handler: MessageHandler) {
    this.messageListeners.add(handler);
    return () => this.messageListeners.delete(handler);
  }

  public onHistory(handler: HistoryHandler) {
    this.historyListeners.add(handler);
    return () => this.historyListeners.delete(handler);
  }

  public onTyping(handler: TypingHandler) {
    this.typingListeners.add(handler);
    return () => this.typingListeners.delete(handler);
  }

  public onPresence(handler: PresenceHandler) {
    this.presenceListeners.add(handler);
    return () => this.presenceListeners.delete(handler);
  }

  public onStatus(handler: StatusHandler) {
    this.statusListeners.add(handler);
    return () => this.statusListeners.delete(handler);
  }

  private notifyStatus(connected: boolean) {
    this.statusListeners.forEach(listener => listener(connected));
  }

  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

export const chatSocketClient = new ChatSocketClient();
