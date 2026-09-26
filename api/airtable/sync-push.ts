// Fonction serverless (Vercel). La synchronisation réelle est assurée par le serveur Express
// (server/airtable.ts). Ici on renvoie une réponse honnête et de forme identique.
export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const emptyCounts = { listings: 0, bookings: 0, users: 0, reviews: 0, messages: 0 };
  const token = process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_PAT || process.env.AIRTABLE_API_KEY;

  return res.status(200).json({
    success: false,
    isLocalFallback: true,
    message: token
      ? "La synchronisation Airtable n'est pas disponible en mode serverless. Lancez le serveur Express (npm run start) pour synchroniser."
      : "Clé AIRTABLE_PAT absente : synchronisation Airtable désactivée.",
    syncedCounts: emptyCounts,
    errors: []
  });
}
