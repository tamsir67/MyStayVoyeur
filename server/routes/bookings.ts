import { Router, Request, Response } from 'express';
import { dbService } from '../db';
import { airtableService } from '../airtable';

export const bookingsRouter = Router();

// GET /api/bookings/export-csv - Exporter les données de la table 'bookings' Supabase au format CSV
bookingsRouter.get('/export-csv', async (_req: Request, res: Response) => {
  try {
    const bookings = await dbService.getBookings();
    
    // En-têtes conformes au schéma de la table 'bookings' de Supabase
    const headers = [
      'id',
      'listing_id',
      'listing_title',
      'listing_commune',
      'traveler_id',
      'traveler_name',
      'traveler_email',
      'host_id',
      'host_name',
      'start_date',
      'end_date',
      'nights_count',
      'guests_count',
      'nightly_total',
      'cleaning_fee',
      'service_fee',
      'tourist_tax',
      'total_price',
      'host_net_earnings',
      'status',
      'payment_status',
      'access_code',
      'co2_saved_kg',
      'created_at'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = bookings.map(b => [
      escapeCsv(b.id),
      escapeCsv(b.listingId),
      escapeCsv(b.listingTitle),
      escapeCsv(b.listingCommune),
      escapeCsv(b.travelerId),
      escapeCsv(b.travelerName),
      escapeCsv(b.travelerEmail),
      escapeCsv(b.hostId),
      escapeCsv(b.hostName),
      escapeCsv(b.startDate),
      escapeCsv(b.endDate),
      escapeCsv(b.nightsCount),
      escapeCsv(b.guestsCount),
      escapeCsv(b.nightlyTotal),
      escapeCsv(b.cleaningFee),
      escapeCsv(b.serviceFee),
      escapeCsv(b.touristTax),
      escapeCsv(b.totalPrice),
      escapeCsv(b.hostNetEarnings),
      escapeCsv(b.status),
      escapeCsv(b.paymentStatus),
      escapeCsv(b.accessCode || ''),
      escapeCsv(b.co2SavedKg || ''),
      escapeCsv(b.createdAt)
    ].join(';'));

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="mystay_supabase_bookings_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bookings
bookingsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const travelerId = req.query.travelerId as string | undefined;
    const hostId = req.query.hostId as string | undefined;
    const bookings = await dbService.getBookings(travelerId, hostId);
    res.json({ success: true, data: bookings, count: bookings.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bookings
bookingsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const newBooking = req.body;
    if (!newBooking.listingId || !newBooking.startDate || !newBooking.endDate) {
      return res.status(400).json({ success: false, error: 'Données de réservation incomplètes' });
    }
    const created = await dbService.createBooking(newBooking);
    // Auto-sync avec Airtable en arrière-plan
    airtableService.triggerAutoSync('Bookings', created).catch(() => {});
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/bookings/:id/status
bookingsRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updated = await dbService.updateBookingStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Réservation non trouvée' });
    }
    airtableService.triggerAutoSync('Bookings', updated).catch(() => {});
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/bookings/:id
bookingsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await dbService.updateBooking(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Réservation non trouvée' });
    }
    airtableService.triggerAutoSync('Bookings', updated).catch(() => {});
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/bookings/:id
bookingsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await dbService.deleteBooking(req.params.id);
    airtableService.triggerAutoDelete('Bookings', req.params.id).catch(() => {});
    res.json({ success: true, message: `Réservation ${req.params.id} supprimée de la table Supabase.` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bookings/seed-examples
bookingsRouter.post('/seed-examples', async (_req: Request, res: Response) => {
  try {
    const examples = await dbService.seedExampleBookings();
    res.json({ 
      success: true, 
      data: examples, 
      message: `${examples.length} exemples de réservation insérés directement dans la table Supabase.` 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

