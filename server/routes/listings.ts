import { Router, Request, Response } from 'express';
import { dbService } from '../db';
import { airtableService } from '../airtable';

export const listingsRouter = Router();

// GET /api/listings
listingsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const region = req.query.region as string | undefined;
    const status = req.query.status as string | undefined;
    const listings = await dbService.getListings(region, status);
    res.json({ success: true, data: listings, count: listings.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/listings/:id
listingsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const listing = await dbService.getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Hébergement non trouvé' });
    }
    res.json({ success: true, data: listing });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/listings
listingsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const newListing = req.body;
    if (!newListing.title || !newListing.region || !newListing.pricePerNight) {
      return res.status(400).json({ success: false, error: 'Données requises manquantes' });
    }
    const created = await dbService.createListing(newListing);
    // Auto-sync avec Airtable
    airtableService.triggerAutoSync('Listings', created).catch(() => {});
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/listings/:id/status
listingsRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, adminComment } = req.body;
    const updated = await dbService.updateListingStatus(req.params.id, status, adminComment);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Hébergement non trouvé' });
    }
    airtableService.triggerAutoSync('Listings', updated).catch(() => {});
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/listings/:id
listingsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await dbService.updateListing(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Hébergement non trouvé' });
    }
    airtableService.triggerAutoSync('Listings', updated).catch(() => {});
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/listings/:id
listingsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await dbService.deleteListing(req.params.id);
    airtableService.triggerAutoDelete('Listings', req.params.id).catch(() => {});
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
