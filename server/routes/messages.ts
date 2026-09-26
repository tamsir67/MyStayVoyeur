import { Router, Request, Response } from 'express';
import { dbService } from '../db';
import { airtableService } from '../airtable';
import { Message } from '../../src/types';

export const messagesRouter = Router();

// GET /api/messages - Récupération des messages (optionnellement filtrés par bookingId)
messagesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const bookingId = req.query.bookingId as string | undefined;
    const messages = await dbService.getMessages(bookingId);
    res.json({ success: true, data: messages, count: messages.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Erreur récupération messages' });
  }
});

// POST /api/messages - Envoi d'un message et synchronisation immédiate Supabase
messagesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as Partial<Message>;
    if (!body.content || !body.bookingId) {
      return res.status(400).json({ success: false, error: 'bookingId et content requis' });
    }

    const message: Message = {
      id: body.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      bookingId: body.bookingId,
      senderId: body.senderId || 'usr_voyageur_1',
      senderName: body.senderName || 'Voyageur',
      senderRole: body.senderRole || 'voyageur',
      content: body.content.trim(),
      timestamp: body.timestamp || new Date().toISOString()
    };

    const created = await dbService.createMessage(message);
    airtableService.triggerAutoSync('Messages', created).catch(() => {});
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Erreur création message' });
  }
});
