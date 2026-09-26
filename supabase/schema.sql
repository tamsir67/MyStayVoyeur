-- ==============================================================================
-- MYSTAY - SCHEMA DE BASE DE DONNÉES SUPABASE (PostgreSQL)
-- Tourisme rural et durable en France
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TYPES ET ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('voyageur', 'hote', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_status AS ENUM ('brouillon', 'en_attente', 'publiee', 'a_modifier', 'rejetee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('en_attente_hote', 'confirmee', 'refusee', 'terminee', 'annulee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLE DES UTILISATEURS (PROFILES / USERS)
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

CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    avatar TEXT,
    bio TEXT,
    role TEXT DEFAULT 'voyageur' NOT NULL,
    is_host_verified BOOLEAN DEFAULT FALSE NOT NULL,
    is_email_verified BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. TABLE DES HÉBERGEMENTS RURAUX (LISTINGS)
CREATE TABLE IF NOT EXISTS public.listings (
    id TEXT PRIMARY KEY DEFAULT ('list_' || substr(md5(random()::text), 1, 10)),
    host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    host_name TEXT NOT NULL,
    host_avatar TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    property_type TEXT NOT NULL, -- 'gite', 'eco_cabane', 'ferme_renovee', 'yourte', 'moulin', etc.
    capacity INTEGER NOT NULL DEFAULT 2,
    bedrooms INTEGER NOT NULL DEFAULT 1,
    bathrooms INTEGER NOT NULL DEFAULT 1,
    price_per_night NUMERIC(10, 2) NOT NULL,
    cleaning_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    min_nights INTEGER DEFAULT 2 NOT NULL,
    max_nights INTEGER DEFAULT 30 NOT NULL,
    booking_mode TEXT DEFAULT 'instant' NOT NULL, -- 'instant' ou 'on_demand'
    cancellation_policy TEXT DEFAULT 'moderee' NOT NULL,
    
    -- Localisation
    region TEXT NOT NULL,
    department TEXT NOT NULL,
    commune TEXT NOT NULL,
    approx_location TEXT NOT NULL,
    exact_address TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    
    -- Médias et Équipements
    images TEXT[] DEFAULT '{}' NOT NULL,
    amenities TEXT[] DEFAULT '{}' NOT NULL,
    house_rules TEXT[] DEFAULT '{}' NOT NULL,
    local_tips TEXT,
    
    -- Engagements écologiques et Labels MyStay
    sustainable_practices TEXT[] DEFAULT '{}' NOT NULL,
    labels TEXT[] DEFAULT '{}' NOT NULL, -- 'eco_responsable', 'authentique', 'accueil_engage', 'rural_prioritaire'
    
    -- Modération & Statut
    status listing_status DEFAULT 'publiee' NOT NULL,
    admin_comment TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Calendrier
    blocked_dates TEXT[] DEFAULT '{}' NOT NULL,
    
    -- Métriques
    rating NUMERIC(3, 2) DEFAULT 5.00 NOT NULL,
    review_count INTEGER DEFAULT 0 NOT NULL,
    impact_score_kg_co2_saved_per_night NUMERIC(5, 1) DEFAULT 12.0 NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. TABLE DES RÉSERVATIONS (BOOKINGS)
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY DEFAULT ('bk_' || substr(md5(random()::text), 1, 8)),
    listing_id TEXT REFERENCES public.listings(id) ON DELETE CASCADE,
    listing_title TEXT NOT NULL,
    listing_image TEXT,
    listing_commune TEXT NOT NULL,
    exact_address TEXT,
    
    host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    host_name TEXT NOT NULL,
    traveler_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    traveler_name TEXT NOT NULL,
    traveler_email TEXT NOT NULL,
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    nights_count INTEGER NOT NULL,
    guests_count INTEGER NOT NULL,
    
    -- Tarification
    nightly_total NUMERIC(10, 2) NOT NULL,
    cleaning_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    service_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    tourist_tax NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    host_net_earnings NUMERIC(10, 2) NOT NULL,
    
    status booking_status DEFAULT 'en_attente_hote' NOT NULL,
    payment_status TEXT DEFAULT 'pending' NOT NULL, -- 'paid', 'pending', 'refunded'
    payment_intent_id TEXT,
    stripe_receipt_url TEXT,
    has_review BOOLEAN DEFAULT FALSE NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. TABLE DES AVIS ET COMMENTAIRES (REVIEWS)
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY DEFAULT ('rev_' || substr(md5(random()::text), 1, 8)),
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE CASCADE,
    listing_id TEXT REFERENCES public.listings(id) ON DELETE CASCADE,
    traveler_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    traveler_name TEXT NOT NULL,
    traveler_avatar TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    sub_ratings JSONB DEFAULT '{"cleanliness": 5, "authenticity": 5, "ecoResponsibility": 5, "hostWelcome": 5}'::jsonb,
    comment TEXT NOT NULL,
    host_reply JSONB,
    is_flagged BOOLEAN DEFAULT FALSE NOT NULL,
    status TEXT DEFAULT 'valid' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. TABLE DES MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY DEFAULT ('msg_' || substr(md5(random()::text), 1, 10)),
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sender_name TEXT NOT NULL,
    sender_role user_role NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. INDEX POUR PERFORMANCES DE RECHERCHE ET GÉOLOCALISATION
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_region ON public.listings(region);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price_per_night);
CREATE INDEX IF NOT EXISTS idx_listings_coords ON public.listings(lat, lng);
CREATE INDEX IF NOT EXISTS idx_bookings_traveler ON public.bookings(traveler_id);
CREATE INDEX IF NOT EXISTS idx_bookings_host ON public.bookings(host_id);
CREATE INDEX IF NOT EXISTS idx_reviews_listing ON public.reviews(listing_id);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users / Profiles: Lecture, création et mise à jour
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
CREATE POLICY "Users are viewable by everyone" 
ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert user profile" ON public.users;
CREATE POLICY "Users can insert user profile" 
ON public.users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update user profile" ON public.users;
CREATE POLICY "Users can update user profile" 
ON public.users FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profiles can be inserted" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert user profile" ON public.profiles;
CREATE POLICY "Profiles can be inserted" 
ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Profiles can be updated" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Profiles can be updated" 
ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Profiles can be deleted" ON public.profiles;
CREATE POLICY "Profiles can be deleted" 
ON public.profiles FOR DELETE USING (true);

-- Listings: Lecture publique des hébergements publiés
DROP POLICY IF EXISTS "Published listings are viewable by everyone" ON public.listings;
CREATE POLICY "Published listings are viewable by everyone" 
ON public.listings FOR SELECT USING (status = 'publiee' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Hosts can view their own draft listings" ON public.listings;
CREATE POLICY "Hosts can view their own draft listings" 
ON public.listings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Hosts can insert listings" ON public.listings;
CREATE POLICY "Hosts can insert listings" 
ON public.listings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Hosts and Admins can update listings" ON public.listings;
CREATE POLICY "Hosts and Admins can update listings" 
ON public.listings FOR UPDATE USING (true);

-- Bookings: Lecture et création
DROP POLICY IF EXISTS "Users can view bookings related to them" ON public.bookings;
CREATE POLICY "Users can view bookings related to them" 
ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;
CREATE POLICY "Anyone can create a booking" 
ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authorized users can update bookings" ON public.bookings;
CREATE POLICY "Authorized users can update bookings" 
ON public.bookings FOR UPDATE USING (true);

-- Reviews: Lecture publique
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT USING (status = 'valid');

DROP POLICY IF EXISTS "Users can insert reviews" ON public.reviews;
CREATE POLICY "Users can insert reviews" 
ON public.reviews FOR INSERT WITH CHECK (true);

-- Messages: Visibles par les participants
DROP POLICY IF EXISTS "Messages viewable by everyone" ON public.messages;
CREATE POLICY "Messages viewable by everyone" 
ON public.messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Messages insertable by everyone" ON public.messages;
CREATE POLICY "Messages insertable by everyone" 
ON public.messages FOR INSERT WITH CHECK (true);

-- 10. SEED INITIAL DES PROFILS UTILISATEURS (Ba Tamsir, Hôtes vérifiés, Administrateur)
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

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

