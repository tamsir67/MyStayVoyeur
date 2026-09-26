import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Booking } from '../types';

export interface ExportResult {
  success: boolean;
  count: number;
  source: 'supabase_direct' | 'supabase_backend' | 'local_state';
  filename: string;
  message: string;
}

/**
 * Fonction d'échappement pour format CSV standard (compatible Excel et LibreOffice)
 */
function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  // Si la valeur contient un point-virgule, des guillemets ou des retours à la ligne, on l'entoure de guillemets
  if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exporte les données des réservations depuis la table 'bookings' de Supabase au format CSV.
 * Tente d'abord une extraction directe via le client Supabase (table 'bookings').
 * En cas d'indisponibilité, interroge l'API backend connectée à Supabase.
 * En dernier recours, utilise l'état applicatif local.
 */
export async function exportBookingsToCsv(fallbackBookings: Booking[] = []): Promise<ExportResult> {
  let rows: any[] = [];
  let source: ExportResult['source'] = 'local_state';

  // 1. TENTATIVE D'EXTRACTION DIRECTE DEPUIS LA TABLE SUPABASE 'bookings'
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        rows = data;
        source = 'supabase_direct';
      }
    } catch (err) {
      console.warn('Erreur lecture Supabase direct pour export CSV:', err);
    }
  }

  // 2. TENTATIVE VIA L'API BACKEND (qui interroge la table Supabase 'bookings')
  if (rows.length === 0) {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          rows = json.data;
          source = 'supabase_backend';
        }
      }
    } catch (err) {
      console.warn('Erreur lecture backend /api/bookings pour export CSV:', err);
    }
  }

  // 3. FALLBACK SUR L'ÉTAT LOCAL SI AUCUNE DONNÉE DISTANTE N'EST RÉCUPÉRÉE
  if (rows.length === 0) {
    rows = fallbackBookings;
    source = 'local_state';
  }

  if (rows.length === 0) {
    return {
      success: false,
      count: 0,
      source,
      filename: '',
      message: 'Aucune donnée de réservation trouvée dans la table bookings pour l\'export.'
    };
  }

  // DÉFINITION DES COLONNES DU CSV (Conforme à la table 'bookings' de Supabase)
  const columns: { label: string; key: (r: any) => any }[] = [
    { label: 'id_reservation', key: r => r.id },
    { label: 'listing_id', key: r => r.listing_id || r.listingId || '' },
    { label: 'titre_hebergement', key: r => r.listing_title || r.listingTitle || '' },
    { label: 'commune', key: r => r.listing_commune || r.listingCommune || '' },
    { label: 'adresse_exacte', key: r => r.exact_address || r.exactAddress || '' },
    { label: 'host_id', key: r => r.host_id || r.hostId || '' },
    { label: 'nom_hote', key: r => r.host_name || r.hostName || '' },
    { label: 'traveler_id', key: r => r.traveler_id || r.travelerId || '' },
    { label: 'nom_voyageur', key: r => r.traveler_name || r.travelerName || '' },
    { label: 'email_voyageur', key: r => r.traveler_email || r.travelerEmail || '' },
    { label: 'date_arrivee', key: r => r.start_date || r.startDate || '' },
    { label: 'date_depart', key: r => r.end_date || r.endDate || '' },
    { label: 'nb_nuits', key: r => r.nights_count ?? r.nightsCount ?? '' },
    { label: 'nb_voyageurs', key: r => r.guests_count ?? r.guestsCount ?? '' },
    { label: 'sous_total_nuits_eur', key: r => r.nightly_total ?? r.nightlyTotal ?? 0 },
    { label: 'frais_menage_eur', key: r => r.cleaning_fee ?? r.cleaningFee ?? 0 },
    { label: 'commission_mystay_eur', key: r => r.service_fee ?? r.serviceFee ?? 0 },
    { label: 'taxe_sejour_eur', key: r => r.tourist_tax ?? r.touristTax ?? 0 },
    { label: 'montant_total_ttc_eur', key: r => r.total_price ?? r.totalPrice ?? 0 },
    { label: 'revenu_net_hote_eur', key: r => r.host_net_earnings ?? r.hostNetEarnings ?? 0 },
    { label: 'statut_reservation', key: r => r.status || '' },
    { label: 'statut_paiement', key: r => r.payment_status || r.paymentStatus || '' },
    { label: 'code_acces', key: r => r.access_code || r.accessCode || '' },
    { label: 'co2_economise_kg', key: r => r.co2_saved_kg ?? r.co2SavedKg ?? '' },
    { label: 'date_creation', key: r => r.created_at || r.createdAt || '' }
  ];

  // Construction de l'en-tête et des lignes
  const headerLine = columns.map(c => escapeCsvValue(c.label)).join(';');
  const dataLines = rows.map(row => 
    columns.map(c => escapeCsvValue(c.key(row))).join(';')
  );

  // Utilisation de UTF-8 BOM (\uFEFF) pour l'ouverture native sans problème d'accents dans Microsoft Excel
  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = `${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
  const filename = `mystay_supabase_bookings_${dateStr}_${timeStr}.csv`;

  // Déclenchement du téléchargement côté navigateur
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  const sourceLabels = {
    supabase_direct: "table 'bookings' de Supabase (client direct)",
    supabase_backend: "table 'bookings' de Supabase (API serveur)",
    local_state: "stockage des réservations (mode local)"
  };

  return {
    success: true,
    count: rows.length,
    source,
    filename,
    message: `${rows.length} réservation(s) exportée(s) avec succès depuis la ${sourceLabels[source]}.`
  };
}
