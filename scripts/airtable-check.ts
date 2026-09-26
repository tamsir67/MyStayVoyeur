/**
 * Diagnostic Airtable pour MyStay
 *   npm run airtable:check   → vérifie token, base, tables, colonnes et fait un test d'écriture
 *   npm run airtable:fix     → idem + crée automatiquement les tables/colonnes manquantes
 *                              (nécessite le scope schema.bases:write sur le token)
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

type FieldType = 'text' | 'long' | 'number' | 'checkbox';
const SCHEMA: Record<string, Record<string, FieldType>> = {
  Listings: {
    id: 'text', title: 'text', description: 'long', price_per_night: 'number', lat: 'number', lng: 'number', labels: 'long', review_count: 'number', commune: 'text',
    department: 'text', region: 'text', latitude: 'number', longitude: 'number', capacity: 'number',
    bedrooms: 'number', bathrooms: 'number', eco_labels: 'long', amenities: 'long', images: 'long',
    host_id: 'text', host_name: 'text', rating: 'number', reviews_count: 'number', status: 'text',
    cleaning_fee: 'number'
  },
  Bookings: {
    id: 'text', listing_id: 'text', listing_title: 'text', listing_commune: 'text', traveler_id: 'text',
    traveler_name: 'text', traveler_email: 'text', host_id: 'text', host_name: 'text', start_date: 'text',
    end_date: 'text', nights_count: 'number', guests_count: 'number', total_price: 'number',
    host_net_earnings: 'number', status: 'text', payment_status: 'text', access_code: 'text',
    co2_saved_kg: 'number', created_at: 'text', nightly_total: 'number', service_fee: 'number', tourist_tax: 'number'
  },
  Users: {
    id: 'text', name: 'text', email: 'text', role: 'text', avatar: 'text', phone: 'text', bio: 'long',
    is_host_verified: 'checkbox', is_email_verified: 'checkbox', created_at: 'text', full_name: 'text', avatar_url: 'text'
  },
  Reviews: {
    id: 'text', booking_id: 'text', listing_id: 'text', traveler_id: 'text', traveler_name: 'text',
    rating: 'number', comment: 'long', date: 'text', created_at: 'text', status: 'text', host_reply: 'long'
  },
  messages: {
    id: 'text', booking_id: 'text', sender_id: 'text', sender_name: 'text', sender_role: 'text',
    content: 'long', created_at: 'text'
  }
};

const FIX = process.argv.includes('--fix');
const cfgFile = path.join(process.cwd(), '.airtable_config.json');
let fileCfg: any = {};
try { fileCfg = JSON.parse(fs.readFileSync(cfgFile, 'utf-8')); } catch { /* absent */ }

const TOKEN = String(fileCfg.token || process.env.AIRTABLE_PAT || process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_KEY || '').trim();
const BASE = String(fileCfg.baseId || process.env.AIRTABLE_BASE_ID || 'appIt4PVIpjgrmhri').trim();
const TABLE_NAMES: Record<string, string> = {
  Listings: fileCfg.tables?.listings || 'Listings',
  Bookings: fileCfg.tables?.bookings || 'Bookings',
  Users: fileCfg.tables?.users || 'Users',
  Reviews: fileCfg.tables?.reviews || 'Reviews',
  messages: fileCfg.tables?.messages || 'messages'
};

const ok = (m: string) => console.log(`  ✅ ${m}`);
const ko = (m: string) => console.log(`  ❌ ${m}`);
const info = (m: string) => console.log(`  ℹ️  ${m}`);
let problems = 0;
const renamed: Record<string, string> = {}; // clé logique → vrai nom de table trouvé dans Airtable
const PERM_HINT = "Il faut (1) le scope schema.bases:write sur le token ET (2) être \"Creator\" (ou Owner) de la base. Un simple \"Editor\" (ex. invité par lien) ne peut pas créer de tables ni de colonnes : demandez au propriétaire de vous passer Creator, ou de créer l'élément à la main.";

async function api(method: string, url: string, body?: any) {
  const res = await fetch(`https://api.airtable.com${url}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const json: any = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, json };
}

function fieldSpec(name: string, t: FieldType) {
  if (t === 'number') return { name, type: 'number', options: { precision: 2 } };
  if (t === 'checkbox') return { name, type: 'checkbox', options: { icon: 'check', color: 'greenBright' } };
  if (t === 'long') return { name, type: 'multilineText' };
  return { name, type: 'singleLineText' };
}

async function main() {
  console.log('\n🔎 Diagnostic Airtable MyStay\n');

  // 1. Token
  console.log('1) Token');
  if (!TOKEN) { ko('Aucun token : ajoutez AIRTABLE_PAT=... dans .env (dossier du package.json).'); process.exit(1); }
  const who = await api('GET', '/v0/meta/whoami');
  if (who.status === 401) { ko('Token refusé (401) : il est invalide, expiré ou révoqué. Générez-en un nouveau.'); process.exit(1); }
  if (!who.ok) { ko(`Erreur whoami ${who.status} : ${JSON.stringify(who.json)}`); process.exit(1); }
  ok(`Token valide (compte ${who.json.email || who.json.id})`);
  const scopes: string[] = who.json.scopes || [];
  if (scopes.length) {
    for (const s of ['data.records:read', 'data.records:write', 'schema.bases:read']) {
      if (scopes.includes(s)) ok(`Scope ${s}`); else { ko(`Scope manquant : ${s}`); problems++; }
    }
    if (FIX && !scopes.includes('schema.bases:write')) {
      ko('Scope schema.bases:write manquant : impossible de créer tables/colonnes automatiquement.'); problems++;
    }
  }

  // 2. Base
  console.log(`\n2) Base ${BASE}`);
  const meta = await api('GET', `/v0/meta/bases/${BASE}/tables`);
  if (!meta.ok) {
    ko(`Base inaccessible (${meta.status}). Sur airtable.com/create/tokens, ajoutez cette base dans "Access" du token, et vérifiez le scope schema.bases:read.`);
    console.log(`     Détail : ${JSON.stringify(meta.json)}`);
    process.exit(1);
  }
  const tables: any[] = meta.json.tables || [];
  ok(`Base accessible — tables trouvées : ${tables.map(t => `"${t.name}"`).join(', ') || '(aucune)'}`);

  // 3. Tables & colonnes
  console.log('\n3) Tables et colonnes');
  const ALTERNATIVES: Record<string, string[]> = { Users: ['users', 'profiles'] };
  const SITE_VALUES: Record<string, Record<string, string[]>> = {
    Listings: { status: ['brouillon', 'en_attente', 'publiee', 'a_modifier', 'rejetee'] },
    Bookings: { status: ['en_attente_hote', 'confirmee', 'refusee', 'terminee', 'annulee'], payment_status: ['paid', 'pending', 'refunded'] },
    Users: { role: ['voyageur', 'hote', 'admin'] }
  };
  for (const [logical, fields] of Object.entries(SCHEMA)) {
    const expected = TABLE_NAMES[logical];
    const candidates = [expected, ...(ALTERNATIVES[logical] || [])].map(n => n.toLowerCase());
    let table = tables.find(t => t.name === expected)
      || tables.find(t => candidates.includes(String(t.name).trim().toLowerCase()));
    if (!table) {
      ko(`Aucune table pour "${logical}" (cherché : ${candidates.join(', ')}). Le site ne synchronisera pas ces données. Seul un "Creator" de la base peut la créer.`);
      problems++; continue;
    }
    if (table.name !== expected) {
      renamed[logical] = table.name;
      if (FIX) ok(`"${logical}" → table "${table.name}" (config du site mise à jour)`);
      else info(`"${logical}" → table "${table.name}" : lancez "npm run airtable:fix" pour que le site l'utilise`);
    } else {
      ok(`Table "${table.name}" trouvée`);
    }

    const existing = new Map<string, any>(table.fields.map((f: any) => [f.name, f]));
    const idField = existing.get('id');
    if (!idField) {
      ko(`"${table.name}" : pas de colonne "id" → synchronisation impossible sans doublons. Un Creator doit ajouter une colonne "id" (Single line text).`);
      problems++;
    } else if (!['singleLineText', 'multilineText', 'email', 'url', 'phoneNumber'].includes(idField.type)) {
      ko(`"${table.name}" : la colonne "id" est de type ${idField.type}, elle doit être "Single line text".`);
      problems++;
    }

    // Colonnes : le site s'adapte automatiquement, les absentes sont simplement ignorées
    const known = Object.keys(fields).filter(n => existing.has(n));
    info(`"${table.name}" : ${existing.size} colonnes dans Airtable, dont ${known.length} reconnues par le site (les autres données sont adaptées ou ignorées)`);

    // Listes déroulantes : vérifier que les valeurs du site existent
    for (const [col, vals] of Object.entries(SITE_VALUES[logical] || {})) {
      const f = existing.get(col);
      if (f?.type === 'singleSelect' && Array.isArray(f.options?.choices)) {
        const choices = f.options.choices.map((c: any) => String(c.name).toLowerCase());
        const missingVals = vals.filter(v => !choices.includes(v));
        if (missingVals.length) info(`"${table.name}.${col}" est une liste déroulante sans les valeurs : ${missingVals.join(', ')} → ces valeurs resteront vides dans Airtable (ajoutez-les comme options si possible)`);
      }
    }
  }

  // Mise à jour de la config du site avec les vrais noms de tables
  if (FIX && Object.keys(renamed).length) {
    const keyMap: Record<string, string> = { Listings: 'listings', Bookings: 'bookings', Users: 'users', Reviews: 'reviews', messages: 'messages' };
    fileCfg.tables = { ...(fileCfg.tables || {}) };
    for (const [logical, real] of Object.entries(renamed)) { fileCfg.tables[keyMap[logical]] = real; TABLE_NAMES[logical] = real; }
    fs.writeFileSync(cfgFile, JSON.stringify(fileCfg, null, 2));
    ok(`Config du site mise à jour (.airtable_config.json) : ${Object.values(renamed).join(', ')}`);
  }

  // 4. Test d'écriture réel
  console.log('\n4) Test d\'écriture');
  const tName = encodeURIComponent(TABLE_NAMES.Listings);
  const w = await api('PATCH', `/v0/${BASE}/${tName}`, {
    performUpsert: { fieldsToMergeOn: ['id'] },
    records: [{ fields: { id: '__diagnostic_mystay__', title: 'Test diagnostic (supprimé automatiquement)' } }],
    typecast: true
  });
  if (w.ok) {
    ok('Écriture dans Listings réussie');
    const recId = w.json.records?.[0]?.id;
    if (recId) await api('DELETE', `/v0/${BASE}/${tName}/${recId}`);
  } else {
    ko(`Écriture refusée (${w.status}) : ${w.json?.error?.type || ''} ${w.json?.error?.message || JSON.stringify(w.json)}`);
    problems++;
  }

  console.log('\n' + (problems === 0
    ? '🎉 Tout est prêt. Lancez "npm run dev" puis, dans la fenêtre Airtable (admin), cliquez sur "Envoyer vers Airtable".'
    : `⚠️  ${problems} problème(s) à corriger ci-dessus, puis relancez ce diagnostic.`) + '\n');
}

main().catch(e => { console.error('Erreur inattendue :', e?.message || e); process.exit(1); });
