import { Router, Request, Response } from 'express';
import { dbService } from '../db';
import { airtableService } from '../airtable';

export const reviewsRouter = Router();

// GET /api/reviews
reviewsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const listingId = req.query.listingId as string | undefined;
    const reviews = await dbService.getReviews(listingId);
    res.json({ success: true, data: reviews, count: reviews.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/reviews
reviewsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const review = req.body;
    if (!review.listingId || !review.rating || !review.comment) {
      return res.status(400).json({ success: false, error: 'Avis incomplet' });
    }
    const created = await dbService.createReview(review);
    airtableService.triggerAutoSync('Reviews', created).catch(() => {});
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/reviews/:id
reviewsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await dbService.updateReview(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Avis non trouvé' });
    }
    airtableService.triggerAutoSync('Reviews', updated).catch(() => {});
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/reviews/:id
reviewsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await dbService.deleteReview(req.params.id);
    airtableService.triggerAutoDelete('Reviews', req.params.id).catch(() => {});
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
