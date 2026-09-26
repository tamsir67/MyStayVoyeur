import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Listing, Booking, Review, ListingStatus, BookingStatus, MyStayLabel } from '../types';

// ==============================================================================
// 1. TYPES TYPESCRIPT DÉDIÉS AUX TABLES SUPABASE (PostgreSQL)
// ==============================================================================

/**
 * Schéma de la table 'public.listings'
 */
export interface ListingRow {
  id: string;
  host_id: string | null;
  host_name: string;
  host_avatar: string | null;
  title: string;
  description: string;
  property_type: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  price_per_night: number;
  cleaning_fee: number;
  min_nights: number;
  max_nights: number;
  booking_mode: 'instant' | 'on_demand';
  cancellation_policy: 'souple' | 'moderee' | 'stricte';
  
  // Localisation
  region: string;
  department: string;
  commune: string;
  approx_location: string;
  exact_address: string | null;
  lat: number;
  lng: number;
  
  // Médias et Équipements
  images: string[];
  amenities: string[];
  house_rules: string[];
  local_tips: string | null;
  
  // Pratiques durables et Labels
  sustainable_practices: string[];
  labels: MyStayLabel[];
  
  // Modération
  status: ListingStatus;
  admin_comment: string | null;
  submitted_at: string | null;
  published_at: string | null;
  
  // Calendrier
  blocked_dates: string[];
  
  // Métriques
  rating: number;
  review_count: number;
  impact_score_kg_co2_saved_per_night: number;
  
  created_at: string;
  updated_at: string;
}

export type ListingInsert = Omit<ListingRow, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type ListingUpdate = Partial<ListingRow>;

/**
 * Schéma de la table 'public.bookings'
 */
export interface BookingRow {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_image: string | null;
  listing_commune: string;
  exact_address: string | null;
  
  host_id: string | null;
  host_name: string;
  traveler_id: string | null;
  traveler_name: string;
  traveler_email: string;
  
  start_date: string; // Format ISO / YYYY-MM-DD
  end_date: string;   // Format ISO / YYYY-MM-DD
  nights_count: number;
  guests_count: number;
  
  // Détail financier
  nightly_total: number;
  cleaning_fee: number;
  service_fee: number;
  tourist_tax: number;
  total_price: number;
  host_net_earnings: number;
  
  status: BookingStatus;
  payment_status: 'paid' | 'pending' | 'refunded';
  payment_intent_id: string | null;
  stripe_receipt_url: string | null;
  access_code: string | null;
  co2_saved_kg: number | null;
  has_review: boolean;
  
  created_at: string;
  updated_at: string;
}

export type BookingInsert = Omit<BookingRow, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type BookingUpdate = Partial<BookingRow>;

/**
 * Schéma de la table 'public.reviews'
 */
export interface ReviewRow {
  id: string;
  booking_id: string;
  listing_id: string;
  traveler_id: string | null;
  traveler_name: string;
  traveler_avatar: string | null;
  rating: number; // 1 à 5
  sub_ratings: {
    cleanliness: number;
    authenticity: number;
    ecoResponsibility: number;
    hostWelcome: number;
  };
  comment: string;
  host_reply: {
    text: string;
    repliedAt: string;
  } | null;
  is_flagged: boolean;
  status: 'valid' | 'hidden';
  created_at: string;
}

export type ReviewInsert = Omit<ReviewRow, 'created_at'> & {
  created_at?: string;
};

export type ReviewUpdate = Partial<ReviewRow>;

/**
 * Définition globale du schéma Supabase pour le client typé
 */
export interface Database {
  public: {
    Tables: {
      listings: {
        Row: ListingRow;
        Insert: ListingInsert;
        Update: ListingUpdate;
      };
      bookings: {
        Row: BookingRow;
        Insert: BookingInsert;
        Update: BookingUpdate;
      };
      reviews: {
        Row: ReviewRow;
        Insert: ReviewInsert;
        Update: ReviewUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      listing_status: ListingStatus;
      booking_status: BookingStatus;
      user_role: 'voyageur' | 'hote' | 'admin';
    };
  };
}

// ==============================================================================
// 2. CONFIGURATION ET INITIALISATION DU CLIENT SUPABASE TYPÉ
// ==============================================================================

export const getSupabaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) {
    return import.meta.env.VITE_SUPABASE_URL;
  }
  if (typeof process !== 'undefined' && process.env?.SUPABASE_URL) {
    return process.env.SUPABASE_URL;
  }
  return '';
};

export const getSupabaseAnonKey = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) {
    return import.meta.env.VITE_SUPABASE_ANON_KEY;
  }
  if (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) {
    return process.env.SUPABASE_ANON_KEY;
  }
  return '';
};

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  supabaseUrl.startsWith('https://')
);

/**
 * Instance Supabase typée prête à l'emploi.
 * Si les variables d'environnement ne sont pas encore renseignées, le client
 * retourne null ou un fallback pour éviter tout plantage côté frontend.
 */
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Fonction d'accès sécurisé vérifiant la présence de la configuration.
 */
export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (!supabase) {
    throw new Error(
      "Supabase n'est pas encore configuré. Veuillez définir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans votre fichier .env."
    );
  }
  return supabase;
};

// ==============================================================================
// 3. CONVERTISSEURS SÉCURISÉS (FRONTEND CAMELCASE <-> SUPABASE SNAKE_CASE)
// ==============================================================================

export function listingRowToListing(row: ListingRow): Listing {
  return {
    id: row.id,
    hostId: row.host_id || '',
    hostName: row.host_name,
    hostAvatar: row.host_avatar || '',
    title: row.title,
    description: row.description,
    propertyType: row.property_type as any,
    capacity: row.capacity,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    pricePerNight: Number(row.price_per_night),
    cleaningFee: Number(row.cleaning_fee),
    minNights: row.min_nights,
    maxNights: row.max_nights,
    bookingMode: row.booking_mode,
    cancellationPolicy: row.cancellation_policy,
    region: row.region,
    department: row.department,
    commune: row.commune,
    approxLocation: row.approx_location,
    exactAddress: row.exact_address || undefined,
    lat: Number(row.lat),
    lng: Number(row.lng),
    images: row.images || [],
    amenities: row.amenities || [],
    houseRules: row.house_rules || [],
    localTips: row.local_tips || '',
    sustainablePractices: row.sustainable_practices || [],
    labels: (row.labels as MyStayLabel[]) || [],
    status: row.status,
    adminComment: row.admin_comment || undefined,
    submittedAt: row.submitted_at || undefined,
    publishedAt: row.published_at || undefined,
    blockedDates: row.blocked_dates || [],
    rating: Number(row.rating),
    reviewCount: Number(row.review_count),
    impactScoreKgCo2SavedPerNight: Number(row.impact_score_kg_co2_saved_per_night)
  };
}

export function bookingRowToBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    listingId: row.listing_id,
    listingTitle: row.listing_title,
    listingImage: row.listing_image || '',
    listingCommune: row.listing_commune,
    exactAddress: row.exact_address || undefined,
    hostId: row.host_id || '',
    hostName: row.host_name,
    travelerId: row.traveler_id || '',
    travelerName: row.traveler_name,
    travelerEmail: row.traveler_email,
    startDate: row.start_date,
    endDate: row.end_date,
    nightsCount: Number(row.nights_count),
    guestsCount: Number(row.guests_count),
    nightlyTotal: Number(row.nightly_total),
    cleaningFee: Number(row.cleaning_fee),
    serviceFee: Number(row.service_fee),
    touristTax: Number(row.tourist_tax),
    totalPrice: Number(row.total_price),
    hostNetEarnings: Number(row.host_net_earnings),
    status: row.status,
    paymentStatus: row.payment_status,
    paymentIntentId: row.payment_intent_id || undefined,
    stripeReceiptUrl: row.stripe_receipt_url || undefined,
    accessCode: row.access_code || undefined,
    co2SavedKg: row.co2_saved_kg ? Number(row.co2_saved_kg) : undefined,
    createdAt: row.created_at,
    hasReview: Boolean(row.has_review)
  };
}

export function reviewRowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    bookingId: row.booking_id,
    listingId: row.listing_id,
    travelerId: row.traveler_id || '',
    travelerName: row.traveler_name,
    travelerAvatar: row.traveler_avatar || '',
    rating: Number(row.rating),
    subRatings: row.sub_ratings,
    comment: row.comment,
    createdAt: row.created_at,
    hostReply: row.host_reply || undefined,
    isFlagged: Boolean(row.is_flagged),
    status: row.status
  };
}
