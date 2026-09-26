import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageCircle, X, Send, RotateCcw, Sparkles, 
  ChevronRight, Shield, Video, Camera, Home, 
  Leaf, Train, Phone, CheckCircle2, HeartHandshake,
  Volume2, VolumeX, ExternalLink, HelpCircle
} from 'lucide-react';

interface BotMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  topicId?: string;
  quickActions?: { label: string; actionType: 'navigate' | 'modal' | 'topic'; payload?: string }[];
}

interface PredefinedTopic {
  id: string;
  title: string;
  iconName: 'home' | 'video' | 'camera' | 'shield' | 'leaf' | 'train' | 'phone' | 'help';
  botReply: string;
  actions?: { label: string; actionType: 'navigate' | 'modal' | 'topic'; payload?: string }[];
}

const PREDEFINED_TOPICS: PredefinedTopic[] = [
  {
    id: 'deposer_annonce',
    title: '🏡 Déposer une annonce rurale',
    iconName: 'home',
    botReply: `Pour inscrire un hébergement sur MyStay, voici les étapes clés :\n\n1. **Éligibilité Terroir** : Votre gîte doit être situé dans une commune rurale (sélectionnable dans la liste synchronisée par région ou saisie personnalisée).\n2. **Charte Éco-responsable** : Vous devez valider au moins **3 pratiques durables** (énergie verte, tri/compost, circuits courts, gestion de l'eau, etc.).\n3. **Photos & Vidéos** : Vous pouvez intégrer vos photos et désormais ajouter un **lien vidéo de présentation** (YouTube, Vimeo ou fichier MP4) pour sublimer votre domaine !\n4. **Frais équitables** : Commission de 12% seulement pour financer le circuit éco-touristique.`,
    actions: [
      { label: 'Ouvrir l’Espace Hôte', actionType: 'navigate', payload: 'host' },
      { label: 'Voir comment ajouter une vidéo', actionType: 'topic', payload: 'video_annonce' }
    ]
  },
  {
    id: 'video_annonce',
    title: '🎥 Ajouter une vidéo à un gîte',
    iconName: 'video',
    botReply: `Vous pouvez désormais enrichir chaque annonce d'une vidéo immersive de découverte !\n\n• **Dans le formulaire de dépôt (Étape 4 - Photos & Médias)** : un champ dédié vous permet de renseigner un lien **YouTube, Vimeo ou une vidéo MP4/WebM**, ou même d'importer un fichier direct depuis votre appareil.\n• **Visibilité maximale** : Un lecteur vidéo fluide est intégré sur la fiche détaillée avec un onglet dédié "Visite Vidéo", et un badge "Visite Vidéo" apparaît sur la carte de recherche pour attirer plus de voyageurs.`,
    actions: [
      { label: 'Accéder au formulaire d’annonce', actionType: 'navigate', payload: 'host' },
      { label: 'Autre question sur les annonces', actionType: 'topic', payload: 'deposer_annonce' }
    ]
  },
  {
    id: 'photo_profil',
    title: '📸 Photo de profil & Inscription',
    iconName: 'camera',
    botReply: `Personnalisez votre présence sur MyStay dès votre inscription :\n\n• **Fiche d'inscription** : Vous pouvez cliquer sur "Parcourir..." pour charger votre propre photo (JPG, PNG ou WebP jusqu'à 5 Mo), ou coller l'URL de votre choix.\n• **Avatars présélectionnés** : Vous pouvez également sélectionner en 1 clic un avatar de la communauté, comme le profil voyageur de Ba Tamsir !\n• **Protection RGPD** : Vos photos de profil et données personnelles sont strictement confidentielles, hébergées en Europe et protégées selon la loi européenne RGPD (Règlement UE 2016/679).`,
    actions: [
      { label: 'S’inscrire / Se connecter', actionType: 'modal', payload: 'auth' },
      { label: 'En savoir plus sur le RGPD', actionType: 'topic', payload: 'rgpd_protection' }
    ]
  },
  {
    id: 'rgpd_protection',
    title: '🛡️ Protection des données & RGPD',
    iconName: 'shield',
    botReply: `Sur MyStay, la protection de votre vie privée est une priorité absolue :\n\n• **Conformité stricte au RGPD (Règlement UE 2016/679)** : Vos informations personnelles, documents d'identité, coordonnées et photos de profil sont rigoureusement protégés.\n• **Souveraineté européenne** : Toutes vos données sont hébergées sur des serveurs sécurisés situés dans l'Union Européenne.\n• **Zéro revente commerciale** : Nous ne cédons ni ne vendons jamais vos données à des régies publicitaires ou tiers.\n• **Vos droits** : Vous bénéficiez d'un droit d'accès, de rectification, de portabilité et à l'oubli à tout moment auprès de notre DPO (dpo@mystay-rural.fr).`,
    actions: [
      { label: 'Lire les mentions du Footer', actionType: 'modal', payload: 'rgpd' },
      { label: 'Poser une autre question', actionType: 'topic', payload: 'menu' }
    ]
  },
  {
    id: 'reservation_paiement',
    title: '💳 Réservation & Paiement sécurisé',
    iconName: 'leaf',
    botReply: `Tout est pensé pour un séjour serein et transparent :\n\n• **Modes de réservation** : Instantanée (confirmation immédiate) ou Sur demande (réponse de l'hôte sous 24h).\n• **Paiement Stripe** : Chiffrement bancaire SSL/TLS aux normes bancaires européennes. Aucun numéro de carte n'est stocké sur nos serveurs.\n• **Rémunération juste** : 88% du montant est directement versé aux propriétaires des gîtes et terroirs ruraux.\n• **Calcul d'impact** : Vous visualisez les kg de CO₂ économisés par rapport à une nuitée hôtelière conventionnelle.`,
    actions: [
      { label: 'Explorer les gîtes', actionType: 'navigate', payload: 'explore' },
      { label: 'Mobilité douce & trains', actionType: 'topic', payload: 'mobilite_douce' }
    ]
  },
  {
    id: 'mobilite_douce',
    title: '🚲 Mobilité douce & Gares rurales',
    iconName: 'train',
    botReply: `Favoriser les voyages bas carbone fait partie de l'ADN de MyStay :\n\n• **Accès train** : Chaque hébergement indique la gare SNCF la plus proche (Florac, Mende, Villefort, etc.).\n• **Navette assurée par l'hôte** : Nombreux sont les hôtes qui proposent gracieusement de venir vous chercher à la gare rurale.\n• **Sur place** : Vélos à assistance électrique mis à disposition ou sentiers de randonnée (GR/PR) au départ direct du gîte.`,
    actions: [
      { label: 'Voir la carte des gîtes', actionType: 'navigate', payload: 'map' },
      { label: 'Charte écologique', actionType: 'topic', payload: 'charte_durabilite' }
    ]
  },
  {
    id: 'charte_durabilite',
    title: '🌿 Critères éco-responsables',
    iconName: 'leaf',
    botReply: `Pour figurer sur MyStay, un gîte doit justifier d'au moins 3 engagements vérifiés :\n\n1. **Tri sélectif & compostage autonome**\n2. **Énergie 100% renouvelable / chauffe-eau solaire**\n3. **Gestion sobre de l'eau (récupérateurs de pluie)**\n4. **Panier du terroir & permaculture locale**\n5. **Mobilité douce & prêt de vélos**\n6. **Refuge biodiversité (convention LPO)**`,
    actions: [
      { label: 'Déposer mon gîte engagé', actionType: 'navigate', payload: 'host' }
    ]
  },
  {
    id: 'contact_humain',
    title: '📞 Parler à un conseiller MyStay',
    iconName: 'phone',
    botReply: `Notre équipe humaine est à votre écoute depuis notre antenne rurale en Lozère :\n\n• **Téléphone** : +33 4 66 45 00 12 (du lundi au vendredi, 9h - 18h)\n• **Email support** : contact@mystay-rural.fr\n• **Adresse** : Antenne MyStay Terroirs, 48400 Florac Trois Rivières, Parc National des Cévennes\n• **Messagerie interne** : Échangez en direct avec vos hôtes et le support dans votre espace compte.`,
    actions: [
      { label: 'Ouvrir la messagerie', actionType: 'modal', payload: 'messages' },
      { label: 'Retour au menu d’aide', actionType: 'topic', payload: 'menu' }
    ]
  }
];

export const KumbaBot: React.FC = () => {
  const { setActiveView, openAuthModal, currentUser, bookings, setActiveChatBookingId } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState<BotMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: `👋 Bonjour ! Je suis **Kumba**, votre assistant virtuel MyStay pour le tourisme rural éco-responsable.\n\nComment puis-je vous aider aujourd'hui ? Choisissez un thème ci-dessous ou écrivez-moi directement votre question !`,
      timestamp: 'À l’instant'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [isOpen, messages, isTyping]);

  const handleSelectTopic = (topicId: string) => {
    if (topicId === 'menu') {
      triggerBotReply(`Voici l'ensemble des thématiques où je peux vous guider :`, undefined, true);
      return;
    }

    const topic = PREDEFINED_TOPICS.find(t => t.id === topicId);
    if (!topic) return;

    // Add user question message
    const userMsg: BotMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: topic.title,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate Joonbot conversational delay
    setTimeout(() => {
      const botMsg: BotMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: topic.botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        topicId: topic.id,
        quickActions: topic.actions
      };
      setIsTyping(false);
      setMessages(prev => [...prev, botMsg]);
    }, 450);
  };

  const triggerBotReply = (text: string, actions?: BotMessage['quickActions'], isReturnMenu = false) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botMsg: BotMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: actions
      };
      setMessages(prev => [...prev, botMsg]);
    }, 400);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputText.trim();
    if (!query) return;

    const userMsg: BotMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const q = query.toLowerCase();

    setTimeout(() => {
      setIsTyping(false);

      // Intelligent keyword matching for Joonbot responses
      let matchedTopic: PredefinedTopic | undefined;

      if (q.includes('vidéo') || q.includes('video') || q.includes('film') || q.includes('mp4') || q.includes('youtube') || q.includes('vimeo')) {
        matchedTopic = PREDEFINED_TOPICS.find(t => t.id === 'video_annonce');
      } else if (q.includes('photo') || q.includes('avatar') || q.includes('profil') || q.includes('image') || q.includes('ba tamsir') || q.includes('inscription') || q.includes('compte')) {
        matchedTopic = PREDEFINED_TOPICS.find(t => t.id === 'photo_profil');
      } else if (q.includes('rgpd') || q.includes('donnée') || q.includes('donnee') || q.includes('privacy') || q.includes('loi') || q.includes('europe') || q.includes('cnil') || q.includes('securit') || q.includes('sécurit')) {
        matchedTopic = PREDEFINED_TOPICS.find(t => t.id === 'rgpd_protection');
      } else if (q.includes('déposer') || q.includes('deposer') || q.includes('annonce') || q.includes('hôte') || q.includes('hote') || q.includes('commune') || q.includes('region') || q.includes('région') || q.includes('publier')) {
        matchedTopic = PREDEFINED_TOPICS.find(t => t.id === 'deposer_annonce');
      } else if (q.includes('réserver') || q.includes('reserver') || q.includes('paiement') || q.includes('carte') || q.includes('stripe') || q.includes('prix') || q.includes('co2')) {
        matchedTopic = PREDEFINED_TOPICS.find(t => t.id === 'reservation_paiement');
      } else if (q.includes('train') || q.includes('gare') || q.includes('vélo') || q.includes('velo') || q.includes('navette') || q.includes('transport') || q.includes('mobilit')) {
        matchedTopic = PREDEFINED_TOPICS.find(t => t.id === 'mobilite_douce');
      } else if (q.includes('charte') || q.includes('ecolo') || q.includes('écolo') || q.includes('critere') || q.includes('critère') || q.includes('durab') || q.includes('label')) {
        matchedTopic = PREDEFINED_TOPICS.find(t => t.id === 'charte_durabilite');
      } else if (q.includes('contact') || q.includes('telephone') || q.includes('téléphone') || q.includes('humain') || q.includes('aide') || q.includes('parler') || q.includes('equipe') || q.includes('équipe')) {
        matchedTopic = PREDEFINED_TOPICS.find(t => t.id === 'contact_humain');
      }

      if (matchedTopic) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: matchedTopic.botReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            topicId: matchedTopic.id,
            quickActions: matchedTopic.actions
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: `Je comprends votre question concernant "${query}". Pour vous apporter l'information la plus précise, voici nos principaux domaines d'assistance :`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            quickActions: [
              { label: '🏡 Déposer une annonce', actionType: 'topic', payload: 'deposer_annonce' },
              { label: '🎥 Ajouter une vidéo', actionType: 'topic', payload: 'video_annonce' },
              { label: '📸 Photo & Inscription', actionType: 'topic', payload: 'photo_profil' },
              { label: '🛡️ Données & RGPD', actionType: 'topic', payload: 'rgpd_protection' },
              { label: '📞 Joindre un conseiller', actionType: 'topic', payload: 'contact_humain' }
            ]
          }
        ]);
      }
    }, 450);
  };

  const handleActionClick = (action: { label: string; actionType: string; payload?: string }) => {
    if (action.actionType === 'topic' && action.payload) {
      handleSelectTopic(action.payload);
    } else if (action.actionType === 'navigate' && action.payload) {
      setActiveView(action.payload as any);
      setIsOpen(false);
    } else if (action.actionType === 'modal') {
      if (action.payload === 'auth') {
        openAuthModal('signup');
        setIsOpen(false);
      } else if (action.payload === 'messages') {
        if (bookings && bookings.length > 0) {
          setActiveChatBookingId(bookings[0].id);
        } else {
          setActiveView('my_trips');
        }
        setIsOpen(false);
      } else if (action.payload === 'rgpd') {
        // Scroll to footer RGPD
        const footer = document.querySelector('footer');
        if (footer) {
          footer.scrollIntoView({ behavior: 'smooth' });
        }
        setIsOpen(false);
      }
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: `msg_${Date.now()}`,
        sender: 'bot',
        text: `Conversation réinitialisée. Bonjour, je suis Kumba ! Comment puis-je vous accompagner aujourd'hui sur MyStay ?`,
        timestamp: 'À l’instant'
      }
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {!isOpen && (
          <div className="mb-3 hidden sm:flex items-center gap-2 bg-stone-900/95 text-white px-3.5 py-2 rounded-2xl shadow-xl border border-stone-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium">Une question ? <strong>Kumba</strong> est en ligne</span>
            <button
              onClick={() => setHasUnread(false)}
              className="text-stone-400 hover:text-stone-200 ml-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <button
          id="btn-open-kumbabot"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#243E36] to-[#1a2e28] text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-[#A3E5C8]/40 cursor-pointer"
          title="Discuter avec Kumba (Assistant MyStay)"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-[#A3E5C8]" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#243E36] rounded-full" />
            </div>
          )}

          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-black animate-bounce">
              1
            </span>
          )}
        </button>
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div 
          id="kumba-chat-window"
          className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-md h-[550px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#243E36] to-[#2e5045] text-white p-4 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs border border-[#A3E5C8]/30 flex items-center justify-center text-[#A3E5C8] font-bold text-lg shadow-inner">
                  🌿
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#243E36] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight">Kumba</h3>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-1.5 py-0.2 rounded-full font-semibold">
                    Joonbot MyStay
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/80 leading-tight">
                  Guide éco-tourisme & terroirs ruraux
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                className="p-1.5 rounded-lg hover:bg-white/15 text-emerald-100 transition cursor-pointer"
                title="Recommencer la discussion"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/15 text-emerald-100 transition cursor-pointer"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-banner: RGPD & Protection Reminder */}
          <div className="bg-emerald-50/90 border-b border-emerald-100 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-emerald-900">
            <span className="flex items-center gap-1 font-medium">
              <Shield className="w-3 h-3 text-emerald-700 shrink-0" />
              <span>Conforme RGPD • Données protégées UE</span>
            </span>
            <button
              type="button"
              onClick={() => handleSelectTopic('rgpd_protection')}
              className="text-[10px] underline hover:text-emerald-950 cursor-pointer font-semibold"
            >
              En savoir plus
            </button>
          </div>

          {/* Messages Flow */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-[#243E36] text-white rounded-br-xs'
                      : 'bg-white text-stone-800 border border-stone-200 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Quick Action buttons associated with bot reply */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 max-w-[90%]">
                    {msg.quickActions.map((act, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleActionClick(act)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition cursor-pointer shadow-2xs"
                      >
                        <span>{act.label}</span>
                        <ChevronRight className="w-3 h-3 text-emerald-700" />
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-stone-400 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-stone-500 bg-white border border-stone-200 px-3 py-2 rounded-2xl w-fit shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-stone-500 ml-1 font-medium">Kumba formule sa réponse...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Choice Buttons Carousel (Joonbot style) */}
          <div className="p-2.5 bg-white border-t border-stone-200 space-y-2">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider px-1 flex items-center justify-between">
              <span>Suggestions rapides :</span>
              <span className="text-emerald-800 font-semibold">1 clic</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {PREDEFINED_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(topic.id)}
                  className="shrink-0 text-left text-[11px] font-medium px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-950 transition cursor-pointer shadow-2xs"
                >
                  {topic.title}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 pt-1">
              <input
                id="kumbabot-input-query"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Posez votre question à Kumba..."
                className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition"
              />
              <button
                id="btn-send-kumbabot"
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-[#243E36] hover:bg-[#1a2e28] disabled:opacity-40 text-white rounded-xl transition cursor-pointer shadow-xs shrink-0"
                title="Envoyer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
