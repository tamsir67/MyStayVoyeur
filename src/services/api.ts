import { Listing, Booking, Review, User, Message } from '../types';

const API_BASE = '/api';

export const apiService = {
  // USERS & PROFILES
  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (!res.ok) throw new Error('Erreur récupération utilisateurs');
      const json = await res.json();
      return json.data;
    } catch (e) {
      console.warn('Fallback local getUsers:', e);
      return [];
    }
  },

  async getUser(id: string): Promise<User | null> {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    } catch (e) {
      return null;
    }
  },

  async updateUser(id: string, updates: Partial<User>): Promise<{ success: boolean; data?: User; storage?: string; supabaseError?: string; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message || 'Erreur réseau' };
    }
  },

  async createUser(user: User): Promise<{ success: boolean; data?: User }> {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  // LISTINGS
  async getListings(region?: string, status?: string): Promise<Listing[]> {
    try {
      const params = new URLSearchParams();
      if (region && region !== 'all') params.append('region', region);
      if (status) params.append('status', status);
      const res = await fetch(`${API_BASE}/listings?${params.toString()}`);
      if (!res.ok) throw new Error('Erreur récupération hébergements');
      const json = await res.json();
      return json.data;
    } catch (e) {
      console.warn('Fallback local pour getListings:', e);
      return [];
    }
  },

  async getListingById(id: string): Promise<Listing | null> {
    try {
      const res = await fetch(`${API_BASE}/listings/${id}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    } catch (e) {
      console.warn('Fallback local pour getListingById:', e);
      return null;
    }
  },

  async createListing(listing: Listing): Promise<Listing> {
    const res = await fetch(`${API_BASE}/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing)
    });
    if (!res.ok) throw new Error('Erreur création hébergement');
    const json = await res.json();
    return json.data;
  },

  async updateListing(id: string, updates: Partial<Listing>): Promise<Listing> {
    const res = await fetch(`${API_BASE}/listings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Erreur modification hébergement');
    const json = await res.json();
    return json.data;
  },

  async deleteListing(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/listings/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  async updateListingStatus(id: string, status: Listing['status'], adminComment?: string): Promise<Listing> {
    const res = await fetch(`${API_BASE}/listings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminComment })
    });
    if (!res.ok) throw new Error('Erreur mise à jour statut hébergement');
    const json = await res.json();
    return json.data;
  },

  // BOOKINGS (Actions directes sur table Supabase)
  async getBookings(travelerId?: string, hostId?: string): Promise<Booking[]> {
    try {
      const params = new URLSearchParams();
      if (travelerId) params.append('travelerId', travelerId);
      if (hostId) params.append('hostId', hostId);
      const res = await fetch(`${API_BASE}/bookings?${params.toString()}`);
      if (!res.ok) throw new Error('Erreur récupération réservations');
      const json = await res.json();
      return json.data;
    } catch (e) {
      console.warn('Fallback local pour getBookings:', e);
      return [];
    }
  },

  async createBooking(booking: Booking): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    if (!res.ok) throw new Error('Erreur création réservation');
    const json = await res.json();
    return json.data;
  },

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Erreur mise à jour réservation');
    const json = await res.json();
    return json.data;
  },

  async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Erreur mise à jour réservation');
    const json = await res.json();
    return json.data;
  },

  async deleteBooking(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  },

  async seedExampleBookings(): Promise<Booking[]> {
    const res = await fetch(`${API_BASE}/bookings/seed-examples`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Erreur injection des exemples');
    const json = await res.json();
    return json.data;
  },

  // REVIEWS
  async getReviews(listingId?: string): Promise<Review[]> {
    try {
      const params = new URLSearchParams();
      if (listingId) params.append('listingId', listingId);
      const res = await fetch(`${API_BASE}/reviews?${params.toString()}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data;
    } catch (e) {
      return [];
    }
  },

  async createReview(review: Review): Promise<Review> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    if (!res.ok) throw new Error('Erreur ajout avis');
    const json = await res.json();
    return json.data;
  },

  async updateReview(id: string, updates: Partial<Review>): Promise<Review> {
    const res = await fetch(`${API_BASE}/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Erreur mise à jour avis');
    const json = await res.json();
    return json.data;
  },

  async deleteReview(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/reviews/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  // MESSAGES
  async getMessages(bookingId?: string): Promise<Message[]> {
    try {
      const url = bookingId ? `${API_BASE}/messages?bookingId=${encodeURIComponent(bookingId)}` : `${API_BASE}/messages`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erreur récupération messages');
      const json = await res.json();
      return json.data;
    } catch (e) {
      console.warn('Fallback messages:', e);
      return [];
    }
  },

  async createMessage(message: Partial<Message>): Promise<Message> {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    if (!res.ok) throw new Error('Erreur envoi message');
    const json = await res.json();
    return json.data;
  },

  // SUPABASE & SYSTEM / HEALTH
  async getSupabaseStatus() {
    try {
      const res = await fetch(`${API_BASE}/supabase/status`);
      if (!res.ok) throw new Error('Erreur statut Supabase');
      return await res.json();
    } catch (e) {
      return { 
        success: false, 
        data: { connected: false, mode: 'local' }, 
        logs: [] 
      };
    }
  },

  async updateSupabaseConfig(url: string, key: string) {
    const res = await fetch(`${API_BASE}/supabase/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, key })
    });
    return await res.json();
  },

  async getSupabaseSchemaText(): Promise<string> {
    const res = await fetch(`${API_BASE}/supabase/schema`);
    return await res.text();
  },

  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch (e) {
      return { status: 'offline', supabase: { connected: false } };
    }
  }
};
