// Fonction serverless (Vercel) — doit renvoyer EXACTEMENT la même forme
// que le serveur Express (server/airtable.ts → getConfig), sinon le front plante.
import fs from 'fs';
import path from 'path';

function countJson(file: string): number {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', file), 'utf-8'));
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const baseId = process.env.AIRTABLE_BASE_ID || 'appIt4PVIpjgrmhri';
  const token = (process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_PAT || process.env.AIRTABLE_API_KEY || '').trim();

  if (req.method === 'POST') {
    // Sur Vercel le système de fichiers est en lecture seule : la config se fait via les variables d'environnement.
    return res.status(200).json({
      success: true,
      message: "En production, configurez AIRTABLE_BASE_ID et AIRTABLE_PAT dans les variables d'environnement Vercel.",
      testResult: null
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      baseId,
      hasToken: token.length > 0,
      maskedToken: token ? `${token.slice(0, 7)}...${token.slice(-4)}` : null,
      inviteLink: '',
      syncMode: 'airtable',
      autoSync: true,
      lastSyncAt: null,
      lastSyncStatus: 'idle',
      stats: {
        listings: countJson('listings.json'),
        bookings: countJson('bookings.json'),
        users: countJson('users.json'),
        reviews: countJson('reviews.json'),
        messages: countJson('messages.json')
      },
      tables: {
        listings: 'Listings',
        bookings: 'Bookings',
        users: 'Users',
        reviews: 'Reviews',
        messages: 'messages'
      }
    },
    logs: []
  });
}
