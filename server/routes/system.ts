import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { isSupabaseReady, dbService, supabaseQueryLogs } from '../db';

export const systemRouter = Router();

// GET /api/health
systemRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    supabase: dbService.getSupabaseStatus(),
    version: '1.4.0',
    timestamp: new Date().toISOString()
  });
});

// GET /api/supabase/status
systemRouter.get('/supabase/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: dbService.getSupabaseStatus(),
    logs: supabaseQueryLogs.slice(0, 20)
  });
});

// POST /api/supabase/config
systemRouter.post('/supabase/config', async (req: Request, res: Response) => {
  const { url, key } = req.body;
  if (!url || !key) {
    return res.status(400).json({ success: false, error: 'URL et Clé Supabase requises.' });
  }

  const cleanUrl = url.trim();
  const cleanKey = key.trim();

  const result = await dbService.updateSupabaseCredentials(cleanUrl, cleanKey);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.message });
  }

  // Sauvegarde dans le fichier .env pour persistance multi-redémarrage
  try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = `# Configuration Supabase MyStay
SUPABASE_URL=${cleanUrl}
SUPABASE_ANON_KEY=${cleanKey}
SUPABASE_SERVICE_ROLE_KEY=${cleanKey}
VITE_SUPABASE_URL=${cleanUrl}
VITE_SUPABASE_ANON_KEY=${cleanKey}
`;
    fs.writeFileSync(envPath, envContent, 'utf-8');
  } catch (envErr) {
    console.warn('Notice: impossible d\'écrire dans .env:', envErr);
  }

  res.json({ 
    success: true, 
    message: result.message,
    tablesStatus: result.tablesStatus,
    status: dbService.getSupabaseStatus() 
  });
});

// GET /api/supabase/profiles-sql
systemRouter.get('/supabase/profiles-sql', (_req: Request, res: Response) => {
  const profilesSql = `-- ==============================================================================
-- DÉVERROUILLER ET PEUPLER LA TABLE PROFILES DANS SUPABASE (100% COMPATIBLE UUID)
-- À copier-coller dans Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Création de la table profiles si elle n'existe pas encore
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  name TEXT,
  phone TEXT,
  avatar TEXT,
  bio TEXT,
  role TEXT DEFAULT 'voyageur',
  is_host_verified BOOLEAN DEFAULT false,
  is_email_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Suppression des contraintes de clé étrangère restrictives (ex: auth.users)
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- 3. Ajout des colonnes manquantes au cas où la table existait déjà
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'voyageur';
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS is_host_verified BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Configuration des politiques de sécurité (RLS) permissives
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profiles can be inserted" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert user profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert to profiles" ON public.profiles;
CREATE POLICY "Allow public insert to profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Profiles can be updated" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update to profiles" ON public.profiles;
CREATE POLICY "Allow public update to profiles" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Profiles can be deleted" ON public.profiles;
CREATE POLICY "Profiles can be deleted" ON public.profiles FOR DELETE USING (true);

-- 5. Insertion avec UUIDs valides garantissant la compatibilité PostgreSQL
INSERT INTO public.profiles (id, email, name, phone, avatar, bio, role, is_host_verified, is_email_verified)
VALUES
  (
    '5c1aff24-0fcd-4537-ad4a-0a93d59f8620'::uuid,
    'ba.tamsir@example.fr',
    'Ba Tamsir',
    '+33 6 12 34 56 78',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'Voyageur passionné par l''écotourisme et le patrimoine rural français.',
    'voyageur',
    false,
    true
  ),
  (
    'c716858f-9536-4f50-a36f-564a4490dc7c'::uuid,
    'antoine.cevennes@example.fr',
    'Antoine & Mathilde Vabre',
    '+33 6 98 76 54 32',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'Hôtes engagés dans le Parc National des Cévennes. Accueil paysan et énergie solaire.',
    'hote',
    true,
    true
  ),
  (
    '3984e0e7-1073-4006-a726-69fa615095e5'::uuid,
    'helene.morvan@example.fr',
    'Hélène Duchêne',
    '+33 6 45 67 89 01',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    'Propriétaire de l''éco-cabane dans le Morvan. Préservation de la biodiversité.',
    'hote',
    true,
    true
  ),
  (
    'e82143aa-87e4-4738-a16b-9a718687ee45'::uuid,
    'admin.qualite@mystay.fr',
    'Laurent Moreau (Équipe MyStay)',
    '+33 1 40 50 60 70',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    'Responsable de la charte éthique et de la validation des écolabels.',
    'admin',
    true,
    true
  )
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  avatar = EXCLUDED.avatar,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  bio = EXCLUDED.bio,
  email = EXCLUDED.email,
  is_host_verified = EXCLUDED.is_host_verified,
  updated_at = NOW();
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(profilesSql);
});

// GET /api/supabase/schema
systemRouter.get('/supabase/schema', (_req: Request, res: Response) => {
  try {
    const schemaFilePath = path.join(process.cwd(), 'supabase', 'schema.sql');
    if (fs.existsSync(schemaFilePath)) {
      const sqlContent = fs.readFileSync(schemaFilePath, 'utf-8');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(sqlContent);
    }
  } catch (err) {
    console.warn('Erreur lecture schema.sql:', err);
  }

  const fallbackSql = `-- ==============================================================================
-- SCHEMA OFFICIEL SUPABASE POSTGRESQL POUR MYSTAY (Tables: listings, bookings, reviews)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.listings (
    id TEXT PRIMARY KEY,
    host_id TEXT,
    host_name TEXT NOT NULL,
    host_avatar TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    property_type TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 2,
    bedrooms INTEGER NOT NULL DEFAULT 1,
    bathrooms INTEGER NOT NULL DEFAULT 1,
    price_per_night NUMERIC(10, 2) NOT NULL,
    cleaning_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    min_nights INTEGER DEFAULT 2 NOT NULL,
    max_nights INTEGER DEFAULT 30 NOT NULL,
    booking_mode TEXT DEFAULT 'instant' NOT NULL,
    cancellation_policy TEXT DEFAULT 'moderee' NOT NULL,
    region TEXT NOT NULL,
    department TEXT NOT NULL,
    commune TEXT NOT NULL,
    approx_location TEXT NOT NULL,
    exact_address TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    images TEXT[] DEFAULT '{}' NOT NULL,
    amenities TEXT[] DEFAULT '{}' NOT NULL,
    house_rules TEXT[] DEFAULT '{}' NOT NULL,
    local_tips TEXT,
    sustainable_practices TEXT[] DEFAULT '{}' NOT NULL,
    labels TEXT[] DEFAULT '{}' NOT NULL,
    status TEXT DEFAULT 'publiee' NOT NULL,
    admin_comment TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ DEFAULT NOW(),
    blocked_dates TEXT[] DEFAULT '{}' NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.00 NOT NULL,
    review_count INTEGER DEFAULT 0 NOT NULL,
    impact_score_kg_co2_saved_per_night NUMERIC(5, 1) DEFAULT 12.0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    listing_title TEXT NOT NULL,
    listing_image TEXT,
    listing_commune TEXT,
    exact_address TEXT,
    host_id TEXT NOT NULL,
    host_name TEXT NOT NULL,
    traveler_id TEXT NOT NULL,
    traveler_name TEXT NOT NULL,
    traveler_email TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    nights_count INTEGER NOT NULL DEFAULT 1,
    guests_count INTEGER NOT NULL DEFAULT 1,
    nightly_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    cleaning_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    service_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tourist_tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    host_net_earnings NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'confirmee',
    payment_status TEXT NOT NULL DEFAULT 'paid',
    payment_intent_id TEXT,
    stripe_receipt_url TEXT,
    access_code TEXT,
    co2_saved_kg NUMERIC(6, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    has_review BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    listing_id TEXT NOT NULL,
    traveler_id TEXT,
    traveler_name TEXT NOT NULL,
    traveler_avatar TEXT,
    rating INTEGER NOT NULL,
    sub_ratings JSONB DEFAULT '{"cleanliness": 5, "authenticity": 5, "ecoResponsibility": 5, "hostWelcome": 5}'::jsonb,
    comment TEXT NOT NULL,
    host_reply JSONB,
    is_flagged BOOLEAN DEFAULT FALSE NOT NULL,
    status TEXT DEFAULT 'valid' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    avatar TEXT,
    bio TEXT,
    role TEXT NOT NULL DEFAULT 'voyageur',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture ouverte users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Insertion users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Modification users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Lecture ouverte listings" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Insertion listings" ON public.listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Modification listings" ON public.listings FOR UPDATE USING (true);

CREATE POLICY "Lecture ouverte bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Insertion bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Modification bookings" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Suppression bookings" ON public.bookings FOR DELETE USING (true);

CREATE POLICY "Lecture ouverte reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Insertion reviews" ON public.reviews FOR INSERT WITH CHECK (true);
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(fallbackSql);
});
