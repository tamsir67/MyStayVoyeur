-- ==============================================================================
-- MYSTAY - JEU DE DONNÉES INITIAL (SEED SUPABASE)
-- Exécutez ce script dans l'Éditeur SQL de votre tableau de bord Supabase
-- ==============================================================================

-- 1. PROFILES D'EXEMPLE
INSERT INTO public.profiles (id, email, name, phone, avatar, bio, role, is_host_verified, is_email_verified)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'julie.cevennes@mystay.fr', 'Julie Durand', '06 12 34 56 78', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', 'Hôte passionnée dans les Cévennes depuis 12 ans. Permaculture et apiculture locale.', 'hote', true, true),
  ('a0000000-0000-0000-0000-000000000002', 'marc.morvan@mystay.fr', 'Marc & Agnès Le Goff', '06 98 76 54 32', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 'Rénovateurs d’un ancien moulin à eau dans le Parc du Morvan. Énergie hydroélectrique autonome.', 'hote', true, true),
  ('a0000000-0000-0000-0000-000000000003', 'lucas.voyageur@mystay.fr', 'Lucas Martin', '07 11 22 33 44', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', 'Amoureux de randonnées et de nuits sous les étoiles.', 'voyageur', false, true)
ON CONFLICT (id) DO NOTHING;

-- 2. HÉBERGEMENTS RURAUX AUDITÉS
INSERT INTO public.listings (
  id, host_id, host_name, host_avatar, title, description, property_type,
  capacity, bedrooms, bathrooms, price_per_night, cleaning_fee, min_nights, max_nights,
  booking_mode, cancellation_policy, region, department, commune, approx_location, exact_address,
  lat, lng, images, amenities, house_rules, local_tips, sustainable_practices, labels,
  status, rating, review_count, impact_score_kg_co2_saved_per_night
) VALUES
(
  'list_cevennes_01',
  'a0000000-0000-0000-0000-000000000001',
  'Julie Durand',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  'Le Mas des Châtaigniers • Refuge Éco-responsable',
  'Ancienne magnanerie cévenole du XVIIe siècle entièrement restaurée en écoconstruction (chaux, chanvre, bois de châtaignier local). Chauffage au poêle à granulés, électricité 100% renouvelable et potager en permaculture accessible aux voyageurs.',
  'gite',
  4, 2, 1, 95.00, 30.00, 2, 14,
  'instant', 'moderee',
  'Occitanie', 'Lozère', 'Florac-Trois-Rivières',
  'À 3 km de Florac, en lisière du Parc National des Cévennes',
  '14 Chemin des Faysses, 48400 Florac-Trois-Rivières',
  44.323, 3.593,
  ARRAY[
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Wifi basse fréquence', 'Poêle à bois', 'Cuisine équipée bio', 'Panier maraîcher offert', 'Prise recharge lente vélo'],
  ARRAY['Non-fumeur', 'Tri sélectif obligatoire', 'Compost à disposition', 'Calme après 22h'],
  'Marché des producteurs de Florac tous les jeudis matins. Randonnée du sentier des Menhirs accessible à pied depuis le gîte.',
  ARRAY['Composteur & Tri 5 flux', 'Panneaux solaires thermiques', 'Fournisseur d’énergie verte (Enercoop)', 'Panier de bienvenue 100% local', 'Toilettes sèches complémentaires en extérieur'],
  ARRAY['eco_responsable', 'authentique', 'accueil_engage', 'rural_prioritaire'],
  'publiee', 4.95, 24, 18.5
),
(
  'list_morvan_02',
  'a0000000-0000-0000-0000-000000000002',
  'Marc & Agnès Le Goff',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'L’Éco-Cabane des Grands Lacs du Morvan',
  'Cabane d’architecte bioclimatique perchée entre mélèzes et chênes centenaires, surplombant une vallée sauvage préservée. Récupération d’eau de pluie filtrée et isolation en laine de bois.',
  'eco_cabane',
  2, 1, 1, 120.00, 25.00, 2, 7,
  'instant', 'souple',
  'Bourgogne-Franche-Comté', 'Nièvre', 'Montsauche-les-Settons',
  'À 2 km du Lac des Settons, au calme absolu en sous-bois',
  'Lieu-dit La Faye, 58230 Montsauche-les-Settons',
  47.214, 4.025,
  ARRAY[
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Bain nordique au feu de bois', 'Vélos tout-terrain à disposition', 'Terrasse panoramique', 'Petit-déjeuner bio inclus'],
  ARRAY['Respect strict de la faune nocturne', 'Utilisation des savons biodégradables fournis'],
  'Louez un canoë au coucher du soleil sur le lac des Settons.',
  ARRAY['Toilettes à séparation d’urine', 'Bain nordique sans aucun produit chimique', 'Savons et shampoings artisanaux bio fournis', 'Sensibilisation à l’avifaune locale'],
  ARRAY['eco_responsable', 'authentique', 'accueil_engage'],
  'publiee', 4.88, 18, 22.0
)
ON CONFLICT (id) DO NOTHING;
