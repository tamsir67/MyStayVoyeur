import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Booking, Listing } from '../types';
import { 
  Calendar, MapPin, MessageSquare, Star, Heart, 
  ExternalLink, CheckCircle2, Clock, AlertCircle, 
  Sparkles, Compass, ArrowRight, Key, Copy, Check,
  Leaf, ShieldCheck, CreditCard, Camera, User as UserIcon,
  TrendingDown
} from 'lucide-react';
import { ImpactVisualization } from './ImpactVisualization';

export const TravelerTripsView: React.FC = () => {
  const { 
    currentUser, bookings, listings, favorites, 
    setActiveChatBookingId, setActiveReviewBooking, 
    setSelectedListing, setActiveView, cancelBooking,
    showNotification, openProfileModal
  } = useApp();

  const [filterTab, setFilterTab] = useState<'all' | 'upcoming' | 'ongoing' | 'pending' | 'past' | 'favorites' | 'impact'>('all');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Filter bookings for current traveler
  const myBookings = bookings.filter(b => b.travelerId === currentUser.id);
  const favoriteListings = listings.filter(l => favorites.includes(l.id));

  // Compute total CO2 saved cumulatively
  const userCo2SavedTotal = myBookings
    .filter(b => b.status !== 'annulee' && b.status !== 'refusee')
    .reduce((sum, b) => sum + (b.co2SavedKg || ((b.nightsCount || 1) * 12.5)), 0);

  // Determine current ongoing trips (between start and end dates)
  const todayStr = new Date().toISOString().split('T')[0];
  
  const ongoingBookings = myBookings.filter(b => 
    b.status === 'confirmee' && b.startDate <= todayStr && b.endDate >= todayStr
  );
  const upcomingBookings = myBookings.filter(b => 
    b.status === 'confirmee' && b.startDate > todayStr
  );
  const pendingBookings = myBookings.filter(b => b.status === 'en_attente_hote');
  const pastBookings = myBookings.filter(b => 
    b.status === 'terminee' || (b.status === 'confirmee' && b.endDate < todayStr)
  );

  const handleCopyCode = (code: string, bookingId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(bookingId);
    showNotification('Code copié !', `Le code d'accès ${code} a été copié dans votre presse-papier.`, 'success');
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const getFilteredBookings = () => {
    switch (filterTab) {
      case 'upcoming': return upcomingBookings;
      case 'ongoing': return ongoingBookings;
      case 'pending': return pendingBookings;
      case 'past': return pastBookings;
      default: return myBookings;
    }
  };

  const displayedBookings = getFilteredBookings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header aligned with README Section 5 */}
      <div className="bg-white rounded-3xl border border-[#E6E4DD] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold text-[#8C5E45] uppercase tracking-wider bg-[#F7EBE4] px-2.5 py-1 rounded-full border border-[#E9D5C9]">
                Section 5 • Manuel d'utilisation
              </span>
              <span className="text-xs text-stone-500 font-medium">Espace Voyageur : {currentUser.name}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Gérer ses réservations & Déposer un avis
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
              Consultez l'historique complet de vos séjours (<strong>À venir</strong>, <strong>En cours</strong>, <strong>Terminés</strong>), 
              débloquez l'adresse exacte et votre code d'accès sécurisé, échangez via la messagerie interne pour coordonner votre arrivée, 
              et déposez votre évaluation éco-tourisme selon les 4 piliers MyStay.
            </p>
          </div>

          <button
            onClick={() => setActiveView('explore')}
            className="self-start md:self-center px-4 py-2.5 rounded-xl bg-[#243E36] hover:bg-[#1B2F29] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Compass className="w-4 h-4 text-[#A3E5C8]" />
            <span>Réserver un autre séjour</span>
          </button>
        </div>

        {/* Profil Voyageur • Ba Tamsir Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF9F5] border border-stone-200">
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover border-2 border-[#243E36] shadow-sm"
              />
              <button
                onClick={openProfileModal}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white"
                title="Modifier ma photo"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-stone-900">{currentUser.name}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Profil Voyageur Vérifié
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">{currentUser.email || 'ba.tamsir@example.fr'} • {currentUser.phone || '+33 6 12 34 56 78'}</p>
              <p className="text-xs text-stone-600 italic mt-1 line-clamp-1">« {currentUser.bio || 'Passionné de randonnée pédestre et de séjours nature dans les terroirs ruraux.'} »</p>
              
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFilterTab('impact')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/90 text-emerald-900 border border-emerald-300 hover:bg-emerald-200 transition cursor-pointer shadow-2xs"
                  title="Voir le bilan carbone et le graphique comparatif"
                >
                  <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{userCo2SavedTotal.toFixed(1)} kg CO₂ évités</span>
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-700" />
                </button>
                <span className="text-[11px] text-stone-500">
                  grâce à vos séjours MyStay
                </span>
              </div>
            </div>
          </div>

          <button
            id="traveler-view-open-profile-btn"
            onClick={openProfileModal}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-stone-300 hover:border-[#243E36] text-[#243E36] text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-700" />
            <span>Modifier la photo & Profil</span>
          </button>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 border-t border-stone-100 no-scrollbar">
          <button
            id="tab-all-trips-btn"
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'all'
                ? 'bg-[#243E36] text-white'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Tous ({myBookings.length})</span>
          </button>

          <button
            id="tab-upcoming-trips-btn"
            onClick={() => setFilterTab('upcoming')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'upcoming'
                ? 'bg-[#243E36] text-white'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>À venir ({upcomingBookings.length})</span>
          </button>

          <button
            id="tab-ongoing-trips-btn"
            onClick={() => setFilterTab('ongoing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'ongoing'
                ? 'bg-[#243E36] text-white'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>En cours ({ongoingBookings.length})</span>
          </button>

          <button
            id="tab-pending-trips-btn"
            onClick={() => setFilterTab('pending')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'pending'
                ? 'bg-[#243E36] text-white'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>En attente ({pendingBookings.length})</span>
          </button>

          <button
            id="tab-past-trips-btn"
            onClick={() => setFilterTab('past')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'past'
                ? 'bg-[#243E36] text-white'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Terminés & Avis ({pastBookings.length})</span>
          </button>

          <button
            id="tab-favorites-trips-btn"
            onClick={() => setFilterTab('favorites')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'favorites'
                ? 'bg-[#243E36] text-white'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Coups de cœur ({favoriteListings.length})</span>
          </button>

          <button
            id="tab-carbon-impact-btn"
            onClick={() => setFilterTab('impact')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'impact'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mon Bilan CO₂ ({userCo2SavedTotal.toFixed(1)} kg)</span>
          </button>
        </div>
      </div>

      {/* Main Content Sections */}
      {filterTab === 'impact' ? (
        <div className="space-y-6">
          <ImpactVisualization initialScope="personal" />
        </div>
      ) : filterTab === 'favorites' ? (
        <div>
          {favoriteListings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
              <Heart className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-serif font-bold text-base text-stone-800">Aucun coup de cœur enregistré</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Parcourez les hébergements ruraux et cliquez sur le cœur pour composer votre carnet d'adresses durables.
              </p>
              <button
                onClick={() => setActiveView('explore')}
                className="px-5 py-2.5 rounded-xl bg-[#243E36] text-white text-xs font-bold hover:bg-[#1B2F29] cursor-pointer"
              >
                Explorer les hébergements
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteListings.map(listing => (
                <div
                  key={listing.id}
                  onClick={() => setSelectedListing(listing)}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs cursor-pointer hover:border-[#243E36] transition"
                >
                  <div className="aspect-16/9 overflow-hidden">
                    <img src={(listing.images && listing.images[0]) || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'} alt={listing.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="font-bold text-sm text-stone-900 truncate">{listing.title}</h4>
                    <p className="text-xs text-stone-500">{listing.commune} ({listing.department})</p>
                    <div className="text-xs font-bold text-[#243E36] pt-1">
                      {listing.pricePerNight} € <span className="font-normal text-stone-400">/ nuit</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {displayedBookings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
              <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-serif font-bold text-base text-stone-800">Aucune réservation dans cet onglet</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Découvrez nos gîtes éco-responsables audités et profitez d'un séjour authentique au cœur des terroirs.
              </p>
              <button
                onClick={() => setActiveView('explore')}
                className="px-5 py-2.5 rounded-xl bg-[#243E36] text-white text-xs font-bold hover:bg-[#1B2F29] cursor-pointer"
              >
                Découvrir les séjours
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displayedBookings.map(booking => {
                const isOngoing = booking.status === 'confirmee' && booking.startDate <= todayStr && booking.endDate >= todayStr;
                const isPast = booking.status === 'terminee' || (booking.status === 'confirmee' && booking.endDate < todayStr);
                const isPending = booking.status === 'en_attente_hote';
                const accessCode = booking.accessCode || `MYSTAY-${booking.id.slice(-4).toUpperCase()}`;

                return (
                  <div
                    key={booking.id}
                    id={`booking-card-${booking.id}`}
                    className={`bg-white rounded-3xl border overflow-hidden shadow-xs flex flex-col justify-between transition-all ${
                      isOngoing 
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      {/* Top Banner & Image */}
                      <div className="relative aspect-16/9 bg-stone-100">
                        <img 
                          src={booking.listingImage} 
                          alt={booking.listingTitle} 
                          className="w-full h-full object-cover" 
                        />
                        
                        {/* Status Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                          {isOngoing && (
                            <span className="bg-emerald-700 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-white" /> Séjour en cours
                            </span>
                          )}
                          {!isOngoing && booking.status === 'confirmee' && !isPast && (
                            <span className="bg-[#243E36] text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#A3E5C8]" /> Séjour à venir confirmé
                            </span>
                          )}
                          {isPending && (
                            <span className="bg-amber-600 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                              <Clock className="w-3.5 h-3.5 text-amber-200" /> Demande en attente (24h)
                            </span>
                          )}
                          {isPast && (
                            <span className="bg-stone-800 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Séjour terminé
                            </span>
                          )}
                        </div>

                        {/* CO2 Positive Impact Pill */}
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-[#A3E5C8] font-bold text-[11px] px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                          <Leaf className="w-3 h-3 text-[#A3E5C8]" />
                          <span>~{booking.co2SavedKg || (booking.nightsCount * 8.4).toFixed(1)} kg CO₂ évités</span>
                        </div>
                      </div>

                      {/* Content Card Body */}
                      <div className="p-6 space-y-4">
                        
                        {/* Listing Title & Dates */}
                        <div>
                          <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">
                            {booking.listingTitle}
                          </h3>
                          <div className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                            <span>Du {new Date(booking.startDate).toLocaleDateString('fr-FR')} au {new Date(booking.endDate).toLocaleDateString('fr-FR')}</span>
                            <span>•</span>
                            <span>{booking.nightsCount} nuit{booking.nightsCount > 1 ? 's' : ''}, {booking.guestsCount} voyageur{booking.guestsCount > 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        {/* Unlocked Address Section (README Section 5) */}
                        <div className="p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                          <div className="font-bold flex items-center justify-between text-emerald-900">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                              Adresse exacte débloquée :
                            </span>
                            <a 
                              href={`https://maps.google.com/?q=${encodeURIComponent(booking.exactAddress || booking.listingCommune)}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[11px] font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                            >
                              <span>Itinéraire GPS</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <p className="font-semibold text-stone-800 pl-5 text-[11px] leading-relaxed">
                            {booking.exactAddress || booking.listingCommune}
                          </p>
                        </div>

                        {/* Unlocked Access Code Section (README Section 5) */}
                        {!isPending && (
                          <div className="p-3.5 bg-[#FAF9F5] rounded-2xl border border-[#E6E4DD] text-xs text-stone-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                                <Key className="w-4 h-4 text-[#8C5E45]" />
                                Code d'accès & Arrivée :
                              </span>
                              <button
                                onClick={() => handleCopyCode(accessCode, booking.id)}
                                className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 text-[11px] font-bold text-stone-700 transition flex items-center gap-1 cursor-pointer"
                                title="Copier le code d'accès"
                              >
                                {copiedCodeId === booking.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700">Copié !</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                                    <span>Copier</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="bg-white px-3 py-1.5 rounded-xl border border-stone-300 font-mono font-bold text-base text-[#243E36] tracking-wider">
                                {accessCode}
                              </div>
                              <span className="text-[11px] text-stone-500">
                                Boîte à clés ou digicode sécurisé (accueil à partir de 16h00)
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Booking Summary Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-2xl border border-stone-100">
                          <div>
                            <span className="text-stone-400 block text-[10px] uppercase font-semibold">Hôte référent</span>
                            <span className="font-semibold text-stone-800">{booking.hostName}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[10px] uppercase font-semibold">Règlement Stripe</span>
                            <span className="font-bold text-[#243E36]">{booking.totalPrice.toFixed(2)} € (CB sécurisée)</span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-4 bg-[#FAF9F5] border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      
                      {/* Left action: cancel option if upcoming */}
                      <div>
                        {booking.status === 'confirmee' && !isPast && !isOngoing && (
                          <button
                            onClick={() => {
                              if (confirm('Confirmez-vous l’annulation de votre séjour ? Le remboursement sera initié via Stripe selon la politique d’annulation.')) {
                                cancelBooking(booking.id);
                              }
                            }}
                            className="text-[11px] text-stone-400 hover:text-rose-600 transition cursor-pointer"
                          >
                            Annuler ma réservation
                          </button>
                        )}
                        {isPast && (
                          <div className="text-[11px] text-stone-500">
                            Séjour certifié MyStay
                          </div>
                        )}
                      </div>

                      {/* Right actions: Chat host & Eco-tourism review */}
                      <div className="flex items-center gap-2">
                        {/* Messagerie interne hôte (README Section 5) */}
                        <button
                          id={`chat-host-btn-${booking.id}`}
                          onClick={() => setActiveChatBookingId(booking.id)}
                          className="px-4 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                          title="Échanger directement avec l'hôte"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#243E36]" />
                          <span>Messagerie hôte</span>
                        </button>

                        {/* Laisser un avis éco-tourisme (README Section 5) */}
                        {isPast && (
                          <div>
                            {booking.hasReview ? (
                              <span className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Avis éco-tourisme publié</span>
                              </span>
                            ) : (
                              <button
                                id={`open-review-btn-${booking.id}`}
                                onClick={() => setActiveReviewBooking(booking)}
                                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                              >
                                <Star className="w-3.5 h-3.5 fill-white" />
                                <span>Déposer un avis éco-tourisme</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Visualisation complète du total cumulé de CO2 évité et comparatif */}
      {filterTab !== 'impact' && (
        <div className="pt-4">
          <ImpactVisualization initialScope="personal" />
        </div>
      )}

    </div>
  );
};
