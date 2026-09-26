/**
 * Importe les 4 CSV exportés RÉELLEMENT depuis la base Airtable de l'utilisateur
 * (Listings / Bookings / Users / Reviews) dans la base locale de l'app, en utilisant
 * EXACTEMENT les mêmes fonctions de mapping que pullAllFromAirtable() utiliserait
 * lors d'une vraie synchronisation live. Objectif : que l'app tourne avec le contenu
 * réel de la base Airtable, même quand l'API Airtable elle-même est injoignable
 * (pare-feu / proxy réseau) depuis l'environnement où ce script est exécuté.
 *
 * Usage : npx tsx scripts/import-real-airtable-export.ts
 */
import fs from 'fs';
import path from 'path';
import { dbService } from '../server/db';
import { airtableFieldsToListing, airtableFieldsToBooking } from '../server/airtable';
import type { User, Review } from '../src/types';

const EXPORT_FILE = path.join(process.cwd(), 'data', '_airtable_export_real.json');

type RawRow = Record<string, string>;

function loadExport(): { listings: RawRow[]; bookings: RawRow[]; users: RawRow[]; reviews: RawRow[] } {
  const raw = fs.readFileSync(EXPORT_FILE, 'utf-8');
  return JSON.parse(raw);
}

// Même mapping Users que celui utilisé dans pullAllFromAirtable() (server/airtable.ts)
function rawToUser(fields: RawRow): User {
  return {
    id: fields.id,
    name: fields.name || fields.full_name || 'Utilisateur',
    email: fields.email || '',
    role: (fields.role || 'voyageur') as User['role'],
    phone: fields.phone || '',
    bio: fields.bio || '',
    avatar: fields.avatar || fields.avatar_url || '',
    isHostVerified: String(fields.is_host_verified).toLowerCase() === 'true',
    isEmailVerified: String(fields.is_email_verified).toLowerCase() === 'true',
    createdAt: fields.created_at || new Date().toISOString()
  } as User;
}

// Même mapping Reviews que celui utilisé dans pullAllFromAirtable() (server/airtable.ts)
function rawToReview(fields: RawRow): Review {
  return {
    id: fields.id,
    bookingId: fields.booking_id || fields.bookingId || '',
    listingId: fields.listing_id || '',
    travelerId: fields.traveler_id || '',
    travelerName: fields.traveler_name || 'Voyageur',
    travelerAvatar: fields.traveler_avatar || undefined,
    rating: Number(fields.rating) || 5,
    comment: fields.comment || '',
    status: (fields.status || undefined) as Review['status'],
    isFlagged: String(fields.is_flagged).toLowerCase() === 'true',
    hostReply: fields.host_reply ? { text: String(fields.host_reply) } : undefined,
    createdAt: fields.date || fields.created_at || new Date().toISOString()
  } as Review;
}

async function main() {
  const data = loadExport();

  const listings = data.listings.map(f => airtableFieldsToListing(f, f.id));
  const bookings = data.bookings.map(f => airtableFieldsToBooking(f, f.id));
  const users = data.users.map(rawToUser);
  const reviews = data.reviews.map(rawToReview);

  dbService.bulkUpsertListings(listings);
  dbService.bulkUpsertBookings(bookings);
  dbService.bulkUpsertUsers(users);
  dbService.bulkUpsertReviews(reviews);

  console.log(`Import terminé :`);
  console.log(`  - ${listings.length} annonces (Listings)`);
  console.log(`  - ${bookings.length} réservations (Bookings)`);
  console.log(`  - ${users.length} utilisateurs (Users)`);
  console.log(`  - ${reviews.length} avis (Reviews)`);
  console.log(`Données écrites dans data/*.json.`);
}

main().catch(err => {
  console.error('Erreur import :', err);
  process.exit(1);
});
