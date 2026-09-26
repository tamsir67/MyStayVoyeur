import { Router, Request, Response } from 'express';
import { airtableService } from '../airtable';
import fs from 'fs';
import path from 'path';

export const airtableRouter = Router();

// Middleware spécifique à airtableRouter : s'assure que le Content-Type est toujours JSON sauf pour les exports CSV
airtableRouter.use((req, res, next) => {
  if (!req.path.startsWith('/export-csv')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  next();
});

// GET /api/airtable, /api/airtable/config, /api/airtable/status
const handleGetConfig = (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: airtableService.getConfig(),
    logs: airtableService.getLogs().slice(0, 30)
  });
};

airtableRouter.get('/', handleGetConfig);
airtableRouter.get('/config', handleGetConfig);
airtableRouter.get('/status', handleGetConfig);

// GET /api/airtable/logs
airtableRouter.get('/logs', (_req: Request, res: Response) => {
  res.json({
    success: true,
    logs: airtableService.getLogs()
  });
});

// POST /api/airtable/config ou POST /api/airtable
const handlePostConfig = async (req: Request, res: Response) => {
  const { baseId, token, syncMode, autoSync, tables } = req.body || {};

  const updates: any = {};
  if (baseId !== undefined) updates.baseId = String(baseId).trim();
  if (token !== undefined) updates.token = String(token).trim();
  if (syncMode !== undefined) updates.syncMode = syncMode;
  if (autoSync !== undefined) updates.autoSync = Boolean(autoSync);
  if (tables && typeof tables === 'object') {
    updates.tables = tables;
  }

  const updatedConfig = airtableService.updateConfig(updates);

  // Sauvegarder dans .env si un token a été fourni
  if (updates.token || updates.baseId) {
    try {
      const envPath = path.join(process.cwd(), '.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }

      const baseLine = `AIRTABLE_BASE_ID=${updates.baseId || updatedConfig.baseId}`;
      const tokenLine = `AIRTABLE_PAT=${updates.token}`;

      if (envContent.includes('AIRTABLE_BASE_ID=')) {
        envContent = envContent.replace(/AIRTABLE_BASE_ID=.*/g, baseLine);
      } else {
        envContent += `\n${baseLine}`;
      }

      if (updates.token) {
        if (envContent.includes('AIRTABLE_PAT=')) {
          envContent = envContent.replace(/AIRTABLE_PAT=.*/g, tokenLine);
        } else {
          envContent += `\n${tokenLine}`;
        }
      }

      fs.writeFileSync(envPath, envContent, 'utf-8');
    } catch (e) {
      console.warn('Notice: impossible d\'écrire dans .env:', e);
    }
  }

  // Tester automatiquement la connexion si un token est présent
  let testResult: any = null;
  if (updatedConfig.hasToken) {
    // Le token n'est plus renvoyé par getConfig() : testConnection utilise le token stocké côté serveur
    testResult = await airtableService.testConnection(updatedConfig.baseId);
  }

  res.json({
    success: true,
    message: 'Configuration Airtable mise à jour avec succès.',
    data: updatedConfig,
    testResult
  });
};

airtableRouter.post('/', handlePostConfig);
airtableRouter.post('/config', handlePostConfig);

// POST /api/airtable/test
airtableRouter.post('/test', async (req: Request, res: Response) => {
  const { baseId, token } = req.body || {};
  const result = await airtableService.testConnection(baseId, token);
  res.json(result);
});

// POST /api/airtable/sync-push
airtableRouter.post('/sync-push', async (_req: Request, res: Response) => {
  try {
    const result = await airtableService.pushAllToAirtable();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: `Erreur synchronisation Airtable : ${err.message}`,
      errors: [err.message]
    });
  }
});

// POST /api/airtable/sync-pull
airtableRouter.post('/sync-pull', async (_req: Request, res: Response) => {
  try {
    const result = await airtableService.pullAllFromAirtable();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: `Erreur import Airtable : ${err.message}`,
      errors: [err.message]
    });
  }
});

// POST /api/airtable/sync (Alias universel pour synchroniser dans les deux sens ou selon paramètre)
airtableRouter.post('/sync', async (req: Request, res: Response) => {
  const mode = req.query.mode || req.body?.mode || 'push';
  try {
    if (mode === 'pull') {
      const result = await airtableService.pullAllFromAirtable();
      return res.json(result);
    } else if (mode === 'both') {
      const pullResult = await airtableService.pullAllFromAirtable();
      const pushResult = await airtableService.pushAllToAirtable();
      return res.json({
        success: pullResult.success && pushResult.success,
        message: 'Synchronisation bidirectionnelle terminée.',
        pull: pullResult,
        push: pushResult
      });
    } else {
      const result = await airtableService.pushAllToAirtable();
      return res.json(result);
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: `Erreur synchronisation : ${err.message}`,
      errors: [err.message]
    });
  }
});

// GET /api/airtable/export-csv/:table
airtableRouter.get('/export-csv/:table', (req: Request, res: Response) => {
  const rawTable = String(req.params.table).toLowerCase();
  const validTables = ['listings', 'bookings', 'users', 'reviews', 'messages'];
  
  if (!validTables.includes(rawTable)) {
    return res.status(400).json({
      success: false,
      error: `Table invalide '${rawTable}'. Choix autorisés : ${validTables.join(', ')}.`
    });
  }

  const table = rawTable as 'listings' | 'bookings' | 'users' | 'reviews' | 'messages';
  const csv = airtableService.generateCsv(table);
  const filename = `MyStay_${table.toUpperCase()}_Airtable_appIt4PVIpjgrmhri.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csv);
});

// GET /api/airtable/export-bundle
airtableRouter.get('/export-bundle', (_req: Request, res: Response) => {
  res.json({
    baseId: 'appIt4PVIpjgrmhri',
    exportedAt: new Date().toISOString(),
    platform: 'MyStay',
    tables: {
      listings: {
        tableName: 'Listings',
        csv: airtableService.generateCsv('listings')
      },
      bookings: {
        tableName: 'Bookings',
        csv: airtableService.generateCsv('bookings')
      },
      users: {
        tableName: 'Users',
        csv: airtableService.generateCsv('users')
      },
      reviews: {
        tableName: 'Reviews',
        csv: airtableService.generateCsv('reviews')
      },
      messages: {
        tableName: 'Messages',
        csv: airtableService.generateCsv('messages')
      }
    }
  });
});

// POST /api/airtable/import-data
airtableRouter.post('/import-data', (req: Request, res: Response) => {
  const { table, records } = req.body || {};
  if (!table || !records) {
    return res.status(400).json({ success: false, error: 'Champs "table" et "records" requis' });
  }

  const result = airtableService.importRawData(table, records);
  res.json(result);
});

// POST /api/airtable/webhook (réception des modifications depuis Airtable Automations)
airtableRouter.post('/webhook', (req: Request, res: Response) => {
  console.log('Webhook Airtable reçu:', req.body);
  res.json({ success: true, message: 'Webhook reçu avec succès par MyStay' });
});

// GET /api/airtable/guide
airtableRouter.get('/guide', (_req: Request, res: Response) => {
  res.json({
    baseId: 'appIt4PVIpjgrmhri',
    instructions: {
      step1: "Allez sur https://airtable.com/create/tokens pour créer un Personal Access Token.",
      step2: "Nommez votre token (ex: 'MyStay Integration').",
      step3: "Ajoutez les scopes : 'data.records:read', 'data.records:write', 'schema.bases:read'.",
      step4: "Dans 'Access', sélectionnez votre base 'appIt4PVIpjgrmhri' (ou 'All workspaces').",
      step5: "Copiez le token (commençant par 'pat...') et collez-le dans le panneau de synchronisation MyStay."
    },
    tablesNeeded: [
      {
        name: "Listings",
        description: "Catalogue des hébergements ruraux",
        fields: ["id", "title", "price_per_night", "commune", "department", "region", "postal_code", "max_guests", "eco_labels", "rating", "status", "host_name", "images", "description"]
      },
      {
        name: "Bookings",
        description: "Réservations des voyageurs",
        fields: ["id", "listing_id", "listing_title", "listing_commune", "traveler_name", "traveler_email", "host_name", "start_date", "end_date", "nights_count", "guests_count", "total_price", "status", "payment_status", "access_code", "co2_saved_kg", "created_at"]
      },
      {
        name: "Users",
        description: "Utilisateurs (voyageurs, hôtes, administrateurs)",
        fields: ["id", "name", "email", "role", "phone", "is_host_verified", "is_email_verified", "bio", "avatar"]
      },
      {
        name: "Reviews",
        description: "Avis vérifiés",
        fields: ["id", "listing_id", "traveler_name", "rating", "comment", "date"]
      },
      {
        name: "Messages",
        description: "Messagerie voyageur-hôte",
        fields: ["id", "booking_id", "sender_id", "sender_name", "sender_role", "content", "timestamp"]
      }
    ]
  });
});

// Fallback pour toute route /api/airtable/* non reconnue : renvoyer JSON et JAMAIS de HTML
airtableRouter.all('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route Airtable non trouvée : ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET /api/airtable/config',
      'POST /api/airtable/config',
      'POST /api/airtable/test',
      'POST /api/airtable/sync-push',
      'POST /api/airtable/sync-pull',
      'POST /api/airtable/sync',
      'GET /api/airtable/logs',
      'GET /api/airtable/export-csv/:table (listings, bookings, users, reviews, messages)',
      'GET /api/airtable/export-bundle',
      'POST /api/airtable/import-data',
      'GET /api/airtable/guide'
    ]
  });
});
