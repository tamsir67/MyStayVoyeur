import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { listingsRouter } from './server/routes/listings';
import { bookingsRouter } from './server/routes/bookings';
import { reviewsRouter } from './server/routes/reviews';
import { messagesRouter } from './server/routes/messages';
import { systemRouter } from './server/routes/system';
import { usersRouter } from './server/routes/users';
import { airtableRouter } from './server/routes/airtable';
import { setupChatWebSocket } from './server/chatSocket';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const httpServer = http.createServer(app);

  // Middlewares généraux (support photos base64 jusqu'à 15MB)
  app.use(cors());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ limit: '15mb', extended: true }));

  // 1. API ROUTES (SEPARATION BACKEND)
  app.use('/api/listings', listingsRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/messages', messagesRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/airtable', airtableRouter);
  app.use('/airtable', airtableRouter); // Alias pour éviter les erreurs si /airtable est appelé sans /api
  app.use('/api', systemRouter);

  // 2. WEBSOCKET REAL-TIME MESSAGING
  setupChatWebSocket(httpServer);

  // Intercepteur 404 strict pour /api/* et /airtable/* pour garantir une réponse JSON et JAMAIS de HTML
  app.all(['/api/*', '/airtable/*'], (req, res) => {
    res.status(404).json({
      success: false,
      error: `Route API introuvable : ${req.method} ${req.originalUrl}`
    });
  });

  // Middleware d'erreur globale pour les routes API (réponse JSON obligatoire)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/airtable')) {
      console.error('Erreur serveur API:', err);
      return res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Erreur interne du serveur'
      });
    }
    next(err);
  });

  // 3. FRONTEND INTEGRATION & VITE MIDDLEWARE
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    startAirtableAutoPull();
    const atToken = (process.env.AIRTABLE_PAT || process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_KEY || '').trim();
    console.log(atToken
      ? `[Airtable] Token détecté (${atToken.slice(0, 7)}...) — base ${process.env.AIRTABLE_BASE_ID || 'appIt4PVIpjgrmhri'}`
      : '[Airtable] AUCUN token trouvé : ajoutez AIRTABLE_PAT dans .env (dossier du package.json) puis redémarrez.');
    console.log(`🚀 Serveur MyStay (Backend Express + Frontend Vite + WebSocket Chat) démarré sur http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Erreur au démarrage du serveur:', err);
});


// ─── Import automatique depuis Airtable ────────────────────────────────────
// Au démarrage puis toutes les N minutes (AIRTABLE_PULL_INTERVAL_MINUTES, défaut 2, 0 = désactivé),
// le serveur relit les tables Airtable : ce que vous ajoutez/modifiez dans Airtable apparaît sur le site.
function startAirtableAutoPull() {
  const token = (process.env.AIRTABLE_PAT || process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_KEY || '').trim();
  if (!token) return;
  const minutes = Number(process.env.AIRTABLE_PULL_INTERVAL_MINUTES ?? 2);
  let running = false;
  const pull = async () => {
    if (running) return;
    running = true;
    try {
      const { airtableService } = await import('./server/airtable');
      const r = await airtableService.pullAllFromAirtable();
      const c = r.importedCounts;
      console.log(`[Airtable] Import auto : ${c.listings} annonces, ${c.bookings} réservations, ${c.users} utilisateurs, ${c.reviews} avis, ${c.messages} messages` + (r.errors.length ? ` | erreurs : ${r.errors.join(' | ')}` : ''));
    } catch (e: any) {
      console.warn('[Airtable] Import auto échoué :', e?.message || e);
    } finally {
      running = false;
    }
  };
  // Au démarrage : envoie d'abord les données du site vers Airtable (sans doublon grâce à "id"),
  // puis importe ce qui existe dans Airtable. Désactivable avec AIRTABLE_PUSH_ON_START=false.
  setTimeout(async () => {
    if (process.env.AIRTABLE_PUSH_ON_START !== 'false') {
      try {
        const { airtableService } = await import('./server/airtable');
        const r = await airtableService.pushAllToAirtable();
        const c = r.syncedCounts;
        console.log(`[Airtable] Envoi initial : ${c.listings} annonces, ${c.bookings} réservations, ${c.users} utilisateurs, ${c.reviews} avis, ${c.messages} messages` + (r.errors.length ? `\n[Airtable] Erreurs : ${r.errors.join('\n[Airtable] Erreurs : ')}` : ''));
      } catch (e: any) {
        console.warn('[Airtable] Envoi initial échoué :', e?.message || e);
      }
    }
    await pull();
  }, 3000);
  if (minutes > 0) setInterval(pull, minutes * 60 * 1000);
}
