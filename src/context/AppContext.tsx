import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Listing, Booking, Review, Message, AuditLog, MakeScenarioExecution, 
  FilterOptions, MyStayLabel, ListingStatus, UserRole, BookingStatus, 
  ActiveView, NotificationInfo, PlatformSettings, EmailAuthReceipt 
} from '../types';
import { 
  MOCK_USERS, MOCK_LISTINGS, MOCK_BOOKINGS, MOCK_REVIEWS, 
  MOCK_MESSAGES, MOCK_AUDIT_LOGS, INITIAL_MAKE_EXECUTIONS, DEFAULT_PLATFORM_SETTINGS,
  baTamsirAvatar
} from '../mockData';
import { apiService } from '../services/api';
import { chatSocketClient, OnlineUser } from '../services/chatSocketClient';
import { safeStorage } from '../utils/safeStorage';

function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
}

interface AppContextType {
  currentUser: User;
  switchRole: (role: UserRole) => void;
  setUser: (user: User) => void;

  // Profil Utilisateur Modal & Avatar
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
  resetBaTamsirAvatar: () => void;

  // Airtable Sync Modal
  isAirtableModalOpen: boolean;
  // Contrôle d'accès : true seulement pour un administrateur connecté
  isAdmin: boolean;
  // true si la session a été ouverte par un vrai admin (autorise le sélecteur de rôle démo)
  isAdminSession: boolean;
  openAirtableModal: () => void;
  closeAirtableModal: () => void;

  // Authentication & Session Management
  isAuthenticated: boolean;
  users: User[];
  login: (identifier: string, password: string) => { success: boolean; message: string; user?: User };
  signup: (data: { name: string; email: string; password: string; role: UserRole; phone?: string; bio?: string; avatar?: string }) => { success: boolean; message: string; user?: User };
  logout: () => void;
  requestPasswordReset: (email: string) => { success: boolean; message: string; generatedCode?: string };
  resetPasswordWithCode: (email: string, code: string, newPass: string) => { success: boolean; message: string };
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup' | 'forgot' | 'email_validation';
  authRedirectView: ActiveView | null;
  openAuthModal: (mode?: 'login' | 'signup' | 'forgot' | 'email_validation', redirectView?: ActiveView | null) => void;
  closeAuthModal: () => void;
  requireAuth: (targetView: ActiveView, requiredRole?: UserRole) => boolean;

  // Validation par email & Accusé de réception Admin
  emailAuthReceipts: EmailAuthReceipt[];
  latestAuthReceipt: EmailAuthReceipt | null;
  requestEmailAuthCode: (email: string, name?: string, role?: UserRole) => { success: boolean; message: string; receipt?: EmailAuthReceipt; code?: string };
  validateEmailAuthCode: (email: string, code: string) => { success: boolean; message: string; user?: User; receipt?: EmailAuthReceipt };

  // Admin CMS CRUD Operations
  adminCreateListing: (listing: Listing) => void;
  adminUpdateListing: (id: string, updates: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  
  adminCreateBooking: (booking: Booking) => void;
  adminUpdateBooking: (id: string, updates: Partial<Booking>) => void;
  
  adminCreateReview: (review: Review) => void;
  adminUpdateReview: (reviewId: string, updates: Partial<Review>) => void;
  deleteReview: (reviewId: string) => void;

  adminCreateUser: (userData: Omit<User, 'id' | 'createdAt'>) => User;
  adminUpdateUser: (userId: string, updates: Partial<User>) => void;
  adminDeleteUser: (userId: string) => void;
  refreshUsers: () => Promise<void>;

  platformSettings: PlatformSettings;
  updatePlatformSettings: (updates: Partial<PlatformSettings>) => void;
  
  // Listings
  listings: Listing[];
  filteredListings: Listing[];
  addListing: (listingData: Omit<Listing, 'id' | 'hostId' | 'hostName' | 'hostAvatar' | 'rating' | 'reviewCount' | 'blockedDates'> & { status?: ListingStatus }) => Listing;
  updateListing: (id: string, updates: Partial<Listing>) => boolean;
  requestListingModification: (listingId: string, details: string) => void;
  moderateListing: (id: string, action: 'valider' | 'a_modifier' | 'rejeter', labels: MyStayLabel[], comment: string) => void;
  toggleBlockedDate: (listingId: string, dateStr: string) => void;
  refreshListings: () => Promise<void>;
  
  // Bookings
  bookings: Booking[];
  createBooking: (params: {
    listing: Listing;
    startDate: string;
    endDate: string;
    guestsCount: number;
    paymentMethod: string;
  }) => Booking;
  acceptBooking: (bookingId: string) => void;
  declineBooking: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;
  deleteBooking: (bookingId: string) => Promise<void>;
  seedExampleBookings: () => Promise<void>;
  refreshBookings: () => Promise<void>;
  
  // Reviews
  reviews: Review[];
  addReview: (reviewData: {
    bookingId: string;
    listingId: string;
    rating: number;
    subRatings: { cleanliness: number; authenticity: number; ecoResponsibility: number; hostWelcome: number; };
    comment: string;
  }) => void;
  replyToReview: (reviewId: string, replyText: string) => void;
  flagReview: (reviewId: string) => void;
  moderateReview: (reviewId: string, newStatus: 'valid' | 'hidden') => void;
  refreshReviews: () => Promise<void>;
  
  // Messaging
  messages: Message[];
  sendMessage: (bookingId: string, content: string) => void;
  refreshMessages: () => Promise<void>;
  isChatWsConnected: boolean;
  onlineUsers: OnlineUser[];
  typingUsers: Record<string, { userId: string; userName: string; isTyping: boolean }>;
  sendTyping: (bookingId: string, isTyping: boolean) => void;
  openChatWithBooking: (bookingId: string) => void;
  openChatWithHost: (listing: Listing) => void;
  unreadMessagesCount: number;
  
  // Favorites
  favorites: string[];
  toggleFavorite: (listingId: string) => void;
  
  // Filter state
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;
  
  // Navigation & Modals
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedListing: Listing | null;
  setSelectedListing: (listing: Listing | null) => void;
  
  // Messaging modal state
  activeChatBookingId: string | null;
  setActiveChatBookingId: (id: string | null) => void;
  
  // Review modal state
  activeReviewBooking: Booking | null;
  setActiveReviewBooking: (booking: Booking | null) => void;
  
  // Checkout flow state
  checkoutListing: Listing | null;
  checkoutParams: { startDate: string; endDate: string; guestsCount: number } | null;
  openCheckout: (listing: Listing, params: { startDate: string; endDate: string; guestsCount: number }) => void;
  closeCheckout: () => void;
  
  // Audit Logs & Make Executions
  auditLogs: AuditLog[];
  makeExecutions: MakeScenarioExecution[];
  triggerMakeScenario: (name: string, triggerEvent: string, summary: string) => void;
  
  // Notification toast
  notification: NotificationInfo | null;
  showNotification: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissNotification: () => void;
  closeNotification: () => void;
}

const DEFAULT_FILTERS: FilterOptions = {
  searchQuery: '',
  region: 'all',
  startDate: '',
  endDate: '',
  guests: 1,
  propertyType: 'all',
  maxPrice: 250,
  labels: [],
  selectedSustainableOnly: false,
  sortBy: 'pertinence'
};

const INITIAL_EMAIL_RECEIPTS: EmailAuthReceipt[] = [
  {
    id: 'AR-2026-3814',
    email: 'claire.bernard@example.fr',
    userName: 'Claire Bernard',
    userRole: 'voyageur',
    validationCode: '748291',
    status: 'valide',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    validatedAt: new Date(Date.now() - 3600000 * 4 + 95000).toISOString(),
    adminName: 'Laurent Mercier',
    adminRole: 'Super Administrateur MyStay Rural',
    adminEmail: 'administration@mystay-rural.fr',
    ipReference: '82.64.120.15 (TLS 1.3)',
    securitySignature: 'SHA256:4f8e91c2b3a0 (Certifié MyStay)',
    notes: 'Validation email réussie et accusé de réception consigné.'
  },
  {
    id: 'AR-2026-9152',
    email: 'antoine.valette@example.fr',
    userName: 'Antoine Valette',
    userRole: 'hote',
    validationCode: '319405',
    status: 'valide',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    validatedAt: new Date(Date.now() - 3600000 * 24 + 140000).toISOString(),
    adminName: 'Laurent Mercier',
    adminRole: 'Super Administrateur MyStay Rural',
    adminEmail: 'administration@mystay-rural.fr',
    ipReference: '90.112.44.18 (TLS 1.3)',
    securitySignature: 'SHA256:1a8c3d9e0f5b (Certifié MyStay)',
    notes: 'Validation email hôte réussie avec accusé de réception émis par l\'admin.'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Registered Users (Persisted and upgraded to Ba Tamsir official avatar)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('mystay_users');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(u => {
            if (u.id === 'usr_voyageur_1' && !u.avatar) {
              return { ...u, avatar: baTamsirAvatar };
            }
            return u;
          });
        }
      } catch {
        return MOCK_USERS;
      }
    }
    return MOCK_USERS;
  });

  // Authentication & Session state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = safeStorage.getItem('mystay_is_authenticated');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Current user (defaults to stored user or Ba Tamsir)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = safeStorage.getItem('mystay_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          if (parsed.id === 'usr_voyageur_1' && !parsed.avatar) {
            return { ...parsed, avatar: baTamsirAvatar };
          }
          return parsed;
        }
      } catch {
        return MOCK_USERS[0];
      }
    }
    return MOCK_USERS[0];
  });

  // Profile modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  // Airtable Sync modal state
  const [isAirtableModalOpen, setIsAirtableModalOpen] = useState(false);
  const isAdmin = isAuthenticated && currentUser.role === 'admin';
  // Mémorise qu'un vrai administrateur a ouvert la session : lui seul peut
  // ensuite prévisualiser les autres profils via le sélecteur "DÉMO".
  const [isAdminSession, setIsAdminSession] = useState<boolean>(() => safeStorage.getItem('mystay_admin_session') === 'true');
  useEffect(() => {
    if (isAuthenticated && currentUser.role === 'admin' && !isAdminSession) {
      setIsAdminSession(true);
      safeStorage.setItem('mystay_admin_session', 'true');
    }
    if (!isAuthenticated && isAdminSession) {
      setIsAdminSession(false);
      safeStorage.setItem('mystay_admin_session', 'false');
    }
  }, [isAuthenticated, currentUser.role, isAdminSession]);
  useEffect(() => {
    // Ferme la fenêtre Airtable si l'utilisateur n'est plus admin
    if (!isAdmin) setIsAirtableModalOpen(false);
  }, [isAdmin]);
  const openAirtableModal = () => {
    if (!isAdmin) return;
    setIsAirtableModalOpen(true);
  };
  const closeAirtableModal = () => setIsAirtableModalOpen(false);

  const resetBaTamsirAvatar = () => {
    const updated = { ...currentUser, name: 'Ba Tamsir', avatar: baTamsirAvatar };
    setCurrentUser(updated);
    safeStorage.setItem('mystay_current_user', JSON.stringify(updated));

    setUsers(prev => {
      const updatedList = prev.map(u => u.id === currentUser.id ? { ...u, name: 'Ba Tamsir', avatar: baTamsirAvatar } : u);
      safeStorage.setItem('mystay_users', JSON.stringify(updatedList));
      return updatedList;
    });

    apiService.updateUser(currentUser.id, { name: 'Ba Tamsir', avatar: baTamsirAvatar }).catch(() => {});
    showNotification('Photo officielle rétablie', 'La photo de profil officielle de Ba Tamsir a été restaurée.', 'success');
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    safeStorage.setItem('mystay_current_user', JSON.stringify(updatedUser));

    setUsers(prev => {
      const updatedList = prev.map(u => u.id === currentUser.id ? { ...u, ...updates } : u);
      safeStorage.setItem('mystay_users', JSON.stringify(updatedList));
      return updatedList;
    });

    try {
      const res = await apiService.updateUser(currentUser.id, updates);
      if (res && res.success) {
        const dest = res.storage === 'supabase_and_local' 
          ? 'Synchronisé avec Supabase et base locale'
          : 'Enregistré dans la base de données locale du serveur';
        showNotification('Profil et photo enregistrés', dest, 'success');
      } else {
        showNotification('Profil mis à jour', 'Vos informations et votre photo ont été sauvegardées.', 'success');
      }
    } catch {
      showNotification('Profil mis à jour', 'Vos informations et votre photo ont été sauvegardées.', 'success');
    }
  };

  // Auth modal controls
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot' | 'email_validation'>('login');
  const [authRedirectView, setAuthRedirectView] = useState<ActiveView | null>(null);
  const [resetCodes, setResetCodes] = useState<Record<string, { code: string; expiresAt: number }>>({});

  // Validation par email & Accusés de réception
  const [emailAuthReceipts, setEmailAuthReceipts] = useState<EmailAuthReceipt[]>(() => {
    const saved = safeStorage.getItem('mystay_email_auth_receipts');
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_RECEIPTS;
  });
  const [latestAuthReceipt, setLatestAuthReceipt] = useState<EmailAuthReceipt | null>(null);

  // Platform settings (CMS)
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    const saved = safeStorage.getItem('mystay_platform_settings');
    return saved ? JSON.parse(saved) : DEFAULT_PLATFORM_SETTINGS;
  });

  // Listings
  const [listings, setListings] = useState<Listing[]>(() => {
    const saved = safeStorage.getItem('mystay_listings');
    return saved ? JSON.parse(saved) : MOCK_LISTINGS;
  });

  // Bookings
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = safeStorage.getItem('mystay_bookings');
    return saved ? JSON.parse(saved) : MOCK_BOOKINGS;
  });

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = safeStorage.getItem('mystay_reviews');
    return saved ? JSON.parse(saved) : MOCK_REVIEWS;
  });

  // Messages
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = safeStorage.getItem('mystay_messages');
    return saved ? JSON.parse(saved) : MOCK_MESSAGES;
  });

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = safeStorage.getItem('mystay_favorites');
    return saved ? JSON.parse(saved) : ['lst_1'];
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = safeStorage.getItem('mystay_audit_logs');
    return saved ? JSON.parse(saved) : MOCK_AUDIT_LOGS;
  });

  // Make Scenarios
  const [makeExecutions, setMakeExecutions] = useState<MakeScenarioExecution[]>(() => {
    const saved = safeStorage.getItem('mystay_make_executions');
    return saved ? JSON.parse(saved) : INITIAL_MAKE_EXECUTIONS;
  });

  // View state
  const [activeView, setActiveView] = useState<ActiveView>('explore');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [activeChatBookingId, setActiveChatBookingId] = useState<string | null>(null);
  const [activeReviewBooking, setActiveReviewBooking] = useState<Booking | null>(null);

  // WebSocket Instant Chat states
  const [isChatWsConnected, setIsChatWsConnected] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, { userId: string; userName: string; isTyping: boolean }>>({});
  
  // Checkout modal
  const [checkoutListing, setCheckoutListing] = useState<Listing | null>(null);
  const [checkoutParams, setCheckoutParams] = useState<{ startDate: string; endDate: string; guestsCount: number } | null>(null);

  // Filters
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);

  // Notification Toast
  const [notification, setNotification] = useState<NotificationInfo | null>(null);

  // Synchronisation avec l'API backend / Supabase
  const refreshListings = async () => {
    try {
      const fetchedListings = await apiService.getListings();
      if (fetchedListings && fetchedListings.length > 0) {
        setListings(prev => {
          const merged = [...prev];
          for (const item of fetchedListings) {
            const idx = merged.findIndex(l => l.id === item.id);
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...item };
            } else {
              merged.push(item);
            }
          }
          return merged;
        });
      }
    } catch (e) {
      console.warn('Erreur synchronisation annonces backend:', e);
    }
  };

  const refreshBookings = async () => {
    try {
      const fetchedBookings = await apiService.getBookings();
      if (fetchedBookings && fetchedBookings.length > 0) {
        setBookings(fetchedBookings);
      }
    } catch (e) {
      console.warn('Erreur synchronisation réservations backend:', e);
    }
  };

  const refreshReviews = async () => {
    try {
      const fetchedReviews = await apiService.getReviews();
      if (fetchedReviews && fetchedReviews.length > 0) {
        setReviews(prev => {
          const merged = [...prev];
          for (const item of fetchedReviews) {
            const idx = merged.findIndex(r => r.id === item.id);
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...item };
            } else {
              merged.push(item);
            }
          }
          return merged;
        });
      }
    } catch (e) {
      console.warn('Erreur synchronisation avis backend:', e);
    }
  };

  const refreshUsers = async () => {
    try {
      const fetchedUsers = await apiService.getUsers();
      if (fetchedUsers && fetchedUsers.length > 0) {
        setUsers(prev => {
          const merged = [...prev];
          for (const sUser of fetchedUsers) {
            const idx = merged.findIndex(u => u.id === sUser.id);
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...sUser };
            } else {
              merged.push(sUser);
            }
          }
          return merged;
        });
        setCurrentUser(prev => {
          const matched = fetchedUsers.find(u => u.id === prev.id);
          return matched ? { ...prev, ...matched } : prev;
        });
      }
    } catch (e) {
      console.warn('Erreur synchronisation utilisateurs backend:', e);
    }
  };

  const refreshMessages = async () => {
    try {
      const fetched = await apiService.getMessages();
      if (fetched && fetched.length > 0) {
        setMessages(fetched);
      }
    } catch (e) {
      console.warn('Erreur synchronisation messages backend:', e);
    }
  };

  useEffect(() => {
    refreshListings();
    refreshBookings();
    refreshReviews();
    refreshUsers();
    refreshMessages();
    // Rafraîchit régulièrement pour afficher les données importées depuis Airtable
    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      refreshListings();
      refreshBookings();
      refreshReviews();
      refreshMessages();
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Persist to safeStorage

  useEffect(() => {
    safeStorage.setItem('mystay_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    safeStorage.setItem('mystay_email_auth_receipts', JSON.stringify(emailAuthReceipts));
  }, [emailAuthReceipts]);

  useEffect(() => {
    safeStorage.setItem('mystay_is_authenticated', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    safeStorage.setItem('mystay_platform_settings', JSON.stringify(platformSettings));
  }, [platformSettings]);

  useEffect(() => {
    safeStorage.setItem('mystay_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    safeStorage.setItem('mystay_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    safeStorage.setItem('mystay_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    safeStorage.setItem('mystay_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    safeStorage.setItem('mystay_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    safeStorage.setItem('mystay_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    safeStorage.setItem('mystay_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    safeStorage.setItem('mystay_make_executions', JSON.stringify(makeExecutions));
  }, [makeExecutions]);

  // Références stables pour callbacks WebSocket
  const currentUserRef = React.useRef(currentUser);
  currentUserRef.current = currentUser;
  const activeChatBookingIdRef = React.useRef(activeChatBookingId);
  activeChatBookingIdRef.current = activeChatBookingId;

  // Initialisation et gestion du cycle de vie WebSocket pour la messagerie instantanée
  useEffect(() => {
    chatSocketClient.connect({
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role
    });

    const unsubStatus = chatSocketClient.onStatus(connected => {
      setIsChatWsConnected(connected);
    });

    const unsubPresence = chatSocketClient.onPresence(users => {
      setOnlineUsers(users);
    });

    const unsubTyping = chatSocketClient.onTyping(evt => {
      setTypingUsers(prev => ({
        ...prev,
        [evt.bookingId]: {
          userId: evt.userId,
          userName: evt.userName,
          isTyping: evt.isTyping
        }
      }));
    });

    const unsubMessage = chatSocketClient.onMessage(newMsg => {
      // Idempotence : ignorer si déjà présent
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      // Notification sonore et visuelle si message d'un interlocuteur
      if (newMsg.senderId !== currentUserRef.current.id) {
        playNotificationChime();
        if (activeChatBookingIdRef.current !== newMsg.bookingId) {
          showNotification(
            `Nouveau message de ${newMsg.senderName}`,
            newMsg.content.length > 55 ? newMsg.content.slice(0, 55) + '...' : newMsg.content,
            'info'
          );
        }
      }
    });

    return () => {
      unsubStatus();
      unsubPresence();
      unsubTyping();
      unsubMessage();
    };
  }, [currentUser.id, currentUser.name, currentUser.role]);

  // Synchronisation salle conversation active
  useEffect(() => {
    if (activeChatBookingId) {
      chatSocketClient.joinBooking(activeChatBookingId);
    }
  }, [activeChatBookingId]);

  const showNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setNotification({ title, message, type });
    setTimeout(() => {
      setNotification(prev => (prev?.title === title ? null : prev));
    }, 5000);
  };

  const dismissNotification = () => setNotification(null);

  const triggerMakeScenario = (scenarioName: string, triggerEvent: string, payloadSummary: string) => {
    const newExec: MakeScenarioExecution = {
      id: `exec_make_${Date.now()}`,
      scenarioName,
      triggerEvent,
      status: 'success',
      executionTimeMs: Math.floor(Math.random() * 250) + 200,
      timestamp: new Date().toISOString(),
      payloadSummary
    };
    setMakeExecutions(prev => [newExec, ...prev]);
  };

  const addAuditLog = (action: string, targetId: string, targetType: AuditLog['targetType'], details: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      action,
      targetId,
      targetType,
      authorName: currentUser.name,
      authorRole: currentUser.role === 'admin' ? 'Administrateur' : currentUser.role === 'hote' ? 'Hôte rural' : 'Voyageur',
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const openAuthModal = (mode: 'login' | 'signup' | 'forgot' | 'email_validation' = 'login', redirectView: ActiveView | null = null) => {
    setAuthModalMode(mode);
    setAuthRedirectView(redirectView);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthRedirectView(null);
  };

  const requireAuth = (targetView: ActiveView, requiredRole?: UserRole): boolean => {
    if (!isAuthenticated) {
      openAuthModal('login', targetView);
      showNotification('Connexion requise', 'Veuillez vous connecter pour accéder à cet espace.', 'info');
      return false;
    }
    if (requiredRole && currentUser.role !== requiredRole && currentUser.role !== 'admin') {
      showNotification('Accès restreint', `Cet espace requiert le profil ${requiredRole === 'hote' ? 'Hôte' : 'Admin'}.`, 'warning');
      return false;
    }
    return true;
  };

  const login = (identifier: string, password: string): { success: boolean; message: string; user?: User } => {
    const cleanId = identifier.trim().toLowerCase();
    const user = users.find(u => 
      u.email.toLowerCase() === cleanId || u.name.toLowerCase() === cleanId
    );

    if (!user) {
      return { 
        success: false, 
        message: 'Identifiant introuvable. Veuillez vérifier votre adresse email ou créer un compte.' 
      };
    }

    if (user.password && user.password !== password.trim()) {
      return { 
        success: false, 
        message: 'Mot de passe incorrect. Cliquez sur "Mot de passe oublié ?" pour le réinitialiser.' 
      };
    }

    setCurrentUser(user);
    setIsAuthenticated(true);
    safeStorage.setItem('mystay_is_authenticated', 'true');
    safeStorage.setItem('mystay_current_user', JSON.stringify(user));

    addAuditLog('CONNEXION_UTILISATEUR', user.id, 'user', `Connexion réussie de ${user.name} (${user.role}).`);
    showNotification(
      'Connexion réussie', 
      `Bienvenue ${user.name} ! Vous êtes connecté en tant que ${user.role === 'admin' ? 'Administrateur' : user.role === 'hote' ? 'Hôte rural' : 'Voyageur'}.`, 
      'success'
    );

    if (authRedirectView) {
      setActiveView(authRedirectView);
      setAuthRedirectView(null);
    } else {
      if (user.role === 'admin') setActiveView('admin_space');
      else if (user.role === 'hote') setActiveView('host_space');
      else setActiveView('my_trips');
    }

    setIsAuthModalOpen(false);
    return { success: true, message: 'Connexion réussie', user };
  };

  const signup = (data: { name: string; email: string; password: string; role: UserRole; phone?: string; bio?: string; avatar?: string }): { success: boolean; message: string; user?: User } => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Un compte existe déjà avec cette adresse email.' };
    }

    const defaultAvatar = data.role === 'hote' 
      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone?.trim() || '+33 6 00 00 00 00',
      avatar: data.avatar?.trim() || defaultAvatar,
      bio: data.bio?.trim() || (data.role === 'hote' ? 'Hôte engagé pour la préservation rurale.' : 'Voyageur passionné de terroirs et de nature.'),
      isHostVerified: data.role === 'hote',
      isEmailVerified: true,
      role: data.role,
      createdAt: new Date().toISOString(),
      password: data.password.trim()
    };

    setUsers(prev => {
      const updated = [newUser, ...prev];
      safeStorage.setItem('mystay_users', JSON.stringify(updated));
      return updated;
    });
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    safeStorage.setItem('mystay_is_authenticated', 'true');
    safeStorage.setItem('mystay_current_user', JSON.stringify(newUser));

    apiService.createUser(newUser).catch(() => {});

    addAuditLog('INSCRIPTION_COMPTE', newUser.id, 'user', `Nouveau compte créé : ${newUser.name} (${newUser.email}), rôle ${newUser.role}`);
    showNotification('Compte créé avec succès !', `Bienvenue dans la communauté MyStay, ${newUser.name}.`, 'success');

    if (authRedirectView) {
      setActiveView(authRedirectView);
      setAuthRedirectView(null);
    } else {
      if (newUser.role === 'hote') setActiveView('host_space');
      else setActiveView('explore');
    }

    setIsAuthModalOpen(false);
    return { success: true, message: 'Compte créé avec succès', user: newUser };
  };

  const logout = () => {
    setIsAuthenticated(false);
    safeStorage.setItem('mystay_is_authenticated', 'false');
    const guestUser: User = {
      id: 'usr_guest',
      name: 'Visiteur',
      email: '',
      phone: '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      isHostVerified: false,
      isEmailVerified: false,
      role: 'voyageur',
      createdAt: new Date().toISOString()
    };
    setCurrentUser(guestUser);
    safeStorage.setItem('mystay_current_user', JSON.stringify(guestUser));
    setActiveView('explore');
    showNotification('Déconnexion effectuée', 'Vous naviguez désormais en mode visiteur non connecté.', 'info');
  };

  const requestPasswordReset = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'Aucun compte associé à cette adresse email.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setResetCodes(prev => ({
      ...prev,
      [cleanEmail]: { code, expiresAt: Date.now() + 15 * 60 * 1000 }
    }));

    addAuditLog('DEMANDE_RESET_MDP', user.id, 'user', `Code de réinitialisation de mot de passe généré pour ${cleanEmail}.`);

    return {
      success: true,
      message: `Un code de sécurité à 6 chiffres a été généré pour ${cleanEmail}.`,
      generatedCode: code
    };
  };

  const resetPasswordWithCode = (email: string, code: string, newPass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const pending = resetCodes[cleanEmail];

    if (!pending || pending.code !== code.trim()) {
      return { success: false, message: 'Code de sécurité invalide ou expiré.' };
    }

    setUsers(prev => prev.map(u => u.email.toLowerCase() === cleanEmail ? { ...u, password: newPass.trim() } : u));
    if (currentUser.email.toLowerCase() === cleanEmail) {
      setCurrentUser(prev => ({ ...prev, password: newPass.trim() }));
    }

    setResetCodes(prev => {
      const copy = { ...prev };
      delete copy[cleanEmail];
      return copy;
    });

    addAuditLog('RESET_MDP_CONFIRME', cleanEmail, 'user', `Mot de passe réinitialisé avec succès pour ${cleanEmail}.`);
    showNotification('Mot de passe réinitialisé', 'Votre mot de passe a été mis à jour avec succès. Vous pouvez désormais vous connecter.', 'success');
    return { success: true, message: 'Mot de passe mis à jour avec succès' };
  };

  // Demande de code de validation par email avec accusé de réception de l'admin
  const requestEmailAuthCode = (email: string, name?: string, role: UserRole = 'voyageur') => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Veuillez saisir une adresse email valide.' };
    }

    const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    const userName = name?.trim() || existingUser?.name || cleanEmail.split('@')[0];
    const userRole = existingUser?.role || role;

    // Code de sécurité à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const receiptId = `AR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReceipt: EmailAuthReceipt = {
      id: receiptId,
      email: cleanEmail,
      userName,
      userRole,
      validationCode: code,
      status: 'en_attente',
      createdAt: new Date().toISOString(),
      adminName: 'Laurent Mercier',
      adminRole: 'Super Administrateur MyStay Rural',
      adminEmail: 'administration@mystay-rural.fr',
      ipReference: '82.64.120.15 (Session sécurisée TLS 1.3)',
      securitySignature: `SHA256:${Math.random().toString(36).substring(2, 8).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()} (Certifié MyStay)`,
      notes: `Demande de validation d'authentification reçue. Accusé de réception émis par l'administration.`
    };

    setEmailAuthReceipts(prev => [newReceipt, ...prev]);
    setLatestAuthReceipt(newReceipt);

    // Ajout aux journaux d'audit de l'administrateur
    addAuditLog(
      'ACCUSE_RECEPTION_AUTH_MAIL',
      receiptId,
      'system',
      `Accusé de réception officiel émis pour ${userName} (${cleanEmail}). Code de sécurité à 6 chiffres généré.`
    );

    // Déclenchement du scénario Make
    triggerMakeScenario(
      'MyStay - Validation Email & Accusé Admin',
      'auth_email_verification_requested',
      `Envoi du code sécurisé à ${cleanEmail} avec copie d'accusé de réception à administration@mystay-rural.fr (Réf: ${receiptId})`
    );

    showNotification(
      'Accusé de réception émis !',
      `Code de validation envoyé à ${cleanEmail}. Accusé de réception admin n° ${receiptId} consigné.`,
      'success'
    );

    return {
      success: true,
      message: `Code envoyé à ${cleanEmail}. Accusé de réception n° ${receiptId}`,
      code,
      receipt: newReceipt
    };
  };

  // Validation du code par mail et connexion avec confirmation de l'accusé de réception
  const validateEmailAuthCode = (email: string, code: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    const pendingReceipt = emailAuthReceipts.find(
      r => r.email.toLowerCase() === cleanEmail && r.status === 'en_attente' && r.validationCode === cleanCode
    );

    if (!pendingReceipt) {
      return {
        success: false,
        message: 'Code de validation incorrect ou expiré. Veuillez vérifier votre boîte de réception ou générer un nouveau code.'
      };
    }

    const validatedAt = new Date().toISOString();
    const updatedReceipt: EmailAuthReceipt = {
      ...pendingReceipt,
      status: 'valide',
      validatedAt,
      notes: `Authentification confirmée le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}. Accusé de réception archivé et contresigné par l'administration.`
    };

    setEmailAuthReceipts(prev => prev.map(r => r.id === pendingReceipt.id ? updatedReceipt : r));
    setLatestAuthReceipt(updatedReceipt);

    // Récupération ou création du profil utilisateur
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      const defaultAvatar = updatedReceipt.userRole === 'hote' 
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

      user = {
        id: `usr_${Date.now()}`,
        name: updatedReceipt.userName || 'Nouvel utilisateur',
        email: cleanEmail,
        phone: '+33 6 00 00 00 00',
        avatar: defaultAvatar,
        bio: updatedReceipt.userRole === 'hote' ? 'Hôte vérifié via authentification email sécurisée.' : 'Voyageur authentifié par validation email.',
        isHostVerified: updatedReceipt.userRole === 'hote',
        isEmailVerified: true,
        role: updatedReceipt.userRole || 'voyageur',
        createdAt: new Date().toISOString()
      };
      setUsers(prev => [user!, ...prev]);
    } else {
      user = { ...user, isEmailVerified: true };
      setUsers(prev => prev.map(u => u.id === user!.id ? user! : u));
    }

    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      safeStorage.setItem('mystay_is_authenticated', 'true');
      safeStorage.setItem('mystay_current_user', JSON.stringify(user));

      addAuditLog(
        'AUTH_EMAIL_VALIDEE',
        updatedReceipt.id,
        'user',
        `Connexion par email validée pour ${user.name} (${user.email}). Accusé de réception officiel ${updatedReceipt.id} consigné au registre.`
      );

      showNotification(
        'Authentification validée !',
        `Bienvenue ${user.name}. Accusé de réception n° ${updatedReceipt.id} validé par l'administrateur.`,
        'success'
      );

      if (authRedirectView) {
        setActiveView(authRedirectView);
        setAuthRedirectView(null);
      } else {
        if (user.role === 'admin') setActiveView('admin_space');
        else if (user.role === 'hote') setActiveView('host_space');
        else setActiveView('my_trips');
      }
    }

    return {
      success: true,
      message: 'Authentification validée avec succès avec accusé de réception.',
      user,
      receipt: updatedReceipt
    };
  };

  const switchRole = (role: UserRole) => {
    // Seul un administrateur peut changer de profil (sinon n'importe qui deviendrait admin en un clic)
    if (!isAdminSession) {
      showNotification('Accès refusé', 'Le changement de profil est réservé aux administrateurs.', 'warning');
      return;
    }
    let foundUser = users.find(u => u.role === role) || MOCK_USERS.find(u => u.role === role);
    if (role === 'voyageur' && foundUser && !foundUser.avatar) {
      foundUser = {
        ...foundUser,
        avatar: baTamsirAvatar
      };
    }
    if (foundUser) {
      setCurrentUser(foundUser);
      setIsAuthenticated(true);
      safeStorage.setItem('mystay_is_authenticated', 'true');
      safeStorage.setItem('mystay_current_user', JSON.stringify(foundUser));
      showNotification(
        'Rôle actif modifié',
        `Vous naviguez désormais en tant que ${foundUser.name} (${role.toUpperCase()})`,
        'info'
      );
      if (role === 'admin') setActiveView('admin_space');
      else if (role === 'hote') setActiveView('host_space');
      else setActiveView('explore');
    }
  };

  const toggleFavorite = (listingId: string) => {
    setFavorites(prev => 
      prev.includes(listingId) ? prev.filter(id => id !== listingId) : [...prev, listingId]
    );
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // Listing methods
  const addListing = (listingData: Omit<Listing, 'id' | 'hostId' | 'hostName' | 'hostAvatar' | 'rating' | 'reviewCount' | 'blockedDates'> & { status?: ListingStatus }): Listing => {
    const chosenStatus: ListingStatus = listingData.status || 'en_attente';
    const newListing: Listing = {
      ...listingData,
      id: `lst_${Date.now()}`,
      hostId: currentUser.id,
      hostName: currentUser.name,
      hostAvatar: currentUser.avatar,
      status: chosenStatus,
      submittedAt: chosenStatus === 'en_attente' ? new Date().toISOString() : undefined,
      rating: 0,
      reviewCount: 0,
      blockedDates: []
    };

    setListings(prev => [newListing, ...prev]);
    // Synchronisation automatique vers Supabase
    apiService.createListing(newListing).catch(err => {
      console.warn('Note insertion annonce Supabase:', err);
    });

    if (chosenStatus === 'brouillon') {
      addAuditLog('BROUILLON_ANNONCE_CREE', newListing.id, 'listing', `Nouvelle annonce enregistrée en brouillon : "${newListing.title}" par ${currentUser.name}. L'hôte peut la modifier librement avant publication.`);
      showNotification('Brouillon enregistré', 'Votre annonce est enregistrée en brouillon. Vous pouvez la modifier à tout moment avant de la soumettre.', 'info');
    } else {
      addAuditLog('SOUMISSION_ANNONCE', newListing.id, 'listing', `Nouvelle annonce soumise : "${newListing.title}" par ${currentUser.name}. Statut : En attente de validation.`);
      triggerMakeScenario(
        'MyStay - Nouvelle Annonce -> Alerte Modération Admin',
        'airtable.record.created [Listings: en_attente]',
        `Annonce "${newListing.title}" soumise dans ${newListing.commune} | Email confirmation envoyé à l'hôte | Alerte Slack Admin envoyée.`
      );
      showNotification('Annonce soumise avec succès', 'Votre annonce a été transmise à l\'équipe de modération MyStay pour validation de conformité.', 'success');
    }
    return newListing;
  };

  const updateListing = (id: string, updates: Partial<Listing>): boolean => {
    const existing = listings.find(l => l.id === id);
    if (!existing) {
      showNotification('Erreur', 'Annonce introuvable.', 'error');
      return false;
    }

    // RÈGLE MÉTIER STRICTE : Une fois publiée, SEUL L'ADMINISTRATEUR peut apporter des changements !
    if (existing.status === 'publiee' && currentUser.role !== 'admin') {
      showNotification(
        'Modification verrouillée (Publiée)',
        'Cette annonce est en ligne. Conformément au règlement MyStay, seul l\'administrateur peut y apporter des modifications éventuelles. Utilisez le bouton "Demander une modification".',
        'warning'
      );
      return false;
    }

    setListings(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    // Synchronisation automatique vers Supabase
    apiService.updateListing(id, updates).catch(err => {
      console.warn('Note modification annonce Supabase:', err);
    });
    addAuditLog(
      'MISE_A_JOUR_ANNONCE', 
      id, 
      'listing', 
      `Mise à jour de l'annonce "${existing.title}" par ${currentUser.name} (Rôle: ${currentUser.role}).`
    );
    showNotification('Modifications enregistrées', 'Les modifications apportées à l\'annonce ont bien été enregistrées.', 'success');
    return true;
  };

  const requestListingModification = (listingId: string, details: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;

    const requestObj = {
      requestedAt: new Date().toISOString(),
      details: details.trim(),
      status: 'pending' as const
    };

    setListings(prev => prev.map(l => l.id === listingId ? {
      ...l,
      modificationRequest: requestObj
    } : l));

    apiService.updateListing(listingId, { modificationRequest: requestObj }).catch(err => {
      console.warn('Erreur envoi demande modification Supabase:', err);
    });

    addAuditLog(
      'DEMANDE_MODIFICATION_ANNONCE_PUBLIEE',
      listingId,
      'listing',
      `Demande de modification d'annonce publiée reçue de l'hôte ${currentUser.name} pour "${listing.title}": "${details}". Transmise au back-office administrateur.`
    );

    triggerMakeScenario(
      'MyStay - Demande Modification Annonce Publiée -> Notification Admin',
      'airtable.record.updated [Listing modificationRequest]',
      `Demande de modification pour l'annonce ${listingId} (${listing.title}) : "${details}".`
    );

    showNotification(
      'Demande transmise à l\'administrateur',
      'Votre demande de modification a été transmise à l\'administrateur MyStay. L\'équipe traitera les ajustements demandés.',
      'success'
    );
  };

  const moderateListing = (id: string, action: 'valider' | 'a_modifier' | 'rejeter', labels: MyStayLabel[], comment: string) => {
    const statusMap: Record<string, ListingStatus> = {
      valider: 'publiee',
      a_modifier: 'a_modifier',
      rejeter: 'rejetee'
    };
    const nextStatus = statusMap[action];

    setListings(prev => prev.map(l => {
      if (l.id === id) {
        return {
          ...l,
          status: nextStatus,
          labels: action === 'valider' ? labels : l.labels,
          adminComment: comment,
          publishedAt: action === 'valider' ? new Date().toISOString() : l.publishedAt
        };
      }
      return l;
    }));

    // Synchronisation automatique vers Supabase
    apiService.updateListingStatus(id, nextStatus, comment).catch(err => {
      console.warn('Note statut modération Supabase:', err);
    });

    addAuditLog(
      `MODERATION_${action.toUpperCase()}`,
      id,
      'listing',
      `Décision admin par ${currentUser.name}: passage au statut "${nextStatus}". Commentaire: "${comment}". Labels attribués: ${labels.join(', ') || 'aucun'}.`
    );

    triggerMakeScenario(
      'MyStay - Décision Modération -> Notification Hôte Airtable',
      `airtable.status.changed [Listing ${nextStatus}]`,
      `Statut mis à jour pour ${id} : ${nextStatus}. Email avec retour d'évaluation transmis à l'hôte.`
    );

    showNotification(
      'Décision enregistrée',
      `L'annonce a été marquée comme "${nextStatus}". L'hôte a été notifié par email automatique.`,
      'success'
    );
  };

  const toggleBlockedDate = (listingId: string, dateStr: string) => {
    setListings(prev => prev.map(l => {
      if (l.id === listingId) {
        const isBlocked = (l.blockedDates || []).includes(dateStr);
        const updated = isBlocked 
          ? (l.blockedDates || []).filter(d => d !== dateStr)
          : [...(l.blockedDates || []), dateStr];
        return { ...l, blockedDates: updated };
      }
      return l;
    }));
  };

  // Booking methods
  const openCheckout = (listing: Listing, params: { startDate: string; endDate: string; guestsCount: number }) => {
    setCheckoutListing(listing);
    setCheckoutParams(params);
  };

  const closeCheckout = () => {
    setCheckoutListing(null);
    setCheckoutParams(null);
  };

  const createBooking = (params: {
    listing: Listing;
    startDate: string;
    endDate: string;
    guestsCount: number;
    paymentMethod: string;
  }): Booking => {
    const { listing, startDate, endDate, guestsCount } = params;
    
    // Calculate nights
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nightsCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    const nightlyTotal = listing.pricePerNight * nightsCount;
    const cleaningFee = listing.cleaningFee;
    const serviceFee = Number((nightlyTotal * 0.12).toFixed(2)); // 12% commission MyStay
    const touristTax = Number((nightsCount * guestsCount * 1.5).toFixed(2)); // 1.50€ / pers / nuit
    const totalPrice = Number((nightlyTotal + cleaningFee + serviceFee + touristTax).toFixed(2));
    const hostNetEarnings = Number((nightlyTotal + cleaningFee - (nightlyTotal * 0.03)).toFixed(2)); // frais bancaires déduits

    const isInstant = listing.bookingMode === 'instant';
    const status: BookingStatus = isInstant ? 'confirmee' : 'en_attente_hote';

    const newBooking: Booking = {
      id: `res_${Date.now().toString().slice(-6)}`,
      listingId: listing.id,
      listingTitle: listing.title,
      listingImage: listing.images[0] || '',
      listingCommune: `${listing.commune} (${listing.department})`,
      exactAddress: listing.exactAddress,
      hostId: listing.hostId,
      hostName: listing.hostName,
      travelerId: currentUser.id,
      travelerName: currentUser.name,
      travelerEmail: currentUser.email,
      startDate,
      endDate,
      nightsCount,
      guestsCount,
      nightlyTotal,
      cleaningFee,
      serviceFee,
      touristTax,
      totalPrice,
      hostNetEarnings,
      status,
      paymentStatus: 'paid',
      paymentIntentId: `pi_stripe_${Date.now()}`,
      stripeReceiptUrl: `https://pay.stripe.com/receipts/mystay_${Date.now()}`,
      accessCode: `MYSTAY-${Math.floor(1000 + Math.random() * 9000)}`,
      co2SavedKg: Number((listing.impactScoreKgCo2SavedPerNight * nightsCount).toFixed(1)),
      createdAt: new Date().toISOString(),
      hasReview: false
    };

    setBookings(prev => [newBooking, ...prev]);

    // Envoi direct vers Supabase / API backend pour chaque requête de réservation
    apiService.createBooking(newBooking).catch(err => {
      console.warn('Note d\'écriture Supabase createBooking:', err);
    });

    // Also block the dates in the listing
    const datesToBlock: string[] = [];
    const cur = new Date(start);
    while (cur < end) {
      datesToBlock.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }
    setListings(prev => prev.map(l => {
      if (l.id === listing.id) {
        return {
          ...l,
          blockedDates: Array.from(new Set([...(l.blockedDates || []), ...datesToBlock]))
        };
      }
      return l;
    }));

    addAuditLog(
      'RESERVATION_CREEE_ET_PAYEE',
      newBooking.id,
      'booking',
      `Réservation effectuée par ${currentUser.name} pour "${listing.title}". Montant Stripe total: ${totalPrice} € (Net hôte: ${hostNetEarnings} €, Commission MyStay: ${serviceFee} €). Statut: ${status}.`
    );

    triggerMakeScenario(
      'MyStay - Réservation Stripe -> Email & Calendrier Airtable',
      'stripe.payment_intent.succeeded',
      `Réservation ${newBooking.id} validée (${totalPrice} €) | Déclenchement webhook Make | Notification email envoyée à ${currentUser.email} et à l'hôte ${listing.hostName}`
    );

    showNotification(
      isInstant ? 'Réservation confirmée & payée !' : 'Demande transmise à l\'hôte',
      isInstant 
        ? `Votre séjour à ${listing.commune} est confirmé. L'adresse exacte et votre code d'accès sont disponibles dans "Mes Voyages".`
        : `L'hôte a 24h pour confirmer votre demande. Votre pré-autorisation bancaire est enregistrée.`,
      'success'
    );

    return newBooking;
  };

  const acceptBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmee' } : b));
    apiService.updateBookingStatus(bookingId, 'confirmee').catch(console.warn);
    addAuditLog('RESERVATION_ACCEPTEE_HOTE', bookingId, 'booking', `L'hôte ${currentUser.name} a accepté la réservation.`);
    triggerMakeScenario(
      'MyStay - Acceptation Hôte -> Confirmation Voyageur',
      'airtable.record.updated [Bookings: confirmee]',
      `Réservation ${bookingId} confirmée. Email et coordonnées transmises au voyageur.`
    );
    showNotification('Réservation acceptée', 'Le voyageur a été averti et le séjour est confirmé.', 'success');
  };

  const declineBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'refusee', paymentStatus: 'refunded' } : b));
    apiService.updateBookingStatus(bookingId, 'refusee').catch(console.warn);
    addAuditLog('RESERVATION_REFUSEE_HOTE', bookingId, 'booking', `L'hôte ${currentUser.name} a décliné la demande.`);
    triggerMakeScenario(
      'MyStay - Refus Hôte -> Remboursement Stripe',
      'stripe.refund.created',
      `Réservation ${bookingId} déclinée. Autorisation bancaire libérée.`
    );
    showNotification('Demande refusée', 'Le voyageur a été notifié et le paiement n\'a pas été débité.', 'info');
  };

  const cancelBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'annulee' } : b));
    apiService.updateBookingStatus(bookingId, 'annulee').catch(console.warn);
    addAuditLog('RESERVATION_ANNULEE', bookingId, 'booking', `Réservation ${bookingId} annulée.`);
    showNotification('Réservation annulée', 'Votre réservation a bien été annulée.', 'info');
  };

  const deleteBooking = async (bookingId: string) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
    await apiService.deleteBooking(bookingId);
    addAuditLog('SUPPRESSION_RESERVATION', bookingId, 'booking', `Réservation ${bookingId} supprimée.`);
  };

  const seedExampleBookings = async () => {
    try {
      const examples = await apiService.seedExampleBookings();
      if (examples && examples.length > 0) {
        setBookings(prev => {
          const ids = new Set(examples.map(e => e.id));
          return [...examples, ...prev.filter(b => !ids.has(b.id))];
        });
      }
    } catch (e: any) {
      console.warn('Erreur seed backend:', e);
    }
  };


  // Review methods
  const addReview = (reviewData: {
    bookingId: string;
    listingId: string;
    rating: number;
    subRatings: { cleanliness: number; authenticity: number; ecoResponsibility: number; hostWelcome: number; };
    comment: string;
  }) => {
    const newReview: Review = {
      id: `rev_${Date.now()}`,
      bookingId: reviewData.bookingId,
      listingId: reviewData.listingId,
      travelerId: currentUser.id,
      travelerName: currentUser.name,
      travelerAvatar: currentUser.avatar,
      rating: reviewData.rating,
      subRatings: reviewData.subRatings,
      comment: reviewData.comment,
      createdAt: new Date().toISOString(),
      status: 'valid'
    };

    setReviews(prev => [newReview, ...prev]);

    // Synchronisation automatique vers Supabase
    apiService.createReview(newReview).catch(err => {
      console.warn('Note insertion avis Supabase:', err);
    });

    // Mark booking as reviewed
    setBookings(prev => prev.map(b => b.id === reviewData.bookingId ? { ...b, hasReview: true } : b));

    // Recalculate listing rating
    setListings(prev => prev.map(l => {
      if (l.id === reviewData.listingId) {
        const existingReviews = reviews.filter(r => r.listingId === l.id && r.status === 'valid');
        const allRatings = [...existingReviews.map(r => r.rating), reviewData.rating];
        const newAvg = Number((allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(2));
        return {
          ...l,
          rating: newAvg,
          reviewCount: allRatings.length
        };
      }
      return l;
    }));

    addAuditLog('AVIS_DEPOSE', newReview.id, 'review', `Avis vérifié déposé par ${currentUser.name} pour le logement ${reviewData.listingId}. Note: ${reviewData.rating}/5.`);
    triggerMakeScenario(
      'MyStay - Nouvel Avis Vérifié -> Notification Hôte Airtable',
      'airtable.record.created [Reviews]',
      `Avis 5 étoiles enregistré | Email d'alerte envoyé à l'hôte avec lien pour répondre sous 7 jours.`
    );
    showNotification('Avis publié avec succès', 'Merci pour votre retour authentique qui renforce la communauté rurale !', 'success');
  };

  const replyToReview = (reviewId: string, replyText: string) => {
    const hostReply = {
      text: replyText,
      repliedAt: new Date().toISOString()
    };
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          hostReply
        };
      }
      return r;
    }));
    apiService.updateReview(reviewId, { hostReply }).catch(console.warn);
    addAuditLog('REPONSE_AVIS_HOTE', reviewId, 'review', `Réponse de l'hôte enregistrée pour l'avis ${reviewId}.`);
    showNotification('Réponse publiée', 'Votre réponse est maintenant visible sous le commentaire du voyageur.', 'success');
  };

  const flagReview = (reviewId: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, isFlagged: true } : r));
    addAuditLog('SIGNALEMENT_AVIS', reviewId, 'review', `Un avis a été signalé pour examen de conformité avec la charte MyStay.`);
    showNotification('Avis signalé', 'L\'avis a été transmis à l\'équipe de modération MyStay.', 'info');
  };

  const moderateReview = (reviewId: string, newStatus: 'valid' | 'hidden') => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status: newStatus, isFlagged: false } : r));
    apiService.updateReview(reviewId, { status: newStatus, isFlagged: false }).catch(console.warn);
    addAuditLog('MODERATION_AVIS_ADMIN', reviewId, 'review', `L'avis ${reviewId} a été passé au statut "${newStatus}".`);
    showNotification('Avis modéré', `Le statut de l'avis est maintenant : ${newStatus}`, 'info');
  };

  // Messaging methods
  const sendMessage = (bookingId: string, content: string) => {
    if (!content.trim()) return;
    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      bookingId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    // 1. Optimistic UI update (idempotent)
    setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);

    // 2. Diffusion instantanée WebSocket vers tous les pairs connectés
    chatSocketClient.sendMessage(newMsg);

    // 3. Persistance résiliente Supabase & base serveur
    apiService.createMessage(newMsg).catch(err => {
      console.warn('Erreur transmission message backend/supabase:', err);
    });

    triggerMakeScenario(
      'MyStay - Nouveau Message -> Notification Email & Webhook',
      'airtable.record.created [Messages]',
      `Message de ${currentUser.name} sur la réservation ${bookingId} | Notification push/email envoyée.`
    );
  };

  const sendTyping = (bookingId: string, isTyping: boolean) => {
    chatSocketClient.sendTyping(bookingId, isTyping);
  };

  const openChatWithBooking = (bookingId: string) => {
    setActiveChatBookingId(bookingId);
  };

  const openChatWithHost = (listing: Listing) => {
    // 1. Chercher si une réservation existe déjà entre l'utilisateur et cette annonce
    const existing = bookings.find(
      b => b.listingId === listing.id && (b.travelerId === currentUser.id || b.hostId === currentUser.id)
    );
    if (existing) {
      setActiveChatBookingId(existing.id);
      return;
    }

    // 2. Créer une discussion directe avec l'hôte
    const inquiryBookingId = `inq_${listing.id}_${currentUser.id}`;
    const alreadyExists = bookings.find(b => b.id === inquiryBookingId);
    if (!alreadyExists) {
      const inquiryBooking: Booking = {
        id: inquiryBookingId,
        listingId: listing.id,
        listingTitle: listing.title,
        listingCommune: listing.commune,
        listingImage: listing.images[0] || '',
        hostId: listing.hostId,
        hostName: listing.hostName,
        travelerId: currentUser.id,
        travelerName: currentUser.name,
        travelerEmail: currentUser.email || 'voyageur@mystay.fr',
        startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        nightsCount: 2,
        guestsCount: 2,
        nightlyTotal: listing.pricePerNight * 2,
        cleaningFee: listing.cleaningFee,
        serviceFee: Math.round(listing.pricePerNight * 2 * 0.12),
        touristTax: 3,
        totalPrice: listing.pricePerNight * 2 + listing.cleaningFee + Math.round(listing.pricePerNight * 2 * 0.12) + 3,
        hostNetEarnings: listing.pricePerNight * 2 + listing.cleaningFee,
        status: 'en_attente_hote',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        hasReview: false
      };
      setBookings(prev => [inquiryBooking, ...prev]);
      apiService.createBooking(inquiryBooking).catch(console.warn);
    }
    setActiveChatBookingId(inquiryBookingId);
  };

  const unreadMessagesCount = React.useMemo(() => {
    const myBookingIds = new Set(
      bookings
        .filter(b => b.travelerId === currentUser.id || b.hostId === currentUser.id)
        .map(b => b.id)
    );
    return messages.filter(m => m.senderId !== currentUser.id && myBookingIds.has(m.bookingId)).length;
  }, [messages, currentUser.id, bookings]);

  // Admin CMS CRUD Operations
  const adminCreateListing = (newListing: Listing) => {
    setListings(prev => [newListing, ...prev]);
    apiService.createListing(newListing).catch(console.warn);
    addAuditLog('CREATION_ANNONCE_CMS', newListing.id, 'listing', `Création manuelle de l'hébergement "${newListing.title}" (${newListing.commune}).`);
    showNotification('Annonce créée', `L'annonce "${newListing.title}" a été ajoutée au catalogue.`, 'success');
  };

  const adminUpdateListing = (id: string, updates: Partial<Listing>) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    apiService.updateListing(id, updates).catch(console.warn);
    addAuditLog('MODIFICATION_ANNONCE_CMS', id, 'listing', `Mise à jour CMS de l'annonce #${id}.`);
    showNotification('Annonce modifiée', 'Les modifications ont été enregistrées avec succès.', 'success');
  };

  const deleteListing = (id: string) => {
    const target = listings.find(l => l.id === id);
    setListings(prev => prev.filter(l => l.id !== id));
    apiService.deleteListing(id).catch(console.warn);
    addAuditLog('SUPPRESSION_ANNONCE_CMS', id, 'listing', `Suppression définitive du gîte "${target?.title || id}" par l'administrateur.`);
    showNotification('Annonce supprimée', 'L\'hébergement a été retiré de la plateforme.', 'info');
  };

  const adminCreateBooking = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
    apiService.createBooking(newBooking).catch(console.warn);
    addAuditLog('CREATION_RESERVATION_CMS', newBooking.id, 'booking', `Création manuelle d'une réservation #${newBooking.id} pour "${newBooking.listingTitle}".`);
    showNotification('Réservation créée', `La réservation #${newBooking.id} a été enregistrée.`, 'success');
  };

  const adminUpdateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    apiService.updateBooking(id, updates).catch(console.warn);
    addAuditLog('MODIFICATION_RESERVATION_CMS', id, 'booking', `Mise à jour de la réservation #${id}.`);
    showNotification('Réservation modifiée', 'Les détails de la réservation ont été mis à jour.', 'success');
  };

  const adminCreateReview = (review: Review) => {
    setReviews(prev => [review, ...prev]);
    apiService.createReview(review).catch(console.warn);
    addAuditLog('CREATION_AVIS_CMS', review.id, 'review', `Avis modérateur inséré pour l'annonce ${review.listingId}.`);
    showNotification('Avis ajouté', 'L\'avis a été enregistré.', 'success');
  };

  const adminUpdateReview = (reviewId: string, updates: Partial<Review>) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ...updates } : r));
    apiService.updateReview(reviewId, updates).catch(console.warn);
    addAuditLog('MODIFICATION_AVIS_CMS', reviewId, 'review', `Mise à jour de l'avis #${reviewId}.`);
    showNotification('Avis modifiée', 'L\'avis a été mis à jour.', 'success');
  };

  const deleteReview = (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    apiService.deleteReview(reviewId).catch(console.warn);
    addAuditLog('SUPPRESSION_AVIS_CMS', reviewId, 'review', `Suppression de l'avis #${reviewId} par l'administrateur.`);
    showNotification('Avis supprimé', 'L\'avis a été retiré.', 'info');
  };

  const adminCreateUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isEmailVerified: true,
      isHostVerified: userData.role === 'hote' ? (userData.isHostVerified ?? true) : false
    };
    setUsers(prev => [newUser, ...prev]);
    apiService.createUser(newUser).catch(console.warn);
    addAuditLog('CREATION_UTILISATEUR_CMS', newUser.id, 'user', `Nouveau compte créé : ${newUser.name} (${newUser.email}, rôle : ${newUser.role}).`);
    showNotification('Utilisateur créé', `Le compte de ${newUser.name} est opérationnel.`, 'success');
    return newUser;
  };

  const adminUpdateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
    apiService.updateUser(userId, updates).catch(console.warn);
    addAuditLog('MODIFICATION_UTILISATEUR_CMS', userId, 'user', `Mise à jour du compte ${userId}.`);
    showNotification('Utilisateur mis à jour', 'Informations sauvegardées.', 'success');
  };

  const adminDeleteUser = (userId: string) => {
    if (currentUser.id === userId) {
      showNotification('Action refusée', 'Impossible de supprimer le compte actuellement connecté.', 'warning');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    apiService.deleteUser(userId).catch(console.warn);
    addAuditLog('SUPPRESSION_UTILISATEUR_CMS', userId, 'user', `Suppression du compte utilisateur #${userId}.`);
    showNotification('Utilisateur supprimé', 'Le compte a été retiré de la base.', 'info');
  };

  const updatePlatformSettings = (updates: Partial<PlatformSettings>) => {
    setPlatformSettings(prev => {
      const updated = { ...prev, ...updates };
      safeStorage.setItem('mystay_platform_settings', JSON.stringify(updated));
      return updated;
    });
    addAuditLog('MAJ_PARAMETRES_CMS', 'plateforme', 'system', 'Mise à jour des paramètres éditoriaux et économiques de la plateforme.');
    showNotification('Configuration enregistrée', 'Les paramètres de la plateforme ont été mis à jour.', 'success');
  };

  // Compute filtered listings
  const filteredListings = listings.filter(l => {
    if (currentUser.role === 'voyageur' && l.status !== 'publiee') {
      return false;
    }
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const match = 
        l.title.toLowerCase().includes(q) ||
        l.commune.toLowerCase().includes(q) ||
        l.department.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q) ||
        l.propertyType.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filters.region && filters.region !== 'all') {
      if (l.region !== filters.region) return false;
    }
    if (filters.guests && filters.guests > 1 && l.capacity < filters.guests) {
      return false;
    }
    if (filters.propertyType && filters.propertyType !== 'all') {
      if (l.propertyType !== filters.propertyType) return false;
    }
    if (filters.maxPrice && l.pricePerNight > filters.maxPrice) {
      return false;
    }
    if (filters.labels && filters.labels.length > 0) {
      const hasAll = filters.labels.every(lbl => (l.labels || []).includes(lbl));
      if (!hasAll) return false;
    }
    if (filters.selectedSustainableOnly && (l.sustainablePractices?.length || 0) < 3) {
      return false;
    }
    return true;
  });

  return (
    <AppContext.Provider value={{
      currentUser,
      switchRole,
      setUser: setCurrentUser,
      isProfileModalOpen,
      openProfileModal,
      closeProfileModal,
      isAirtableModalOpen,
      isAdmin,
      isAdminSession,
      openAirtableModal,
      closeAirtableModal,
      updateUserProfile,
      resetBaTamsirAvatar,
      isAuthenticated,
      users,
      login,
      signup,
      logout,
      requestPasswordReset,
      resetPasswordWithCode,
      isAuthModalOpen,
      authModalMode,
      authRedirectView,
      openAuthModal,
      closeAuthModal,
      requireAuth,
      adminCreateListing,
      adminUpdateListing,
      deleteListing,
      adminCreateBooking,
      adminUpdateBooking,
      adminCreateReview,
      adminUpdateReview,
      deleteReview,
      adminCreateUser,
      adminUpdateUser,
      adminDeleteUser,
      refreshUsers,
      platformSettings,
      updatePlatformSettings,
      listings,
      filteredListings,
      addListing,
      updateListing,
      requestListingModification,
      moderateListing,
      toggleBlockedDate,
      refreshListings,
      bookings,
      createBooking,
      acceptBooking,
      declineBooking,
      cancelBooking,
      deleteBooking,
      seedExampleBookings,
      refreshBookings,
      reviews,
      addReview,
      replyToReview,
      flagReview,
      moderateReview,
      refreshReviews,
      messages,
      sendMessage,
      refreshMessages,
      isChatWsConnected,
      onlineUsers,
      typingUsers,
      sendTyping,
      openChatWithBooking,
      openChatWithHost,
      unreadMessagesCount,
      favorites,
      toggleFavorite,
      filters,
      setFilters,
      resetFilters,
      activeView,
      setActiveView,
      selectedListing,
      setSelectedListing,
      activeChatBookingId,
      setActiveChatBookingId,
      activeReviewBooking,
      setActiveReviewBooking,
      checkoutListing,
      checkoutParams,
      openCheckout,
      closeCheckout,
      emailAuthReceipts,
      latestAuthReceipt,
      requestEmailAuthCode,
      validateEmailAuthCode,
      auditLogs,
      makeExecutions,
      triggerMakeScenario,
      notification,
      showNotification,
      dismissNotification,
      closeNotification: dismissNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
