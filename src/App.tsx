import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { SearchAndFilters } from './components/SearchAndFilters';
import { ListingCard } from './components/ListingCard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { StripeCheckoutModal } from './components/StripeCheckoutModal';
import { HostDashboard } from './components/HostDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { TravelerTripsView } from './components/TravelerTripsView';
import { MessagingModal } from './components/MessagingModal';
import { ReviewModal } from './components/ReviewModal';
import { NoCodeInspectorModal } from './components/NoCodeInspectorModal';
import { PublishedSitesMap } from './components/PublishedSitesMap';
import { calculateDistanceKm } from './utils/geo';
import { LogoMyStayVoyager } from './components/LogoMyStayVoyager';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AirtableSyncModal } from './components/AirtableSyncModal';
import { KumbaBot } from './components/KumbaBot';
import { ImpactVisualization } from './components/ImpactVisualization';
import { 
  Leaf, Trees, HeartHandshake, Shield, Sparkles, 
  MapPin, CheckCircle2, ArrowRight, Compass, 
  X, Check, AlertTriangle, Info, SlidersHorizontal,
  Map, LayoutGrid, Crosshair, Phone, Mail,
  Instagram, Facebook, Linkedin, Youtube,
  CreditCard, Calendar, Key, MessageSquare, Star,
  Lock, LogIn, UserPlus, ShieldAlert, ExternalLink, FileText
} from 'lucide-react';

const AppInner: React.FC = () => {
  const { 
    activeView, setActiveView, filteredListings, 
    selectedListing, setSelectedListing, notification, closeNotification, 
    showNotification, resetFilters, currentUser, checkoutListing, 
    checkoutParams, closeCheckout, isAuthenticated, openAuthModal, 
    switchRole, isAirtableModalOpen, closeAirtableModal, isAdmin 
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'rating' | 'co2' | 'distance_asc'>('featured');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isRgpdModalOpen, setIsRgpdModalOpen] = useState(false);

  // Trigger GPS Geolocation
  const handleGeolocateUser = () => {
    if (!navigator.geolocation) {
      showNotification(
        'Géolocalisation non supportée',
        'Votre navigateur ou terminal ne prend pas en charge la géolocalisation.',
        'warning'
      );
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setUserLocation(coords);
        setIsLocating(false);
        setSortBy('distance_asc');
        showNotification(
          'Position GPS détectée !',
          'Les hébergements ruraux sont désormais classés par proximité géographique.',
          'success'
        );
      },
      (err) => {
        setIsLocating(false);
        // Fallback simulation: Center around Lyon / Massif Central for realistic exploration
        setUserLocation({ lat: 45.764, lng: 4.835 });
        setSortBy('distance_asc');
        showNotification(
          'Position activée',
          'Distance calculée depuis le centre de la France (Rhône-Alpes / Massif Central).',
          'info'
        );
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Sorted listings (including distance calculation if geolocated)
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'distance_asc' && userLocation) {
      const distA = calculateDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = calculateDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    }
    if (sortBy === 'price_asc') return a.pricePerNight - b.pricePerNight;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'co2') return b.impactScoreKgCo2SavedPerNight - a.impactScoreKgCo2SavedPerNight;
    return 0; // featured default
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-stone-900 selection:bg-[#243E36] selection:text-white">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Floating Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-2xl shadow-xl border border-stone-200 p-4 animate-in slide-in-from-bottom-5 duration-200 flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${
            notification.type === 'success' ? 'bg-emerald-100 text-emerald-800' :
            notification.type === 'warning' ? 'bg-amber-100 text-amber-800' :
            notification.type === 'error' ? 'bg-rose-100 text-rose-800' :
            'bg-sky-100 text-sky-800'
          }`}>
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
            {notification.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
            {notification.type === 'error' && <X className="w-4 h-4" />}
            {notification.type === 'info' && <Info className="w-4 h-4" />}
          </div>

          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-xs text-stone-900">{notification.title}</h5>
            <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">{notification.message}</p>
          </div>

          <button
            onClick={closeNotification}
            className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'explore' && (
          <div className="space-y-10 pb-16">
            
            {/* Hero Value Proposition */}
            <section className="relative overflow-hidden bg-[#243E36] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#A3E5C8_1px,transparent_1px)] [background-size:24px_24px]" />
              
              <div className="relative max-w-5xl mx-auto text-center space-y-4">
                <div className="flex justify-center mb-1">
                  <div className="p-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 shadow-md">
                    <LogoMyStayVoyager variant="badge" size="lg" />
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-xs border border-white/10">
                  <Leaf className="w-3.5 h-3.5 text-[#A3E5C8]" />
                  <span>Alternative au tourisme de masse dans les territoires ruraux</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                  Vivez la France rurale avec authenticité et sobriété
                </h1>

                <p className="text-sm sm:text-base text-stone-200 max-w-2xl mx-auto font-light leading-relaxed">
                  Des hébergements d'exception rigoureusement audités : gîtes en pierres, cabanes locales, fermes en permaculture et accueil chaleureux par des hôtes passionnés.
                </p>

                {/* Micro indicators */}
                <div className="flex items-center justify-center gap-6 pt-3 text-xs text-stone-300 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#A3E5C8]" /> 100% Hors zones sur-touristiques
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#A3E5C8]" /> Min. 3 pratiques durables vérifiées
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#A3E5C8]" /> Rémunération équitable des terroirs (88% net)
                  </span>
                </div>
              </div>
            </section>

            {/* Sticky/Floating Search Bar & Labels */}
            <div className="-mt-10 relative z-20">
              <SearchAndFilters />
            </div>

            {/* Interactive User Flow Guide: Réserver & Payer + Gérer ses réservations & Déposer un avis */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Flow 1: Réserver et Payer */}
                <div className="bg-white rounded-3xl p-5 border border-[#E6E4DD] shadow-xs hover:border-[#243E36] transition flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#8C5E45] uppercase tracking-wider bg-[#F7EBE4] px-2.5 py-0.5 rounded-full border border-[#E9D5C9]">
                        Partie 4 du Manuel
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CreditCard className="w-3 h-3 text-emerald-600" /> Stripe Connect
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                      <span>1. Réserver et Payer</span>
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Sélectionnez vos dates dans le volet du gîte, cliquez sur <strong>« Réserver maintenant »</strong> et découvrez la décomposition transparente (nuitées, ménage écologique, taxe communale et <strong>calcul de l'empreinte carbone évitée</strong>).
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400">
                      Choix direct ci-dessous
                    </span>
                    <button
                      onClick={() => {
                        const firstListing = sortedListings[0];
                        if (firstListing) {
                          setSelectedListing(firstListing);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#243E36] hover:bg-[#1B2F29] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Tester une réservation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Flow 2: Gérer ses réservations & Déposer un avis */}
                <div className="bg-white rounded-3xl p-5 border border-[#E6E4DD] shadow-xs hover:border-[#243E36] transition flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#8C5E45] uppercase tracking-wider bg-[#F7EBE4] px-2.5 py-0.5 rounded-full border border-[#E9D5C9]">
                        Partie 5 du Manuel
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#243E36] bg-[#EAE8DF] px-2 py-0.5 rounded-full border border-[#D5D2C5]">
                        <Key className="w-3 h-3 text-[#8C5E45]" /> Code d'accès & Avis
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                      <span>2. Gérer & Déposer un avis</span>
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Retrouvez l'historique complet (<strong>À venir</strong>, <strong>En cours</strong>, <strong>Terminés</strong>), consultez l'adresse exacte et votre <strong>code d'accès</strong>, échangez avec l'hôte via la <strong>messagerie interne</strong> et évaluez votre séjour.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400">
                      Menu « Mes Voyages »
                    </span>
                    <button
                      id="open-trips-flow-btn"
                      onClick={() => setActiveView('my_trips')}
                      className="px-3.5 py-1.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE8DF] border border-stone-300 text-stone-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#243E36]" />
                      <span>Accéder à Mes Voyages</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Marketplace Grid Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              
              {/* Header with Results Count, View Mode Switcher & Sort */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    Hébergements ruraux disponibles
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {sortedListings.length} {sortedListings.length > 1 ? 'lieux audités' : 'lieu audité'} selon vos critères éco-responsables
                    {userLocation && (
                      <span className="ml-2 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        📍 Géolocalisation active
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* View Mode Switcher: Grille vs Carte */}
                  <div className="flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200 shadow-inner">
                    <button
                      id="toggle-view-grid-btn"
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        viewMode === 'grid'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Grille</span>
                    </button>

                    <button
                      id="toggle-view-map-btn"
                      onClick={() => setViewMode('map')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        viewMode === 'map'
                          ? 'bg-[#243E36] text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      <Map className="w-3.5 h-3.5 text-[#A3E5C8]" />
                      <span>Carte interactive ({sortedListings.length})</span>
                    </button>
                  </div>

                  {/* Geolocation trigger button */}
                  <button
                    id="geo-find-nearby-btn"
                    onClick={handleGeolocateUser}
                    disabled={isLocating}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                      userLocation
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-[#243E36] hover:bg-stone-50'
                    }`}
                    title="Calculer la distance depuis ma position GPS"
                  >
                    <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-emerald-700' : 'text-[#243E36]'}`} />
                    <span>{isLocating ? 'Détection...' : userLocation ? 'Position active' : 'Autour de moi'}</span>
                  </button>

                  {/* Sort selector */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-stone-500 font-medium hidden sm:inline">Trier :</span>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as any)}
                      className="p-2 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800 outline-none focus:border-[#243E36] cursor-pointer"
                    >
                      <option value="featured">Recommandés MyStay</option>
                      {userLocation && (
                        <option value="distance_asc">📍 Proximité (les plus proches)</option>
                      )}
                      <option value="price_asc">Prix par nuit croissant</option>
                      <option value="rating">Meilleures notes voyageurs</option>
                      <option value="co2">Impact carbone le plus vertueux</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* View Rendering: Grid vs Interactive Map */}
              {viewMode === 'map' ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <PublishedSitesMap
                    listings={sortedListings}
                    userLocation={userLocation}
                    onGeolocateUser={handleGeolocateUser}
                    isLocating={isLocating}
                  />
                </div>
              ) : (
                /* Grid of Listings */
                sortedListings.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-4 max-w-lg mx-auto">
                    <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
                      <Compass className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-stone-800">
                      Aucun hébergement ne correspond à vos filtres actuels
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Essayez de réinitialiser la région sélectionnée ou les labels pour découvrir d'autres pépites rurales.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="px-5 py-2.5 bg-[#243E36] hover:bg-[#1B2F29] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Réinitialiser tous les filtres
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedListings.map(listing => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        distanceKm={userLocation ? calculateDistanceKm(userLocation.lat, userLocation.lng, listing.lat, listing.lng) : undefined}
                        onViewOnMap={() => setViewMode('map')}
                      />
                    ))}
                  </div>
                )
              )}

            </div>

            {/* Total CO2 Évité & Graphique Comparatif Écologique (ADEME) */}
            <section id="carbon-impact-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
              <ImpactVisualization initialScope="community" />
            </section>

            {/* Rural Tourism Charter / Manifesto */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
              <div className="bg-[#FAF9F5] rounded-3xl p-8 sm:p-12 border border-[#E6E4DD] space-y-8">
                <div className="max-w-3xl space-y-2">
                  <div className="text-xs font-bold text-[#8C5E45] uppercase tracking-wider">
                    Notre Engagement Charte v1.1
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                    Pourquoi MyStay est différent des plateformes généralistes
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Chaque séjour réservé sur MyStay injecte 88% de sa valeur directement dans l'économie rurale locale et préserve les écosystèmes français.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-5 bg-white rounded-2xl border border-stone-200 space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Leaf className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-stone-900">Sobriété & Écologie</h4>
                    <p className="text-xs text-stone-500 leading-snug">
                      Minimum 3 pratiques durables certifiées par logement : compostage, énergies vertes, zéro plastique et gestion de l'eau.
                    </p>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-stone-200 space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Trees className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-stone-900">Patrimoine Rural Vivant</h4>
                    <p className="text-xs text-stone-500 leading-snug">
                      Bâtisses en pierres de pays, éco-cabanes locales, bergerie restaurée : valorisation du savoir-faire architectural français.
                    </p>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-stone-200 space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-stone-900">Accueil & Lien Humain</h4>
                    <p className="text-xs text-stone-500 leading-snug">
                      Rencontres authentiques avec les hôtes, paniers fermiers du terroir et conseils hors des sentiers battus.
                    </p>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-stone-200 space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-stone-900">Transparence Totale</h4>
                    <p className="text-xs text-stone-500 leading-snug">
                      Paiement sécurisé Stripe Connect sans frais cachés, avis certifiés post-séjour sous 14 jours et modération humaine stricte.
                    </p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* View 2: Traveler Trips */}
        {activeView === 'my_trips' && (
          !isAuthenticated ? (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
              <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">Espace Voyageur Sécurisé</div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">Connexion requise pour accéder à vos séjours</h2>
                  <p className="text-xs text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
                    Identifiez-vous pour consulter vos réservations en cours, échanger avec vos hôtes et déposer vos retours d'expérience vérifiés.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Se connecter avec un compte voyageur</span>
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="w-full sm:w-auto px-6 py-3 border border-emerald-700 text-emerald-800 hover:bg-emerald-50 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Créer un compte</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <TravelerTripsView />
          )
        )}

        {/* View 3: Host Space */}
        {activeView === 'host_space' && (
          !isAuthenticated ? (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
              <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">Espace Hôte Rural</div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">Authentification Hôte requise</h2>
                  <p className="text-xs text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
                    Connectez-vous pour gérer vos annonces de gîtes ruraux, bloquer des dates au calendrier et suivre vos versements Stripe Connect.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Se connecter à l'espace Hôte</span>
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="w-full sm:w-auto px-6 py-3 border border-emerald-700 text-emerald-800 hover:bg-emerald-50 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Devenir Hôte rural</span>
                  </button>
                </div>
              </div>
            </div>
          ) : currentUser.role === 'voyageur' ? (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
              <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-8 h-8 text-stone-700" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Espace réservé aux hôtes</h2>
                <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">Votre compte est un compte voyageur. Pour proposer un hébergement, créez un compte hôte.</p>
                <button
                  onClick={() => setActiveView('explore')}
                  className="px-6 py-3 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Retour à l'accueil
                </button>
              </div>
            </div>
          ) : (
            <HostDashboard />
          )
        )}

        {/* View 4: Admin Space */}
        {activeView === 'admin_space' && (
          !isAuthenticated ? (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
              <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-8 h-8 text-stone-700" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Console CMS & Back-Office</div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">Accès Administrateur Restreint</h2>
                  <p className="text-xs text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
                    Cet espace est réservé à l'équipe de modération et aux administrateurs MyStay pour la gestion du CMS, des labels et des utilisateurs.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full sm:w-auto px-6 py-3 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Connexion Administrateur</span>
                  </button>
                </div>
              </div>
            </div>
          ) : !isAdmin ? (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
              <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-8 h-8 text-stone-700" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Accès refusé</h2>
                <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">Cet espace est réservé aux administrateurs MyStay.</p>
                <button
                  onClick={() => setActiveView('explore')}
                  className="px-6 py-3 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Retour à l'accueil
                </button>
              </div>
            </div>
          ) : (
            <AdminDashboard />
          )
        )}

        {/* View 5: No-Code Inspector */}
        {isAdmin && (activeView === 'no_code_stack' || activeView === 'nocode_inspector') && <NoCodeInspectorModal />}
      </main>

      {/* Global Modals */}
      <AuthModal />
      {selectedListing && <ListingDetailModal />}
      {checkoutListing && checkoutParams && (
        <StripeCheckoutModal
          listing={checkoutListing}
          params={checkoutParams}
          onClose={closeCheckout}
        />
      )}
      <MessagingModal />
      <ReviewModal />
      <UserProfileModal />
      {isAdmin && <AirtableSyncModal isOpen={isAirtableModalOpen} onClose={closeAirtableModal} />}
      <KumbaBot />

      {/* RGPD European Compliance & Data Protection Modal */}
      {isRgpdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#243E36] to-[#1e342d] text-white p-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-[#A3E5C8]/40 flex items-center justify-center text-[#A3E5C8]">
                  <Shield className="w-6 h-6 text-[#A3E5C8]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-serif font-bold">Protection des Données Personnelles</h3>
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
                      RGPD UE 2016/679
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100/80 mt-0.5">
                    Engagement de transparence, souveraineté et respect strict de votre vie privée
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRgpdModalOpen(false)}
                className="text-stone-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-stone-700 leading-relaxed">
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-emerald-950">
                    Vos données sont protégées selon la loi européenne sur le RGPD
                  </p>
                  <p className="text-xs text-emerald-900 mt-1">
                    Conformément au Règlement Général sur la Protection des Données (Règlement UE 2016/679) et à la loi Informatique et Libertés, la plateforme MyStay garantit l'intégrité, la confidentialité et la sécurité de toutes vos données personnelles.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#243E36]" />
                  1. Données collectées & Finalités
                </h4>
                <p>
                  Nous ne collectons que les informations strictement nécessaires au bon déroulement de vos réservations éco-responsables et à la mise en relation avec les hôtes ruraux :
                </p>
                <ul className="list-disc pl-5 space-y-1 text-stone-600">
                  <li><strong>Profil voyageur & hôte</strong> : nom, prénom, email, téléphone, biographie et <strong>photo de profil</strong> (téléversée avec votre consentement explicite lors de l'inscription ou modifiée ultérieurement).</li>
                  <li><strong>Annonces de gîtes</strong> : photos du domaine, <strong>liens ou vidéos de présentation</strong>, adresses et caractéristiques durables.</li>
                  <li><strong>Sécurisation des paiements</strong> : aucune donnée de carte bancaire n'est stockée sur nos serveurs. Les transactions sont opérées par Stripe sous conformité PCI-DSS de niveau 1.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#243E36]" />
                  2. Souveraineté européenne & Zéro revente
                </h4>
                <p>
                  • <strong>Hébergement 100% Union Européenne</strong> : L'ensemble de notre infrastructure technique et de stockage réside dans des centres de données sécurisés situés au sein de l'UE.<br />
                  • <strong>Aucune cession commerciale</strong> : Vos données ne font l'objet d'aucune vente, location ou transfert vers des régies publicitaires ou des tiers non autorisés.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-[#243E36]" />
                  3. Vos droits fondamentaux & Contact DPO
                </h4>
                <p>
                  Vous disposez à tout moment des droits suivants sur vos données personnelles :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-stone-100 rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-900">Droit d'accès & de rectification</span>
                    <p className="text-stone-600 mt-0.5">Consultez et modifiez votre profil ou photo à tout instant.</p>
                  </div>
                  <div className="p-2.5 bg-stone-100 rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-900">Droit à l'oubli / Suppression</span>
                    <p className="text-stone-600 mt-0.5">Demandez l'effacement définitif de votre compte et médias.</p>
                  </div>
                  <div className="p-2.5 bg-stone-100 rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-900">Portabilité des données</span>
                    <p className="text-stone-600 mt-0.5">Exportez l'intégralité de vos réservations au format standard.</p>
                  </div>
                  <div className="p-2.5 bg-stone-100 rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-900">Délégué DPO dédié</span>
                    <p className="text-stone-600 mt-0.5">Contact direct : <strong>dpo@mystay-rural.fr</strong> (délai &lt; 30j).</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <span className="text-[11px] text-stone-500">
                Dernière mise à jour conforme RGPD : Mars 2026
              </span>
              <button
                type="button"
                onClick={() => setIsRgpdModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#243E36] hover:bg-[#1a2e28] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs border-t border-stone-800 pt-12 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Col 1: Brand & Presentation */}
            <div className="space-y-3">
              <LogoMyStayVoyager variant="footer" size="md" />
              <p className="text-stone-400 text-xs leading-relaxed pt-1">
                Plateforme éco-responsable dédiée aux séjours ruraux authentiques, favorisant la préservation du patrimoine naturel et l'économie locale.
              </p>
              <div className="text-[11px] text-[#A3E5C8] font-medium pt-1">
                ✓ Hébergements audités & labellisés
              </div>
            </div>

            {/* Col 2: Navigation rapide */}
            <div className="space-y-3">
              <h4 className="text-white font-serif font-bold text-sm tracking-wide">
                Navigation
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => setActiveView('explore')} className="hover:text-white transition cursor-pointer">
                    Explorer les séjours
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveView('my_trips')} className="hover:text-white transition cursor-pointer">
                    Mes Réservations & Voyages
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveView('host_space')} className="hover:text-white transition cursor-pointer">
                    Espace Hôte rural (Déposer un gîte)
                  </button>
                </li>
                {isAdmin && (
                <li>
                  <button onClick={() => setActiveView('admin_space')} className="hover:text-white transition cursor-pointer">
                    Back-Office Admin & Labellisation
                  </button>
                </li>
                )}
              </ul>
            </div>

            {/* Col 3: Coordonnées & Contact */}
            <div className="space-y-3">
              <h4 className="text-white font-serif font-bold text-sm tracking-wide">
                Contact & Siège
              </h4>
              <div className="space-y-2.5 text-xs text-stone-300">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#A3E5C8] shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    14 Chemin des Faysses<br />
                    48400 Florac-Trois-Rivières<br />
                    <span className="text-stone-500 text-[11px]">Parc National des Cévennes, France</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#A3E5C8] shrink-0" />
                  <a href="tel:+33466450120" className="hover:text-white transition">
                    +33 (0)4 66 45 01 20
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#A3E5C8] shrink-0" />
                  <a href="mailto:contact@mystay-rural.fr" className="hover:text-white transition">
                    contact@mystay-rural.fr
                  </a>
                </div>
              </div>
            </div>

            {/* Col 4: Tous les réseaux sociaux */}
            <div className="space-y-3">
              <h4 className="text-white font-serif font-bold text-sm tracking-wide">
                Réseaux Sociaux
              </h4>
              <p className="text-xs text-stone-400">
                Suivez nos actualités, nos hôtes passionnés et les initiatives de nos terroirs :
              </p>
              
              <div className="flex items-center gap-2.5 flex-wrap pt-1">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram MyStay"
                  className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-[#243E36] text-stone-300 hover:text-white flex items-center justify-center transition border border-stone-700 hover:border-[#A3E5C8] cursor-pointer"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>

                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook MyStay"
                  className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-[#243E36] text-stone-300 hover:text-white flex items-center justify-center transition border border-stone-700 hover:border-[#A3E5C8] cursor-pointer"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn MyStay"
                  className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-[#243E36] text-stone-300 hover:text-white flex items-center justify-center transition border border-stone-700 hover:border-[#A3E5C8] cursor-pointer"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>

                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X MyStay"
                  className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-[#243E36] text-stone-300 hover:text-white flex items-center justify-center transition border border-stone-700 hover:border-[#A3E5C8] cursor-pointer"
                  title="X"
                >
                  <span className="text-[14px] font-bold leading-none select-none tracking-tight">𝕏</span>
                </a>

                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube MyStay"
                  className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-[#243E36] text-stone-300 hover:text-white flex items-center justify-center transition border border-stone-700 hover:border-[#A3E5C8] cursor-pointer"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>

              <div className="text-[11px] text-stone-500 pt-1">
                Rejoignez la communauté du tourisme rural durable.
              </div>
            </div>

          </div>

          {/* RGPD European Personal Data Protection Banner in Footer */}
          <div className="p-5 rounded-2xl bg-stone-800/90 border border-stone-700/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                  <Shield className="w-5 h-5 text-[#A3E5C8]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-white font-semibold text-xs">
                      Protection des Données Personnelles
                    </h4>
                    <span className="text-[10px] font-bold text-[#A3E5C8] bg-emerald-900/70 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                      🇪🇺 Loi Européenne RGPD (Règlement UE 2016/679)
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                    Vos données personnelles, coordonnées, photos de profil et vidéos d'annonces sont protégées selon la loi européenne sur le RGPD. Hébergement souverain au sein de l'UE, confidentialité garantie et zéro revente commerciale.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRgpdModalOpen(true)}
                className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-700 hover:bg-[#243E36] text-stone-200 hover:text-white text-xs font-semibold transition cursor-pointer border border-stone-600 hover:border-emerald-500/50"
              >
                <span>Garanties RGPD & Droits</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2.5 border-t border-stone-700/60 text-[11px] text-stone-400">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Serveurs souverains sécurisés basés en Union Européenne</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Zéro cession ni monétisation publicitaire de vos informations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Droit d'accès, rectification et suppression garanti (DPO)</span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
            <p>
              © 2026 MyStay • Tourisme rural et durable en France. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4 text-stone-400">
              <span className="hover:text-white cursor-pointer">Mentions Légales</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">Charte Éco-responsable</span>
              <span>•</span>
              <button 
                type="button"
                onClick={() => setIsRgpdModalOpen(true)}
                className="hover:text-[#A3E5C8] transition cursor-pointer font-medium"
              >
                Politique de Confidentialité & RGPD
              </button>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
