import { Router, Request, Response } from 'express';
import { dbService } from '../db';
import { airtableService } from '../airtable';
import { User } from '../../src/types';

export const usersRouter = Router();

// GET /api/users - Liste des utilisateurs
usersRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await dbService.getUsers();
    res.json({ success: true, data: users });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Erreur récupération utilisateurs' });
  }
});

// GET /api/users/:id - Récupération d'un profil
usersRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await dbService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Erreur récupération profil' });
  }
});

// PUT /api/users/:id - Mise à jour du profil et de la photo
usersRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: 'Données de mise à jour requises' });
    }

    const result = await dbService.updateUser(id, updates);
    airtableService.triggerAutoSync('Users', result.user).catch(() => {});

    res.json({
      success: true,
      data: result.user,
      storage: result.storage,
      supabaseError: result.supabaseError || null,
      message: result.storage === 'supabase_and_local'
        ? 'Photo et profil sauvegardés dans Supabase et base locale'
        : 'Photo et profil sauvegardés en base locale serveur'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Erreur mise à jour utilisateur' });
  }
});

// POST /api/users - Création / synchronisation d'un profil
usersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const user = req.body as User;
    if (!user || !user.id || !user.email) {
      return res.status(400).json({ success: false, error: 'ID et email requis' });
    }

    const result = await dbService.createUser(user);
    airtableService.triggerAutoSync('Users', result.user).catch(() => {});
    res.status(201).json({
      success: true,
      data: result.user,
      storage: result.storage,
      message: 'Utilisateur créé et synchronisé avec succès'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Erreur création utilisateur' });
  }
});

// DELETE /api/users/:id
usersRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await dbService.deleteUser(req.params.id);
    airtableService.triggerAutoDelete('Users', req.params.id).catch(() => {});
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Erreur suppression utilisateur' });
  }
});
