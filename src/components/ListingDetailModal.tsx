import React, { useState } from 'react';
import { Listing, MyStayLabel } from '../types';
import { useApp } from '../context/AppContext';
import { 
  X, Star, MapPin, Heart, ShieldCheck, Zap, Mail, 
  Calendar, Users, CheckCircle2, AlertCircle, Info, 
  Leaf, Trees, HeartHandshake, Shield, Sparkles, 
  Clock, ArrowRight, MessageSquare, Video, Play
} from 'lucide-react';
import { ListingLocationMap } from './ListingLocationMap';

interface ListingDetailModalProps {
  listing?: Listing;
  onClose?: () => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({ listing: propListing, onClose }) => {
  const { 
    selectedListing, setSelectedListing,
    currentUser, favorites, toggleFavorite, reviews, 
    bookings, openCheckout, showNotification, setActiveView,
    openChatWithHost
  } = useApp();

  const listing = propListing || selectedListing;
  if (!listing) return null;

  const isBookedByMe = bookings.some(
    b => b.listingId === listing.id && b.travelerId === currentUser.id && b.status === 'confirmee'
  );

  const handleClose = () => {
    if (onClose) onClose();
    else setSelectedListing(null);
  };

  // Booking widget local state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const inThreeDays = new Date();
  inThreeDays.setDate(inThreeDays.getDate() + 3);

  const [startDate, setStartDate] = useState<string>(tomorrow.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(inThreeDays.toISOString().split('T')[0]);
  const [guestsCount, setGuestsCount] = useState<number>(Math.min(2, listing.capacity));
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'video'>('photos');

  const isFavorite = favorites.includes(listing.id);

  // Filter reviews for this listing
  const listingReviews = reviews.filter(r => r.listingId === listing.id && r.status === 'valid');

  // Video URL helper
  const activeVideo = listing.videoUrl || (listing.videos && listing.videos.length > 0 ? listing.videos[0] : '');
  const hasVideo = !!activeVideo;

  // Compute pricing
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const validDates = end > start;

  const nightlyTotal = listing.pricePerNight * (validDates ? diffDays : listing.minNights);
  const cleaningFee = listing.cleaningFee;
  const serviceFee = Number((nightlyTotal * 0.12).toFixed(2));
  const touristTax = Number(((validDates ? diffDays : listing.minNights) * guestsCount * 1.5).toFixed(2));
  const grandTotal = Number((nightlyTotal + cleaningFee + serviceFee + touristTax).toFixed(2));

  // Check if chosen range has any blocked dates
  const isDateBlocked = () => {
    if (!validDates) return false;
    let cur = new Date(start);
    while (cur < end) {
      const dStr = cur.toISOString().split('T')[0];
      if (listing.blockedDates && Array.isArray(listing.blockedDates) && listing.blockedDates.includes(dStr)) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  };
  const datesAreBlocked = isDateBlocked();

  const handleStartBooking = () => {
    if (!validDates) {
      showNotification('Dates invalides', 'La date de départ doit être postérieure à la date d\'arrivée.', 'warning');
      return;
    }
    if (diffDays < listing.minNights) {
      showNotification('Durée minimale', `Ce logement requiert un séjour d'au moins ${listing.minNights} nuit(s).`, 'warning');
      return;
    }
    if (datesAreBlocked) {
      showNotification('Dates indisponibles', 'Certaines dates sélectionnées sont déjà réservées ou bloquées par l\'hôte.', 'warning');
      return;
    }

    // Open Stripe Checkout
    openCheckout(listing, {
      startDate,
      endDate,
      guestsCount
    });
  };

  const labelConfig: Record<MyStayLabel, { label: string; icon: React.ReactNode; bg: string; text: string; desc: string }> = {
    eco_responsable: { 
      label: 'Éco-responsable', 
      icon: <Leaf className="w-4 h-4" />, 
      bg: 'bg-emerald-50 border-emerald-300',
      text: 'text-emerald-900',
      desc: 'Pratiques environnementales documentées et auditées par MyStay'
    },
    authentique: { 
      label: 'Authentique', 
      icon: <Trees className="w-4 h-4" />, 
      bg: 'bg-amber-50 border-amber-300',
      text: 'text-amber-900',
      desc: 'Hébergement préservant le bâti patrimonial et les matériaux locaux'
    },
    accueil_engage: { 
      label: 'Accueil engagé', 
      icon: <HeartHandshake className="w-4 h-4" />, 
      bg: 'bg-orange-50 border-orange-300',
      text: 'text-orange-900',
      desc: 'Hôte passionné favorisant la découverte du terroir et les liens humains'
    },
    rural_prioritaire: { 
      label: 'Rural prioritaire', 
      icon: <Shield className="w-4 h-4" />, 
      bg: 'bg-stone-100 border-stone-300',
      text: 'text-stone-900',
      desc: 'Implantation en zone rurale préservée pour soutenir l\'économie locale'
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        id="listing-detail-modal-container"
        className="relative bg-[#FAF9F5] w-full max-w-5xl rounded-3xl shadow-2xl border border-[#DEDBD2] overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E4DD] bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              {listing.propertyType.replace('_', ' ')} • Réf. {listing.id}
            </span>
            {listing.status === 'en_attente' && (
              <span className="bg-amber-100 text-amber-900 text-xs px-2 py-0.5 rounded-full font-bold">
                En attente de validation modération
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleFavorite(listing.id)}
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 hover:text-rose-600 transition cursor-pointer"
              title="Ajouter aux favoris"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'text-rose-600 fill-rose-600' : ''}`} />
            </button>
            <button
              id="close-listing-detail-btn"
              onClick={handleClose}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-8 flex-1">
          
          {/* Title & Location Header */}
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
              {listing.title}
            </h1>
            <div className="flex items-center gap-4 flex-wrap text-sm text-stone-600 mt-2">
              <span className="flex items-center gap-1 font-medium text-stone-900">
                <MapPin className="w-4 h-4 text-[#C86D51]" />
                {listing.commune} ({listing.department}), {listing.region}
              </span>
              <span className="text-stone-300">•</span>
              <span className="flex items-center gap-1 text-stone-700">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <strong className="text-stone-900">{listing.rating > 0 ? listing.rating.toFixed(2) : 'Nouveau'}</strong>
                <span>({listing.reviewCount} avis vérifiés)</span>
              </span>
              <span className="text-stone-300">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full text-xs font-semibold">
                🌱 Impact : -{listing.impactScoreKgCo2SavedPerNight} kg CO₂ / nuitée
              </span>
            </div>
          </div>

          {/* Media Gallery (Photos & Vidéo du Site d'Accueil) */}
          <div className="space-y-3">
            {/* Bannière de présentation du site d'accueil */}
            <div className="bg-[#FAF9F5] border border-emerald-200/80 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-stone-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="font-semibold text-[#243E36]">
                  🏡 Le site où vous serez accueilli par {listing.hostName} :
                </span>
                <span className="text-stone-500 hidden sm:inline">
                  découvrez la propriété, les abords naturels et l'ambiance authentique
                </span>
              </div>
              {hasVideo && activeMediaTab === 'photos' && (
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('video')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-100 px-3 py-1 rounded-xl transition cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-amber-700 text-amber-700" />
                  <span>Voir la vidéo du site</span>
                </button>
              )}
            </div>

            {hasVideo && (
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('photos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      activeMediaTab === 'photos'
                        ? 'bg-[#243E36] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span>📸 Photos du site ({listing.images?.length || 1})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('video')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeMediaTab === 'video'
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'text-amber-900 hover:bg-amber-100/60'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>🎬 Vidéo du site & accueil</span>
                  </button>
                </div>

                <span className="text-xs text-stone-500 hidden sm:inline-flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-amber-700" />
                  Visite immersive du lieu où vous serez accueilli
                </span>
              </div>
            )}

            {activeMediaTab === 'photos' ? (
              <>
                <div className="relative aspect-16/9 sm:aspect-21/9 rounded-2xl overflow-hidden bg-stone-200 shadow-xs">
                  <img
                    src={(listing.images && listing.images[activePhotoIndex]) || (listing.images && listing.images[0]) || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'}
                    alt={listing.title}
                    className="w-full h-full object-cover transition duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                    <span>🏡</span>
                    <span>{activePhotoIndex === 0 ? "Image principale du site d'accueil" : `Vue du site & intérieur (${activePhotoIndex + 1})`}</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-full">
                    Photo {activePhotoIndex + 1} / {(listing.images && listing.images.length) || 1}
                  </div>
                  {hasVideo && (
                    <button
                      type="button"
                      onClick={() => setActiveMediaTab('video')}
                      className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-[#243E36]/90 hover:bg-[#243E36] backdrop-blur-xs text-white text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer shadow-md transition"
                    >
                      <Play className="w-3 h-3 fill-white" /> Voir la vidéo du site d'accueil
                    </button>
                  )}
                </div>

                {(listing.images && listing.images.length > 1) && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {listing.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                          activePhotoIndex === idx ? 'border-[#243E36] ring-2 ring-[#243E36]/30' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Aperçu ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div className="relative aspect-16/9 sm:aspect-21/9 rounded-2xl overflow-hidden bg-black shadow-lg">
                  {activeVideo.includes('youtube.com') || activeVideo.includes('youtu.be') ? (
                    <iframe
                      src={activeVideo.replace('watch?v=', 'embed/').split('&')[0]}
                      title={`Visite vidéo - ${listing.title}`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : activeVideo.includes('vimeo.com') ? (
                    <iframe
                      src={`https://player.vimeo.com/video/${activeVideo.split('/').pop()}`}
                      title={`Visite vidéo - ${listing.title}`}
                      className="w-full h-full border-0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={activeVideo}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-950 text-xs">
                  <div className="flex items-center gap-2 font-medium">
                    <Play className="w-4 h-4 text-amber-700 fill-amber-700 shrink-0" />
                    <span>Visite immersive du site et découverte du domaine où vous serez accueilli par {listing.hostName}.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('photos')}
                    className="text-xs font-bold text-[#243E36] hover:underline cursor-pointer ml-2 shrink-0"
                  >
                    Revenir aux photos du site
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Official Labels MyStay Banner */}
          <div className="bg-white rounded-2xl p-5 border border-[#DEDBD2] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#243E36] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#243E36]" />
                Labels officiels MyStay attribués par la modération
              </h3>
              <span className="text-xs text-stone-500 hidden sm:inline">
                Charte Tourisme Durable v1.1
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {(listing.labels || []).map(l => {
                const cfg = labelConfig[l];
                if (!cfg) return null;
                return (
                  <div key={l} className={`p-3 rounded-xl border ${cfg.bg} flex flex-col justify-between space-y-1`}>
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {cfg.icon}
                      <span>{cfg.label}</span>
                    </div>
                    <p className="text-[11px] leading-snug opacity-90">
                      {cfg.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main 2-Column Grid: Details vs Booking Widget */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column (8 cols): Description, Engagements, Host, Amenities */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Host Profile Box */}
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-200">
                <div className="flex items-center gap-3">
                  <img
                    src={listing.hostAvatar}
                    alt={listing.hostName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#243E36]"
                  />
                  <div>
                    <div className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                      <span>Proposé par {listing.hostName}</span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Hôte vérifié
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">
                      Producteur / Hébergeur engagé dans la charte rurale
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-stone-500 flex flex-col items-end gap-2">
                  <div className="hidden sm:block">
                    <div>Capacité : <strong>{listing.capacity} pers.</strong></div>
                    <div>{listing.bedrooms} chambre(s) • {listing.bathrooms} sdb</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openChatWithHost(listing)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#243E36] text-[#243E36] hover:bg-[#243E36] hover:text-white transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Envoyer un message instantané à l'hôte"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Contacter l'hôte</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  L'esprit du séjour & authenticité
                </h3>
                <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Sustainable Commitments (Min 3 required by specification) */}
              <div className="bg-[#F4F6F0] rounded-2xl p-5 border border-[#DEE3D3] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-[#1E3A2F] flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-[#2E6F40]" />
                    Engagements durables déclarés et vérifiés ({(listing.sustainablePractices || []).length})
                  </h3>
                  <span className="text-[11px] font-semibold text-[#2E6F40] bg-white px-2 py-0.5 rounded-full border border-[#D0DBC3]">
                    Conforme Charte MyStay
                  </span>
                </div>
                <p className="text-xs text-stone-600">
                  Chaque hébergeur s’engage sur au moins 3 pratiques concrètes pour préserver le biotope local :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {(listing.sustainablePractices || []).map((practice, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-[#DCE4CF] text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span className="font-medium text-stone-800">{practice}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Équipements & confort naturel
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(listing.amenities || []).map((item, idx) => (
                    <div key={idx} className="text-xs text-stone-700 flex items-center gap-2 bg-white p-2 rounded-xl border border-stone-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#243E36]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules & Local Tips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
                  <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-600">
                    Règles du lieu
                  </h4>
                  <ul className="text-xs text-stone-600 space-y-1">
                    {listing.houseRules.map((rule, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-[#C86D51]">•</span> {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#FAF6F2] p-4 rounded-2xl border border-[#EDE2D8] space-y-2">
                  <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#8C5E45]">
                    Conseil de l'hôte & découverte locale
                  </h4>
                  <p className="text-xs text-stone-700 italic">
                    « {listing.localTips} »
                  </p>
                </div>
              </div>

              {/* Interactive Geolocation Map */}
              <div className="pt-1">
                <ListingLocationMap listing={listing} isBookedByMe={isBookedByMe} />
              </div>

            </div>

            {/* Right Column (5 cols): Sticky Booking & Pricing Widget */}
            <div className="lg:col-span-5">
              <div className="sticky top-20 bg-white rounded-3xl p-6 border-2 border-[#243E36] shadow-lg space-y-5">
                
                {/* Header Réserver et Payer */}
                <div className="border-b border-stone-100 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#8C5E45] uppercase tracking-wider bg-[#F7EBE4] px-2 py-0.5 rounded-full border border-[#E9D5C9]">
                      Section 4 • Réserver et Payer
                    </span>
                    {listing.bookingMode === 'instant' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Zap className="w-3 h-3 text-amber-500" /> Réservation instantanée
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-300">
                        <Mail className="w-3 h-3 text-stone-500" /> Sur demande hôte (24h)
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="text-2xl font-bold font-serif text-[#243E36]">
                      {listing.pricePerNight} € <span className="text-xs font-normal text-stone-500 font-sans">/ nuit</span>
                    </div>
                    <div className="text-xs text-stone-500">
                      Min. {listing.minNights} nuit{listing.minNights > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Step 1: Date & Guests Selection */}
                <div className="bg-[#FAF9F5] rounded-2xl p-3.5 border border-[#E6E4DD] space-y-3">
                  <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#243E36]" />
                    <span>1. Sélectionnez vos dates et voyageurs</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-500 uppercase">
                        Date d'arrivée
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full text-xs font-semibold text-stone-900 bg-white p-2 rounded-lg border border-stone-200 outline-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-500 uppercase">
                        Date de départ
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full text-xs font-semibold text-stone-900 bg-white p-2 rounded-lg border border-stone-200 outline-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-stone-500 uppercase">
                      Nombre d'occupants (max {listing.capacity})
                    </label>
                    <select
                      value={guestsCount}
                      onChange={e => setGuestsCount(Number(e.target.value))}
                      className="w-full text-xs font-semibold text-stone-900 bg-white p-2 rounded-lg border border-stone-200 outline-none cursor-pointer"
                    >
                      {Array.from({ length: listing.capacity }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>
                          {num} voyageur{num > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Validation messages */}
                {datesAreBlocked && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Certaines dates sélectionnées sont déjà réservées.</span>
                  </div>
                )}

                {/* Detailed Transparent Price Breakdown (Section 4 du Manuel) */}
                <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
                    <span>Récapitulatif transparent</span>
                    <span className="text-[10px] text-[#243E36] font-semibold bg-[#EAE8DF] px-2 py-0.5 rounded">Stripe sécurisé</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Prix des nuitées ({listing.pricePerNight} € x {diffDays} n.)</span>
                    <span className="font-semibold text-stone-900">{nightlyTotal.toFixed(2)} €</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Forfait ménage écologique</span>
                    <span className="font-semibold text-stone-900">{cleaningFee.toFixed(2)} €</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      Commission solidaire MyStay (12%)
                      <span className="text-[10px] text-stone-400" title="Rémunère la modération humaine et le support">ⓘ</span>
                    </span>
                    <span className="font-semibold text-stone-900">{serviceFee.toFixed(2)} €</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Taxe de séjour reversée à la commune ({guestsCount} p. x {diffDays} n.)</span>
                    <span className="font-semibold text-stone-900">{touristTax.toFixed(2)} €</span>
                  </div>

                  {/* Calcul impact environnemental positif (Manuel README Section 4) */}
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold">Calcul de votre impact positif : </span>
                      <span>
                        ~{(listing.impactScoreKgCo2SavedPerNight * diffDays).toFixed(1)} kg de CO₂ économisés sur ce séjour grâce aux pratiques durables !
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline font-bold text-sm text-stone-900">
                    <span className="text-base text-[#243E36]">Total à payer TTC</span>
                    <span className="text-xl text-[#243E36]">{grandTotal.toFixed(2)} €</span>
                  </div>
                </div>

                {/* Step 2 & 4: CTA Action button */}
                <button
                  id="start-booking-stripe-btn"
                  onClick={handleStartBooking}
                  disabled={datesAreBlocked || !validDates}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                    datesAreBlocked || !validDates
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : 'bg-[#243E36] hover:bg-[#1B2F29] text-white'
                  }`}
                >
                  <span>
                    {listing.bookingMode === 'instant' ? 'Réserver maintenant' : 'Envoyer une demande'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => openChatWithHost(listing)}
                  className="w-full py-2.5 px-4 rounded-xl border border-stone-200 hover:border-[#243E36] hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#243E36]" />
                  <span>Poser une question à l'hôte (Direct)</span>
                </button>

                <div className="text-[11px] text-stone-500 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Paiement sécurisé par carte bancaire via Stripe</span>
                  </div>
                  <div className="text-stone-400">
                    Annulation {listing.cancellationPolicy} • Adresse exacte débloquée après validation
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Verified Reviews Section (Section 4.6) */}
          <div className="border-t border-[#E6E4DD] pt-8 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-stone-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  Avis vérifiés après séjour ({listingReviews.length})
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Conformément au cahier des charges, seuls les voyageurs ayant réalisé un séjour peuvent publier un avis.
                </p>
              </div>

              {listing.rating > 0 && (
                <div className="bg-[#FAF9F5] px-4 py-2 rounded-xl border border-stone-200 text-right">
                  <div className="text-2xl font-bold font-serif text-[#243E36]">
                    {listing.rating.toFixed(2)} / 5
                  </div>
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                    Note globale
                  </div>
                </div>
              )}
            </div>

            {listingReviews.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
                Aucun avis pour le moment. Soyez le premier voyageur à explorer ce lieu et partager votre expérience !
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listingReviews.map(review => (
                  <div key={review.id} className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={review.travelerAvatar}
                          alt={review.travelerName}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-bold text-xs text-stone-900">{review.travelerName}</div>
                          <div className="text-[10px] text-stone-400">
                            Séjour certifié • {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{review.rating}/5</span>
                      </div>
                    </div>

                    {/* Sub-ratings grid */}
                    {review.subRatings && (
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2.5 rounded-xl text-stone-600">
                        <div>Propreté : <strong>{review.subRatings.cleanliness}/5</strong></div>
                        <div>Authenticité : <strong>{review.subRatings.authenticity}/5</strong></div>
                        <div>Éco-responsabilité : <strong>{review.subRatings.ecoResponsibility}/5</strong></div>
                        <div>Accueil humain : <strong>{review.subRatings.hostWelcome}/5</strong></div>
                      </div>
                    )}

                    <p className="text-xs text-stone-700 leading-relaxed italic">
                      « {review.comment} »
                    </p>

                    {/* Host Reply */}
                    {review.hostReply && (
                      <div className="bg-[#FAF6F2] p-3 rounded-xl border-l-2 border-[#8C5E45] text-xs space-y-1">
                        <div className="font-bold text-[#8C5E45] flex items-center gap-1 text-[11px]">
                          <MessageSquare className="w-3 h-3" />
                          <span>Réponse de l'hôte ({listing.hostName}) :</span>
                        </div>
                        <p className="text-stone-600 text-xs italic">
                          « {review.hostReply.text} »
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
