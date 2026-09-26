import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { inMemoryListings, inMemoryBookings, inMemoryUsers, inMemoryReviews, inMemoryMessages, dbService } from './db';
import { Listing, Booking, User, Review, Message, } from '../src/types';

export interface AirtableLog {
  id: string;
  timestamp: string;
  action: 'TEST' | 'PUSH' | 'PULL' | 'AUTO_SYNC' | 'IMPORT';
  status: 'success' | 'error' | 'warning';
  table: string;
  recordsCount?: number;
  durationMs: number;
  details: string;
}

export interface AirtableConfig {
  baseId: string;
  token: string;
  inviteLink?: string;
  syncMode: 'airtable' | 'supabase' | 'local';
  autoSync: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: 'idle' | 'success' | 'error';
  tables: {
    listings: string;
    bookings: string;
    users: string;
    reviews: string;
    messages: string;
  };
}

const CONFIG_FILE = path.join(process.cwd(), '.airtable_config.json');

// Base ID fourni par l'utilisateur
const DEFAULT_BASE_ID = 'appIt4PVIpjgrmhri';
const DEFAULT_INVITE_LINK = 'https://airtable.com/invite/l?inviteId=invE7uhJB3I0Ntbbi&inviteToken=e6a9b9e4e548765afa0cee1eb3729fcf9c2360cf3c2a631fe8ab1fef3e148714';

let airtableConfig: AirtableConfig = loadStoredConfig();
let airtableLogs: AirtableLog[] = [
  {
    id: `log_init_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'TEST',
    status: 'warning',
    table: 'system',
    durationMs: 0,
    details: `Base Airtable configurée avec l'ID ${DEFAULT_BASE_ID}. En attente du Personal Access Token (PAT) pour synchronisation API bidirectionnelle.`
  }
];

function loadStoredConfig(): AirtableConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      return {
        baseId: data.baseId || process.env.AIRTABLE_BASE_ID || DEFAULT_BASE_ID,
        token: data.token || process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_PAT || process.env.AIRTABLE_API_KEY || '',
        inviteLink: data.inviteLink || DEFAULT_INVITE_LINK,
        syncMode: data.syncMode || 'airtable',
        autoSync: data.autoSync ?? true,
        lastSyncAt: data.lastSyncAt || null,
        lastSyncStatus: data.lastSyncStatus || 'idle',
        tables: {
          listings: data.tables?.listings || 'Listings',
          bookings: data.tables?.bookings || 'Bookings',
          users: data.tables?.users || 'Users',
          reviews: data.tables?.reviews || 'Reviews',
          messages: data.tables?.messages || 'messages',
        }
      };
    }
  } catch (e) {
    console.warn('Notice: impossible de charger .airtable_config.json:', e);
  }

  return {
    baseId: process.env.AIRTABLE_BASE_ID || DEFAULT_BASE_ID,
    token: process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_PAT || process.env.AIRTABLE_API_KEY || '',
    inviteLink: DEFAULT_INVITE_LINK,
    syncMode: 'airtable',
    autoSync: true,
    lastSyncAt: null,
    lastSyncStatus: 'idle',
    tables: {
      listings: 'Listings',
      bookings: 'Bookings',
      messages: 'messages',
      users: 'Users',
      reviews: 'Reviews',
    }
  };
}

function saveStoredConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(airtableConfig, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Notice: impossible de sauvegarder .airtable_config.json:', e);
  }
}

function addLog(action: AirtableLog['action'], status: AirtableLog['status'], table: string, durationMs: number, details: string, recordsCount?: number) {
  const log: AirtableLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    action,
    status,
    table,
    recordsCount,
    durationMs,
    details
  };
  airtableLogs = [log, ...airtableLogs.slice(0, 49)];
}

// Transformateurs MyStay -> Airtable Fields
// Normalise une liste qui peut contenir des chaînes JSON ("[\"a\",\"b\"]") ou des séparateurs
function cleanList(v: any): string[] {
  const out: string[] = [];
  const push = (x: any) => {
    if (x === undefined || x === null || x === '') return;
    if (typeof x === 'string') {
      const t = x.trim();
      if (t.startsWith('[')) { try { const arr = JSON.parse(t); if (Array.isArray(arr)) { arr.forEach(push); return; } } catch { /* texte normal */ } }
      const cleaned = t.replace(/^[\[\s"']+|[\]\s"']+$/g, '');
      if (cleaned) out.push(cleaned);
    } else out.push(String(x));
  };
  (Array.isArray(v) ? v : [v]).forEach(push);
  return out;
}

export function listingToAirtableFields(l: Listing) {
  // On envoie les noms "Supabase" (lat, labels, review_count...) ET les anciens noms (latitude, eco_labels...).
  // adaptFieldsToSchema() ne garde que les colonnes qui existent réellement dans la table Airtable.
  const labels = cleanList(l.labels);
  return {
    id: l.id,
    title: l.title,
    description: l.description || '',
    property_type: l.propertyType,
    price_per_night: Number(l.pricePerNight),
    cleaning_fee: Number(l.cleaningFee || 0),
    min_nights: l.minNights,
    max_nights: l.maxNights,
    booking_mode: l.bookingMode,
    cancellation_policy: l.cancellationPolicy,
    commune: l.commune,
    department: l.department,
    region: l.region,
    approx_location: l.approxLocation,
    exact_address: l.exactAddress,
    lat: Number(l.lat || 0),
    lng: Number(l.lng || 0),
    latitude: Number(l.lat || 0),
    longitude: Number(l.lng || 0),
    capacity: Number(l.capacity || 2),
    bedrooms: Number(l.bedrooms || 1),
    bathrooms: Number(l.bathrooms || 1),
    labels,
    eco_labels: labels,
    amenities: cleanList(l.amenities),
    house_rules: cleanList(l.houseRules),
    local_tips: l.localTips,
    sustainable_practices: cleanList(l.sustainablePractices),
    images: cleanList(l.images),
    host_id: l.hostId,
    host_name: l.hostName,
    host_avatar: l.hostAvatar,
    rating: Number(l.rating || 5),
    review_count: Number(l.reviewCount || 0),
    reviews_count: Number(l.reviewCount || 0),
    status: l.status || 'publiee',
    admin_comment: l.adminComment,
    submitted_at: l.submittedAt,
    published_at: l.publishedAt,
    blocked_dates: cleanList(l.blockedDates),
    impact_score_kg_co2_saved_per_night: Number(l.impactScoreKgCo2SavedPerNight || 0),
    updated_at: new Date().toISOString()
  };
}

export function bookingToAirtableFields(b: Booking) {
  return {
    id: b.id,
    listing_id: b.listingId,
    listing_title: b.listingTitle,
    listing_image: b.listingImage,
    listing_commune: b.listingCommune || '',
    exact_address: b.exactAddress,
    traveler_id: b.travelerId,
    traveler_name: b.travelerName,
    traveler_email: b.travelerEmail,
    host_id: b.hostId,
    host_name: b.hostName,
    start_date: b.startDate,
    end_date: b.endDate,
    nights_count: Number(b.nightsCount),
    guests_count: Number(b.guestsCount),
    nightly_total: Number(b.nightlyTotal || 0),
    cleaning_fee: Number(b.cleaningFee || 0),
    service_fee: Number(b.serviceFee || 0),
    tourist_tax: Number(b.touristTax || 0),
    total_price: Number(b.totalPrice),
    host_net_earnings: Number(b.hostNetEarnings || b.totalPrice * 0.9),
    status: b.status,
    payment_status: b.paymentStatus,
    payment_intent_id: b.paymentIntentId,
    stripe_receipt_url: b.stripeReceiptUrl,
    access_code: b.accessCode || '',
    co2_saved_kg: Number(b.co2SavedKg || 0),
    has_review: Boolean(b.hasReview),
    created_at: b.createdAt,
    updated_at: new Date().toISOString()
  };
}

export function userToAirtableFields(u: User) {
  // Jamais de mot de passe envoyé vers Airtable
  return {
    id: u.id,
    name: u.name,
    full_name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar || '',
    avatar_url: u.avatar || '',
    phone: u.phone || '',
    bio: u.bio || '',
    is_host_verified: Boolean(u.isHostVerified),
    is_email_verified: Boolean(u.isEmailVerified),
    created_at: u.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export function reviewToAirtableFields(r: Review) {
  return {
    id: r.id,
    booking_id: r.bookingId || '',
    listing_id: r.listingId,
    traveler_id: r.travelerId,
    traveler_name: r.travelerName,
    traveler_avatar: r.travelerAvatar,
    rating: Number(r.rating),
    sub_ratings: r.subRatings,
    comment: r.comment,
    host_reply: r.hostReply?.text,
    status: r.status,
    is_flagged: Boolean(r.isFlagged),
    date: r.createdAt,
    created_at: r.createdAt
  };
}

export function messageToAirtableFields(m: Message) {
  return {
    id: m.id,
    booking_id: m.bookingId,
    sender_id: m.senderId,
    sender_name: m.senderName,
    sender_role: m.senderRole,
    content: m.content,
    created_at: m.timestamp // colonne "created_at" dans la table Airtable messages
  };
}

export function airtableFieldsToMessage(fields: any, recordId?: string): Message {
  return {
    id: fields.id || recordId || `msg_${Date.now()}`,
    bookingId: fields.booking_id || fields.bookingId || '',
    senderId: fields.sender_id || fields.senderId || '',
    senderName: fields.sender_name || fields.senderName || 'Utilisateur',
    senderRole: fields.sender_role || fields.senderRole || 'voyageur',
    content: fields.content || '',
    timestamp: fields.created_at || fields.timestamp || new Date().toISOString()
  };
}

export function airtableFieldsToListing(fields: any, recordId?: string): Listing {
  const images = Array.isArray(fields.images)
    ? fields.images.map((img: any) => typeof img === 'string' ? img : img.url || '').filter(Boolean)
    : typeof fields.images === 'string' && fields.images.trim()
    ? fields.images.split(/[,;\n]/).map((s: string) => s.trim()).filter(Boolean)
    : ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'];

  const amenities = Array.isArray(fields.amenities)
    ? fields.amenities
    : typeof fields.amenities === 'string' && fields.amenities.trim()
    ? fields.amenities.split(/[,;]/).map((s: string) => s.trim()).filter(Boolean)
    : ['Cuisine équipée', 'Wi-Fi bas débit', 'Terrasse ombragée'];

  const houseRules = Array.isArray(fields.house_rules || fields.houseRules)
    ? (fields.house_rules || fields.houseRules)
    : typeof (fields.house_rules || fields.houseRules) === 'string'
    ? (fields.house_rules || fields.houseRules).split(/[,;]/).map((s: string) => s.trim()).filter(Boolean)
    : ['Respect du calme de la nature', 'Tri rigoureux des déchets'];

  const sustainablePractices = Array.isArray(fields.sustainable_practices || fields.sustainablePractices)
    ? (fields.sustainable_practices || fields.sustainablePractices)
    : typeof (fields.sustainable_practices || fields.sustainablePractices) === 'string'
    ? (fields.sustainable_practices || fields.sustainablePractices).split(/[,;]/).map((s: string) => s.trim()).filter(Boolean)
    : ['Tri sélectif & compostage autonome', 'Énergie 100% renouvelable', 'Panier terroir local'];

  const labels = Array.isArray(fields.labels)
    ? fields.labels
    : typeof fields.labels === 'string' && fields.labels.trim()
    ? fields.labels.split(/[,;]/).map((s: string) => s.trim()).filter(Boolean)
    : ['eco_responsable'];

  const blockedDates = Array.isArray(fields.blocked_dates || fields.blockedDates)
    ? (fields.blocked_dates || fields.blockedDates)
    : typeof (fields.blocked_dates || fields.blockedDates) === 'string'
    ? (fields.blocked_dates || fields.blockedDates).split(/[,;]/).map((s: string) => s.trim()).filter(Boolean)
    : [];

  return {
    id: fields.id || recordId || `lst_${Date.now()}`,
    title: fields.title || 'Hébergement rural MyStay',
    description: fields.description || 'Lieu rural authentique engagé pour la préservation du patrimoine.',
    propertyType: fields.property_type || fields.propertyType || 'gite',
    capacity: Number(fields.capacity || fields.max_guests) || 4,
    bedrooms: Number(fields.bedrooms) || 2,
    bathrooms: Number(fields.bathrooms) || 1,
    pricePerNight: Number(fields.price_per_night || fields.pricePerNight) || 85,
    cleaningFee: Number(fields.cleaning_fee || fields.cleaningFee) || 25,
    minNights: Number(fields.min_nights || fields.minNights) || 2,
    maxNights: Number(fields.max_nights || fields.maxNights) || 30,
    bookingMode: fields.booking_mode || fields.bookingMode || 'instant',
    cancellationPolicy: fields.cancellation_policy || fields.cancellationPolicy || 'moderee',
    region: fields.region || 'Occitanie',
    department: fields.department || 'Lozère (48)',
    commune: fields.commune || 'Saint-Germain-de-Calberte',
    approxLocation: fields.approx_location || fields.approxLocation || 'En pleine nature préservée',
    exactAddress: fields.exact_address || fields.exactAddress || 'Chemin rural communal',
    lat: Number(fields.latitude || fields.lat) || 44.218,
    lng: Number(fields.longitude || fields.lng) || 3.809,
    images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'],
    siteImageUrl: images[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    videoUrl: fields.video_url || fields.videoUrl || undefined,
    videos: fields.video_url || fields.videoUrl ? [fields.video_url || fields.videoUrl] : [],
    amenities,
    houseRules,
    localTips: fields.local_tips || fields.localTips || 'Visite des producteurs locaux et randonnées au crépuscule.',
    sustainablePractices: sustainablePractices.length >= 3 ? sustainablePractices : [...sustainablePractices, 'Tri sélectif & compostage autonome', 'Énergie 100% renouvelable', 'Panier terroir local'].slice(0, 3),
    labels: labels.length > 0 ? labels : ['eco_responsable'],
    status: fields.status || 'publiee',
    hostId: fields.host_id || fields.hostId || 'usr_hote_1',
    hostName: fields.host_name || fields.hostName || 'Hôte rural MyStay',
    hostAvatar: fields.host_avatar || fields.hostAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    rating: Number(fields.rating) || 5.0,
    reviewCount: Number(fields.review_count ?? fields.reviews_count ?? fields.reviewCount) || 0,
    blockedDates,
    impactScoreKgCo2SavedPerNight: Number(fields.impact_score_kg_co2_saved_per_night || fields.impact_score_co2 || fields.impactScoreKgCo2SavedPerNight) || 8.5,
    submittedAt: fields.submitted_at || fields.submittedAt || new Date().toISOString(),
    publishedAt: fields.published_at || fields.publishedAt || new Date().toISOString()
  };
}

export function airtableFieldsToBooking(fields: any, recordId?: string): Booking {
  return {
    id: fields.id || recordId || `res_${Date.now()}`,
    listingId: fields.listing_id || fields.listingId || 'lst_mas_cevenol',
    listingTitle: fields.listing_title || fields.listingTitle || 'Hébergement rural',
    listingImage: fields.listing_image || fields.listingImage || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    listingCommune: fields.listing_commune || fields.listingCommune || 'Cévennes',
    exactAddress: fields.exact_address || fields.exactAddress || 'Chemin rural',
    hostId: fields.host_id || fields.hostId || 'usr_hote_1',
    hostName: fields.host_name || fields.hostName || 'Hôte rural',
    travelerId: fields.traveler_id || fields.travelerId || 'usr_voyageur_1',
    travelerName: fields.traveler_name || fields.travelerName || 'Voyageur MyStay',
    travelerEmail: fields.traveler_email || fields.travelerEmail || 'voyageur@mystay.fr',
    startDate: fields.start_date || fields.startDate || '2026-10-10',
    endDate: fields.end_date || fields.endDate || '2026-10-14',
    nightsCount: Number(fields.nights_count || fields.nightsCount) || 4,
    guestsCount: Number(fields.guests_count || fields.guestsCount) || 2,
    nightlyTotal: Number(fields.nightly_total || fields.nightlyTotal) || 360,
    cleaningFee: Number(fields.cleaning_fee || fields.cleaningFee) || 30,
    serviceFee: Number(fields.service_fee || fields.serviceFee) || 43.2,
    touristTax: Number(fields.tourist_tax || fields.touristTax) || 12,
    totalPrice: Number(fields.total_price || fields.totalPrice) || 445.2,
    hostNetEarnings: Number(fields.host_net_earnings || fields.hostNetEarnings) || 379.2,
    status: fields.status || 'confirmee',
    paymentStatus: fields.payment_status || fields.paymentStatus || 'paid',
    accessCode: fields.access_code || fields.accessCode || 'MYSTAY-1234',
    co2SavedKg: Number(fields.co2_saved_kg || fields.co2SavedKg) || 34,
    createdAt: fields.created_at || fields.createdAt || new Date().toISOString(),
    hasReview: Boolean(fields.has_review || fields.hasReview)
  };
}

// Service Airtable
export const airtableService = {
  getConfig() {
    // SÉCURITÉ : on n'expose JAMAIS le token en clair au navigateur.
    const { token: _token, ...publicConfig } = airtableConfig;
    return {
      ...publicConfig,
      hasToken: Boolean(airtableConfig.token && airtableConfig.token.trim().length > 0),
      maskedToken: airtableConfig.token 
        ? `${airtableConfig.token.slice(0, 7)}...${airtableConfig.token.slice(-4)}` 
        : null,
      stats: {
        listings: inMemoryListings.length,
        bookings: inMemoryBookings.length,
        users: inMemoryUsers.length,
        reviews: inMemoryReviews.length,
        messages: inMemoryMessages.length
      }
    };
  },

  getLogs() {
    return airtableLogs;
  },

  updateConfig(updates: Partial<AirtableConfig>) {
    airtableConfig = {
      ...airtableConfig,
      ...updates
    };
    if (updates.token) {
      process.env.AIRTABLE_API_KEY = updates.token;
      process.env.AIRTABLE_PAT = updates.token;
    }
    if (updates.baseId) {
      process.env.AIRTABLE_BASE_ID = updates.baseId;
    }
    saveStoredConfig();
    return this.getConfig();
  },

  async testConnection(baseId?: string, token?: string): Promise<{
    success: boolean;
    message: string;
    accessibleTables: string[];
    missingTables: string[];
    tablesStatus?: Record<string, boolean>;
    statusCode?: number;
    details?: any;
  }> {
    const bId = (baseId || airtableConfig.baseId || DEFAULT_BASE_ID).trim();
    const tok = (token || airtableConfig.token || '').trim();
    const startTime = Date.now();

    if (!tok) {
      const msg = "Clé d'accès Airtable manquante. Pour connecter l'API, créez un Personal Access Token (PAT) sur airtable.com/create/tokens ou utilisez l'export CSV 1-clic.";
      addLog('TEST', 'warning', 'all', 0, msg);
      return {
        success: false,
        message: msg,
        accessibleTables: [],
        missingTables: ['Listings', 'Bookings', 'Users', 'Reviews'],
        statusCode: 401
      };
    }

    try {
      // On teste chaque table logique en utilisant D'ABORD le nom réellement configuré
      // (ex. "listings", "profiles" — cf. .airtable_config.json), puis en repli le nom par
      // défaut avec majuscule. L'ancienne version testait toujours "Listings"/"Bookings"/...
      // en dur, donc échouait à tort dès que la base utilisait des noms en minuscules.
      const logicalTables: { key: keyof AirtableConfig['tables']; label: string; default: string }[] = [
        { key: 'listings', label: 'Listings', default: 'Listings' },
        { key: 'bookings', label: 'Bookings', default: 'Bookings' },
        { key: 'users', label: 'Users', default: 'Users' },
        { key: 'reviews', label: 'Reviews', default: 'Reviews' },
        { key: 'messages', label: 'Messages', default: 'messages' },
      ];

      const accessibleTables: string[] = [];
      const tablesStatus: Record<string, boolean> = {};
      let firstError: { status: number; err: any; rawText: string; wasJson: boolean } | null = null;
      const duration0 = Date.now() - startTime;

      for (const t of logicalTables) {
        const configuredName = airtableConfig.tables[t.key] || t.default;
        const candidates = configuredName === t.default ? [configuredName] : [configuredName, t.default];
        let found = false;
        for (const name of candidates) {
          try {
            const url = `https://api.airtable.com/v0/${bId}/${encodeURIComponent(name)}?maxRecords=1`;
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${tok}` } });
            if (res.ok) {
              accessibleTables.push(t.label);
              tablesStatus[t.label] = true;
              found = true;
              break;
            }
            if (!firstError && (res.status === 401 || res.status === 403)) {
              const { err, rawText, wasJson } = await parseAirtableErrorBody(res);
              firstError = { status: res.status, err, rawText, wasJson };
            }
          } catch { /* on essaie le nom candidat suivant */ }
        }
        if (!found) tablesStatus[t.label] = false;
      }

      const duration = Date.now() - startTime;

      // Une 401/403 dès le premier appel (token invalide, ou pas d'accès à la base du tout)
      // bloque tout : on le signale plutôt que de dire juste "table non trouvée".
      if (accessibleTables.length === 0 && firstError && (firstError.status === 401 || firstError.status === 403)) {
        const msg = explainAirtableError(firstError.status, firstError.err, 'toutes les tables', firstError.rawText, firstError.wasJson);
        addLog('TEST', 'error', 'all', duration0, msg);
        return {
          success: false,
          message: msg,
          accessibleTables: [],
          missingTables: logicalTables.map(t => t.label),
          statusCode: firstError.status,
          details: firstError.err
        };
      }

      const msg = accessibleTables.length > 0
        ? `Connexion réussie à Airtable (${bId}) ! Tables détectées : ${accessibleTables.join(', ')}.`
        : `Connexion à Airtable authentifiée, mais aucune des tables attendues (Listings, Bookings, Users, Reviews, Messages) n'a été trouvée sous les noms configurés. Vérifiez les noms exacts dans Airtable ou lancez "npm run airtable:fix".`;
      addLog('TEST', accessibleTables.length > 0 ? 'success' : 'warning', 'all', duration, msg);

      return {
        success: true,
        message: msg,
        accessibleTables,
        missingTables: logicalTables.map(t => t.label).filter(t => !accessibleTables.includes(t)),
        statusCode: 200,
        tablesStatus
      };
    } catch (err: any) {
      const duration = Date.now() - startTime;
      const msg = `Erreur réseau lors de la connexion à Airtable : ${err.message}`;
      addLog('TEST', 'error', 'network', duration, msg);
      return {
        success: false,
        message: msg,
        accessibleTables: [],
        missingTables: ['Listings', 'Bookings', 'Users', 'Reviews', 'Messages'],
        statusCode: 500
      };
    }
  },

  // Synchronisation PUSH : Envoyer les données de MyStay vers Airtable
  async pushAllToAirtable(): Promise<{
    success: boolean;
    message: string;
    syncedCounts: { listings: number; bookings: number; users: number; reviews: number; messages: number };
    errors: string[];
  }> {
    const bId = (airtableConfig.baseId || DEFAULT_BASE_ID).trim();
    const tok = (airtableConfig.token || '').trim();
    const errors: string[] = [];
    const syncedCounts = { listings: 0, bookings: 0, users: 0, reviews: 0, messages: 0 };

    if (!tok) {
      const counts = {
        listings: inMemoryListings.length,
        bookings: inMemoryBookings.length,
        users: inMemoryUsers.length,
        reviews: inMemoryReviews.length,
        messages: inMemoryMessages.length
      };
      addLog('PUSH', 'error', 'all', 0, `Aucun token Airtable : rien n'a été envoyé (${counts.listings} annonces restent en local).`);
      return {
        success: false,
        message: `Aucun token Airtable détecté : rien n'a été envoyé. Ajoutez AIRTABLE_PAT=... dans le fichier .env (à côté de package.json) puis redémarrez le serveur (Ctrl+C puis npm run dev).`,
        syncedCounts: { listings: 0, bookings: 0, users: 0, reviews: 0, messages: 0 },
        errors: ['Token Airtable manquant']
      };
    }

    const startTime = Date.now();

    // 1. Pousser les Listings
    try {
      const records = inMemoryListings.map(l => ({ fields: listingToAirtableFields(l) }));
      const count = await batchUpsertToAirtable(bId, tok, airtableConfig.tables.listings || 'Listings', records);
      syncedCounts.listings = count;
      addLog('PUSH', 'success', 'Listings', Date.now() - startTime, `${count} hébergements synchronisés vers Airtable`, count);
    } catch (e: any) {
      errors.push(`Table Listings: ${e.message}`);
      addLog('PUSH', 'error', 'Listings', Date.now() - startTime, `Erreur push Listings: ${e.message}`);
    }

    // 2. Pousser les Bookings
    try {
      const records = inMemoryBookings.map(b => ({ fields: bookingToAirtableFields(b) }));
      const count = await batchUpsertToAirtable(bId, tok, airtableConfig.tables.bookings || 'Bookings', records);
      syncedCounts.bookings = count;
      addLog('PUSH', 'success', 'Bookings', Date.now() - startTime, `${count} réservations synchronisées vers Airtable`, count);
    } catch (e: any) {
      errors.push(`Table Bookings: ${e.message}`);
      addLog('PUSH', 'error', 'Bookings', Date.now() - startTime, `Erreur push Bookings: ${e.message}`);
    }

    // 3. Pousser les Users
    try {
      const records = inMemoryUsers.map(u => ({ fields: userToAirtableFields(u) }));
      const count = await batchUpsertToAirtable(bId, tok, airtableConfig.tables.users || 'Users', records);
      syncedCounts.users = count;
      addLog('PUSH', 'success', 'Users', Date.now() - startTime, `${count} utilisateurs synchronisés vers Airtable`, count);
    } catch (e: any) {
      errors.push(`Table Users: ${e.message}`);
      addLog('PUSH', 'error', 'Users', Date.now() - startTime, `Erreur push Users: ${e.message}`);
    }

    // 4. Pousser les Reviews
    try {
      const records = inMemoryReviews.map(r => ({ fields: reviewToAirtableFields(r) }));
      const count = await batchUpsertToAirtable(bId, tok, airtableConfig.tables.reviews || 'Reviews', records);
      syncedCounts.reviews = count;
      addLog('PUSH', 'success', 'Reviews', Date.now() - startTime, `${count} avis synchronisés vers Airtable`, count);
    } catch (e: any) {
      errors.push(`Table Reviews: ${e.message}`);
      addLog('PUSH', 'error', 'Reviews', Date.now() - startTime, `Erreur push Reviews: ${e.message}`);
    }

    // 5. Pousser les Messages
    try {
      const records = inMemoryMessages.map(m => ({ fields: messageToAirtableFields(m) }));
      const count = await batchUpsertToAirtable(bId, tok, airtableConfig.tables.messages || 'Messages', records);
      syncedCounts.messages = count;
      addLog('PUSH', 'success', 'Messages', Date.now() - startTime, `${count} messages synchronisés vers Airtable`, count);
    } catch (e: any) {
      errors.push(`Table Messages: ${e.message}`);
      addLog('PUSH', 'error', 'Messages', Date.now() - startTime, `Erreur push Messages: ${e.message}`);
    }

    const totalSynced = syncedCounts.listings + syncedCounts.bookings + syncedCounts.users + syncedCounts.reviews + syncedCounts.messages;
    const isSuccess = totalSynced > 0;

    airtableConfig.lastSyncAt = new Date().toISOString();
    airtableConfig.lastSyncStatus = isSuccess ? 'success' : 'error';
    saveStoredConfig();

    return {
      success: isSuccess,
      message: isSuccess 
        ? `Synchronisation terminée avec succès ! ${totalSynced} enregistrements synchronisés dans la base Airtable ${bId}.`
        : `La synchronisation a rencontré des blocages : ${errors.join(' | ')}. Assurez-vous d'avoir créé les tables correspondantes dans Airtable.`,
      syncedCounts,
      errors
    };
  },

  // Synchronisation PULL : Importer les données depuis Airtable vers MyStay
  async pullAllFromAirtable(): Promise<{
    success: boolean;
    message: string;
    importedCounts: { listings: number; bookings: number; users: number; reviews: number; messages: number };
    errors: string[];
  }> {
    const bId = (airtableConfig.baseId || DEFAULT_BASE_ID).trim();
    const tok = (airtableConfig.token || '').trim();
    const errors: string[] = [];
    const importedCounts = { listings: 0, bookings: 0, users: 0, reviews: 0, messages: 0 };

    if (!tok) {
      const counts = {
        listings: inMemoryListings.length,
        bookings: inMemoryBookings.length,
        users: inMemoryUsers.length,
        reviews: inMemoryReviews.length,
        messages: inMemoryMessages.length
      };
      addLog('PULL', 'error', 'all', 0, `Aucun token Airtable : import impossible (${counts.listings} annonces locales conservées).`);
      return {
        success: false,
        message: `Aucun token Airtable détecté : import impossible. Ajoutez AIRTABLE_PAT=... dans le fichier .env puis redémarrez le serveur.`,
        importedCounts: { listings: 0, bookings: 0, users: 0, reviews: 0, messages: 0 },
        errors: ['Token Airtable manquant']
      };
    }

    const startTime = Date.now();

    // 1. Lire Listings
    try {
      const records = await fetchAllFromAirtable(bId, tok, airtableConfig.tables.listings || 'Listings');
      if (records.length > 0) {
        const mappedListings = records.map(r => airtableFieldsToListing(r.fields || r, r.id));
        dbService.bulkUpsertListings(mappedListings);
        importedCounts.listings = records.length;
        addLog('PULL', 'success', 'Listings', Date.now() - startTime, `${records.length} hébergements importés depuis Airtable`, records.length);
      }
    } catch (e: any) {
      errors.push(`Table Listings: ${e.message}`);
    }

    // 2. Lire Bookings
    try {
      const records = await fetchAllFromAirtable(bId, tok, airtableConfig.tables.bookings || 'Bookings');
      if (records.length > 0) {
        const mappedBookings = records.map(r => airtableFieldsToBooking(r.fields || r, r.id));
        dbService.bulkUpsertBookings(mappedBookings);
        importedCounts.bookings = records.length;
        addLog('PULL', 'success', 'Bookings', Date.now() - startTime, `${records.length} réservations importées depuis Airtable`, records.length);
      }
    } catch (e: any) {
      errors.push(`Table Bookings: ${e.message}`);
    }

    // 3. Lire Users
    try {
      const records = await fetchAllFromAirtable(bId, tok, airtableConfig.tables.users || 'Users');
      if (records.length > 0) {
        const mappedUsers = records.map(r => ({
          id: r.fields.id || r.id,
          name: r.fields.name || r.fields.full_name || 'Utilisateur',
          email: r.fields.email || '',
          role: r.fields.role || 'voyageur',
          phone: r.fields.phone || '',
          bio: r.fields.bio || '',
          avatar: r.fields.avatar || r.fields.avatar_url || '',
          isHostVerified: Boolean(r.fields.is_host_verified),
          isEmailVerified: Boolean(r.fields.is_email_verified),
          createdAt: r.fields.created_at || new Date().toISOString()
        } as User));
        dbService.bulkUpsertUsers(mappedUsers);
        importedCounts.users = records.length;
        addLog('PULL', 'success', 'Users', Date.now() - startTime, `${records.length} utilisateurs importés depuis Airtable`, records.length);
      }
    } catch (e: any) {
      errors.push(`Table Users: ${e.message}`);
    }

    // 4. Lire Reviews
    try {
      const records = await fetchAllFromAirtable(bId, tok, airtableConfig.tables.reviews || 'Reviews');
      if (records.length > 0) {
        const mappedReviews = records.map(r => ({
          id: r.fields.id || r.id,
          bookingId: r.fields.booking_id || r.fields.bookingId || '',
          listingId: r.fields.listing_id || '',
          travelerId: r.fields.traveler_id || '',
          travelerName: r.fields.traveler_name || 'Voyageur',
          travelerAvatar: r.fields.traveler_avatar || undefined,
          rating: Number(r.fields.rating) || 5,
          comment: r.fields.comment || '',
          status: r.fields.status || undefined,
          isFlagged: Boolean(r.fields.is_flagged),
          hostReply: r.fields.host_reply ? { text: String(r.fields.host_reply) } : undefined,
          createdAt: r.fields.date || r.fields.created_at || new Date().toISOString()
        } as Review));
        dbService.bulkUpsertReviews(mappedReviews);
        importedCounts.reviews = records.length;
        addLog('PULL', 'success', 'Reviews', Date.now() - startTime, `${records.length} avis importés depuis Airtable`, records.length);
      }
    } catch (e: any) {
      errors.push(`Table Reviews: ${e.message}`);
    }

    // 5. Lire Messages
    try {
      const records = await fetchAllFromAirtable(bId, tok, airtableConfig.tables.messages || 'Messages');
      if (records.length > 0) {
        const mappedMessages = records.map(r => airtableFieldsToMessage(r.fields || r, r.id));
        dbService.bulkUpsertMessages(mappedMessages);
        importedCounts.messages = records.length;
        addLog('PULL', 'success', 'Messages', Date.now() - startTime, `${records.length} messages importés depuis Airtable`, records.length);
      }
    } catch (e: any) {
      errors.push(`Table Messages: ${e.message}`);
    }

    const totalImported = importedCounts.listings + importedCounts.bookings + importedCounts.users + importedCounts.reviews + importedCounts.messages;
    return {
      success: totalImported > 0 || errors.length === 0,
      message: `${totalImported} enregistrements récupérés et injectés dans la plateforme.`,
      importedCounts,
      errors
    };
  },

  // Auto-sync unitaire lors de la création d'une réservation ou annonce
  async triggerAutoSync(table: 'Listings' | 'Bookings' | 'Messages' | 'Users' | 'Reviews', record: any) {
    if (!airtableConfig.autoSync || !airtableConfig.token) return;
    const bId = airtableConfig.baseId || DEFAULT_BASE_ID;
    const tok = airtableConfig.token;

    try {
      let fields: any = {};
      if (table === 'Listings') fields = listingToAirtableFields(record);
      else if (table === 'Bookings') fields = bookingToAirtableFields(record);
      else if (table === 'Users') fields = userToAirtableFields(record);
      else if (table === 'Reviews') fields = reviewToAirtableFields(record);
      else if (table === 'Messages') fields = messageToAirtableFields(record);

      const tableKey = table.toLowerCase() as keyof AirtableConfig['tables'];
      const tableName = airtableConfig.tables[tableKey] || table;
      try {
        await batchUpsertToAirtable(bId, tok, tableName, [{ fields }]);
        addLog('AUTO_SYNC', 'success', table, 20, `Enregistrement ${record.id} automatiquement synchronisé dans Airtable`);
      } catch (e: any) {
        addLog('AUTO_SYNC', 'error', table, 20, `Auto-sync échoué pour ${record.id} : ${e.message}`);
        console.warn(`[Airtable] ${e.message}`);
      }
    } catch (err: any) {
      console.warn(`Erreur auto-sync Airtable ${table}:`, err.message);
    }
  },

  // Suppression automatique dans Airtable (recherche la ligne par sa colonne "id")
  async triggerAutoDelete(table: 'Listings' | 'Bookings' | 'Messages' | 'Users' | 'Reviews', id: string) {
    if (!airtableConfig.autoSync || !airtableConfig.token || !id) return;
    const bId = airtableConfig.baseId || DEFAULT_BASE_ID;
    const tok = airtableConfig.token;
    const tableKey = table.toLowerCase() as keyof AirtableConfig['tables'];
    const tableName = airtableConfig.tables[tableKey] || table;
    try {
      const safeId = String(id).replace(/'/g, "\\'");
      const formula = encodeURIComponent(`{id}='${safeId}'`);
      const base = `https://api.airtable.com/v0/${bId}/${encodeURIComponent(tableName)}`;
      const found = await fetch(`${base}?filterByFormula=${formula}&maxRecords=10`, {
        headers: { Authorization: `Bearer ${tok}` }
      });
      if (!found.ok) {
        addLog('AUTO_SYNC', 'warning', table, 0, `Suppression Airtable impossible (${found.status}) pour ${id}`);
        return;
      }
      const data = await found.json();
      const recIds: string[] = (data.records || []).map((r: any) => r.id);
      if (recIds.length === 0) return;
      const qs = recIds.map(r => `records[]=${r}`).join('&');
      const del = await fetch(`${base}?${qs}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok}` } });
      addLog('AUTO_SYNC', del.ok ? 'success' : 'warning', table, 0,
        del.ok ? `Enregistrement ${id} supprimé dans Airtable` : `Suppression Airtable refusée (${del.status}) pour ${id}`);
    } catch (err: any) {
      console.warn(`Erreur suppression Airtable ${table}:`, err.message);
    }
  },

  // Génération de CSV optimisé pour Airtable
  generateCsv(table: 'listings' | 'bookings' | 'users' | 'reviews' | 'messages'): string {
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    if (table === 'listings') {
      const headers = ['id', 'title', 'price_per_night', 'commune', 'department', 'region', 'capacity', 'eco_labels', 'rating', 'status', 'host_name', 'images', 'description'];
      const rows = inMemoryListings.map(l => [
        escapeCsv(l.id),
        escapeCsv(l.title),
        escapeCsv(l.pricePerNight),
        escapeCsv(l.commune),
        escapeCsv(l.department),
        escapeCsv(l.region),
        escapeCsv(l.capacity),
        escapeCsv((l.labels || []).join('; ')),
        escapeCsv(l.rating),
        escapeCsv(l.status),
        escapeCsv(l.hostName),
        escapeCsv((l.images || []).join('\n')),
        escapeCsv(l.description)
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (table === 'bookings') {
      const headers = ['id', 'listing_id', 'listing_title', 'listing_commune', 'traveler_name', 'traveler_email', 'host_name', 'start_date', 'end_date', 'nights_count', 'guests_count', 'total_price', 'status', 'payment_status', 'access_code', 'co2_saved_kg', 'created_at'];
      const rows = inMemoryBookings.map(b => [
        escapeCsv(b.id),
        escapeCsv(b.listingId),
        escapeCsv(b.listingTitle),
        escapeCsv(b.listingCommune),
        escapeCsv(b.travelerName),
        escapeCsv(b.travelerEmail),
        escapeCsv(b.hostName),
        escapeCsv(b.startDate),
        escapeCsv(b.endDate),
        escapeCsv(b.nightsCount),
        escapeCsv(b.guestsCount),
        escapeCsv(b.totalPrice),
        escapeCsv(b.status),
        escapeCsv(b.paymentStatus),
        escapeCsv(b.accessCode),
        escapeCsv(b.co2SavedKg),
        escapeCsv(b.createdAt)
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (table === 'users') {
      const headers = ['id', 'name', 'email', 'role', 'phone', 'is_host_verified', 'is_email_verified', 'bio', 'avatar'];
      const rows = inMemoryUsers.map(u => [
        escapeCsv(u.id),
        escapeCsv(u.name),
        escapeCsv(u.email),
        escapeCsv(u.role),
        escapeCsv(u.phone),
        escapeCsv(u.isHostVerified),
        escapeCsv(u.isEmailVerified),
        escapeCsv(u.bio),
        escapeCsv(u.avatar)
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (table === 'reviews') {
      const headers = ['id', 'listing_id', 'traveler_name', 'rating', 'comment', 'created_at'];
      const rows = inMemoryReviews.map(r => [
        escapeCsv(r.id),
        escapeCsv(r.listingId),
        escapeCsv(r.travelerName),
        escapeCsv(r.rating),
        escapeCsv(r.comment),
        escapeCsv(r.createdAt)
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (table === 'messages') {
      const headers = ['id', 'booking_id', 'sender_id', 'sender_name', 'sender_role', 'content', 'timestamp'];
      const rows = inMemoryMessages.map(m => [
        escapeCsv(m.id),
        escapeCsv(m.bookingId),
        escapeCsv(m.senderId),
        escapeCsv(m.senderName),
        escapeCsv(m.senderRole),
        escapeCsv(m.content),
        escapeCsv(m.timestamp)
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    return '';
  },

  // Importer un lot de données fournies directement (JSON ou CSV paste)
  importRawData(tableName: string, data: any[]) {
    if (!Array.isArray(data) || data.length === 0) {
      return { success: false, message: 'Format invalide ou aucune ligne fournie' };
    }

    if (tableName.toLowerCase().includes('listing')) {
      const mapped = data.map(item => airtableFieldsToListing(item.fields || item, item.id));
      dbService.bulkUpsertListings(mapped);
    } else if (tableName.toLowerCase().includes('booking')) {
      const mapped = data.map(item => airtableFieldsToBooking(item.fields || item, item.id));
      dbService.bulkUpsertBookings(mapped);
    } else if (tableName.toLowerCase().includes('user')) {
      const mapped = data.map(item => ({
        id: item.id || item.fields?.id || `usr_${Date.now()}`,
        name: item.name || item.fields?.name || 'Utilisateur',
        email: item.email || item.fields?.email || '',
        role: item.role || item.fields?.role || 'voyageur',
        phone: item.phone || item.fields?.phone || '',
        isHostVerified: Boolean(item.is_host_verified || item.fields?.is_host_verified),
        isEmailVerified: Boolean(item.is_email_verified || item.fields?.is_email_verified),
        bio: item.bio || item.fields?.bio || '',
        avatar: item.avatar || item.fields?.avatar || '',
        createdAt: item.created_at || item.fields?.created_at || new Date().toISOString()
      }));
      dbService.bulkUpsertUsers(mapped);
    } else if (tableName.toLowerCase().includes('review')) {
      const mapped = data.map(item => ({
        id: item.id || item.fields?.id || `rev_${Date.now()}`,
        bookingId: item.booking_id || item.fields?.booking_id || item.bookingId || '',
        listingId: item.listing_id || item.fields?.listing_id || item.listingId || '',
        travelerId: item.traveler_id || item.fields?.traveler_id || item.travelerId || '',
        travelerName: item.traveler_name || item.fields?.traveler_name || item.travelerName || 'Voyageur',
        rating: Number(item.rating || item.fields?.rating) || 5,
        comment: item.comment || item.fields?.comment || '',
        createdAt: item.date || item.created_at || item.fields?.created_at || new Date().toISOString()
      }));
      dbService.bulkUpsertReviews(mapped);
    } else if (tableName.toLowerCase().includes('message')) {
      const mapped = data.map(item => airtableFieldsToMessage(item.fields || item, item.id));
      dbService.bulkUpsertMessages(mapped);
    }

    addLog('IMPORT', 'success', tableName, 10, `${data.length} enregistrements importés manuellement depuis Airtable`, data.length);
    return {
      success: true,
      message: `${data.length} lignes importées avec succès pour la table ${tableName}.`
    };
  }
};

// Fonctions d'aide HTTP pour Airtable (batching max 10 par requête)
// ─── Adaptation automatique au schéma réel de la base Airtable ─────────────
// On lit la structure des tables (API meta, scope schema.bases:read) puis, pour chaque
// enregistrement, on ne garde que les colonnes existantes et on convertit les valeurs
// dans le bon type (texte, nombre, case à cocher, date, sélection...). Ainsi le site
// fonctionne même si la base a été construite avec d'autres colonnes.
type AirtableField = { name: string; type: string; choices?: string[] };
const READ_ONLY_TYPES = new Set([
  'formula', 'rollup', 'lookup', 'multipleLookupValues', 'count', 'autoNumber', 'createdTime',
  'lastModifiedTime', 'createdBy', 'lastModifiedBy', 'button', 'externalSyncSource', 'aiText'
]);
let schemaCache: { at: number; baseId: string; tables: Map<string, Map<string, AirtableField>> } | null = null;

async function getTableFields(baseId: string, token: string, tableName: string): Promise<Map<string, AirtableField> | null> {
  const fresh = schemaCache && schemaCache.baseId === baseId && Date.now() - schemaCache.at < 10 * 60 * 1000;
  if (!fresh) {
    try {
      const res = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return null; // pas de scope schema.bases:read → on envoie tel quel
      const data: any = await res.json();
      const tables = new Map<string, Map<string, AirtableField>>();
      for (const t of data.tables || []) {
        tables.set(String(t.name).toLowerCase(), new Map((t.fields || []).map((f: any) => [f.name, {
          name: f.name, type: f.type,
          choices: Array.isArray(f.options?.choices) ? f.options.choices.map((c: any) => String(c.name)) : undefined
        }])));
      }
      schemaCache = { at: Date.now(), baseId, tables };
    } catch {
      return null;
    }
  }
  return schemaCache!.tables.get(tableName.toLowerCase()) || null;
}

function toList(v: any): string[] {
  if (Array.isArray(v)) return v.map(x => (typeof x === 'object' && x !== null ? (x.url || x.name || JSON.stringify(x)) : String(x))).filter(Boolean);
  if (typeof v === 'string') return v.split(/[\n,;]/).map(x => x.trim()).filter(Boolean);
  return [];
}

function convertValue(v: any, type: string): any {
  if (v === undefined || v === null) return undefined;
  switch (type) {
    case 'number': case 'currency': case 'percent': case 'rating': case 'duration': {
      const n = Number(v); return Number.isFinite(n) ? n : undefined;
    }
    case 'checkbox': return Boolean(v);
    case 'date': {
      const d = new Date(v); return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
    }
    case 'dateTime': {
      const d = new Date(v); return isNaN(d.getTime()) ? undefined : d.toISOString();
    }
    case 'multipleSelects': return toList(v);
    case 'multipleAttachments': return toList(v).filter(u => /^https?:\/\//.test(u)).map(url => ({ url }));
    case 'singleSelect': return Array.isArray(v) ? (v[0] !== undefined ? String(v[0]) : undefined) : String(v);
    case 'multipleRecordLinks': case 'singleCollaborator': case 'multipleCollaborators': return undefined;
    default: // singleLineText, multilineText, richText, email, url, phoneNumber...
      if (Array.isArray(v)) return v.map(x => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(type === 'singleLineText' ? ', ' : '\n');
      if (typeof v === 'object') return JSON.stringify(v);
      if (typeof v === 'boolean') return v ? 'true' : 'false';
      return String(v);
  }
}

async function adaptFieldsToSchema(baseId: string, token: string, tableName: string, fields: Record<string, any>) {
  const schema = await getTableFields(baseId, token, tableName);
  if (!schema) {
    // Schéma inconnu : on retire seulement les valeurs vides et on aplatit les tableaux
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (v === undefined || v === null) continue;
      out[k] = Array.isArray(v) ? v.join(', ') : (typeof v === 'object' ? JSON.stringify(v) : v);
    }
    return { fields: out, hasId: true };
  }
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(fields)) {
    const f = schema.get(k);
    if (!f || READ_ONLY_TYPES.has(f.type)) continue;
    let cv = convertValue(v, f.type);
    // Listes déroulantes : un "Editor" ne peut pas créer de nouvelle option → on ne garde que les valeurs existantes
    if (f.choices && f.type === 'singleSelect' && cv !== undefined) {
      const match = f.choices.find(c => c.toLowerCase() === String(cv).toLowerCase());
      cv = match;
    }
    if (f.choices && f.type === 'multipleSelects' && Array.isArray(cv)) {
      cv = cv.map((x: string) => f.choices!.find(c => c.toLowerCase() === x.toLowerCase())).filter(Boolean);
    }
    if (cv !== undefined) out[k] = cv;
  }
  const idField = schema.get('id');
  return { fields: out, hasId: Boolean(idField && !READ_ONLY_TYPES.has(idField.type)) };
}

// Traduit les erreurs Airtable en messages compréhensibles avec la piste de correction.
// `rawText` est le corps brut de la réponse HTTP : quand ce n'est PAS du JSON valide, la réponse
// ne vient presque certainement pas d'Airtable (proxy réseau, pare-feu d'entreprise, page d'erreur
// d'un CDN...) et on le dit explicitement au lieu d'inventer un diagnostic Airtable qui induirait en erreur.
function explainAirtableError(status: number, err: any, tableName: string, rawText?: string, wasJson?: boolean): string {
  if (wasJson === false) {
    const preview = (rawText || '').replace(/\s+/g, ' ').trim().slice(0, 200);
    return `Réponse non-JSON reçue (HTTP ${status}) en interrogeant la table "${tableName}" — ce n'est probablement pas une erreur Airtable mais un blocage réseau/proxy avant d'atteindre api.airtable.com (pare-feu, filtrage d'entreprise, DNS...). Extrait de la réponse : "${preview || '(vide)'}". Vérifiez d'abord que api.airtable.com est bien joignable depuis ce serveur.`;
  }
  const type = err?.error?.type || err?.error || '';
  const msg = err?.error?.message || '';
  if (status === 401 || type === 'AUTHENTICATION_REQUIRED') {
    return `Token invalide ou révoqué (401). Vérifiez AIRTABLE_PAT dans .env puis redémarrez le serveur.`;
  }
  if (status === 404 || type === 'NOT_FOUND') {
    return `Table "${tableName}" introuvable (${status}) : ce nom de table n'existe pas dans la base. Vérifiez l'orthographe exacte (majuscules comprises) dans Airtable, ou lancez "npm run airtable:fix" pour la détecter automatiquement.`;
  }
  if (status === 403 || type === 'INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND') {
    return `Accès refusé à la table "${tableName}" (403) : soit elle n'existe pas sous ce nom, soit le token n'a pas accès à cette base/table. Airtable renvoie volontairement la même erreur dans les deux cas (pour ne pas révéler l'existence de tables privées). Vérifiez : 1) le nom exact de la table, 2) que le PAT est bien invité sur cette base précise, 3) les scopes data.records:read / data.records:write sur le token.`;
  }
  if (type === 'UNKNOWN_FIELD_NAME' || /Unknown field name/i.test(msg)) {
    return `Colonne manquante dans la table "${tableName}" : ${msg}. Créez cette colonne dans Airtable (voir AIRTABLE_SCHEMA.md).`;
  }
  if (type === 'INVALID_VALUE_FOR_COLUMN' || /cannot accept the provided value/i.test(msg)) {
    return `Type de colonne incompatible dans "${tableName}" : ${msg}. Utilisez des champs "Single line text" / "Long text" / "Number" comme indiqué dans AIRTABLE_SCHEMA.md.`;
  }
  if (status === 422 && /fieldsToMergeOn/i.test(msg)) {
    return `La table "${tableName}" doit contenir une colonne "id" de type Single line text (utilisée pour éviter les doublons).`;
  }
  if (status === 429) return `Trop de requêtes vers Airtable (429). Réessayez dans 30 secondes.`;
  return `Erreur Airtable HTTP ${status} sur "${tableName}" : ${msg || type || 'inconnue'}`;
}

// Lit le corps d'une réponse HTTP en essayant de le parser en JSON.
// Renvoie aussi le texte brut et si le parsing a réussi, pour distinguer une vraie erreur Airtable
// (toujours du JSON) d'une réponse qui n'en vient pas (page HTML de proxy, texte brut, etc.).
async function parseAirtableErrorBody(res: Response): Promise<{ err: any; rawText: string; wasJson: boolean }> {
  const rawText = await res.text().catch(() => '');
  try {
    return { err: JSON.parse(rawText), rawText, wasJson: true };
  } catch {
    return { err: { error: { message: res.statusText } }, rawText, wasJson: false };
  }
}

async function batchUpsertToAirtable(baseId: string, token: string, tableName: string, records: { fields: any }[]): Promise<number> {
  const CHUNK_SIZE = 10;
  let total = 0;
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  const adapted: { fields: any }[] = [];
  let hasId = true;
  for (const r of records) {
    const a = await adaptFieldsToSchema(baseId, token, tableName, r.fields);
    hasId = a.hasId;
    if (Object.keys(a.fields).length > 0) adapted.push({ fields: a.fields });
  }
  if (!hasId) {
    throw new Error(`La table "${tableName}" n'a pas de colonne "id" (texte) : impossible de synchroniser sans créer de doublons. Ajoutez une colonne "id" de type Single line text.`);
  }

  for (let i = 0; i < adapted.length; i += CHUNK_SIZE) {
    const chunk = adapted.slice(i, i + CHUNK_SIZE);
    // PATCH + performUpsert : met à jour la ligne ayant le même "id", sinon la crée (pas de doublon)
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ performUpsert: { fieldsToMergeOn: ['id'] }, records: chunk, typecast: true })
    });
    if (!res.ok) {
      const { err, rawText, wasJson } = await parseAirtableErrorBody(res);
      throw new Error(explainAirtableError(res.status, err, tableName, rawText, wasJson));
    }
    const data = await res.json();
    total += (data.records || []).length;
  }
  return total;
}

async function fetchAllFromAirtable(baseId: string, token: string, tableName: string): Promise<any[]> {
  const allRecords: any[] = [];
  let offset: string | undefined = undefined;

  do {
    const url: string = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}${offset ? `?offset=${offset}` : ''}`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const { err, rawText, wasJson } = await parseAirtableErrorBody(res);
      throw new Error(explainAirtableError(res.status, err, tableName, rawText, wasJson));
    }

    const data = await res.json();
    if (data.records) {
      allRecords.push(...data.records);
    }
    offset = data.offset;
  } while (offset);

  return allRecords;
}
