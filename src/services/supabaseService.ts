import { supabase, isSupabaseConfigured, listingRowToListing, bookingRowToBooking, reviewRowToReview, BookingInsert, ReviewInsert } from '../lib/supabaseClient';
import type { Listing, Booking, Review } from '../types';

/**
 * Service Frontend dédié pour interagir directement et de façon découplée avec Supabase
 * Ce service fonctionne soit en direct avec le client Supabase (via Anon Key et RLS),
 * soit via l'API backend Express (/api/*) en mode séparé.
 */
export const supabaseService = {
  /**
   * Vérifie l'état de la connexion directe Supabase côté client
   */
  async testDirectConnection(): Promise<{
    connected: boolean;
    url: string;
    mode: 'client_direct' | 'backend_proxy';
    tables: {
      listings: boolean;
      bookings: boolean;
      reviews: boolean;
      profiles: boolean;
      messages: boolean;
    };
    error?: string;
  }> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        connected: false,
        url: 'Non configuré',
        mode: 'backend_proxy',
        tables: { listings: false, bookings: false, reviews: false, profiles: false, messages: false },
        error: 'Variables VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY absentes.'
      };
    }

    try {
      // Test de lecture sur la table bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .limit(1);

      // Test de lecture sur la table listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('id')
        .limit(1);

      // Test de lecture sur la table reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id')
        .limit(1);

      // Test de lecture sur la table profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      // Test de lecture sur la table messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .limit(1);

      return {
        connected: !bookingsError || !listingsError || !reviewsError || !profilesError,
        url: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'Direct Client',
        mode: 'client_direct',
        tables: {
          listings: !listingsError,
          bookings: !bookingsError,
          reviews: !reviewsError,
          profiles: !profilesError,
          messages: !messagesError
        },
        error: bookingsError ? bookingsError.message : (profilesError ? profilesError.message : undefined)
      };
    } catch (e: any) {
      return {
        connected: false,
        url: 'Erreur',
        mode: 'client_direct',
        tables: { listings: false, bookings: false, reviews: false, profiles: false, messages: false },
        error: e.message || 'Erreur réseau Supabase'
      };
    }
  },

  /**
   * Récupérer les réservations directement depuis la table Supabase
   */
  async getBookingsDirect(travelerId?: string, hostId?: string): Promise<Booking[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (travelerId) query = query.eq('traveler_id', travelerId);
      if (hostId) query = query.eq('host_id', hostId);

      const { data, error } = await query;
      if (error || !data) {
        console.warn('Erreur Supabase direct:', error);
        return null;
      }

      return data.map(bookingRowToBooking);
    } catch (err) {
      console.warn('Exception Supabase direct:', err);
      return null;
    }
  },

  /**
   * Créer une réservation directement dans la table Supabase
   */
  async createBookingDirect(bookingRow: BookingInsert): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const { error } = await (supabase as any).from('bookings').insert([bookingRow]);
      if (error) {
        console.error('Erreur insertion Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Exception insertion Supabase:', err);
      return false;
    }
  },

  /**
   * Récupérer les hébergements directement depuis Supabase
   */
  async getListingsDirect(region?: string): Promise<Listing[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      let query = supabase.from('listings').select('*').eq('status', 'publiee');
      if (region && region !== 'all') {
        query = query.eq('region', region);
      }

      const { data, error } = await query;
      if (error || !data) return null;

      return data.map(listingRowToListing);
    } catch {
      return null;
    }
  },

  /**
   * Mettre à jour les identifiants Supabase côté serveur dynamiquement
   */
  async configureBackendSupabase(url: string, key: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/supabase/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, key })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Erreur réseau lors de la configuration backend' };
    }
  },

  /**
   * Vérifier l'état de la connexion Supabase côté backend
   */
  async getBackendSupabaseStatus(): Promise<any> {
    try {
      const res = await fetch('/api/supabase/status');
      return await res.json();
    } catch {
      return { success: false };
    }
  }
};
