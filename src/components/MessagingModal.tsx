import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, Send, MessageSquare, ShieldCheck, User, Wifi, WifiOff, 
  Sparkles, CheckCheck, Clock, Key, MapPin, Coffee, Info, ChevronRight
} from 'lucide-react';

export const MessagingModal: React.FC = () => {
  const { 
    activeChatBookingId, setActiveChatBookingId, bookings, 
    messages, sendMessage, currentUser, isChatWsConnected,
    onlineUsers, typingUsers, sendTyping
  } = useApp();

  const [inputContent, setInputContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Auto-scroll to bottom whenever messages or active conversation changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChatBookingId]);

  if (!activeChatBookingId) return null;

  // Conversations auxquelles l'utilisateur participe
  const myConversations = bookings.filter(b => 
    b.travelerId === currentUser.id || b.hostId === currentUser.id || currentUser.role === 'admin'
  );

  const currentBooking = bookings.find(b => b.id === activeChatBookingId);
  if (!currentBooking) return null;

  const chatMessages = messages.filter(m => m.bookingId === activeChatBookingId);

  const isCurrentUserHost = currentUser.id === currentBooking.hostId;
  const interlocutorName = isCurrentUserHost ? currentBooking.travelerName : currentBooking.hostName;
  const interlocutorId = isCurrentUserHost ? currentBooking.travelerId : currentBooking.hostId;
  const interlocutorRoleLabel = isCurrentUserHost ? 'Voyageur MyStay' : 'Hôte Rural Certifié';

  // Vérifier si l'interlocuteur est actuellement connecté via WebSocket
  const isInterlocutorOnline = onlineUsers.some(u => 
    u.userId === interlocutorId || u.userName.toLowerCase() === interlocutorName.toLowerCase()
  );

  // Vérifier si l'interlocuteur est en train d'écrire
  const currentTyping = typingUsers[activeChatBookingId];
  const isInterlocutorTyping = currentTyping && currentTyping.userId !== currentUser.id && currentTyping.isTyping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputContent(e.target.value);

    // Émettre indicateur de frappe en direct
    sendTyping(activeChatBookingId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(activeChatBookingId, false);
    }, 1500);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    sendTyping(activeChatBookingId, false);

    sendMessage(activeChatBookingId, inputContent);
    setInputContent('');
  };

  const handleQuickInsert = (text: string) => {
    sendMessage(activeChatBookingId, text);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        id="messaging-modal-container"
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col md:flex-row h-[680px] max-h-[92vh] my-auto"
      >
        
        {/* Left Column: List of conversations (desktop) */}
        <div className="hidden md:flex flex-col w-72 border-r border-stone-200 bg-[#FAF9F5] shrink-0">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#243E36]" />
              <h2 className="font-serif font-bold text-sm text-stone-900">Messagerie Instantanée</h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {myConversations.length} fil{myConversations.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {myConversations.length === 0 ? (
              <div className="p-4 text-xs text-stone-400 text-center">
                Aucune conversation active.
              </div>
            ) : (
              myConversations.map(conv => {
                const isSelected = conv.id === activeChatBookingId;
                const isHost = currentUser.id === conv.hostId;
                const otherName = isHost ? conv.travelerName : conv.hostName;
                const convMsgs = messages.filter(m => m.bookingId === conv.id);
                const lastMsg = convMsgs[convMsgs.length - 1];

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveChatBookingId(conv.id)}
                    className={`w-full text-left p-3.5 flex items-center gap-3 transition cursor-pointer ${
                      isSelected ? 'bg-white shadow-xs border-l-4 border-[#243E36]' : 'hover:bg-stone-100/70'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-[#243E36] text-white flex items-center justify-center font-bold text-sm">
                        {otherName.charAt(0)}
                      </div>
                      {onlineUsers.some(u => u.userId === (isHost ? conv.travelerId : conv.hostId)) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-900 truncate">{otherName}</span>
                        {lastMsg && (
                          <span className="text-[9px] text-stone-400">
                            {new Date(lastMsg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">{conv.listingTitle}</p>
                      {lastMsg && (
                        <p className="text-[10px] text-stone-400 truncate mt-0.5">
                          {lastMsg.senderId === currentUser.id ? 'Vous: ' : ''}{lastMsg.content}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Quick tester helper */}
          <div className="p-3 bg-amber-50/70 border-t border-amber-200/60 text-[10px] text-amber-900 leading-tight">
            💡 <strong>Test temps réel :</strong> Basculez entre Voyageur et Hôte via le menu en haut à droite pour tester l'échange direct !
          </div>
        </div>

        {/* Right Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-stone-200 bg-[#FAF9F5] flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-[#243E36] text-white flex items-center justify-center font-bold text-base shadow-xs">
                  {interlocutorName.charAt(0)}
                </div>
                <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  isInterlocutorOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'
                }`} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-stone-900 truncate">
                    {interlocutorName}
                  </h3>
                  <span className="text-[10px] font-semibold bg-[#243E36]/10 text-[#243E36] px-2 py-0.5 rounded-full">
                    {interlocutorRoleLabel}
                  </span>
                  <span className={`text-[10px] font-medium flex items-center gap-1 ${
                    isInterlocutorOnline ? 'text-emerald-700' : 'text-stone-400'
                  }`}>
                    {isInterlocutorOnline ? '🟢 En direct' : '⚪ Hors-ligne'}
                  </span>
                </div>

                <p className="text-[11px] text-stone-500 truncate">
                  🏡 {currentBooking.listingTitle} ({currentBooking.listingCommune})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                {isChatWsConnected ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-800 font-bold">WebSocket Connecté</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-600" />
                    <span>Reconnexion...</span>
                  </>
                )}
              </div>

              <button
                id="close-messaging-modal-btn"
                onClick={() => setActiveChatBookingId(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                title="Fermer la boîte de dialogue"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Security & Charter Reminder */}
          <div className="bg-amber-50/80 px-4 py-2 border-b border-amber-200/60 text-[11px] text-amber-900 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="truncate">Messagerie directe sécurisée MyStay • Coordonnées débloquées pour ce séjour.</span>
            </div>
            {currentBooking.accessCode && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-white px-2 py-0.5 rounded border border-amber-200 font-mono font-bold text-[#243E36]">
                <Key className="w-3 h-3 text-amber-700" /> Code : {currentBooking.accessCode}
              </span>
            )}
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-4 py-2 bg-[#FAF9F5]/70 border-b border-stone-100 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" /> Réponses rapides :
            </span>
            {isCurrentUserHost ? (
              <>
                <button
                  type="button"
                  onClick={() => handleQuickInsert(`Bonjour ! Bienvenue au gîte. Accueil possible dès 16h00. Code boîte à clés : ${currentBooking.accessCode || '7492'}.`)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:border-[#243E36] hover:bg-stone-50 text-stone-700 whitespace-nowrap transition cursor-pointer"
                >
                  🔑 Code & heure d'arrivée
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickInsert("Bonjour ! Avez-vous besoin d'indications particulières pour l'itinéraire jusqu'au domaine ?")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:border-[#243E36] hover:bg-stone-50 text-stone-700 whitespace-nowrap transition cursor-pointer"
                >
                  📍 Itinéraire d'accès
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickInsert("Nous avons préparé un panier de bienvenue avec des produits bio du terroir local. Au plaisir de vous accueillir !")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:border-[#243E36] hover:bg-stone-50 text-stone-700 whitespace-nowrap transition cursor-pointer"
                >
                  🧺 Panier terroir
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleQuickInsert("Bonjour ! Nous prévoyons d'arriver vers 17h30. Est-ce que cette heure vous convient ?")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:border-[#243E36] hover:bg-stone-50 text-stone-700 whitespace-nowrap transition cursor-pointer"
                >
                  ⏱️ Arrivée vers 17h30
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickInsert("Bonjour ! Pouvez-vous nous confirmer où stationner notre véhicule à proximité du gîte ?")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:border-[#243E36] hover:bg-stone-50 text-stone-700 whitespace-nowrap transition cursor-pointer"
                >
                  🚗 Stationnement
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickInsert("Bonjour ! Avez-vous de bonnes recommandations de sentiers de randonnée ou de producteurs locaux à proximité ?")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:border-[#243E36] hover:bg-stone-50 text-stone-700 whitespace-nowrap transition cursor-pointer"
                >
                  🥾 Conseils randos & terroir
                </button>
              </>
            )}
          </div>

          {/* Message Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF9F5]/40">
            {chatMessages.length === 0 ? (
              <div className="text-center text-xs text-stone-400 py-16 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="font-semibold text-stone-600">Aucun message pour l'instant</p>
                <p className="max-w-xs mx-auto text-[11px]">
                  Envoyez un premier message pour organiser les détails pratiques de votre séjour en toute simplicité.
                </p>
              </div>
            ) : (
              chatMessages.map(msg => {
                const isMine = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} transition-all`}
                  >
                    <div className="text-[10px] text-stone-400 mb-1 px-1 flex items-center gap-1.5">
                      <span className="font-semibold text-stone-600">{msg.senderName}</span>
                      <span>•</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMine && <CheckCheck className="w-3 h-3 text-[#243E36]" />}
                    </div>

                    <div
                      className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                        isMine
                          ? 'bg-[#243E36] text-white rounded-br-xs'
                          : 'bg-white text-stone-900 border border-stone-200 rounded-bl-xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}

            {/* Live Typing indicator */}
            {isInterlocutorTyping && (
              <div className="flex items-center gap-2 text-xs text-stone-500 italic py-1 animate-pulse">
                <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-[10px] font-bold">
                  {interlocutorName.charAt(0)}
                </div>
                <span>{interlocutorName} est en train d'écrire...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form 
            onSubmit={handleSend} 
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              id="instant-chat-input"
              type="text"
              value={inputContent}
              onChange={handleInputChange}
              placeholder={`Écrivez votre message à ${interlocutorName}...`}
              className="flex-1 text-xs p-3 rounded-2xl border border-stone-200 outline-none focus:border-[#243E36] focus:ring-2 focus:ring-[#243E36]/20 bg-[#FAF9F5]/50 transition"
              autoFocus
            />
            <button
              id="send-instant-message-btn"
              type="submit"
              disabled={!inputContent.trim()}
              className="p-3 rounded-2xl bg-[#243E36] hover:bg-[#1B2F29] text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-md flex items-center justify-center shrink-0"
              title="Envoyer instantanément (Entrée)"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
