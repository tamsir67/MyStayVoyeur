import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Listing, Booking, SustainablePractice 
} from '../types';
import { SUSTAINABLE_PRACTICES_CATALOG } from '../mockData';
import { RURAL_REGIONS, getCommunesForRegion, findRuralCommune } from '../data/ruralLocations';
import { 
  Plus, Home, Calendar, DollarSign, Clock, CheckCircle2, 
  AlertCircle, MessageSquare, ShieldCheck, X, Check, 
  Trash2, Eye, ArrowRight, Sparkles, Leaf, MapPin, Video, Play, Film,
  Upload, Image as ImageIcon, Lock, MessageSquarePlus, Edit3, FileText, Send, Star, Camera,
  RefreshCw
} from 'lucide-react';
import { compressImageFile } from '../utils/imageCompressor';

// Photos terroirs de sites ruraux suggérées
const RURAL_STOCK_SUGGESTIONS = [
  { label: 'Mas cévenol & cour en pierres', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Moulin à eau & sous-bois ombragé', url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Éco-cabane sous les chênes', url: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Bergerie & vue panoramique', url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Ferme maraîchère & verger bio', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Chambre paysanne & poêle à bois', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80' }
];

export const HostDashboard: React.FC = () => {
  const { 
    currentUser, listings, bookings, addListing, updateListing,
    requestListingModification,
    acceptBooking, declineBooking, toggleBlockedDate, 
    setActiveChatBookingId, showNotification, unreadMessagesCount 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'listings' | 'bookings' | 'calendar' | 'revenues'>('listings');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [isSubmittingListing, setIsSubmittingListing] = useState(false);

  // Modal de demande de modification pour annonce publiée
  const [isModificationRequestModalOpen, setIsModificationRequestModalOpen] = useState(false);
  const [targetListingForRequest, setTargetListingForRequest] = useState<Listing | null>(null);
  const [requestDetails, setRequestDetails] = useState('');
  const [requestMediaUrl, setRequestMediaUrl] = useState('');

  const [selectedListingForCalendar, setSelectedListingForCalendar] = useState<string>(
    listings.find(l => l.hostId === currentUser.id)?.id || listings[0]?.id || ''
  );

  // Filter listings and bookings for current host
  const hostListings = listings.filter(l => l.hostId === currentUser.id);
  const hostBookings = bookings.filter(b => b.hostId === currentUser.id);

  // Financial calculations
  const totalGrossEarnings = hostBookings
    .filter(b => b.status === 'confirmee' || b.status === 'terminee')
    .reduce((sum, b) => sum + (b.nightlyTotal + b.cleaningFee), 0);

  const totalMyStayCommission = hostBookings
    .filter(b => b.status === 'confirmee' || b.status === 'terminee')
    .reduce((sum, b) => sum + b.serviceFee, 0);

  const totalNetEstimated = hostBookings
    .filter(b => b.status === 'confirmee' || b.status === 'terminee')
    .reduce((sum, b) => sum + b.hostNetEarnings, 0);

  // New Listing Wizard Form State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState<Listing['propertyType']>('gite');
  const [capacity, setCapacity] = useState(4);
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [region, setRegion] = useState('Occitanie');
  const [department, setDepartment] = useState('Lozère (48)');
  const [commune, setCommune] = useState('Saint-Germain-de-Calberte');
  const [isCustomCommune, setIsCustomCommune] = useState(false);
  const [customCommuneInput, setCustomCommuneInput] = useState('');
  const [customDepartmentInput, setCustomDepartmentInput] = useState('');
  const [approxLocation, setApproxLocation] = useState('Vallon préservé des Cévennes, au cœur du terroir');
  const [exactAddress, setExactAddress] = useState('');
  const [pricePerNight, setPricePerNight] = useState(90);
  const [cleaningFee, setCleaningFee] = useState(30);
  const [minNights, setMinNights] = useState(2);
  const [bookingMode, setBookingMode] = useState<'instant' | 'on_demand'>('instant');
  const [selectedPractices, setSelectedPractices] = useState<string[]>([
    'Tri sélectif & compostage autonome',
    'Panier terroir & potager en permaculture',
    'Énergie 100% renouvelable & chauffe-eau solaire'
  ]);
  const [amenitiesInput, setAmenitiesInput] = useState('Poêle à bois, Jardin bio, Terrasse ombragée, Cuisine équipée');
  const [houseRulesInput, setHouseRulesInput] = useState('Non fumeur, Respect du calme de la nature, Tri rigoureux des déchets');
  const [localTips, setLocalTips] = useState('');
  
  // Galerie de photos multiples et vidéo
  const [imagesList, setImagesList] = useState<string[]>([
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [newPhotoUrlInput, setNewPhotoUrlInput] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Communes filtered by currently selected region
  const availableCommunes = getCommunesForRegion(region);
  const selectedCommuneInfo = findRuralCommune(region, commune);

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    const communes = getCommunesForRegion(newRegion);
    if (communes.length > 0) {
      const match = communes.find(c => c.name.toLowerCase() === commune.toLowerCase());
      if (match) {
        setCommune(match.name);
        setDepartment(match.department);
      } else {
        const first = communes[0];
        setCommune(first.name);
        setDepartment(first.department);
        setIsCustomCommune(false);
        setCustomCommuneInput('');
        setCustomDepartmentInput('');
        setApproxLocation(`À proximité de ${first.name}, ${first.terroirNote || first.department}`);
      }
    } else {
      setCommune('');
      setIsCustomCommune(false);
    }
  };

  const handleCommuneChange = (val: string) => {
    if (val === '__custom__') {
      setIsCustomCommune(true);
      setCommune(customCommuneInput || '');
      if (customDepartmentInput) setDepartment(customDepartmentInput);
    } else {
      setIsCustomCommune(false);
      setCommune(val);
      const found = findRuralCommune(region, val);
      if (found) {
        setDepartment(found.department);
        setApproxLocation(`À proximité de ${found.name}, ${found.terroirNote || found.department}`);
      }
    }
  };

  const togglePractice = (label: string) => {
    setSelectedPractices(prev => 
      prev.includes(label) ? prev.filter(p => p !== label) : [...prev, label]
    );
  };

  // Gestion des photos multiples
  const handleAddPhotoUrl = () => {
    const trimmed = newPhotoUrlInput.trim();
    if (!trimmed) return;
    if (!imagesList.includes(trimmed)) {
      setImagesList(prev => [...prev, trimmed]);
    }
    setNewPhotoUrlInput('');
  };

  const handleRemovePhoto = (index: number) => {
    if (imagesList.length <= 1) {
      showNotification('Au moins une photo', 'Votre annonce doit comporter au minimum une photo du lieu.', 'warning');
      return;
    }
    setImagesList(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSetPrimaryPhoto = (index: number) => {
    setImagesList(prev => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  // Ouvre le wizard pour créer une nouvelle annonce
  const openCreateListingModal = () => {
    setEditingListingId(null);
    setTitle('');
    setDescription('');
    setPropertyType('gite');
    setCapacity(4);
    setBedrooms(2);
    setBathrooms(1);
    setRegion('Occitanie');
    setDepartment('Lozère (48)');
    setCommune('Saint-Germain-de-Calberte');
    setIsCustomCommune(false);
    setApproxLocation('Vallon préservé des Cévennes, au cœur du terroir');
    setExactAddress('');
    setPricePerNight(90);
    setCleaningFee(30);
    setMinNights(2);
    setBookingMode('instant');
    setSelectedPractices([
      'Tri sélectif & compostage autonome',
      'Panier terroir & potager en permaculture',
      'Énergie 100% renouvelable & chauffe-eau solaire'
    ]);
    setAmenitiesInput('Poêle à bois, Jardin bio, Terrasse ombragée, Cuisine équipée');
    setHouseRulesInput('Non fumeur, Respect du calme de la nature, Tri rigoureux des déchets');
    setLocalTips('');
    setImagesList(['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80']);
    setVideoUrl('');
    setStep(1);
    setIsCreateModalOpen(true);
  };

  // Ouvre le wizard pour MODIFIER une annonce avant publication
  const openEditListingModal = (listing: Listing) => {
    if (listing.status === 'publiee') {
      showNotification(
        'Annonce publiée verrouillée',
        'Cette annonce est certifiée et en ligne. Conformément au règlement MyStay, seul l\'administrateur peut la modifier.',
        'warning'
      );
      return;
    }
    setEditingListingId(listing.id);
    setTitle(listing.title);
    setDescription(listing.description);
    setPropertyType(listing.propertyType);
    setCapacity(listing.capacity);
    setBedrooms(listing.bedrooms);
    setBathrooms(listing.bathrooms);
    setRegion(listing.region);
    setDepartment(listing.department);
    setCommune(listing.commune);
    setIsCustomCommune(false);
    setApproxLocation(listing.approxLocation || '');
    setExactAddress(listing.exactAddress || '');
    setPricePerNight(listing.pricePerNight);
    setCleaningFee(listing.cleaningFee);
    setMinNights(listing.minNights);
    setBookingMode(listing.bookingMode);
    setSelectedPractices(listing.sustainablePractices || []);
    setAmenitiesInput((listing.amenities || []).join(', '));
    setHouseRulesInput((listing.houseRules || []).join(', '));
    setLocalTips(listing.localTips || '');
    setImagesList(listing.images && listing.images.length > 0 ? listing.images : ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80']);
    setVideoUrl(listing.videoUrl || (listing.videos && listing.videos[0]) || '');
    setStep(1);
    setIsCreateModalOpen(true);
  };

  // Soumission (Création ou Mise à jour avant publication)
  const handleSaveListing = (desiredStatus: 'brouillon' | 'en_attente') => {
    if (selectedPractices.length < 3) {
      showNotification(
        'Charte de durabilité',
        'Le cahier des charges MyStay impose au moins 3 pratiques durables vérifiées.',
        'warning'
      );
      return;
    }
    if (!title.trim() || !commune.trim()) {
      showNotification('Champs obligatoires', 'Veuillez renseigner le titre et la commune rurale.', 'warning');
      return;
    }
    if (imagesList.length === 0) {
      showNotification('Photo requise', 'Veuillez ajouter au moins une photo du site.', 'warning');
      return;
    }

    setIsSubmittingListing(true);
    try {
      const selectedRuralCommune = findRuralCommune(region, commune);
      const finalLat = selectedRuralCommune 
        ? selectedRuralCommune.lat + (Math.random() - 0.5) * 0.006
        : (region === 'Occitanie' ? 44.218 + (Math.random() - 0.5) * 0.05 : 46.5);
      const finalLng = selectedRuralCommune 
        ? selectedRuralCommune.lng + (Math.random() - 0.5) * 0.006
        : (region === 'Occitanie' ? 3.809 + (Math.random() - 0.5) * 0.05 : 2.5);

      const payload = {
        title,
        description: description || 'Hébergement rural respectueux du patrimoine naturel et humain.',
        propertyType,
        capacity,
        bedrooms,
        bathrooms,
        pricePerNight,
        cleaningFee,
        minNights,
        maxNights: 21,
        bookingMode,
        cancellationPolicy: 'moderee' as const,
        region,
        department,
        commune,
        approxLocation: approxLocation || `À proximité de ${commune}, pleine nature`,
        exactAddress: exactAddress || `Chemin communal, ${commune}`,
        lat: finalLat,
        lng: finalLng,
        images: imagesList.length > 0 ? imagesList : ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'],
        siteImageUrl: imagesList[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        videoUrl: videoUrl.trim() || undefined,
        videos: videoUrl.trim() ? [videoUrl.trim()] : [],
        amenities: amenitiesInput.split(',').map(s => s.trim()).filter(Boolean),
        houseRules: houseRulesInput.split(',').map(s => s.trim()).filter(Boolean),
        localTips: localTips || 'Balades au coucher du soleil et dégustation des produits de la ferme voisine.',
        sustainablePractices: selectedPractices,
        labels: ['eco_responsable' as const],
        status: desiredStatus,
        impactScoreKgCo2SavedPerNight: 8.5
      };

      if (editingListingId) {
        // Modification d'une annonce existante non publiée
        updateListing(editingListingId, payload);
        showNotification(
          'Annonce modifiée',
          desiredStatus === 'en_attente' 
            ? 'Votre annonce a été mise à jour et soumise à la modération MyStay.' 
            : 'Vos modifications ont été enregistrées dans votre brouillon.',
          'success'
        );
      } else {
        // Nouvelle annonce
        addListing(payload);
        showNotification(
          desiredStatus === 'en_attente' ? 'Annonce transmise' : 'Brouillon enregistré',
          desiredStatus === 'en_attente'
            ? 'Votre annonce a été soumise pour examen par l\'équipe MyStay.'
            : 'Votre brouillon est sauvegardé. Vous pourrez le modifier avant de le publier.',
          'success'
        );
      }

      setIsCreateModalOpen(false);
      setEditingListingId(null);
      setStep(1);
    } catch (err: any) {
      console.error('Erreur soumission annonce:', err);
      showNotification('Erreur de soumission', err?.message || 'Une anomalie est survenue lors de l\'enregistrement.', 'error');
    } finally {
      setIsSubmittingListing(false);
    }
  };

  // Quick Calendar helper for current month days
  const currentCalendarListing = listings.find(l => l.id === selectedListingForCalendar) || hostListings[0];
  const calendarDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(2026, 9, i + 1); // Oct 2026
    const dateStr = d.toISOString().split('T')[0];
    const isBlocked = Boolean(currentCalendarListing?.blockedDates && Array.isArray(currentCalendarListing.blockedDates) && currentCalendarListing.blockedDates.includes(dateStr));
    return { dayNumber: i + 1, dateStr, isBlocked };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Profile Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E4DD] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#243E36] shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-stone-900">
                Espace Hôte : {currentUser.name}
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> Profil vérifié
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1 max-w-xl">
              Gérez vos hébergements ruraux, suivez vos réservations, mettez à jour votre calendrier et consultez vos revenus transparents.
            </p>
          </div>
        </div>

        <button
          id="host-create-listing-btn"
          onClick={openCreateListingModal}
          className="px-5 py-3 rounded-2xl bg-[#243E36] hover:bg-[#1B2F29] text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Déposer une annonce (&lt; 15 min)</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          id="host-tab-listings"
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'listings'
              ? 'bg-[#243E36] text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Mes Annonces ({hostListings.length})</span>
        </button>

        <button
          id="host-tab-bookings"
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'bg-[#243E36] text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Réservations reçues ({hostBookings.length})</span>
        </button>

        <button
          id="host-tab-calendar"
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'calendar'
              ? 'bg-[#243E36] text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Disponibilités & Calendrier</span>
        </button>

        <button
          id="host-tab-revenues"
          onClick={() => setActiveTab('revenues')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'revenues'
              ? 'bg-[#243E36] text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Suivi financier & Stripe</span>
        </button>

        <button
          id="host-tab-chat"
          onClick={() => {
            if (hostBookings.length > 0) {
              setActiveChatBookingId(hostBookings[0].id);
            } else if (bookings.length > 0) {
              setActiveChatBookingId(bookings[0].id);
            } else {
              showNotification('Messagerie', 'Aucune réservation reçue pour le moment.', 'info');
            }
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 ml-auto"
          title="Ouvrir la messagerie instantanée"
        >
          <MessageSquare className="w-4 h-4 text-[#243E36]" />
          <span>Messagerie en direct</span>
          {unreadMessagesCount > 0 && (
            <span className="w-4 h-4 bg-emerald-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
              {unreadMessagesCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostListings.map(listing => {
              const hasVideo = Boolean(listing.videoUrl || (listing.videos && listing.videos.length > 0));
              const isPublished = listing.status === 'publiee';
              const hasPendingModif = Boolean(listing.modificationRequest && listing.modificationRequest.status === 'pending');

              return (
                <div 
                  key={listing.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between transition hover:shadow-md"
                >
                  <div>
                    <div className="relative aspect-16/9 bg-stone-100">
                      <img 
                        src={(listing.images && listing.images[0]) || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'} 
                        alt={listing.title} 
                        className="w-full h-full object-cover" 
                      />
                      
                      {/* Statut & Verrouillage badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                        {isPublished ? (
                          <>
                            <span className="bg-emerald-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                              <CheckCircle2 className="w-3 h-3 text-[#A3E5C8]" /> Publiée en ligne
                            </span>
                            <span className="bg-stone-900/85 backdrop-blur-xs text-amber-200 border border-amber-400/30 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                              <Lock className="w-2.5 h-2.5" /> Seul l'admin peut modifier
                            </span>
                          </>
                        ) : listing.status === 'brouillon' ? (
                          <span className="bg-stone-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <FileText className="w-3 h-3 text-stone-300" /> Brouillon (Modifiable)
                          </span>
                        ) : listing.status === 'en_attente' ? (
                          <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <Clock className="w-3 h-3" /> En attente validation (Modifiable)
                          </span>
                        ) : (
                          <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <AlertCircle className="w-3 h-3" /> À modifier (Modifiable)
                          </span>
                        )}
                      </div>

                      {/* Badges Médias en bas de l'image */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <span className="text-[10px] font-semibold bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ImageIcon className="w-2.5 h-2.5" /> {listing.images?.length || 1} photo(s)
                        </span>

                        {hasVideo && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-900/90 text-amber-200 border border-amber-400/40 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
                            <Play className="w-2.5 h-2.5 fill-amber-300" /> Vidéo incluse
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-2.5">
                      <h3 className="font-serif font-bold text-sm text-stone-900 line-clamp-1">
                        {listing.title}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-1">
                        {listing.commune} ({listing.department})
                      </p>

                      <div className="text-xs text-[#243E36] font-bold">
                        {listing.pricePerNight} € <span className="text-stone-400 font-normal">/ nuit</span>
                        <span className="text-stone-400 font-normal ml-2">• Ménage {listing.cleaningFee} €</span>
                      </div>

                      {/* Alerte si une demande de modification est en cours sur l'annonce publiée */}
                      {hasPendingModif && (
                        <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 space-y-1">
                          <div className="font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-700 animate-spin" />
                            <span>Demande de modification en cours d'examen par l'admin :</span>
                          </div>
                          <p className="italic text-stone-700 line-clamp-2">
                            « {listing.modificationRequest?.details} »
                          </p>
                        </div>
                      )}

                      {listing.adminComment && (
                        <div className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-[11px] text-stone-800 italic">
                          <strong>Note modérateur :</strong> {listing.adminComment}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-[#FAF9F5] border-t border-stone-100 flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between text-stone-500 font-medium">
                      <span>{listing.bookingMode === 'instant' ? '⚡ Instantané' : '📨 Sur demande'}</span>
                      <button
                        onClick={() => {
                          setSelectedListingForCalendar(listing.id);
                          setActiveTab('calendar');
                        }}
                        className="text-[#243E36] font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Calendrier</span>
                      </button>
                    </div>

                    {/* Actions de modification selon le statut : Avant ou Après publication */}
                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-2">
                      {!isPublished ? (
                        // Avant publication : l'hôte peut modifier directement son annonce
                        <button
                          onClick={() => openEditListingModal(listing)}
                          className="w-full py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Modifier l'annonce (avant publication)</span>
                        </button>
                      ) : (
                        // Après publication : verrouillée, seul l'admin peut modifier
                        <button
                          onClick={() => {
                            setTargetListingForRequest(listing);
                            setRequestDetails(listing.modificationRequest?.details || '');
                            setRequestMediaUrl('');
                            setIsModificationRequestModalOpen(true);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                        >
                          <MessageSquarePlus className="w-3.5 h-3.5 text-amber-800" />
                          <span>Demander une modification à l'admin</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {hostBookings.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
              Aucune réservation pour le moment. Vos demandes apparaîtront ici.
            </div>
          ) : (
            <div className="space-y-3">
              {hostBookings.map(booking => (
                <div 
                  key={booking.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={booking.listingImage}
                      alt={booking.listingTitle}
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900">
                          {booking.listingTitle}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          booking.status === 'confirmee'
                            ? 'bg-emerald-100 text-emerald-800'
                            : booking.status === 'en_attente_hote'
                            ? 'bg-amber-100 text-amber-800'
                            : booking.status === 'terminee'
                            ? 'bg-stone-100 text-stone-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {booking.status === 'confirmee' && 'Confirmée'}
                          {booking.status === 'en_attente_hote' && 'En attente de votre réponse'}
                          {booking.status === 'terminee' && 'Séjour terminé'}
                          {booking.status === 'refusee' && 'Déclinée'}
                        </span>
                      </div>

                      <div className="text-xs text-stone-500 mt-1">
                        Voyageur : <strong>{booking.travelerName}</strong> ({booking.travelerEmail}) • {booking.guestsCount} pers.
                      </div>
                      <div className="text-xs text-stone-600 mt-0.5">
                        Dates : <strong>{new Date(booking.startDate).toLocaleDateString('fr-FR')}</strong> au <strong>{new Date(booking.endDate).toLocaleDateString('fr-FR')}</strong> ({booking.nightsCount} nuits)
                      </div>
                    </div>
                  </div>

                  {/* Financial & Actions */}
                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="text-right">
                      <div className="text-xs text-stone-400">Net versé à l'hôte</div>
                      <div className="text-lg font-bold text-[#243E36]">
                        {booking.hostNetEarnings.toFixed(2)} €
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Total voyageur {booking.totalPrice.toFixed(2)} €
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {booking.status === 'en_attente_hote' && (
                        <>
                          <button
                            id={`accept-booking-btn-${booking.id}`}
                            onClick={() => acceptBooking(booking.id)}
                            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                            title="Accepter la demande"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accepter</span>
                          </button>
                          <button
                            id={`decline-booking-btn-${booking.id}`}
                            onClick={() => declineBooking(booking.id)}
                            className="p-2 rounded-xl bg-stone-200 hover:bg-rose-100 hover:text-rose-700 text-stone-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                            title="Décliner la demande"
                          >
                            <X className="w-4 h-4" />
                            <span>Refuser</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setActiveChatBookingId(booking.id)}
                        className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium text-xs flex items-center gap-1.5 cursor-pointer"
                        title="Ouvrir la messagerie interne"
                      >
                        <MessageSquare className="w-4 h-4 text-[#8C5E45]" />
                        <span className="hidden sm:inline">Message</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Calendar Block / Unblock */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Gestion des disponibilités du calendrier
              </h3>
              <p className="text-xs text-stone-500">
                Cliquez sur une date pour la bloquer ou la rendre disponible à la réservation instantanée.
              </p>
            </div>

            {/* Select which listing to manage */}
            <select
              value={selectedListingForCalendar}
              onChange={e => setSelectedListingForCalendar(e.target.value)}
              className="p-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 bg-stone-50 cursor-pointer"
            >
              {hostListings.map(l => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </div>

          {/* Calendar grid Octobre 2026 */}
          <div className="border border-stone-200 rounded-2xl p-4 bg-[#FAF9F5]">
            <div className="font-bold text-xs text-stone-700 mb-3 flex items-center justify-between">
              <span>Octobre 2026</span>
              <div className="flex items-center gap-3 text-[11px] font-normal text-stone-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-white border border-stone-300 rounded" /> Libre</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-200 border border-rose-300 rounded" /> Bloqué / Réservé</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                <div key={d} className="text-center font-bold text-[10px] uppercase text-stone-400 py-1">
                  {d}
                </div>
              ))}

              {calendarDays.map(item => (
                <button
                  key={item.dateStr}
                  onClick={() => {
                    if (currentCalendarListing) {
                      toggleBlockedDate(currentCalendarListing.id, item.dateStr);
                    }
                  }}
                  className={`h-12 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition cursor-pointer ${
                    item.isBlocked
                      ? 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200'
                      : 'bg-white text-stone-900 border-stone-200 hover:border-[#243E36]'
                  }`}
                  title={item.isBlocked ? 'Date bloquée (cliquer pour libérer)' : 'Date libre (cliquer pour bloquer)'}
                >
                  <span>{item.dayNumber}</span>
                  <span className="text-[9px] font-normal opacity-80">
                    {item.isBlocked ? 'Bloqué' : `${currentCalendarListing?.pricePerNight}€`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Financial & Stripe Connect */}
      {activeTab === 'revenues' && (
        <div className="space-y-6">
          {/* Revenue KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="text-xs text-stone-500 uppercase font-semibold">Chiffre d’affaires brut</div>
              <div className="text-2xl font-bold font-serif text-stone-900 mt-1">
                {totalGrossEarnings.toFixed(2)} €
              </div>
              <div className="text-[11px] text-stone-400 mt-1">Nuitées + frais de ménage perçus</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="text-xs text-stone-500 uppercase font-semibold">Commission MyStay (12%)</div>
              <div className="text-2xl font-bold font-serif text-[#8C5E45] mt-1">
                {totalMyStayCommission.toFixed(2)} €
              </div>
              <div className="text-[11px] text-stone-400 mt-1">Rémunération modération & support</div>
            </div>

            <div className="bg-[#FAF9F5] p-5 rounded-2xl border-2 border-[#243E36] shadow-xs">
              <div className="text-xs text-[#243E36] uppercase font-bold">Montant net versé estimé</div>
              <div className="text-2xl font-bold font-serif text-[#243E36] mt-1">
                {totalNetEstimated.toFixed(2)} €
              </div>
              <div className="text-[11px] text-emerald-800 font-semibold mt-1">
                ✓ Compte bancaire Stripe Connect rattaché
              </div>
            </div>
          </div>

          {/* Stripe Connect account status box */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                S
              </div>
              <div>
                <div className="font-bold text-sm text-stone-900">
                  Compte Stripe Connect Express
                </div>
                <div className="text-xs text-stone-500">
                  IBAN FR76 •••• •••• 8912 • Virements automatiques à J+2 après check-in du voyageur
                </div>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Actif & vérifié
            </span>
          </div>
        </div>
      )}

      {/* Modal: New Listing Wizard (< 15 min) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF9F5]">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  {editingListingId ? "Modifier l'annonce avant publication" : "Déposer une annonce rurale"} (Étape {step}/4)
                </h3>
                <p className="text-xs text-stone-500">
                  {editingListingId 
                    ? "Apportez vos modifications avant la validation finale. Une fois publiée, seul l'admin pourra la modifier."
                    : "Conforme à la charte MyStay Tourisme Durable v1.1"}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingListingId(null);
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={(e) => { e.preventDefault(); handleSaveListing('en_attente'); }} className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Step 1: General Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Titre de l'annonce *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Ex: Mas cévenol en pierres sèches et source naturelle"
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 outline-none focus:border-[#243E36]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                        Typologie d'habitat
                      </label>
                      <select
                        value={propertyType}
                        onChange={e => setPropertyType(e.target.value as any)}
                        className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-white"
                      >
                        <option value="gite">Gîte rural traditionnel</option>
                        <option value="eco_cabane">Éco-Cabane en bois local</option>
                        <option value="bergerie">Bergerie en pierre</option>
                        <option value="moulin">Ancien moulin</option>
                        <option value="ferme_renovee">Ferme vivrière</option>
                        <option value="yourte">Yourte / Habitat léger</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                        Capacité maximale (pers.)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={capacity}
                        onChange={e => setCapacity(Number(e.target.value))}
                        className="w-full text-xs p-3 rounded-xl border border-stone-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center justify-between">
                          <span>Région rurale</span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {RURAL_REGIONS.length} régions terroirs
                          </span>
                        </label>
                        <select
                          value={region}
                          onChange={e => handleRegionChange(e.target.value)}
                          className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-white font-medium text-stone-800 outline-none focus:border-[#243E36] focus:ring-1 focus:ring-[#243E36]"
                        >
                          {RURAL_REGIONS.map(r => (
                            <option key={r.name} value={r.name}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-stone-500 mt-1">
                          {RURAL_REGIONS.find(r => r.name === region)?.label}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center justify-between">
                          <span>Commune rurale *</span>
                          <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                            {availableCommunes.length} villages
                          </span>
                        </label>
                        <select
                          value={isCustomCommune ? '__custom__' : commune}
                          onChange={e => handleCommuneChange(e.target.value)}
                          className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-white font-medium text-stone-900 outline-none focus:border-[#243E36] focus:ring-1 focus:ring-[#243E36]"
                        >
                          <option value="" disabled>-- Choisir une commune rurale --</option>
                          {availableCommunes.map(c => (
                            <option key={c.name} value={c.name}>
                              {c.name} ({c.department})
                            </option>
                          ))}
                          <option value="__custom__">✍️ Autre commune rurale (saisie manuelle)...</option>
                        </select>
                        <p className="text-[10px] text-stone-500 mt-1">
                          Sélection automatique de la commune rurale et du département
                        </p>
                      </div>
                    </div>

                    {/* Custom commune manual input */}
                    {isCustomCommune && (
                      <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                          <MapPin className="w-3.5 h-3.5 text-amber-700" />
                          <span>Saisie libre d'une commune rurale hors liste</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              Nom du village / commune *
                            </label>
                            <input
                              type="text"
                              required
                              value={customCommuneInput}
                              onChange={e => {
                                setCustomCommuneInput(e.target.value);
                                setCommune(e.target.value);
                              }}
                              placeholder="Ex: Saint-Hilaire-de-Lavit"
                              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white outline-none focus:border-[#243E36]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              Département (ex: Lozère (48)) *
                            </label>
                            <input
                              type="text"
                              required
                              value={customDepartmentInput}
                              onChange={e => {
                                setCustomDepartmentInput(e.target.value);
                                setDepartment(e.target.value);
                              }}
                              placeholder="Ex: Lozère (48)"
                              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white outline-none focus:border-[#243E36]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Commune details & terroir badge */}
                    {!isCustomCommune && selectedCommuneInfo && (
                      <div className="p-3 bg-[#FAF9F5] rounded-xl border border-emerald-200/70 flex items-start gap-3 text-xs">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-stone-900">{selectedCommuneInfo.name}</span>
                            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              {selectedCommuneInfo.department}
                            </span>
                            <span className="text-[11px] text-stone-500">
                              Code postal : {selectedCommuneInfo.postalCode}
                            </span>
                          </div>
                          {selectedCommuneInfo.terroirNote && (
                            <div className="text-[11px] text-stone-600 mt-1 flex items-center gap-1.5">
                              <Leaf className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{selectedCommuneInfo.terroirNote}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Sustainable Commitments (Min 3 required) */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                    🌱 <strong>Engagement Charte MyStay :</strong> Vous devez sélectionner au moins 3 pratiques éco-responsables effectives sur votre hébergement.
                  </div>

                  <div className="space-y-2.5">
                    {SUSTAINABLE_PRACTICES_CATALOG.map(practice => {
                      const isSelected = selectedPractices.includes(practice.label);
                      return (
                        <div
                          key={practice.id}
                          onClick={() => togglePractice(practice.label)}
                          className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                            isSelected
                              ? 'bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-400'
                              : 'bg-white border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center text-xs mt-0.5 ${
                            isSelected ? 'bg-emerald-700 text-white' : 'border border-stone-300'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-stone-900">{practice.label}</div>
                            <p className="text-[11px] text-stone-500 mt-0.5">{practice.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-right text-xs font-bold text-stone-600">
                    Sélectionnées : {selectedPractices.length} / min. 3
                  </div>
                </div>
              )}

              {/* Step 3: Pricing & Calendar */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                        Prix par nuit (€ TTC)
                      </label>
                      <input
                        type="number"
                        min={30}
                        max={500}
                        value={pricePerNight}
                        onChange={e => setPricePerNight(Number(e.target.value))}
                        className="w-full text-xs p-3 rounded-xl border border-stone-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                        Frais de ménage (€)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={cleaningFee}
                        onChange={e => setCleaningFee(Number(e.target.value))}
                        className="w-full text-xs p-3 rounded-xl border border-stone-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Mode de réservation
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`p-3 rounded-xl border cursor-pointer text-xs ${
                        bookingMode === 'instant' ? 'border-[#243E36] bg-[#FAF9F5] font-bold text-[#243E36]' : 'border-stone-200'
                      }`}>
                        <input
                          type="radio"
                          name="mode"
                          checked={bookingMode === 'instant'}
                          onChange={() => setBookingMode('instant')}
                          className="mr-2"
                        />
                        Instantané (recommandé)
                      </label>

                      <label className={`p-3 rounded-xl border cursor-pointer text-xs ${
                        bookingMode === 'on_demand' ? 'border-[#243E36] bg-[#FAF9F5] font-bold text-[#243E36]' : 'border-stone-200'
                      }`}>
                        <input
                          type="radio"
                          name="mode"
                          checked={bookingMode === 'on_demand'}
                          onChange={() => setBookingMode('on_demand')}
                          className="mr-2"
                        />
                        Sur demande (délai 24h)
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Description, Photos & Rules */}
              {step === 4 && (
                <div className="space-y-5">
                  {/* Alert banner regarding edit rules */}
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-950">
                    <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Règle de publication MyStay :</strong>
                      <p className="mt-0.5 text-emerald-900 leading-relaxed text-[11px]">
                        Vous pouvez modifier librement vos photos, vidéos et descriptifs tant que l'annonce n'est pas encore certifiée et publiée. Une fois l'annonce publiée, seul un administrateur MyStay pourra apporter des changements à votre demande.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Description authentique du lieu *
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Décrivez l'histoire du lieu, les matériaux écologiques utilisés, la quiétude de l'environnement..."
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 outline-none focus:border-[#243E36]"
                    />
                  </div>

                  {/* Media Section: Image du site et Vidéo de l'accueil */}
                  <div className="space-y-4">
                    {/* Bloc 1: Image Principale du Site d'Accueil */}
                    <div className="p-4 bg-stone-50/90 border border-emerald-200/90 rounded-2xl space-y-3.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                            📸
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-stone-900 uppercase">
                              1. Image principale du site d'accueil *
                            </label>
                            <span className="text-[11px] text-stone-500">
                              Le lieu, le domaine ou la bâtisse rurale où le voyageur sera accueilli
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                          Couverture voyageur
                        </span>
                      </div>

                      {/* Grande prévisualisation de l'image du site */}
                      <div className="relative aspect-16/9 sm:aspect-21/9 rounded-xl overflow-hidden border-2 border-emerald-600/30 bg-stone-200 shadow-xs">
                        <img 
                          src={imagesList[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'} 
                          alt="Image du site d'accueil" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-[#243E36]/90 backdrop-blur-xs text-white text-[11px] font-semibold px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-xs">
                          <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                          <span>Vue du site où le voyageur sera accueilli</span>
                        </div>
                      </div>

                      {/* Boutons d'action pour changer l'image du site */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={newPhotoUrlInput}
                            onChange={e => setNewPhotoUrlInput(e.target.value)}
                            placeholder="Coller l'URL d'une photo du site (https://...)"
                            className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white outline-none focus:border-[#243E36]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const trimmed = newPhotoUrlInput.trim();
                              if (!trimmed) return;
                              setImagesList(prev => [trimmed, ...prev.filter(u => u !== trimmed)]);
                              setNewPhotoUrlInput('');
                              showNotification('Photo mise à jour', 'La nouvelle photo a été définie comme image principale du site.', 'success');
                            }}
                            className="shrink-0 px-3.5 py-2.5 rounded-xl bg-[#243E36] text-white font-bold text-xs hover:bg-[#1B2F29] cursor-pointer"
                          >
                            Définir comme site
                          </button>

                          {/* Upload local de fichier photo pour le site */}
                          <label className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold cursor-pointer shadow-2xs">
                            <Upload className="w-3.5 h-3.5 text-emerald-800" />
                            <span>Téléverser...</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 25 * 1024 * 1024) {
                                    showNotification('Fichier volumineux', 'Veuillez choisir une image inférieure à 25 Mo.', 'warning');
                                    return;
                                  }
                                  try {
                                    const compressedDataUrl = await compressImageFile(file, 1200, 900, 0.78);
                                    setImagesList(prev => [compressedDataUrl, ...prev]);
                                    showNotification('Image du site chargée', 'Votre image a été optimisée et placée en couverture principale.', 'success');
                                  } catch (err) {
                                    showNotification('Erreur de traitement', 'Impossible de charger cette image.', 'error');
                                  }
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Suggestions rapides de sites ruraux authentiques */}
                        <div className="pt-1">
                          <span className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
                            Ou choisissez une vue de site rural de référence :
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {RURAL_STOCK_SUGGESTIONS.map((item, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setImagesList(prev => [item.url, ...prev.filter(u => u !== item.url)]);
                                }}
                                className={`text-[11px] px-2 py-1 rounded-lg cursor-pointer border transition ${
                                  imagesList[0] === item.url 
                                    ? 'bg-emerald-700 text-white font-bold border-emerald-800' 
                                    : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                                }`}
                              >
                                {imagesList[0] === item.url ? '✓ ' : '+ '}{item.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Photos complémentaires pour l'intérieur / galerie */}
                        {imagesList.length > 1 && (
                          <div className="pt-3 border-t border-stone-200/80">
                            <span className="text-[11px] font-bold text-stone-700 block mb-2">
                              Photos complémentaires du gîte et intérieurs ({imagesList.length - 1}) :
                            </span>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {imagesList.slice(1).map((url, index) => {
                                const realIndex = index + 1;
                                return (
                                  <div 
                                    key={realIndex} 
                                    className="relative group rounded-lg overflow-hidden border border-stone-200 aspect-4/3 bg-stone-100"
                                  >
                                    <img src={url} alt={`Photo ${realIndex}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1 p-1">
                                      <button
                                        type="button"
                                        onClick={() => handleSetPrimaryPhoto(realIndex)}
                                        className="p-1 bg-white hover:bg-stone-100 text-stone-800 text-[9px] font-bold rounded cursor-pointer"
                                        title="Définir comme image du site"
                                      >
                                        ⭐ Site
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemovePhoto(realIndex)}
                                        className="p-1 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer"
                                        title="Supprimer cette photo"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bloc 2: Vidéo de Présentation du Site & de l'Accueil */}
                    <div className="p-4 bg-stone-50/90 border border-amber-200/90 rounded-2xl space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                            🎬
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-stone-900 uppercase">
                              2. Vidéo de présentation du site & de l'accueil (Recommandé)
                            </label>
                            <span className="text-[11px] text-stone-500">
                              Pour que le voyageur voie en mouvement le site où il sera accueilli
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          videoUrl 
                            ? 'bg-amber-100 text-amber-950 border-amber-300' 
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}>
                          {videoUrl ? '✓ Vidéo prête' : 'Facultatif'}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Ajoutez une vidéo pour que le voyageur découvre le chemin d'accès, la quiétude des extérieurs, la cour, la bâtisse ou votre mot d'accueil. Prise en charge des liens YouTube, Vimeo ou fichiers vidéo MP4/WebM.
                      </p>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="url"
                            value={videoUrl}
                            onChange={e => setVideoUrl(e.target.value)}
                            placeholder="Lien vidéo : https://www.youtube.com/watch?v=... ou https://.../visite.mp4"
                            className="w-full text-xs p-2.5 pr-8 rounded-xl border border-stone-300 bg-white outline-none focus:border-[#243E36]"
                          />
                          {videoUrl && (
                            <button
                              type="button"
                              onClick={() => setVideoUrl('')}
                              className="absolute right-2 top-2 p-1 text-stone-400 hover:text-stone-700 rounded-md cursor-pointer"
                              title="Effacer la vidéo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Import local de fichier vidéo */}
                        <label className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-semibold cursor-pointer shadow-2xs">
                          <Film className="w-3.5 h-3.5 text-amber-800" />
                          <span>Fichier vidéo...</span>
                          <input
                            type="file"
                            accept="video/mp4, video/webm, video/ogg"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 50 * 1024 * 1024) {
                                  showNotification('Fichier volumineux', 'Pour les vidéos de plus de 50 Mo, privilégiez un lien YouTube ou Vimeo.', 'warning');
                                  return;
                                }
                                try {
                                  const objectUrl = URL.createObjectURL(file);
                                  setVideoUrl(objectUrl);
                                  showNotification('Vidéo prête', 'Votre vidéo locale est prévisualisable par les voyageurs.', 'success');
                                } catch {
                                  showNotification('Erreur vidéo', 'Impossible de charger la vidéo.', 'error');
                                }
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Exemples rapides en 1 clic */}
                      <div className="flex items-center gap-2 flex-wrap text-[11px] text-stone-500 pt-0.5">
                        <span className="font-medium text-stone-600">Tester avec un exemple :</span>
                        <button
                          type="button"
                          onClick={() => setVideoUrl('https://www.youtube.com/watch?v=M7FIvfx5J10')}
                          className="text-amber-800 font-semibold underline hover:text-amber-950 cursor-pointer"
                        >
                          Visite mas en pleine nature (YouTube)
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setVideoUrl('https://assets.mixkit.co/videos/preview/mixkit-drone-view-of-a-winding-road-in-a-forest-43759-large.mp4')}
                          className="text-amber-800 font-semibold underline hover:text-amber-950 cursor-pointer"
                        >
                          Vue aérienne du domaine rural (MP4)
                        </button>
                      </div>

                      {/* Lecteur Vidéo Interactif en Direct dans le Formulaire */}
                      {videoUrl && (
                        <div className="p-3 bg-white rounded-xl border border-amber-200 mt-2 space-y-2 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                            <span className="flex items-center gap-1.5">
                              <Play className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
                              Aperçu du lecteur vidéo du site :
                            </span>
                            <span className="text-[10px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              ✓ Conforme pour le voyageur
                            </span>
                          </div>

                          <div className="relative aspect-16/9 rounded-lg overflow-hidden bg-black max-h-56 shadow-inner">
                            {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                              <iframe
                                src={videoUrl.replace('watch?v=', 'embed/').split('&')[0]}
                                title="Aperçu YouTube du site"
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : videoUrl.includes('vimeo.com') ? (
                              <iframe
                                src={`https://player.vimeo.com/video/${videoUrl.split('/').pop()}`}
                                title="Aperçu Vimeo du site"
                                className="w-full h-full border-0"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={videoUrl}
                                controls
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>

                          <p className="text-[11px] text-stone-500 italic">
                            💡 Ce lecteur interactif sera mis en avant sur votre annonce pour permettre au voyageur de visiter virtuellement les lieux avant de réserver.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Conseil de l'hôte pour valoriser le terroir
                    </label>
                    <input
                      type="text"
                      value={localTips}
                      onChange={e => setLocalTips(e.target.value)}
                      placeholder="Ex: Visite de notre rucher, découverte du sentier des cascades secrètes..."
                      className="w-full text-xs p-3 rounded-xl border border-stone-300"
                    />
                  </div>
                </div>
              )}

              {/* Wizard navigation & submission buttons */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(prev => (prev - 1) as any)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    Précédent
                  </button>
                ) : <div />}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 1) {
                        if (!title.trim()) {
                          showNotification('Titre requis', 'Veuillez saisir un titre pour votre annonce.', 'warning');
                          return;
                        }
                        if (!commune.trim()) {
                          showNotification('Commune requise', 'Veuillez sélectionner une commune rurale dans la liste déroulante.', 'warning');
                          return;
                        }
                      }
                      setStep(prev => (prev + 1) as any);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#243E36] text-white text-xs font-bold hover:bg-[#1B2F29] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Suivant</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Enregistrer en brouillon (permet à l'hôte de modifier plus tard avant validation) */}
                    <button
                      type="button"
                      onClick={() => handleSaveListing('brouillon')}
                      className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <FileText className="w-4 h-4 text-stone-500" />
                      <span>Sauvegarder en brouillon</span>
                    </button>

                    {/* Soumettre à la modération */}
                    <button
                      type="submit"
                      id="submit-new-listing-btn"
                      disabled={isSubmittingListing}
                      className="px-5 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
                    >
                      {isSubmittingListing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#A3E5C8]" />
                          <span>Transmission en cours...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#A3E5C8]" />
                          <span>{editingListingId ? 'Mettre à jour & Soumettre' : 'Soumettre à la modération'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal: Demande de modification à l'administrateur pour annonce publiée */}
      {isModificationRequestModalOpen && targetListingForRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto flex flex-col">
            
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-amber-50/60">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-800" />
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    Demander une modification à l'administrateur
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Annonce certifiée : {targetListingForRequest.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModificationRequestModalOpen(false);
                  setTargetListingForRequest(null);
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!requestDetails.trim()) {
                  showNotification('Précision requise', 'Veuillez décrire les modifications souhaitées.', 'warning');
                  return;
                }
                const finalMsg = requestMediaUrl.trim() 
                  ? `${requestDetails.trim()}\n\n[Média transmis par l'hôte : ${requestMediaUrl.trim()}]`
                  : requestDetails.trim();

                requestListingModification(targetListingForRequest.id, finalMsg);
                showNotification(
                  'Demande transmise à l\'administrateur',
                  'Votre requête a été envoyée. L\'administrateur MyStay appliquera la modification après contrôle.',
                  'success'
                );
                setIsModificationRequestModalOpen(false);
                setTargetListingForRequest(null);
                setRequestDetails('');
                setRequestMediaUrl('');
              }}
              className="p-6 space-y-4"
            >
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
                <strong className="font-semibold text-stone-900 block">
                  Pourquoi l'intervention de l'administrateur est requise ?
                </strong>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Une fois une annonce publiée sur MyStay, elle bénéficie d'une garantie de qualité et d'éco-responsabilité. Afin de préserver la fiabilité des réservations et la conformité de la charte de durabilité, tout changement de photo, vidéo, tarif ou descriptif est validé par un administrateur.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                  Détaillez les modifications demandées *
                </label>
                <textarea
                  required
                  rows={4}
                  value={requestDetails}
                  onChange={e => setRequestDetails(e.target.value)}
                  placeholder="Ex: Je souhaite mettre à jour le prix par nuit à 95 €, ajouter une nouvelle photo de la chambre et mettre le lien de notre nouvelle vidéo drone..."
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 outline-none focus:border-[#243E36]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                  Lien vers nouvelle photo ou vidéo (facultatif)
                </label>
                <input
                  type="url"
                  value={requestMediaUrl}
                  onChange={e => setRequestMediaUrl(e.target.value)}
                  placeholder="https://... (lien image, YouTube ou MP4)"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-none focus:border-[#243E36]"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModificationRequestModalOpen(false);
                    setTargetListingForRequest(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer la demande à l'administrateur</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
