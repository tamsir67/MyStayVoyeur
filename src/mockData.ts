import { User, Listing, Booking, Review, Message, AuditLog, MakeScenarioExecution } from './types';

export const baTamsirAvatar = '/ba_tamsir_avatar.jpg';

export const SUSTAINABLE_PRACTICES_CATALOG = [
  {
    id: 'tri_compost',
    category: 'tri' as const,
    label: 'Tri sélectif & compostage autonome',
    description: 'Bacs de tri rigoureux, lombricomposteur au verger et zéro déchet plastique à usage unique.'
  },
  {
    id: 'energie_solaire',
    category: 'energie_sobriete' as const,
    label: 'Énergie 100% renouvelable & chauffe-eau solaire',
    description: 'Panneaux photovoltaïques ou contrat fournisseur vert certifié, éclairage LED basse consommation.'
  },
  {
    id: 'recuperation_eau',
    category: 'energie_sobriete' as const,
    label: 'Récupération d’eau de pluie & mousseurs',
    description: 'Cuves de récupération pour l’arrosage potager, toilettes sèches ou réducteurs de pression.'
  },
  {
    id: 'panier_terroir',
    category: 'produits_locaux' as const,
    label: 'Panier terroir & potager en permaculture',
    description: 'Légumes bio du jardin en libre cueillette et partenariats avec les producteurs du village.'
  },
  {
    id: 'mobilite_douce',
    category: 'mobilite_douce' as const,
    label: 'Prêt de vélos & navette gare rurale',
    description: 'Vélos à assistance électrique mis à disposition ou prise en charge à la gare la plus proche.'
  },
  {
    id: 'refuge_lpo',
    category: 'sensibilisation_biodiversite' as const,
    label: 'Refuge biodiversité (LPO) & nichoirs',
    description: 'Zone non traitée préservée, guides nature de la faune locale et ateliers d’observation nocturne.'
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'usr_voyageur_1',
    email: 'ba.tamsir@example.fr',
    name: 'Ba Tamsir',
    phone: '+33 6 12 34 56 78',
    avatar: baTamsirAvatar,
    bio: 'Passionné de randonnée pédestre et de séjours nature dans les terroirs ruraux.',
    isHostVerified: false,
    isEmailVerified: true,
    role: 'voyageur',
    createdAt: '2026-03-10T10:00:00Z',
    password: 'voyageur123'
  },
  {
    id: 'usr_hote_1',
    email: 'antoine.cevennes@example.fr',
    name: 'Antoine & Mathilde Vabre',
    phone: '+33 6 98 76 54 32',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: 'Apiculteurs et chevriers dans la vallée des Cévennes. Nous restaurons d’anciens mas de schiste avec des matériaux biosourcés.',
    isHostVerified: true,
    isEmailVerified: true,
    role: 'hote',
    createdAt: '2026-01-15T09:30:00Z',
    hostVerificationDocs: ['carte_identite.pdf', 'attestation_assurance_agricole.pdf'],
    password: 'hote123'
  },
  {
    id: 'usr_hote_2',
    email: 'helene.morvan@example.fr',
    name: 'Hélène Duchêne',
    phone: '+33 6 44 22 11 00',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    bio: 'Menuisière et naturaliste au cœur du Parc Naturel Régional du Morvan. Éco-cabanes sur pilotis en bois local non traité.',
    isHostVerified: true,
    isEmailVerified: true,
    role: 'hote',
    createdAt: '2026-02-04T14:15:00Z',
    hostVerificationDocs: ['kbis_agritourisme.pdf', 'cni_helene.pdf'],
    password: 'hote123'
  },
  {
    id: 'usr_admin',
    email: 'admin.qualite@mystay.fr',
    name: 'Laurent Moreau (Équipe MyStay)',
    phone: '+33 1 80 90 20 00',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bio: 'Responsable de la charte éthique, de l’éligibilité des territoires ruraux et de l’attribution des labels durables.',
    isHostVerified: true,
    isEmailVerified: true,
    role: 'admin',
    createdAt: '2025-11-01T08:00:00Z',
    password: 'admin123'
  }
];

export const DEFAULT_PLATFORM_SETTINGS = {
  heroTagline: 'Alternative au tourisme de masse dans les territoires ruraux',
  heroSubheadline: 'Des hébergements audités, gérés par des hôtes engagés pour préserver nos écosystèmes et soutenir les campagnes françaises.',
  commissionRatePercent: 12,
  touristTaxPerNight: 1.50,
  minEcoPracticesRequired: 3,
  charterAnnouncement: '🌱 Charte Éco-Tourisme v1.2 : 88% des revenus sont directement reversés aux terroirs locaux.',
  maintenanceMode: false
};

export const MOCK_LISTINGS: Listing[] = [
  {
    id: 'lst_1',
    hostId: 'usr_hote_1',
    hostName: 'Antoine & Mathilde Vabre',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    title: 'Gîte du Moulin des Cévennes en schiste séculaire',
    description: 'Niché le long d’une rivière cristalline, ce moulin à farine du XVIIIe siècle a été restauré en matériaux biosourcés (chaux, chanvre et châtaignier local). Énergie solaire thermique, eau de source filtrée et potager biologique en permaculture à disposition. Idéal pour une déconnexion ressourçante sans wifi intrusif.',
    propertyType: 'moulin',
    capacity: 4,
    bedrooms: 2,
    bathrooms: 1,
    pricePerNight: 95,
    cleaningFee: 35,
    minNights: 2,
    maxNights: 21,
    bookingMode: 'instant',
    cancellationPolicy: 'moderee',
    region: 'Occitanie',
    department: 'Lozère (48)',
    commune: 'Saint-Germain-de-Calberte',
    approxLocation: 'Vallon préservé des Cévennes, à 12 km de Florac',
    exactAddress: 'Lieu-dit Le Moulin de la Souche, 48370 Saint-Germain-de-Calberte',
    lat: 44.218,
    lng: 3.809,
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-drone-view-of-a-winding-road-in-a-forest-43759-large.mp4',
    amenities: ['Poêle à bois', 'Potager accessible', 'Cuisine équipée', 'Lave-linge écologique', 'Bibliothèque nature', 'Terrasse ombragée', 'Barbecue solaire'],
    houseRules: ['Non fumeur', 'Animaux bienvenus sous accord préalable', 'Respect du calme de la vallée après 22h', 'Tri des déchets obligatoire'],
    localTips: 'Antoine vous emmène visiter ses ruches le mardi matin et vous indique les bassines naturelles secrètes de baignade.',
    sustainablePractices: [
      'Tri sélectif & compostage autonome',
      'Énergie 100% renouvelable & chauffe-eau solaire',
      'Récupération d’eau de pluie & mousseurs',
      'Panier terroir & potager en permaculture',
      'Refuge biodiversité (LPO) & nichoirs'
    ],
    labels: ['eco_responsable', 'authentique', 'accueil_engage', 'rural_prioritaire'],
    status: 'publiee',
    publishedAt: '2026-04-12T11:00:00Z',
    blockedDates: ['2026-10-01', '2026-10-02', '2026-10-03'],
    rating: 4.95,
    reviewCount: 18,
    impactScoreKgCo2SavedPerNight: 8.4
  },
  {
    id: 'lst_2',
    hostId: 'usr_hote_2',
    hostName: 'Hélène Duchêne',
    hostAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    title: 'Éco-Cabane des Grands Chênes - Parc du Morvan',
    description: 'Une cabane éco-conçue en mélèze et douglas des forêts voisines, perchée avec vue panoramique sur les monts boisés du Morvan. Chauffage d’appoint au poêle de masse, éclairage solaire et bain nordique chauffé au bois local certifié PEFC. Déconnexion absolue garantie.',
    propertyType: 'eco_cabane',
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    pricePerNight: 120,
    cleaningFee: 25,
    minNights: 2,
    maxNights: 14,
    bookingMode: 'instant',
    cancellationPolicy: 'souple',
    region: 'Bourgogne-Franche-Comté',
    department: 'Nièvre (58)',
    commune: 'Saint-Brisson',
    approxLocation: 'Au cœur de la forêt morvandelle, proche des lacs de Settons',
    exactAddress: 'Chemin des Biches, Hameau des Chênes, 58230 Saint-Brisson',
    lat: 47.268,
    lng: 4.091,
    images: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Bain nordique au feu de bois', 'Poêle à bois', 'Lit king size en lin lavé', 'Terrasse panoramique', 'Petit-déjeuner bio inclus'],
    houseRules: ['Chaussures d’extérieur retirées à l’entrée', 'Savons biodégradables fournis uniquement', 'Interdiction de fumer sur le site boisé'],
    localTips: 'Départ direct pour le GR de Pays Tour du Morvan et location de vélos électriques à 3 km.',
    sustainablePractices: [
      'Tri sélectif & compostage autonome',
      'Énergie 100% renouvelable & chauffe-eau solaire',
      'Prêt de vélos & navette gare rurale',
      'Refuge biodiversité (LPO) & nichoirs'
    ],
    labels: ['eco_responsable', 'authentique', 'rural_prioritaire'],
    status: 'publiee',
    publishedAt: '2026-05-18T14:30:00Z',
    blockedDates: ['2026-09-25', '2026-09-26'],
    rating: 4.88,
    reviewCount: 12,
    impactScoreKgCo2SavedPerNight: 9.1
  },
  {
    id: 'lst_3',
    hostId: 'usr_hote_1',
    hostName: 'Antoine & Mathilde Vabre',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    title: 'Bergerie d’Alpage Éco-restaurée sous les oliviers',
    description: 'Ancienne bergerie en pierres sèches sur un versant ensoleillé du Luberon sauvage. Toiture végétalisée pour isolation thermique naturelle, toilettes à séparation d’urine écologique, douche à l’italienne alimentée par chauffe-eau solaire. Dégustation d’huile d’olive du domaine offerte à l’arrivée.',
    propertyType: 'bergerie',
    capacity: 5,
    bedrooms: 2,
    bathrooms: 1,
    pricePerNight: 110,
    cleaningFee: 40,
    minNights: 3,
    maxNights: 28,
    bookingMode: 'on_demand',
    cancellationPolicy: 'moderee',
    region: "Provence-Alpes-Côte d'Azur",
    department: 'Vaucluse (84)',
    commune: 'Buoux',
    approxLocation: 'À 8 km d’Apt, falaise et garrigue odorante',
    exactAddress: 'Piste des Chênes Blancs, 84480 Buoux',
    lat: 43.832,
    lng: 5.385,
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Toiture végétalisée', 'Jardin d’aromates', 'Plancha', 'Jeux de société d’antan', 'Hamac sous les micocouliers'],
    houseRules: ['Respect strict des consignes incendie en été', 'Économie d’eau demandée', 'Pas de fêtes bruyantes'],
    localTips: 'Les sentiers de randonnée partent de la bergerie vers le vallon de l’Aiguebrun.',
    sustainablePractices: [
      'Tri sélectif & compostage autonome',
      'Récupération d’eau de pluie & mousseurs',
      'Panier terroir & potager en permaculture',
      'Accueil engagé & transmission des savoir-faire'
    ],
    labels: ['authentique', 'accueil_engage'],
    status: 'publiee',
    publishedAt: '2026-03-20T09:00:00Z',
    blockedDates: [],
    rating: 4.92,
    reviewCount: 9,
    impactScoreKgCo2SavedPerNight: 7.2
  },
  {
    id: 'lst_4',
    hostId: 'usr_hote_2',
    hostName: 'Hélène Duchêne',
    hostAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    title: 'Ferme Vivrière Traditionnelle & Four à Pain du Pays Basque',
    description: 'Ferme séculaire rénovée avec badigeons à la chaux et poutres apparentes taillées à la hache. Élevage de brebis Manech et verger de pommiers à cidre. Vous partagerez le quotidien apaisé de la vie à la ferme.',
    propertyType: 'ferme_renovee',
    capacity: 6,
    bedrooms: 3,
    bathrooms: 2,
    pricePerNight: 135,
    cleaningFee: 45,
    minNights: 2,
    maxNights: 14,
    bookingMode: 'instant',
    cancellationPolicy: 'stricte',
    region: 'Nouvelle-Aquitaine',
    department: 'Pyrénées-Atlantiques (64)',
    commune: 'Saint-Étienne-de-Baïgorry',
    approxLocation: 'Vallée verdoyante des Aldudes',
    exactAddress: 'Maison Bordaxuria, 64430 Saint-Étienne-de-Baïgorry',
    lat: 43.178,
    lng: -1.341,
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Cheminée ouverte', 'Atelier fabrication de fromage', 'Four à pain en briques', 'Grand jardin clos', 'Vélos disponibles'],
    houseRules: ['Fermeture des barrières de pâturage obligatoire', 'Chiens acceptés si tenus en laisse près des animaux'],
    localTips: 'Atelier de pétrissage et cuisson du pain au levain chaque samedi avec les habitants.',
    sustainablePractices: [
      'Tri sélectif & compostage autonome',
      'Panier terroir & potager en permaculture',
      'Prêt de vélos & navette gare rurale',
      'Refuge biodiversité (LPO) & nichoirs'
    ],
    labels: ['eco_responsable', 'authentique', 'accueil_engage'],
    status: 'publiee',
    publishedAt: '2026-06-01T10:00:00Z',
    blockedDates: [],
    rating: 5.0,
    reviewCount: 7,
    impactScoreKgCo2SavedPerNight: 8.9
  },
  {
    id: 'lst_pending_demo',
    hostId: 'usr_hote_1',
    hostName: 'Antoine & Mathilde Vabre',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    title: 'Yourte Contemporaine en Laine Locale & Verger Bio',
    description: 'Yourte lumineuse isolée en feutre de laine de brebis mérinos des Cévennes. Plancher en châtaignier, douche solaire extérieure sous pergola de kiwis bio, toilettes sèches à sciure locale. Idéal pour admirer la Voie Lactée dans la Réserve Internationale de Ciel Étoilé.',
    propertyType: 'yourte',
    capacity: 3,
    bedrooms: 1,
    bathrooms: 1,
    pricePerNight: 80,
    cleaningFee: 20,
    minNights: 1,
    maxNights: 7,
    bookingMode: 'on_demand',
    cancellationPolicy: 'souple',
    region: 'Auvergne-Rhône-Alpes',
    department: 'Drôme (26)',
    commune: 'Dieulefit',
    approxLocation: 'Colline du Pays de Dieulefit',
    exactAddress: 'Route des Poteries, 26220 Dieulefit',
    lat: 44.523,
    lng: 5.064,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Télescope astronomique', 'Douche solaire', 'Dôme transparent pour contempler les étoiles', 'Bouilloire solaire'],
    houseRules: ['Éclairages extérieurs éteints après 23h pour préserver le ciel nocturne', 'Produits d’hygiène biologiques fournis'],
    localTips: 'Les potiers de Dieulefit et les producteurs de picodon AOP sont à 15 minutes en vélo.',
    sustainablePractices: [
      'Tri sélectif & compostage autonome',
      'Énergie 100% renouvelable & chauffe-eau solaire',
      'Panier terroir & potager en permaculture'
    ],
    labels: ['eco_responsable'],
    status: 'en_attente',
    submittedAt: '2026-09-16T15:45:00Z',
    blockedDates: [],
    rating: 0,
    reviewCount: 0,
    impactScoreKgCo2SavedPerNight: 11.2
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'res_2026_0891',
    listingId: 'lst_1',
    listingTitle: 'Gîte du Moulin des Cévennes en schiste séculaire',
    listingImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
    listingCommune: 'Saint-Germain-de-Calberte (48)',
    exactAddress: 'Lieu-dit Le Moulin de la Souche, 48370 Saint-Germain-de-Calberte',
    hostId: 'usr_hote_1',
    hostName: 'Antoine & Mathilde Vabre',
    travelerId: 'usr_voyageur_1',
    travelerName: 'Ba Tamsir',
    travelerEmail: 'ba.tamsir@example.fr',
    startDate: '2026-08-10',
    endDate: '2026-08-14',
    nightsCount: 4,
    guestsCount: 2,
    nightlyTotal: 380, // 4 * 95
    cleaningFee: 35,
    serviceFee: 49.80, // 12%
    touristTax: 12.00,
    totalPrice: 476.80,
    hostNetEarnings: 365.20,
    status: 'terminee',
    paymentStatus: 'paid',
    paymentIntentId: 'pi_3Pq91029481923',
    stripeReceiptUrl: 'https://pay.stripe.com/receipts/invoices/sample_mystay_1',
    accessCode: 'MYSTAY-4821',
    co2SavedKg: 33.6,
    createdAt: '2026-07-28T16:20:00Z',
    hasReview: true
  },
  {
    id: 'res_2026_0917_encours',
    listingId: 'lst_3',
    listingTitle: 'Bergerie d’Alpage Éco-restaurée sous les oliviers',
    listingImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
    listingCommune: 'Bonnieux (84)',
    exactAddress: 'Hameau des Buoux, 84480 Bonnieux (Parc du Luberon)',
    hostId: 'usr_hote_1',
    hostName: 'Antoine & Mathilde Vabre',
    travelerId: 'usr_voyageur_1',
    travelerName: 'Ba Tamsir',
    travelerEmail: 'ba.tamsir@example.fr',
    startDate: '2026-09-15',
    endDate: '2026-09-19',
    nightsCount: 4,
    guestsCount: 2,
    nightlyTotal: 440,
    cleaningFee: 40,
    serviceFee: 57.60,
    touristTax: 12.00,
    totalPrice: 549.60,
    hostNetEarnings: 422.40,
    status: 'confirmee',
    paymentStatus: 'paid',
    paymentIntentId: 'pi_3Pq988812903',
    stripeReceiptUrl: 'https://pay.stripe.com/receipts/invoices/sample_mystay_encours',
    accessCode: 'MYSTAY-8419',
    co2SavedKg: 40.8,
    createdAt: '2026-09-01T10:00:00Z',
    hasReview: false
  },
  {
    id: 'res_2026_0942',
    listingId: 'lst_2',
    listingTitle: 'Éco-Cabane des Grands Chênes - Parc du Morvan',
    listingImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    listingCommune: 'Saint-Brisson (58)',
    exactAddress: 'Chemin des Biches, Hameau des Chênes, 58230 Saint-Brisson',
    hostId: 'usr_hote_2',
    hostName: 'Hélène Duchêne',
    travelerId: 'usr_voyageur_1',
    travelerName: 'Ba Tamsir',
    travelerEmail: 'ba.tamsir@example.fr',
    startDate: '2026-10-15',
    endDate: '2026-10-18',
    nightsCount: 3,
    guestsCount: 2,
    nightlyTotal: 360, // 3 * 120
    cleaningFee: 25,
    serviceFee: 46.20,
    touristTax: 9.00,
    totalPrice: 440.20,
    hostNetEarnings: 338.80,
    status: 'confirmee',
    paymentStatus: 'paid',
    paymentIntentId: 'pi_3Pq99912093849',
    stripeReceiptUrl: 'https://pay.stripe.com/receipts/invoices/sample_mystay_2',
    accessCode: 'MYSTAY-5893',
    co2SavedKg: 27.3,
    createdAt: '2026-09-12T11:40:00Z',
    hasReview: false
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    bookingId: 'res_2026_0891',
    listingId: 'lst_1',
    travelerId: 'usr_voyageur_1',
    travelerName: 'Ba Tamsir',
    travelerAvatar: baTamsirAvatar,
    rating: 5,
    subRatings: {
      cleanliness: 5,
      authenticity: 5,
      ecoResponsibility: 5,
      hostWelcome: 5
    },
    comment: 'Un séjour inoubliable au Moulin des Cévennes ! L’accueil d’Antoine et Mathilde est d’une sincérité rare. Le miel des ruches offert au petit-déjeuner était délicieux, et le chant de la rivière invite à une vraie sérénité. Toutes les pratiques écologiques sont réelles et transparentes.',
    createdAt: '2026-08-16T10:15:00Z',
    hostReply: {
      text: 'Merci infiniment Ba Tamsir pour votre sensibilité à la préservation de notre vallée cévenole. Ce fut un plaisir de partager notre potager avec vous !',
      repliedAt: '2026-08-17T14:00:00Z'
    },
    status: 'valid'
  },
  {
    id: 'rev_2',
    bookingId: 'res_prev_07',
    listingId: 'lst_2',
    travelerId: 'usr_voyageur_2',
    travelerName: 'Marc Lefebvre',
    travelerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    rating: 4.8,
    subRatings: {
      cleanliness: 5,
      authenticity: 5,
      ecoResponsibility: 5,
      hostWelcome: 4.5
    },
    comment: 'Cabane exceptionnelle, odeur apaisante du bois brut et bain nordique parfait sous les étoiles. Hélène a pensé au moindre détail pour limiter l’impact environnemental.',
    createdAt: '2026-07-22T08:30:00Z',
    status: 'valid'
  }
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg_1',
    bookingId: 'res_2026_0942',
    senderId: 'usr_voyageur_1',
    senderName: 'Ba Tamsir',
    senderRole: 'voyageur',
    content: 'Bonjour Hélène, nous arriverons vers 17h le 15 octobre. Pouvez-vous nous confirmer s’il est possible de récupérer les vélos électriques dès le lendemain matin ?',
    timestamp: '2026-09-14T09:20:00Z'
  },
  {
    id: 'msg_2',
    bookingId: 'res_2026_0942',
    senderId: 'usr_hote_2',
    senderName: 'Hélène Duchêne',
    senderRole: 'hote',
    content: 'Bonjour Ba Tamsir ! Absolument, les 2 VAE seront chargés et réglés pour vous avec les casques et cartes des sentiers du Morvan. À très vite !',
    timestamp: '2026-09-14T10:05:00Z'
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_001',
    action: 'ANNONCE_VALIDEE',
    targetId: 'lst_1',
    targetType: 'listing',
    authorName: 'Laurent Moreau (Admin MyStay)',
    authorRole: 'Administrateur',
    details: 'Validation de l’annonce après vérification de la localisation rurale et des 5 pratiques écologiques. Attribution des labels Éco-responsable et Authentique.',
    timestamp: '2026-04-12T11:00:00Z'
  },
  {
    id: 'log_002',
    action: 'PAIEMENT_STRIPE_ENCAISSE',
    targetId: 'res_2026_0942',
    targetType: 'booking',
    authorName: 'Système Stripe Connect',
    authorRole: 'Automate',
    details: 'Encaissement de 440.20 €. Split: 338.80 € pour l’hôte Hélène Duchêne, 46.20 € commission MyStay, 55.20 € ménage + taxe.',
    timestamp: '2026-09-12T11:40:02Z'
  },
  {
    id: 'log_003',
    action: 'NOTIFICATION_MAKE_ENVOYEE',
    targetId: 'res_2026_0942',
    targetType: 'system',
    authorName: 'Scénario Make #2',
    authorRole: 'Webhook Make',
    details: 'Email de confirmation avec récapitulatif écologique et itinéraire doux transmis à claire.bernard@example.fr.',
    timestamp: '2026-09-12T11:40:05Z'
  }
];

export const INITIAL_MAKE_EXECUTIONS: MakeScenarioExecution[] = [
  {
    id: 'exec_make_101',
    scenarioName: 'MyStay - Réservation Stripe -> Email & Calendrier Airtable',
    triggerEvent: 'stripe.payment_intent.succeeded',
    status: 'success',
    executionTimeMs: 420,
    timestamp: '2026-09-12T11:40:05Z',
    payloadSummary: 'Booking res_2026_0942 | 440.20€ | Email envoyé à claire.bernard@example.fr | Ligne Airtable Bookings créée'
  },
  {
    id: 'exec_make_102',
    scenarioName: 'MyStay - Nouvelle Annonce -> Alerte Modération Admin',
    triggerEvent: 'airtable.record.created [Listings: en_attente]',
    status: 'success',
    executionTimeMs: 310,
    timestamp: '2026-09-16T15:45:02Z',
    payloadSummary: 'Annonce lst_pending_demo "Yourte Contemporaine" | Notification Slack Admin & Email d’accusé réception hôte'
  },
  {
    id: 'exec_make_103',
    scenarioName: 'MyStay - Clôture Séjour -> Invitation Avis Vérifié',
    triggerEvent: 'airtable.formula_trigger [DepartureDate == Today]',
    status: 'success',
    executionTimeMs: 280,
    timestamp: '2026-08-15T09:00:00Z',
    payloadSummary: 'Séjour res_2026_0891 terminé | Lien sécurisé unique d’avis 14 jours envoyé au voyageur'
  }
];
