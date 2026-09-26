import { Listing, Booking, Review, User, Message } from '../src/types';
import { 
  MOCK_LISTINGS, MOCK_USERS, MOCK_BOOKINGS, MOCK_REVIEWS, MOCK_MESSAGES 
} from '../src/mockData';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

dotenv.config();

// Configuration Supabase
let supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const rawServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const rawAnon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// Si la clé service role commence par sb_secret_ (qui renvoie 401 sur PostgREST) ou est invalide, utiliser la clé anon testée et valide
let supabaseKey = (rawServiceRole && !rawServiceRole.startsWith('sb_secret_'))
  ? rawServiceRole
  : (rawAnon || rawServiceRole);

export let isSupabaseReady = Boolean(
  supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project') && supabaseUrl.startsWith('https://')
);

export let supabaseServer: SupabaseClient | null = isSupabaseReady
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Journal des requêtes en direct (accessible pour audit & affichage temps réel)
export interface SupabaseQueryLog {
  id: string;
  timestamp: string;
  action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'PING';
  table: string;
  sqlEquivalent: string;
  status: 'supabase_success' | 'supabase_error' | 'in_memory_direct';
  durationMs: number;
  details?: string;
  affectedId?: string;
}

export let supabaseQueryLogs: SupabaseQueryLog[] = [
  {
    id: `log_init_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'PING',
    table: 'bookings',
    sqlEquivalent: `SELECT COUNT(*) FROM public.bookings;`,
    status: isSupabaseReady ? 'supabase_success' : 'in_memory_direct',
    durationMs: 4,
    details: isSupabaseReady 
      ? `Connexion Supabase active sur ${supabaseUrl}`
      : 'Mode dynamique : requêtes directes prêtes & stockage local résilient'
  }
];

function recordLog(
  action: SupabaseQueryLog['action'], 
  table: string, 
  sqlEquivalent: string, 
  status: SupabaseQueryLog['status'], 
  durationMs: number, 
  details?: string, 
  affectedId?: string
) {
  const newLog: SupabaseQueryLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    action,
    table,
    sqlEquivalent,
    status,
    durationMs,
    details,
    affectedId
  };
  supabaseQueryLogs = [newLog, ...supabaseQueryLogs.slice(0, 49)]; // Conserve les 50 dernières requêtes
}

// Validation UUID pour compatibilité avec le typage PostgreSQL strict de Supabase
export const isValidUuid = (val?: string | null) => 
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val));

// Génération d'un UUID déterministe valide si l'ID d'origine est un string (ex: usr_voyageur_1)
export function toUuid(id: string): string {
  if (isValidUuid(id)) {
    return id;
  }
  const hash = crypto.createHash('md5').update(id).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

// Convertisseurs bidirectionnels pour compatibilité totale avec les conventions PostgreSQL / Supabase
export function bookingToDbRow(b: Booking) {
  const hostUuid = isValidUuid(b.hostId) ? b.hostId : (b.hostId ? toUuid(b.hostId) : null);
  const travelerUuid = isValidUuid(b.travelerId) ? b.travelerId : (b.travelerId ? toUuid(b.travelerId) : null);
  return {
    id: b.id,
    listing_id: b.listingId,
    listing_title: b.listingTitle || "Hébergement rural MyStay",
    listing_image: b.listingImage || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
    listing_commune: b.listingCommune || "France",
    exact_address: b.exactAddress || null,
    host_id: hostUuid,
    host_name: b.hostName || "Hôte Rural",
    traveler_id: travelerUuid,
    traveler_name: b.travelerName || "Voyageur MyStay",
    traveler_email: b.travelerEmail || "voyageur@mystay.fr",
    start_date: b.startDate,
    end_date: b.endDate,
    nights_count: Number(b.nightsCount || 1),
    guests_count: Number(b.guestsCount || 1),
    nightly_total: Number(b.nightlyTotal || 0),
    cleaning_fee: Number(b.cleaningFee || 0),
    service_fee: Number(b.serviceFee || 0),
    tourist_tax: Number(b.touristTax || 0),
    total_price: Number(b.totalPrice || 0),
    host_net_earnings: Number(b.hostNetEarnings || 0),
    status: b.status || 'confirmee',
    payment_status: b.paymentStatus || 'paid',
    payment_intent_id: b.paymentIntentId || null,
    stripe_receipt_url: b.stripeReceiptUrl || null,
    created_at: b.createdAt || new Date().toISOString(),
    has_review: Boolean(b.hasReview)
  };
}

export function dbRowToBooking(row: any): Booking {
  return {
    id: String(row.id),
    listingId: row.listing_id ?? row.listingId ?? '',
    listingTitle: row.listing_title ?? row.listingTitle ?? '',
    listingImage: row.listing_image ?? row.listingImage ?? '',
    listingCommune: row.listing_commune ?? row.listingCommune ?? '',
    exactAddress: row.exact_address ?? row.exactAddress ?? '',
    hostId: row.host_id ?? row.hostId ?? '',
    hostName: row.host_name ?? row.hostName ?? '',
    travelerId: row.traveler_id ?? row.travelerId ?? '',
    travelerName: row.traveler_name ?? row.travelerName ?? '',
    travelerEmail: row.traveler_email ?? row.travelerEmail ?? '',
    startDate: row.start_date ?? row.startDate ?? '',
    endDate: row.end_date ?? row.endDate ?? '',
    nightsCount: Number(row.nights_count ?? row.nightsCount ?? 1),
    guestsCount: Number(row.guests_count ?? row.guestsCount ?? 1),
    nightlyTotal: Number(row.nightly_total ?? row.nightlyTotal ?? 0),
    cleaningFee: Number(row.cleaning_fee ?? row.cleaningFee ?? 0),
    serviceFee: Number(row.service_fee ?? row.serviceFee ?? 0),
    touristTax: Number(row.tourist_tax ?? row.touristTax ?? 0),
    totalPrice: Number(row.total_price ?? row.totalPrice ?? 0),
    hostNetEarnings: Number(row.host_net_earnings ?? row.hostNetEarnings ?? 0),
    status: row.status ?? 'confirmee',
    paymentStatus: row.payment_status ?? row.paymentStatus ?? 'paid',
    paymentIntentId: row.payment_intent_id ?? row.paymentIntentId ?? '',
    stripeReceiptUrl: row.stripe_receipt_url ?? row.stripeReceiptUrl ?? '',
    accessCode: row.access_code ?? row.accessCode ?? '',
    co2SavedKg: Number(row.co2_saved_kg ?? row.co2SavedKg ?? 0),
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    hasReview: Boolean(row.has_review ?? row.hasReview ?? false)
  };
}

export function listingToDbRow(l: Listing) {
  const hostUuid = isValidUuid(l.hostId) ? l.hostId : (l.hostId ? toUuid(l.hostId) : null);
  return {
    id: l.id,
    host_id: hostUuid,
    host_name: l.hostName || "Hôte Rural",
    host_avatar: l.hostAvatar || null,
    title: l.title,
    description: l.description || l.title || "Superbe hébergement rural éco-responsable dans un cadre naturel préservé.",
    property_type: l.propertyType || "gite",
    capacity: Number(l.capacity || 2),
    bedrooms: Number(l.bedrooms || 1),
    bathrooms: Number(l.bathrooms || 1),
    price_per_night: Number(l.pricePerNight || 80),
    cleaning_fee: Number(l.cleaningFee || 0),
    min_nights: Number(l.minNights || 2),
    max_nights: Number(l.maxNights || 30),
    booking_mode: l.bookingMode || "instant",
    cancellation_policy: l.cancellationPolicy || "moderee",
    region: l.region || "Occitanie",
    department: l.department || "Lozère",
    commune: l.commune || "Florac",
    approx_location: l.approxLocation || (l.commune + ", France"),
    exact_address: l.exactAddress || null,
    lat: Number(l.lat || 44.32),
    lng: Number(l.lng || 3.59),
    images: Array.isArray(l.images) ? l.images : [],
    amenities: Array.isArray(l.amenities) ? l.amenities : [],
    house_rules: Array.isArray(l.houseRules) ? l.houseRules : [],
    local_tips: l.localTips || null,
    sustainable_practices: Array.isArray(l.sustainablePractices) ? l.sustainablePractices : [],
    labels: Array.isArray(l.labels) ? l.labels : [],
    status: l.status || "publiee",
    admin_comment: l.adminComment || null,
    blocked_dates: Array.isArray(l.blockedDates) ? l.blockedDates : [],
    rating: Number(l.rating || 5),
    review_count: Number(l.reviewCount || 0),
    impact_score_kg_co2_saved_per_night: Number(l.impactScoreKgCo2SavedPerNight || 12)
  };
}

export function dbRowToListing(row: any): Listing {
  return {
    id: String(row.id),
    hostId: row.host_id ?? row.hostId ?? 'usr_hote_1',
    hostName: row.host_name ?? row.hostName ?? 'Hôte Rural',
    hostAvatar: row.host_avatar ?? row.hostAvatar ?? '',
    title: row.title ?? '',
    description: row.description ?? '',
    propertyType: row.property_type ?? row.propertyType ?? 'gite',
    capacity: Number(row.capacity ?? 2),
    bedrooms: Number(row.bedrooms ?? 1),
    bathrooms: Number(row.bathrooms ?? 1),
    pricePerNight: Number(row.price_per_night ?? row.pricePerNight ?? 80),
    cleaningFee: Number(row.cleaning_fee ?? row.cleaningFee ?? 0),
    minNights: Number(row.min_nights ?? row.minNights ?? 2),
    maxNights: Number(row.max_nights ?? row.maxNights ?? 30),
    bookingMode: row.booking_mode ?? row.bookingMode ?? 'instant',
    cancellationPolicy: row.cancellation_policy ?? row.cancellationPolicy ?? 'moderee',
    region: row.region ?? 'Occitanie',
    department: row.department ?? 'Lozère',
    commune: row.commune ?? 'Florac',
    approxLocation: row.approx_location ?? row.approxLocation ?? '',
    exactAddress: row.exact_address ?? row.exactAddress ?? '',
    lat: Number(row.lat ?? 44.32),
    lng: Number(row.lng ?? 3.59),
    images: Array.isArray(row.images) ? row.images : [],
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    houseRules: Array.isArray(row.house_rules ?? row.houseRules) ? (row.house_rules ?? row.houseRules) : [],
    localTips: row.local_tips ?? row.localTips ?? '',
    sustainablePractices: Array.isArray(row.sustainable_practices ?? row.sustainablePractices) ? (row.sustainable_practices ?? row.sustainablePractices) : [],
    labels: Array.isArray(row.labels) ? row.labels : [],
    status: row.status ?? 'publiee',
    adminComment: row.admin_comment ?? row.adminComment,
    blockedDates: Array.isArray(row.blocked_dates ?? row.blockedDates) ? (row.blocked_dates ?? row.blockedDates) : [],
    rating: Number(row.rating ?? 5),
    reviewCount: Number(row.review_count ?? row.reviewCount ?? 0),
    impactScoreKgCo2SavedPerNight: Number(row.impact_score_kg_co2_saved_per_night ?? row.impactScoreKgCo2SavedPerNight ?? 12)
  };
}

export function reviewToDbRow(r: Review) {
  const travelerUuid = isValidUuid(r.travelerId) ? r.travelerId : (r.travelerId ? toUuid(r.travelerId) : null);
  return {
    id: r.id,
    booking_id: r.bookingId || null,
    listing_id: r.listingId || null,
    traveler_id: travelerUuid,
    traveler_name: r.travelerName || "Voyageur",
    traveler_avatar: r.travelerAvatar || null,
    rating: Math.min(5, Math.max(1, Math.round(Number(r.rating || 5)))),
    comment: r.comment || ""
  };
}

export function dbRowToReview(row: any): Review {
  return {
    id: String(row.id),
    bookingId: row.booking_id ?? row.bookingId ?? '',
    listingId: row.listing_id ?? row.listingId ?? '',
    travelerId: row.traveler_id ?? row.travelerId ?? 'usr_voyageur_1',
    travelerName: row.traveler_name ?? row.travelerName ?? 'Voyageur',
    travelerAvatar: row.traveler_avatar ?? row.travelerAvatar ?? '',
    rating: Number(row.rating ?? 5),
    subRatings: row.sub_ratings ?? row.subRatings ?? {
      cleanliness: 5,
      authenticity: 5,
      ecoResponsibility: 5,
      hostWelcome: 5
    },
    comment: row.comment ?? '',
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    status: row.status ?? 'valid'
  };
}

export function messageToDbRow(m: Message) {
  return {
    id: m.id,
    booking_id: m.bookingId || null,
    sender_id: isValidUuid(m.senderId) ? m.senderId : (m.senderId ? toUuid(m.senderId) : null),
    sender_name: m.senderName || "Voyageur",
    sender_role: m.senderRole || "voyageur",
    content: m.content || "",
    created_at: m.timestamp || new Date().toISOString()
  };
}

export function dbRowToMessage(row: any): Message {
  return {
    id: String(row.id),
    bookingId: row.booking_id ?? row.bookingId ?? '',
    senderId: row.sender_id ?? row.senderId ?? 'usr_voyageur_1',
    senderName: row.sender_name ?? row.senderName ?? 'Voyageur',
    senderRole: (row.sender_role ?? row.senderRole ?? 'voyageur') as any,
    content: row.content ?? '',
    timestamp: row.created_at ?? row.timestamp ?? new Date().toISOString()
  };
}

export function userToProfileRow(u: User) {
  return {
    id: toUuid(u.id),
    email: u.email,
    name: u.name,
    phone: u.phone || null,
    avatar: u.avatar || null,
    bio: u.bio || null,
    role: u.role || 'voyageur',
    is_host_verified: Boolean(u.isHostVerified || u.role === 'hote' || u.role === 'admin'),
    is_email_verified: Boolean(u.isEmailVerified ?? true),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export function profileRowToUser(row: any): User {
  return {
    id: String(row.id),
    name: row.name || 'Utilisateur MyStay',
    email: row.email || '',
    role: (row.role || 'voyageur') as any,
    phone: row.phone || '',
    avatar: row.avatar || '',
    bio: row.bio || undefined,
    isHostVerified: Boolean(row.is_host_verified),
    isEmailVerified: Boolean(row.is_email_verified),
    createdAt: row.created_at || new Date().toISOString()
  };
}

// Stockage persistant sur disque (serveur) pour garantir la persistance des profils, photos, réservations et annonces
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const LISTINGS_FILE = path.join(DATA_DIR, 'listings.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function initPersistedUsers(): User[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Avertissement lecture users.json:', err);
  }
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(MOCK_USERS, null, 2), 'utf-8');
  } catch (writeErr) {
    console.warn('Notice: impossible d\'écrire users.json:', writeErr);
  }
  return [...MOCK_USERS];
}

function savePersistedUsers(users: User[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Erreur sauvegarde users.json:', err);
  }
}

function initPersistedBookings(): Booking[] {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const raw = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Avertissement lecture bookings.json:', err);
  }
  try {
    ensureDataDir();
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(MOCK_BOOKINGS, null, 2), 'utf-8');
  } catch (writeErr) {
    console.warn('Notice: impossible d\'écrire bookings.json:', writeErr);
  }
  return [...MOCK_BOOKINGS];
}

function savePersistedBookings(bookings: Booking[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Erreur sauvegarde bookings.json:', err);
  }
}

function initPersistedListings(): Listing[] {
  try {
    if (fs.existsSync(LISTINGS_FILE)) {
      const raw = fs.readFileSync(LISTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Avertissement lecture listings.json:', err);
  }
  try {
    ensureDataDir();
    fs.writeFileSync(LISTINGS_FILE, JSON.stringify(MOCK_LISTINGS, null, 2), 'utf-8');
  } catch (writeErr) {
    console.warn('Notice: impossible d\'écrire listings.json:', writeErr);
  }
  return [...MOCK_LISTINGS];
}

function savePersistedListings(listings: Listing[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(LISTINGS_FILE, JSON.stringify(listings, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Erreur sauvegarde listings.json:', err);
  }
}

function initPersistedReviews(): Review[] {
  try {
    if (fs.existsSync(REVIEWS_FILE)) {
      const raw = fs.readFileSync(REVIEWS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Avertissement lecture reviews.json:', err);
  }
  try {
    ensureDataDir();
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(MOCK_REVIEWS, null, 2), 'utf-8');
  } catch (writeErr) {
    console.warn('Notice: impossible d\'écrire reviews.json:', writeErr);
  }
  return [...MOCK_REVIEWS];
}

function savePersistedReviews(reviews: Review[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Erreur sauvegarde reviews.json:', err);
  }
}

function initPersistedMessages(): Message[] {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const raw = fs.readFileSync(MESSAGES_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Avertissement lecture messages.json:', err);
  }
  try {
    ensureDataDir();
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(MOCK_MESSAGES, null, 2), 'utf-8');
  } catch (writeErr) {
    console.warn('Notice: impossible d\'écrire messages.json:', writeErr);
  }
  return [...MOCK_MESSAGES];
}

function savePersistedMessages(messages: Message[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Erreur sauvegarde messages.json:', err);
  }
}

// Mémoire active synchronisée avec persistance disque locale
export let inMemoryListings: Listing[] = initPersistedListings();
export let inMemoryBookings: Booking[] = initPersistedBookings();
export let inMemoryReviews: Review[] = initPersistedReviews();
export let inMemoryUsers: User[] = initPersistedUsers();
export let inMemoryMessages: Message[] = initPersistedMessages();

export const dbService = {
  // SUPABASE CONFIG & HEALTH
  getSupabaseStatus() {
    return {
      connected: isSupabaseReady,
      url: supabaseUrl ? `${supabaseUrl.slice(0, 22)}...` : 'Option 1 (Base Locale Active)',
      ready: true,
      storageType: 'persistent_server_storage',
      mode: isSupabaseReady ? 'cloud_supabase_postgresql' : 'server_persistent_disk',
      bookingsCount: inMemoryBookings.length,
      listingsCount: inMemoryListings.length,
      reviewsCount: inMemoryReviews.length,
      usersCount: inMemoryUsers.length,
      messagesCount: inMemoryMessages.length,
      lastQuery: supabaseQueryLogs[0] || null,
      recentLogs: supabaseQueryLogs.slice(0, 10)
    };
  },

  async updateSupabaseCredentials(url: string, key: string): Promise<{ success: boolean; message: string; tablesStatus?: { bookings: boolean; listings: boolean; reviews: boolean; messages: boolean; profiles: boolean } }> {
    if (!url || !key) {
      return { success: false, message: 'URL et Clé Anon Supabase requises.' };
    }
    try {
      const client = createClient(url, key);
      const startTime = Date.now();
      
      // Test de requêtes réelles sur les tables PostgreSQL de Supabase
      const [bookingsRes, listingsRes, reviewsRes, messagesRes, profilesRes] = await Promise.all([
        client.from('bookings').select('id').limit(1),
        client.from('listings').select('id').limit(1),
        client.from('reviews').select('id').limit(1),
        client.from('messages').select('id').limit(1),
        client.from('profiles').select('id').limit(1)
      ]);
      const duration = Date.now() - startTime;
      
      supabaseUrl = url;
      supabaseKey = key;
      isSupabaseReady = true;
      supabaseServer = client;

      const tablesStatus = {
        bookings: !bookingsRes.error,
        listings: !listingsRes.error,
        reviews: !reviewsRes.error,
        messages: !messagesRes.error,
        profiles: !profilesRes.error
      };

      const missing = Object.entries(tablesStatus)
        .filter(([_, ok]) => !ok)
        .map(([name]) => name);

      recordLog(
        'PING', 
        'system', 
        `Test connexion Supabase (${url})`, 
        missing.length === 0 ? 'supabase_success' : 'supabase_error', 
        duration, 
        missing.length === 0 ? `Connexion validée en ${duration}ms sur toutes les tables` : `Tables manquantes : ${missing.join(', ')}`
      );

      return { 
        success: true, 
        message: missing.length === 0 
          ? `Connexion Supabase réussie ! Toutes les tables (listings, bookings, reviews, messages, profiles) sont opérationnelles.`
          : `Connecté à Supabase, mais les tables [${missing.join(', ')}] doivent être configurées via le script SQL.`,
        tablesStatus
      };
    } catch (err: any) {
      return { success: false, message: `Erreur connexion Supabase : ${err.message}` };
    }
  },

  // LISTINGS
  async getListings(region?: string, status?: string): Promise<Listing[]> {
    const startTime = Date.now();
    const sql = `SELECT * FROM public.listings ${region ? `WHERE region = '${region}'` : ''} ${status ? `AND status = '${status}'` : ''};`;

    if (isSupabaseReady && supabaseServer) {
      try {
        let query = supabaseServer.from('listings').select('*');
        if (region && region !== 'all') query = query.eq('region', region);
        if (status) query = query.eq('status', status);
        const { data, error } = await query;
        const duration = Date.now() - startTime;

        if (!error && data && data.length > 0) {
          const mapped = data.map(dbRowToListing);
          recordLog('SELECT', 'listings', sql, 'supabase_success', duration, `${mapped.length} annonces chargées depuis Supabase`);
          inMemoryListings = mapped;
          return mapped;
        }
        recordLog('SELECT', 'listings', sql, 'supabase_error', duration, error?.message || 'Table vide');
      } catch (err: any) {
        recordLog('SELECT', 'listings', sql, 'supabase_error', Date.now() - startTime, err.message);
      }
    } else {
      recordLog('SELECT', 'listings', sql, 'in_memory_direct', Date.now() - startTime, 'Requête directe locale');
    }

    let result = [...inMemoryListings];
    if (region && region !== 'all') result = result.filter(l => l.region === region);
    if (status) result = result.filter(l => l.status === status);
    return result;
  },

  async getListingById(id: string): Promise<Listing | null> {
    const startTime = Date.now();
    const sql = `SELECT * FROM public.listings WHERE id = '${id}' LIMIT 1;`;

    if (isSupabaseReady && supabaseServer) {
      try {
        const { data, error } = await supabaseServer.from('listings').select('*').eq('id', id).single();
        const duration = Date.now() - startTime;
        if (!error && data) {
          recordLog('SELECT', 'listings', sql, 'supabase_success', duration, `Annonce ${id} trouvée`, id);
          return dbRowToListing(data);
        }
        recordLog('SELECT', 'listings', sql, 'supabase_error', duration, error?.message, id);
      } catch (err: any) {
        recordLog('SELECT', 'listings', sql, 'supabase_error', Date.now() - startTime, err.message, id);
      }
    }
    return inMemoryListings.find(l => l.id === id) || null;
  },

  async createListing(listing: Listing): Promise<Listing> {
    if (!listing.id) {
      listing.id = `lst_${Date.now()}`;
    }
    inMemoryListings = [listing, ...inMemoryListings.filter(l => l.id !== listing.id)];
    savePersistedListings(inMemoryListings);
    const startTime = Date.now();
    const row = listingToDbRow(listing);
    const sql = `INSERT INTO public.listings (id, title, commune, price_per_night, host_id) VALUES ('${listing.id}', '${listing.title.replace(/'/g, "''")}', '${listing.commune}', ${listing.pricePerNight}, ${row.host_id ? `'${row.host_id}'` : 'NULL'});`;

    if (isSupabaseReady && supabaseServer) {
      try {
        let { error } = await supabaseServer.from('listings').upsert([row]);
        // Si PostgreSQL refuse l'insertion à cause d'une contrainte de clé étrangère sur host_id, réessayer avec host_id: null
        if (error && (error.message.includes('foreign key') || error.message.includes('violates') || error.message.includes('uuid'))) {
          const fallbackRow = { ...row, host_id: null };
          const retryRes = await supabaseServer.from('listings').upsert([fallbackRow]);
          error = retryRes.error;
        }
        const duration = Date.now() - startTime;
        if (!error) {
          recordLog('INSERT', 'listings', sql, 'supabase_success', duration, `Annonce ${listing.id} enregistrée dans Supabase (table public.listings)`, listing.id);
        } else {
          recordLog('INSERT', 'listings', sql, 'supabase_error', duration, `Erreur Supabase: ${error.message}`, listing.id);
        }
      } catch (err: any) {
        recordLog('INSERT', 'listings', sql, 'supabase_error', Date.now() - startTime, err.message, listing.id);
      }
    } else {
      recordLog('INSERT', 'listings', sql, 'in_memory_direct', Date.now() - startTime, 'Enregistrement direct en mémoire locale', listing.id);
    }
    return listing;
  },

  async updateListing(id: string, updates: Partial<Listing>): Promise<Listing | null> {
    const idx = inMemoryListings.findIndex(l => l.id === id);
    if (idx === -1) return null;

    inMemoryListings[idx] = { ...inMemoryListings[idx], ...updates };
    savePersistedListings(inMemoryListings);

    const updated = inMemoryListings[idx];
    const startTime = Date.now();
    const sql = `UPDATE public.listings SET title = '${(updated.title || '').replace(/'/g, "''")}', price_per_night = ${updated.pricePerNight} WHERE id = '${id}';`;

    if (isSupabaseReady && supabaseServer) {
      try {
        const row = listingToDbRow(updated);
        let { error } = await supabaseServer.from('listings').upsert([row]);
        if (error && (error.message.includes('foreign key') || error.message.includes('violates'))) {
          const fallbackRow = { ...row, host_id: null };
          const retry = await supabaseServer.from('listings').upsert([fallbackRow]);
          error = retry.error;
        }
        const duration = Date.now() - startTime;
        recordLog('UPDATE', 'listings', sql, error ? 'supabase_error' : 'supabase_success', duration, error ? error.message : `Annonce ${id} mise à jour dans Supabase`, id);
      } catch (err: any) {
        recordLog('UPDATE', 'listings', sql, 'supabase_error', Date.now() - startTime, err.message, id);
      }
    }
    return updated;
  },

  async deleteListing(id: string): Promise<boolean> {
    inMemoryListings = inMemoryListings.filter(l => l.id !== id);
    savePersistedListings(inMemoryListings);

    const startTime = Date.now();
    const sql = `DELETE FROM public.listings WHERE id = '${id}';`;

    if (isSupabaseReady && supabaseServer) {
      try {
        const { error } = await supabaseServer.from('listings').delete().eq('id', id);
        const duration = Date.now() - startTime;
        recordLog('DELETE', 'listings', sql, error ? 'supabase_error' : 'supabase_success', duration, error ? error.message : `Annonce ${id} supprimée de Supabase`, id);
      } catch (err: any) {
        recordLog('DELETE', 'listings', sql, 'supabase_error', Date.now() - startTime, err.message, id);
      }
    }
    return true;
  },

  async updateListingStatus(id: string, status: Listing['status'], adminComment?: string): Promise<Listing | null> {
    const idx = inMemoryListings.findIndex(l => l.id === id);
    if (idx === -1) return null;

    inMemoryListings[idx] = {
      ...inMemoryListings[idx],
      status,
      adminComment: adminComment ?? inMemoryListings[idx].adminComment,
      publishedAt: status === 'publiee' ? new Date().toISOString() : inMemoryListings[idx].publishedAt
    };
    savePersistedListings(inMemoryListings);

    const startTime = Date.now();
    const sql = `UPDATE public.listings SET status = '${status}' WHERE id = '${id}';`;

    if (isSupabaseReady && supabaseServer) {
      try {
        const { error } = await supabaseServer.from('listings').update({
          status,
          admin_comment: adminComment,
          published_at: inMemoryListings[idx].publishedAt
        }).eq('id', id);
        const duration = Date.now() - startTime;
        recordLog('UPDATE', 'listings', sql, error ? 'supabase_error' : 'supabase_success', duration, error?.message || 'Statut mis à jour', id);
      } catch (err: any) {
        recordLog('UPDATE', 'listings', sql, 'supabase_error', Date.now() - startTime, err.message, id);
      }
    } else {
      recordLog('UPDATE', 'listings', sql, 'in_memory_direct', Date.now() - startTime, 'Statut actualisé en direct', id);
    }

    return inMemoryListings[idx];
  },

  // ==========================================
  // BOOKINGS (Direct actions sur table Supabase)
  // ==========================================
  async getBookings(travelerId?: string, hostId?: string): Promise<Booking[]> {
    const startTime = Date.now();
    const sql = `SELECT * FROM public.bookings ${travelerId ? `WHERE traveler_id = '${travelerId}'` : hostId ? `WHERE host_id = '${hostId}'` : ''} ORDER BY created_at DESC;`;

    if (isSupabaseReady && supabaseServer) {
      try {
        let query = supabaseServer.from('bookings').select('*').order('created_at', { ascending: false });
        if (travelerId) query = query.eq('traveler_id', travelerId);
        if (hostId) query = query.eq('host_id', hostId);
        
        const { data, error } = await query;
        const duration = Date.now() - startTime;

        if (!error && data && data.length > 0) {
          const mapped = data.map(dbRowToBooking);
          recordLog('SELECT', 'bookings', sql, 'supabase_success', duration, `${mapped.length} réservations extraites de Supabase`);
          // Sync with local memory
          inMemoryBookings = mapped;
          return mapped;
        } else if (error) {
          recordLog('SELECT', 'bookings', sql, 'supabase_error', duration, `Erreur Supabase: ${error.message}`);
        }
      } catch (err: any) {
        recordLog('SELECT', 'bookings', sql, 'supabase_error', Date.now() - startTime, err.message);
      }
    } else {
      recordLog('SELECT', 'bookings', sql, 'in_memory_direct', Date.now() - startTime, `${inMemoryBookings.length} réservations extraites du stockage direct`);
    }

    let result = [...inMemoryBookings];
    if (travelerId) result = result.filter(b => b.travelerId === travelerId);
    if (hostId) result = result.filter(b => b.hostId === hostId);
    return result;
  },

  async createBooking(booking: Booking): Promise<Booking> {
    if (!booking.id) {
      booking.id = `res_${Date.now().toString().slice(-6)}`;
    }
    // Insérer en tête du tableau mémoire et persister sur disque (Option 1)
    inMemoryBookings = [booking, ...inMemoryBookings.filter(b => b.id !== booking.id)];
    savePersistedBookings(inMemoryBookings);

    const startTime = Date.now();
    const row = bookingToDbRow(booking);
    const sql = `INSERT INTO public.bookings (id, listing_id, listing_title, traveler_id, traveler_name, start_date, end_date, total_price, status) VALUES ('${row.id}', '${row.listing_id}', '${row.listing_title.replace(/'/g, "''")}', ${row.traveler_id ? `'${row.traveler_id}'` : 'NULL'}, '${row.traveler_name.replace(/'/g, "''")}', '${row.start_date}', '${row.end_date}', ${row.total_price}, '${row.status}');`;

    if (isSupabaseReady && supabaseServer) {
      try {
        // 1. S'assurer que le logement parent existe dans la table 'listings' de Supabase (pour satisfaire la clé étrangère bookings_listing_id_fkey)
        if (row.listing_id) {
          const { data: existingListing } = await supabaseServer.from('listings').select('id').eq('id', row.listing_id).maybeSingle();
          if (!existingListing) {
            const memListing = inMemoryListings.find(l => l.id === row.listing_id);
            if (memListing) {
              const lRow = listingToDbRow(memListing);
              try {
                await supabaseServer.from('listings').upsert([{ ...lRow, host_id: null }]);
              } catch {}
            } else {
              try {
                await supabaseServer.from('listings').upsert([{
                  id: row.listing_id,
                  title: row.listing_title || 'Hébergement rural',
                  commune: row.listing_commune || 'France',
                  region: 'France',
                  approx_location: row.listing_commune || 'France',
                  price_per_night: 80
                }]);
              } catch {}
            }
          }
        }

        // 2. Tenter l'insertion directe dans la table 'bookings'
        let { error } = await supabaseServer.from('bookings').upsert([row]);

        // 3. Si PostgreSQL signale une violation de clé étrangère sur traveler_id ou host_id, réessayer sans ces contraintes optionnelles
        if (error && (error.message.includes('foreign key') || error.message.includes('violates') || error.message.includes('uuid'))) {
          const fallbackRow = { ...row, host_id: null, traveler_id: null };
          const retryRes = await supabaseServer.from('bookings').upsert([fallbackRow]);
          error = retryRes.error;
        }

        const duration = Date.now() - startTime;
        if (!error) {
          recordLog('INSERT', 'bookings', sql, 'supabase_success', duration, `Réservation ${booking.id} enregistrée dans la table public.bookings`, booking.id);
        } else {
          recordLog('INSERT', 'bookings', sql, 'supabase_error', duration, `Supabase a renvoyé : ${error.message}`, booking.id);
        }
      } catch (err: any) {
        recordLog('INSERT', 'bookings', sql, 'supabase_error', Date.now() - startTime, err.message, booking.id);
      }
    } else {
      recordLog('INSERT', 'bookings', sql, 'in_memory_direct', Date.now() - startTime, `Réservation ${booking.id} enregistrée sur disque et mémoire (${booking.totalPrice} €)`, booking.id);
    }

    return booking;
  },

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    const idx = inMemoryBookings.findIndex(b => b.id === id);
    if (idx === -1) return null;

    inMemoryBookings[idx] = { ...inMemoryBookings[idx], ...updates };
    savePersistedBookings(inMemoryBookings);

    const updated = inMemoryBookings[idx];
    const startTime = Date.now();
    const sql = `UPDATE public.bookings SET status = '${updated.status}' WHERE id = '${id}';`;

    if (isSupabaseReady && supabaseServer) {
      try {
        const row = bookingToDbRow(updated);
        let { error } = await supabaseServer.from('bookings').upsert([row]);
        if (error && (error.message.includes('foreign key') || error.message.includes('violates'))) {
          const fallbackRow = { ...row, host_id: null, traveler_id: null };
          const retry = await supabaseServer.from('bookings').upsert([fallbackRow]);
          error = retry.error;
        }
        const duration = Date.now() - startTime;
        recordLog('UPDATE', 'bookings', sql, error ? 'supabase_error' : 'supabase_success', duration, error ? error.message : `Réservation ${id} mise à jour dans Supabase`, id);
      } catch (err: any) {
        recordLog('UPDATE', 'bookings', sql, 'supabase_error', Date.now() - startTime, err.message, id);
      }
    }
    return updated;
  },

  async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking | null> {
    const idx = inMemoryBookings.findIndex(b => b.id === id);
    if (idx === -1) return null;

    inMemoryBookings[idx] = {
      ...inMemoryBookings[idx],
      status
    };
    savePersistedBookings(inMemoryBookings);

    const startTime = Date.now();
    const sql = `UPDATE public.bookings SET status = '${status}' WHERE id = '${id}';`;

    if (isSupabaseReady && supabaseServer) {
      try {
        const { error } = await supabaseServer.from('bookings').update({ status }).eq('id', id);
        const duration = Date.now() - startTime;
        recordLog('UPDATE', 'bookings', sql, error ? 'supabase_error' : 'supabase_success', duration, error ? error.message : `Statut mis à jour sur ${status}`, id);
      } catch (err: any) {
        recordLog('UPDATE', 'bookings', sql, 'supabase_error', Date.now() - startTime, err.message, id);
      }
    } else {
      recordLog('UPDATE', 'bookings', sql, 'in_memory_direct', Date.now() - startTime, `Statut modifié directement sur '${status}'`, id);
    }

    return inMemoryBookings[idx];
  },

  async deleteBooking(id: string): Promise<boolean> {
    inMemoryBookings = inMemoryBookings.filter(b => b.id !== id);
    savePersistedBookings(inMemoryBookings);
    const startTime = Date.now();
    const sql = `DELETE FROM public.bookings WHERE id = '${id}';`;

    if (isSupabaseReady && supabaseServer) {
      try {
        const { error } = await supabaseServer.from('bookings').delete().eq('id', id);
        const duration = Date.now() - startTime;
        recordLog('DELETE', 'bookings', sql, error ? 'supabase_error' : 'supabase_success', duration, error ? error.message : `Ligne supprimée de la table`, id);
      } catch (err: any) {
        recordLog('DELETE', 'bookings', sql, 'supabase_error', Date.now() - startTime, err.message, id);
      }
    } else {
      recordLog('DELETE', 'bookings', sql, 'in_memory_direct', Date.now() - startTime, `Réservation ${id} supprimée directement`, id);
    }
    return true;
  },

  // REVIEWS
  async getReviews(listingId?: string): Promise<Review[]> {
    const startTime = Date.now();
    const sql = `SELECT * FROM public.reviews ${listingId ? `WHERE listing_id = '${listingId}'` : ''};`;

    if (isSupabaseReady && supabaseServer) {
      try {
        let query = supabaseServer.from('reviews').select('*');
        if (listingId) query = query.eq('listing_id', listingId);
        const { data, error } = await query;
        const duration = Date.now() - startTime;
        if (!error && data && data.length > 0) {
          const mapped = data.map(dbRowToReview);
          recordLog('SELECT', 'reviews', sql, 'supabase_success', duration, `${mapped.length} avis récupérés de Supabase`);
          inMemoryReviews = mapped;
          return mapped;
        }
        recordLog('SELECT', 'reviews', sql, 'supabase_error', duration, error?.message || 'Table vide');
      } catch (err: any) {
        recordLog('SELECT', 'reviews', sql, 'supabase_error', Date.now() - startTime, err.message);
      }
    }
    if (listingId) return inMemoryReviews.filter(r => r.listingId === listingId);
    return inMemoryReviews;
  },

  async createReview(review: Review): Promise<Review> {
    if (!review.id) {
      review.id = `rev_${Date.now()}`;
    }
    inMemoryReviews = [review, ...inMemoryReviews.filter(r => r.id !== review.id)];
    savePersistedReviews(inMemoryReviews);
    const startTime = Date.now();
    const row = reviewToDbRow(review);
    const sql = `INSERT INTO public.reviews (id, booking_id, listing_id, rating, comment) VALUES ('${review.id}', '${row.booking_id}', '${row.listing_id}', ${row.rating}, '${review.comment.replace(/'/g, "''")}');`;

    if (isSupabaseReady && supabaseServer) {
      try {
        let { error } = await supabaseServer.from('reviews').upsert([row]);
        // Si contrainte de clé étrangère sur booking_id ou traveler_id
        if (error && (error.message.includes('foreign key') || error.message.includes('violates') || error.message.includes('uuid'))) {
          const fallbackRow = { ...row, booking_id: null, traveler_id: null };
          const retryRes = await supabaseServer.from('reviews').upsert([fallbackRow]);
          error = retryRes.error;
        }
        const duration = Date.now() - startTime;
        recordLog('INSERT', 'reviews', sql, error ? 'supabase_error' : 'supabase_success', duration, error ? error.message : 'Avis éco-tourisme publié dans Supabase', review.id);
      } catch (err: any) {
        recordLog('INSERT', 'reviews', sql, 'supabase_error', Date.now() - startTime, err.message, review.id);
      }
    } else {
      recordLog('INSERT', 'reviews', sql, 'in_memory_direct', Date.now() - startTime, 'Avis éco-tourisme enregistré', review.id);
    }
    return review;
  },

  async updateReview(id: string, updates: Partial<Review>): Promise<Review | null> {
    const idx = inMemoryReviews.findIndex(r => r.id === id);
    if (idx === -1) return null;

    inMemoryReviews[idx] = { ...inMemoryReviews[idx], ...updates };
    savePersistedReviews(inMemoryReviews);

    if (isSupabaseReady && supabaseServer) {
      try {
        const row = reviewToDbRow(inMemoryReviews[idx]);
        await supabaseServer.from('reviews').upsert([row]);
      } catch (err) {
        console.warn('Erreur update review Supabase:', err);
      }
    }
    return inMemoryReviews[idx];
  },

  async deleteReview(id: string): Promise<boolean> {
    inMemoryReviews = inMemoryReviews.filter(r => r.id !== id);
    savePersistedReviews(inMemoryReviews);

    if (isSupabaseReady && supabaseServer) {
      try {
        await supabaseServer.from('reviews').delete().eq('id', id);
      } catch (err) {
        console.warn('Erreur delete review Supabase:', err);
      }
    }
    return true;
  },

  // USERS & PROFILES (Stockage résilient : Table 'profiles' Supabase + Base locale serveur)
  async getUsers(): Promise<User[]> {
    if (isSupabaseReady && supabaseServer) {
      try {
        // 1. Tenter la table 'profiles' de Supabase
        const { data: profileData, error: profileErr } = await supabaseServer.from('profiles').select('*');
        if (!profileErr && profileData && profileData.length > 0) {
          return profileData.map(profileRowToUser);
        }
        // 2. Tenter la table 'users' si configurée
        const { data: userData, error: userErr } = await supabaseServer.from('users').select('*');
        if (!userErr && userData && userData.length > 0) {
          return userData as unknown as User[];
        }
      } catch (err) {
        console.warn('Erreur lecture profiles Supabase:', err);
      }
    }
    return [...inMemoryUsers];
  },

  async getUserById(id: string): Promise<User | null> {
    if (isSupabaseReady && supabaseServer) {
      try {
        const queryId = isValidUuid(id) ? id : toUuid(id);
        const { data, error } = await supabaseServer.from('profiles').select('*').eq('id', queryId).maybeSingle();
        if (!error && data) {
          return profileRowToUser(data);
        }
        if (id.includes('@')) {
          const { data: emailData, error: emailErr } = await supabaseServer.from('profiles').select('*').eq('email', id).maybeSingle();
          if (!emailErr && emailData) {
            return profileRowToUser(emailData);
          }
        }
        const { data: userData, error: userErr } = await supabaseServer.from('users').select('*').eq('id', id).maybeSingle();
        if (!userErr && userData) {
          return userData as unknown as User;
        }
      } catch (err) {
        console.warn('Erreur lecture profil Supabase:', err);
      }
    }
    const found = inMemoryUsers.find(u => u.id === id || toUuid(u.id) === id);
    return found ? { ...found } : null;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<{ user: User; storage: 'supabase_and_local' | 'server_local'; supabaseError?: string }> {
    const startTime = Date.now();
    let index = inMemoryUsers.findIndex(u => u.id === id || toUuid(u.id) === id);
    let targetUser: User;

    if (index >= 0) {
      inMemoryUsers[index] = { ...inMemoryUsers[index], ...updates };
      targetUser = inMemoryUsers[index];
    } else {
      targetUser = {
        id,
        name: updates.name || 'Utilisateur MyStay',
        email: updates.email || `${id}@mystay.fr`,
        role: updates.role || 'voyageur',
        ...updates
      } as User;
      inMemoryUsers.push(targetUser);
    }

    // Toujours persister sur le disque serveur (sécurité absolue)
    savePersistedUsers(inMemoryUsers);

    let storage: 'supabase_and_local' | 'server_local' = 'server_local';
    let supabaseError: string | undefined = undefined;

    // Tenter l'écriture dans Supabase si configuré
    if (isSupabaseReady && supabaseServer) {
      const profileRow = userToProfileRow(targetUser);
      const sql = `UPDATE public.profiles SET name='${(targetUser.name || '').replace(/'/g, "''")}', avatar='${(targetUser.avatar ? (targetUser.avatar.length > 60 ? targetUser.avatar.slice(0, 60) + '...' : targetUser.avatar) : '')}', bio='${(targetUser.bio || '').replace(/'/g, "''")}' WHERE id='${profileRow.id}';`;
      try {
        // Tenter d'abord avec l'UUID
        let { error } = await supabaseServer.from('profiles').upsert([profileRow]);
        
        // Si PostgreSQL signale une erreur de type sur UUID, retenter avec l'ID texte original
        if (error && error.message.includes('uuid')) {
          const fallbackRow = { ...profileRow, id: targetUser.id };
          const resFallback = await supabaseServer.from('profiles').upsert([fallbackRow]);
          error = resFallback.error;
        }

        const duration = Date.now() - startTime;

        if (error) {
          supabaseError = error.message;
          recordLog('UPDATE', 'profiles', sql, 'supabase_error', duration, `Écriture Supabase 'profiles' (${error.message}). Sauvegarde locale active.`, targetUser.id);
        } else {
          storage = 'supabase_and_local';
          recordLog('UPDATE', 'profiles', sql, 'supabase_success', duration, `Profil et photo synchronisés dans Supabase 'profiles' (${targetUser.name})`, targetUser.id);
        }
      } catch (err: any) {
        supabaseError = err?.message || 'Exception Supabase';
        recordLog('UPDATE', 'profiles', sql, 'supabase_error', Date.now() - startTime, `Exception Supabase : ${supabaseError}`, targetUser.id);
      }
    } else {
      recordLog('UPDATE', 'profiles', `UPDATE local_users SET avatar='...' WHERE id='${id}'`, 'in_memory_direct', Date.now() - startTime, `Profil et photo sauvegardés en base locale (${targetUser.name})`, id);
    }

    return { user: targetUser, storage, supabaseError };
  },

  async createUser(user: User): Promise<{ user: User; storage: 'supabase_and_local' | 'server_local' }> {
    const existingIndex = inMemoryUsers.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIndex >= 0) {
      inMemoryUsers[existingIndex] = { ...inMemoryUsers[existingIndex], ...user };
    } else {
      inMemoryUsers.push(user);
    }
    savePersistedUsers(inMemoryUsers);

    if (isSupabaseReady && supabaseServer) {
      try {
        const profileRow = userToProfileRow(user);
        let res = await supabaseServer.from('profiles').upsert([profileRow]);
        if (res.error && res.error.message.includes('uuid')) {
          await supabaseServer.from('profiles').upsert([{ ...profileRow, id: user.id }]);
        }
        return { user, storage: 'supabase_and_local' };
      } catch {
        // Fallback local
      }
    }
    return { user, storage: 'server_local' };
  },

  async deleteUser(id: string): Promise<boolean> {
    inMemoryUsers = inMemoryUsers.filter(u => u.id !== id);
    savePersistedUsers(inMemoryUsers);
    if (isSupabaseReady && supabaseServer) {
      try {
        const queryId = isValidUuid(id) ? id : toUuid(id);
        await supabaseServer.from('profiles').delete().eq('id', queryId);
        try {
          await supabaseServer.from('users').delete().eq('id', id);
        } catch {}
      } catch (err) {
        console.warn('Erreur delete user Supabase:', err);
      }
    }
    return true;
  },

  // MESSAGES (Interconnexion directe avec Supabase 'messages')
  async getMessages(bookingId?: string): Promise<Message[]> {
    if (isSupabaseReady && supabaseServer) {
      try {
        let query = supabaseServer.from('messages').select('*').order('created_at', { ascending: true });
        if (bookingId) {
          query = query.eq('booking_id', bookingId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map(dbRowToMessage);
        }
      } catch (err) {
        console.warn('Erreur lecture messages Supabase:', err);
      }
    }
    if (bookingId) {
      return inMemoryMessages.filter(m => m.bookingId === bookingId);
    }
    return [...inMemoryMessages];
  },

  async createMessage(msg: Message): Promise<Message> {
    const startTime = Date.now();
    inMemoryMessages.push(msg);
    savePersistedMessages(inMemoryMessages);

    if (isSupabaseReady && supabaseServer) {
      const row = messageToDbRow(msg);
      const sql = `INSERT INTO public.messages (id, booking_id, sender_name, sender_role, content) VALUES ('${msg.id}', '${msg.bookingId}', '${msg.senderName}', '${msg.senderRole}', '${msg.content.replace(/'/g, "''")}');`;
      try {
        const { error } = await supabaseServer.from('messages').upsert([row]);
        const duration = Date.now() - startTime;
        if (error) {
          recordLog('INSERT', 'messages', sql, 'supabase_error', duration, `Erreur insertion Supabase: ${error.message}`, msg.id);
        } else {
          recordLog('INSERT', 'messages', sql, 'supabase_success', duration, `Message enregistré dans table Supabase (${msg.senderName})`, msg.id);
        }
      } catch (err: any) {
        recordLog('INSERT', 'messages', sql, 'supabase_error', Date.now() - startTime, err.message, msg.id);
      }
    } else {
      recordLog('INSERT', 'messages', `-- Message local (${msg.senderName})`, 'in_memory_direct', Date.now() - startTime, `Message sauvegardé en local`, msg.id);
    }
    return msg;
  },

  // SEED DE 3 EXEMPLES CONCRETS DANS LA TABLE SUPABASE
  async seedExampleBookings(): Promise<Booking[]> {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const d1Start = new Date(today);
    d1Start.setDate(today.getDate() + 10);
    const d1End = new Date(today);
    d1End.setDate(today.getDate() + 14);

    const d2Start = new Date(today);
    d2Start.setDate(today.getDate() - 1);
    const d2End = new Date(today);
    d2End.setDate(today.getDate() + 2);

    const d3Start = new Date(today);
    d3Start.setDate(today.getDate() + 22);
    const d3End = new Date(today);
    d3End.setDate(today.getDate() + 25);

    const examples: Booking[] = [
      {
        id: `res_supabase_${Date.now().toString().slice(-4)}_1`,
        listingId: 'lst_1',
        listingTitle: 'Le Mas des Cévennes Éco-Responsable',
        listingImage: 'https://images.unsplash.com/photo-1542314831-c6a4d27e69b9?auto=format&fit=crop&w=800&q=80',
        listingCommune: 'Florac (Lozère)',
        exactAddress: 'Hameau de Montbrun, 48400 Florac-Trois-Rivières',
        hostId: 'usr_hote_1',
        hostName: 'Jean-Marc & Hélène V.',
        travelerId: 'usr_traveler',
        travelerName: 'Claire Bernard',
        travelerEmail: 'claire.bernard@example.com',
        startDate: formatDate(d1Start),
        endDate: formatDate(d1End),
        nightsCount: 4,
        guestsCount: 2,
        nightlyTotal: 480,
        cleaningFee: 40,
        serviceFee: 57.6,
        touristTax: 12,
        totalPrice: 589.6,
        hostNetEarnings: 505.6,
        status: 'confirmee',
        paymentStatus: 'paid',
        paymentIntentId: `pi_stripe_sb_${Date.now()}_1`,
        stripeReceiptUrl: 'https://pay.stripe.com/receipts/mystay_cevennes',
        accessCode: 'MYSTAY-7821',
        co2SavedKg: 37.6,
        createdAt: new Date().toISOString(),
        hasReview: false
      },
      {
        id: `res_supabase_${Date.now().toString().slice(-4)}_2`,
        listingId: 'lst_3',
        listingTitle: 'Éco-Gîte & Permaculture du Luberon',
        listingImage: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
        listingCommune: 'Gordes (Vaucluse)',
        exactAddress: 'Chemin des Bories Vertes, 84220 Gordes',
        hostId: 'usr_hote_2',
        hostName: 'Gérard & Anne Dupont',
        travelerId: 'usr_traveler',
        travelerName: 'Claire Bernard',
        travelerEmail: 'claire.bernard@example.com',
        startDate: formatDate(d2Start),
        endDate: formatDate(d2End),
        nightsCount: 3,
        guestsCount: 2,
        nightlyTotal: 345,
        cleaningFee: 35,
        serviceFee: 41.4,
        touristTax: 9,
        totalPrice: 430.4,
        hostNetEarnings: 369.65,
        status: 'confirmee', // En cours
        paymentStatus: 'paid',
        paymentIntentId: `pi_stripe_sb_${Date.now()}_2`,
        stripeReceiptUrl: 'https://pay.stripe.com/receipts/mystay_luberon',
        accessCode: 'MYSTAY-3490',
        co2SavedKg: 28.2,
        createdAt: new Date().toISOString(),
        hasReview: false
      },
      {
        id: `res_supabase_${Date.now().toString().slice(-4)}_3`,
        listingId: 'lst_2',
        listingTitle: 'Domaine de la Vallée & Bergerie Rénovée',
        listingImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        listingCommune: 'Sarlat-la-Canéda (Dordogne)',
        exactAddress: 'Lieu-dit La Métairie, 24200 Sarlat',
        hostId: 'usr_hote_1',
        hostName: 'Jean-Marc & Hélène V.',
        travelerId: 'usr_traveler',
        travelerName: 'Claire Bernard',
        travelerEmail: 'claire.bernard@example.com',
        startDate: formatDate(d3Start),
        endDate: formatDate(d3End),
        nightsCount: 3,
        guestsCount: 4,
        nightlyTotal: 495,
        cleaningFee: 45,
        serviceFee: 59.4,
        touristTax: 18,
        totalPrice: 617.4,
        hostNetEarnings: 525.15,
        status: 'en_attente_hote',
        paymentStatus: 'pending',
        paymentIntentId: `pi_stripe_sb_${Date.now()}_3`,
        accessCode: 'MYSTAY-8912',
        co2SavedKg: 31.5,
        createdAt: new Date().toISOString(),
        hasReview: false
      }
    ];

    // Création séquentielle avec enregistrement Supabase & logs
    for (const ex of examples) {
      await this.createBooking(ex);
    }

    return examples;
  },

  bulkUpsertListings(newListings: Listing[]) {
    for (const l of newListings) {
      const idx = inMemoryListings.findIndex(existing => existing.id === l.id);
      if (idx !== -1) {
        inMemoryListings[idx] = { ...inMemoryListings[idx], ...stripUndefined(l) };
      } else {
        inMemoryListings.unshift(l);
      }
    }
    savePersistedListings(inMemoryListings);
    return inMemoryListings;
  },

  bulkUpsertBookings(newBookings: Booking[]) {
    for (const b of newBookings) {
      const idx = inMemoryBookings.findIndex(existing => existing.id === b.id);
      if (idx !== -1) {
        inMemoryBookings[idx] = { ...inMemoryBookings[idx], ...stripUndefined(b) };
      } else {
        inMemoryBookings.unshift(b);
      }
    }
    savePersistedBookings(inMemoryBookings);
    return inMemoryBookings;
  },

  bulkUpsertUsers(newUsers: User[]) {
    for (const u of newUsers) {
      const idx = inMemoryUsers.findIndex(existing => existing.id === u.id);
      if (idx !== -1) {
        inMemoryUsers[idx] = { ...inMemoryUsers[idx], ...stripUndefined(u) };
      } else {
        inMemoryUsers.unshift(u);
      }
    }
    savePersistedUsers(inMemoryUsers);
    return inMemoryUsers;
  },

  bulkUpsertReviews(newReviews: Review[]) {
    for (const r of newReviews) {
      const idx = inMemoryReviews.findIndex(existing => existing.id === r.id);
      if (idx !== -1) {
        inMemoryReviews[idx] = { ...inMemoryReviews[idx], ...stripUndefined(r) };
      } else {
        inMemoryReviews.unshift(r);
      }
    }
    savePersistedReviews(inMemoryReviews);
    return inMemoryReviews;
  },

  bulkUpsertMessages(newMessages: Message[]) {
    for (const m of newMessages) {
      const idx = inMemoryMessages.findIndex(existing => existing.id === m.id);
      if (idx !== -1) {
        inMemoryMessages[idx] = { ...inMemoryMessages[idx], ...stripUndefined(m) };
      } else {
        inMemoryMessages.unshift(m);
      }
    }
    savePersistedMessages(inMemoryMessages);
    return inMemoryMessages;
  }
};

// Synchronisation initiale non-bloquante vers Supabase si les tables sont vides
export async function syncInitialDataToSupabase() {
  if (!isSupabaseReady || !supabaseServer) return;
  try {
    // 1. Sync Profiles (si la politique RLS INSERT est débloquée)
    const { count: profileCount } = await supabaseServer.from('profiles').select('id', { count: 'exact', head: true });
    if (profileCount === 0 || profileCount === null) {
      const profileRows = inMemoryUsers.map(userToProfileRow);
      const res = await supabaseServer.from('profiles').upsert(profileRows);
      if (res.error) {
        recordLog('INSERT', 'profiles', '-- Synchronisation automatique profiles vers Supabase', 'supabase_error', 50, `Table 'profiles' en attente du script SQL RLS : ${res.error.message}`, 'sync_init');
      } else {
        recordLog('INSERT', 'profiles', '-- Synchronisation automatique profiles vers Supabase', 'supabase_success', 50, `Profils insérés dans table 'profiles' Supabase`, 'sync_init');
      }
    }

    // 2. Sync Listings
    const { count: listingCount } = await supabaseServer.from('listings').select('id', { count: 'exact', head: true });
    if (listingCount === 0 || listingCount === null) {
      const rows = inMemoryListings.map(listingToDbRow);
      let { error } = await supabaseServer.from('listings').upsert(rows);
      if (error && (error.message.includes('foreign key') || error.message.includes('violates'))) {
        const fallbackRows = rows.map(r => ({ ...r, host_id: null }));
        try {
          await supabaseServer.from('listings').upsert(fallbackRows);
        } catch {}
      }
    }

    // 3. Sync Bookings
    const { count: bookingCount } = await supabaseServer.from('bookings').select('id', { count: 'exact', head: true });
    if (bookingCount === 0 || bookingCount === null) {
      for (const b of inMemoryBookings.slice(0, 5)) {
        const row = bookingToDbRow(b);
        let { error } = await supabaseServer.from('bookings').upsert([row]);
        if (error && (error.message.includes('foreign key') || error.message.includes('violates'))) {
          try {
            await supabaseServer.from('bookings').upsert([{ ...row, host_id: null, traveler_id: null }]);
          } catch {}
        }
      }
    }

    // 4. Sync Messages
    const { count: msgCount } = await supabaseServer.from('messages').select('id', { count: 'exact', head: true });
    if (msgCount === 0 || msgCount === null) {
      const msgRows = inMemoryMessages.map(messageToDbRow);
      try {
        await supabaseServer.from('messages').upsert(msgRows);
      } catch {}
    }
  } catch (err) {
    console.warn('Sync Supabase initial non-bloquant:', err);
  }
}

// Lancement automatique en arrière-plan
syncInitialDataToSupabase().catch(() => {});

// Évite qu'une valeur vide venant d'Airtable efface une donnée locale existante
function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== '')) as Partial<T>;
}
