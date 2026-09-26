export type UserRole = 'voyageur' | 'hote' | 'admin';

export type ListingStatus = 'brouillon' | 'en_attente' | 'publiee' | 'a_modifier' | 'rejetee';

export type BookingStatus = 'en_attente_hote' | 'confirmee' | 'refusee' | 'terminee' | 'annulee';

export type MyStayLabel = 'eco_responsable' | 'authentique' | 'accueil_engage' | 'rural_prioritaire';

export type ActiveView = 
  | 'explore' 
  | 'my_trips' 
  | 'host_space' 
  | 'admin_space' 
  | 'chat' 
  | 'home' 
  | 'search' 
  | 'host' 
  | 'bookings' 
  | 'admin' 
  | 'cms' 
  | 'stack'
  | 'no_code_stack'
  | 'nocode_inspector';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  isHostVerified?: boolean;
  isEmailVerified?: boolean;
  role: UserRole;
  createdAt?: string;
  password?: string;
  hostVerificationDocs?: string[];
}

export interface Listing {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  title: string;
  description: string;
  propertyType: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  cleaningFee: number;
  minNights: number;
  maxNights: number;
  bookingMode: 'instant' | 'on_demand';
  cancellationPolicy: 'flexible' | 'moderee' | 'stricte' | 'souple';
  region: string;
  department: string;
  commune: string;
  approxLocation: string;
  exactAddress?: string;
  lat: number;
  lng: number;
  images: string[];
  siteImageUrl?: string;
  videoUrl?: string;
  videos?: string[];
  amenities: string[];
  houseRules: string[];
  localTips?: string;
  sustainablePractices: string[];
  labels: MyStayLabel[];
  status: ListingStatus;
  adminComment?: string;
  modificationRequest?: { requestedAt?: string; details?: string; status?: string } | any;
  submittedAt?: string;
  publishedAt?: string;
  blockedDates: string[];
  rating: number;
  reviewCount: number;
  impactScoreKgCo2SavedPerNight: number;
}

export interface Booking {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  listingCommune: string;
  exactAddress?: string;
  hostId: string;
  hostName: string;
  travelerId: string;
  travelerName: string;
  travelerEmail?: string;
  startDate: string;
  endDate: string;
  nightsCount: number;
  guestsCount: number;
  nightlyTotal: number;
  cleaningFee: number;
  serviceFee: number;
  touristTax: number;
  totalPrice: number;
  hostNetEarnings: number;
  status: BookingStatus;
  paymentStatus?: 'paid' | 'pending' | 'refunded';
  paymentIntentId?: string;
  stripeReceiptUrl?: string;
  accessCode?: string;
  co2SavedKg?: number;
  createdAt: string;
  hasReview?: boolean;
}

export interface Review {
  id: string;
  bookingId: string;
  listingId: string;
  travelerId: string;
  travelerName: string;
  travelerAvatar?: string;
  rating: number;
  subRatings?: {
    cleanliness: number;
    authenticity: number;
    ecoResponsibility: number;
    hostWelcome: number;
  };
  comment: string;
  createdAt: string;
  status?: 'valid' | 'pending' | 'flagged' | 'hidden';
  isFlagged?: boolean;
  hostReply?: {
    text: string;
    date?: string;
    repliedAt?: string;
  };
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user?: string;
  authorName?: string;
  authorRole?: string;
  targetId?: string;
  targetType?: string;
  details: string;
  severity?: 'info' | 'warning' | 'error';
}

export interface MakeScenarioExecution {
  id: string;
  name?: string;
  scenarioName?: string;
  status: 'success' | 'running' | 'warning' | 'error';
  timestamp: string;
  duration?: string;
  executionTimeMs?: number;
  trigger?: string;
  triggerEvent?: string;
  recordsProcessed?: number;
  payloadSummary?: string;
}

export interface FilterOptions {
  region?: string;
  department?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  guests?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sustainablePractices?: string[];
  selectedSustainableOnly?: boolean;
  labels?: MyStayLabel[];
  searchQuery?: string;
}

export interface NotificationInfo {
  id?: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp?: string;
}

export interface PlatformSettings {
  serviceFeePercent: number;
  commissionRatePercent?: number;
  commissionRateHost?: number;
  touristTaxPerNight: number;
  heroTagline: string;
  heroSubtitle: string;
  heroSubheadline?: string;
  charterAnnouncement?: string;
}

export interface EmailAuthReceipt {
  id: string;
  email: string;
  userName?: string;
  userRole?: UserRole;
  validationCode?: string;
  code?: string;
  type?: 'verification' | 'reset';
  status?: string;
  createdAt: string;
  validatedAt?: string;
  expiresAt?: string;
  adminName?: string;
  adminRole?: string;
  adminEmail?: string;
  ipReference?: string;
  securitySignature?: string;
  notes?: string;
}

export interface SustainablePractice {
  id: string;
  category: 'tri' | 'energie_sobriete' | 'produits_locaux' | 'mobilite_douce' | 'sensibilisation_biodiversite';
  label: string;
  description: string;
}
