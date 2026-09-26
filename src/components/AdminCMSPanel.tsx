import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Listing, User, Booking, PlatformSettings, 
  ListingStatus, UserRole, BookingStatus, MyStayLabel 
} from '../types';
import { 
  Plus, Pencil, Trash2, Search, 
  Save, X, Check, AlertCircle, Users, Calendar, 
  Building, Settings, CheckCircle2, 
  Sparkles, Shield, FileSpreadsheet, RefreshCw, Database
} from 'lucide-react';
import { exportBookingsToCsv } from '../utils/exportBookingsCsv';
import { NoCodeInspectorModal } from './NoCodeInspectorModal';
import { RURAL_REGIONS, getCommunesForRegion, findRuralCommune } from '../data/ruralLocations';

export const AdminCMSPanel: React.FC = () => {
  const { 
    listings, adminCreateListing, adminUpdateListing, deleteListing,
    users, adminCreateUser, adminUpdateUser, adminDeleteUser,
    bookings, adminCreateBooking, adminUpdateBooking, deleteBooking,
    platformSettings, updatePlatformSettings, currentUser,
    showNotification
  } = useApp();

  // Active sub-entity in CMS
  const [cmsSection, setCmsSection] = useState<'listings' | 'users' | 'bookings' | 'settings' | 'architecture'>('listings');
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterListingStatus, setFilterListingStatus] = useState<string>('all');

  // Modals state
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Handler pour exporter les réservations au format CSV depuis la table Supabase
  const handleExportBookingsCsv = async () => {
    setIsExportingCsv(true);
    try {
      const result = await exportBookingsToCsv(bookings);
      if (result.success) {
        showNotification(
          'Export CSV Supabase réussi',
          result.message,
          'success'
        );
      } else {
        showNotification('Information export', result.message, 'warning');
      }
    } catch (err: any) {
      showNotification('Erreur export', err.message || 'Impossible d\'exporter les réservations au format CSV.', 'error');
    } finally {
      setIsExportingCsv(false);
    }
  };

  // Deletion confirm modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'listing' | 'user' | 'booking';
    id: string;
    title: string;
  } | null>(null);

  // Form states for Listing
  const [listingForm, setListingForm] = useState<Partial<Listing>>({
    title: '',
    description: '',
    propertyType: 'eco_cabane',
    commune: '',
    department: '',
    region: 'Occitanie',
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    pricePerNight: 95,
    cleaningFee: 25,
    minNights: 2,
    maxNights: 30,
    bookingMode: 'instant',
    cancellationPolicy: 'moderee',
    approxLocation: 'Au cœur de la nature préservée',
    lat: 44.35,
    lng: 3.6,
    status: 'publiee',
    labels: ['eco_responsable'],
    sustainablePractices: ['Énergie solaire', 'Toilettes sèches', 'Isolation chanvre'],
    images: ['https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80'],
    videoUrl: '',
    impactScoreKgCo2SavedPerNight: 12
  });

  // Form states for User
  const [userForm, setUserForm] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'voyageur',
    phone: '+33 6 00 00 00 00',
    bio: '',
    password: '',
    isHostVerified: false,
    isEmailVerified: true
  });

  // Form states for Booking
  const [bookingForm, setBookingForm] = useState<Partial<Booking>>({
    listingId: listings[0]?.id || 'lst_1',
    listingTitle: listings[0]?.title || 'Gîte rural',
    listingImage: listings[0]?.images?.[0] || 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80',
    listingCommune: listings[0]?.commune || 'Sainte-Énimie',
    travelerId: currentUser.id,
    travelerName: currentUser.name,
    travelerEmail: currentUser.email,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    nightsCount: 3,
    guestsCount: 2,
    nightlyTotal: 270,
    cleaningFee: 30,
    serviceFee: 36,
    touristTax: 4.5,
    totalPrice: 340.5,
    hostNetEarnings: 270,
    status: 'confirmee',
    paymentStatus: 'paid'
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<PlatformSettings>(platformSettings);

  // ----------------------------------------------------
  // LISTING HANDLERS
  // ----------------------------------------------------
  const openNewListingModal = () => {
    setEditingListing(null);
    setListingForm({
      title: '',
      description: 'Superbe éco-hébergement rural intégré harmonieusement dans son environnement naturel.',
      propertyType: 'gite',
      commune: '',
      department: '',
      region: 'Occitanie',
      approxLocation: 'Dans un hameau préservé',
      capacity: 4,
      bedrooms: 2,
      bathrooms: 1,
      pricePerNight: 110,
      cleaningFee: 35,
      minNights: 2,
      maxNights: 30,
      bookingMode: 'instant',
      cancellationPolicy: 'moderee',
      lat: 44.35,
      lng: 3.6,
      status: 'publiee',
      labels: ['eco_responsable', 'authentique'],
      sustainablePractices: ['Composteur sur place', 'Chauffage bois local', 'Produits ménagers bio'],
      images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'],
      amenities: ['Cuisine équipée', 'Poêle à bois', 'Jardin clos'],
      houseRules: ['Non fumeur', 'Animaux bienvenus'],
      localTips: 'Marché paysan le dimanche matin sur la place du village.',
      impactScoreKgCo2SavedPerNight: 15
    });
    setIsListingModalOpen(true);
  };

  const openEditListingModal = (l: Listing) => {
    setEditingListing(l);
    setListingForm({ ...l });
    setIsListingModalOpen(true);
  };

  const saveListingForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingForm.title?.trim() || !listingForm.commune?.trim()) {
      showNotification('Champs manquants', 'Le titre et la commune sont obligatoires.', 'warning');
      return;
    }

    if (editingListing) {
      adminUpdateListing(editingListing.id, listingForm);
    } else {
      const newListing: Listing = {
        id: `lst_${Date.now()}`,
        title: listingForm.title || 'Nouveau gîte rural',
        description: listingForm.description || '',
        propertyType: (listingForm.propertyType as any) || 'gite',
        commune: listingForm.commune || 'Village',
        department: listingForm.department || '01',
        region: listingForm.region || 'Occitanie',
        approxLocation: listingForm.approxLocation || 'En pleine nature',
        lat: listingForm.lat || 44.35,
        lng: listingForm.lng || 3.6,
        capacity: Number(listingForm.capacity) || 2,
        bedrooms: Number(listingForm.bedrooms) || 1,
        bathrooms: Number(listingForm.bathrooms) || 1,
        pricePerNight: Number(listingForm.pricePerNight) || 85,
        cleaningFee: Number(listingForm.cleaningFee) || 25,
        minNights: Number(listingForm.minNights) || 2,
        maxNights: Number(listingForm.maxNights) || 30,
        bookingMode: listingForm.bookingMode || 'instant',
        cancellationPolicy: listingForm.cancellationPolicy || 'moderee',
        images: listingForm.images && listingForm.images.length > 0 ? listingForm.images : ['https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80'],
        videoUrl: listingForm.videoUrl?.trim() || undefined,
        amenities: listingForm.amenities || ['Cuisine équipée', 'Wi-Fi bas débit', 'Terrasse'],
        houseRules: listingForm.houseRules || ['Respect du calme nocturne'],
        localTips: listingForm.localTips || 'Sentiers de randonnée accessibles à pied.',
        hostId: currentUser.id,
        hostName: currentUser.name,
        hostAvatar: currentUser.avatar,
        status: (listingForm.status as ListingStatus) || 'publiee',
        submittedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        labels: (listingForm.labels as MyStayLabel[]) || ['eco_responsable'],
        sustainablePractices: listingForm.sustainablePractices || ['Tri sélectif', 'Énergie verte'],
        rating: 5.0,
        reviewCount: 1,
        blockedDates: [],
        impactScoreKgCo2SavedPerNight: Number(listingForm.impactScoreKgCo2SavedPerNight) || 10
      };
      adminCreateListing(newListing);
    }
    setIsListingModalOpen(false);
  };

  // ----------------------------------------------------
  // USER HANDLERS
  // ----------------------------------------------------
  const openNewUserModal = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      role: 'voyageur',
      phone: '+33 6 12 34 56 78',
      bio: 'Membre passionné par le tourisme rural durable.',
      password: 'password123',
      isHostVerified: false,
      isEmailVerified: true
    });
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (u: User) => {
    setEditingUser(u);
    setUserForm({ ...u });
    setIsUserModalOpen(true);
  };

  const saveUserForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name?.trim() || !userForm.email?.trim()) {
      showNotification('Champs obligatoires', 'Le nom et l\'adresse email sont requis.', 'warning');
      return;
    }

    if (editingUser) {
      adminUpdateUser(editingUser.id, userForm);
    } else {
      adminCreateUser({
        name: userForm.name.trim(),
        email: userForm.email.trim().toLowerCase(),
        role: userForm.role || 'voyageur',
        phone: userForm.phone || '+33 6 00 00 00 00',
        bio: userForm.bio || '',
        avatar: userForm.role === 'hote' 
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        isHostVerified: userForm.role === 'hote' ? !!userForm.isHostVerified : false,
        isEmailVerified: true,
        password: userForm.password || 'password123'
      });
    }
    setIsUserModalOpen(false);
  };

  // ----------------------------------------------------
  // BOOKING HANDLERS
  // ----------------------------------------------------
  const openNewBookingModal = () => {
    setEditingBooking(null);
    const firstListing = listings[0];
    const nNights = 3;
    const nightTotal = (firstListing?.pricePerNight || 90) * nNights;
    const sFee = Math.round(nightTotal * 0.12);
    setBookingForm({
      listingId: firstListing?.id || 'lst_1',
      listingTitle: firstListing?.title || 'Éco-gîte',
      listingImage: firstListing?.images?.[0] || 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80',
      listingCommune: firstListing?.commune || 'Sainte-Énimie',
      travelerId: currentUser.id,
      travelerName: currentUser.name,
      travelerEmail: currentUser.email,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * nNights).toISOString().split('T')[0],
      nightsCount: nNights,
      guestsCount: 2,
      nightlyTotal: nightTotal,
      cleaningFee: 25,
      serviceFee: sFee,
      touristTax: 4.5,
      totalPrice: nightTotal + 25 + sFee + 4.5,
      hostNetEarnings: nightTotal,
      status: 'confirmee',
      paymentStatus: 'paid'
    });
    setIsBookingModalOpen(true);
  };

  const openEditBookingModal = (b: Booking) => {
    setEditingBooking(b);
    setBookingForm({ ...b });
    setIsBookingModalOpen(true);
  };

  const saveBookingForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBooking) {
      adminUpdateBooking(editingBooking.id, bookingForm);
    } else {
      const targetListing = listings.find(l => l.id === bookingForm.listingId) || listings[0];
      const nights = Number(bookingForm.nightsCount) || 3;
      const nightly = Number(bookingForm.nightlyTotal) || (targetListing.pricePerNight * nights);
      const fee = Number(bookingForm.serviceFee) || Math.round(nightly * 0.12);
      const clean = Number(bookingForm.cleaningFee) || targetListing.cleaningFee || 25;
      const tax = 4.5;
      const total = nightly + clean + fee + tax;

      const newBooking: Booking = {
        id: `bk_${Date.now()}`,
        listingId: targetListing.id,
        listingTitle: targetListing.title,
        listingImage: targetListing.images?.[0] || 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80',
        listingCommune: targetListing.commune,
        travelerId: bookingForm.travelerId || currentUser.id,
        travelerName: bookingForm.travelerName || currentUser.name,
        travelerEmail: bookingForm.travelerEmail || currentUser.email,
        hostId: targetListing.hostId,
        hostName: targetListing.hostName,
        startDate: bookingForm.startDate || new Date().toISOString().split('T')[0],
        endDate: bookingForm.endDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        nightsCount: nights,
        guestsCount: Number(bookingForm.guestsCount) || 2,
        nightlyTotal: nightly,
        cleaningFee: clean,
        serviceFee: fee,
        touristTax: tax,
        totalPrice: total,
        hostNetEarnings: nightly,
        status: (bookingForm.status as BookingStatus) || 'confirmee',
        paymentStatus: (bookingForm.paymentStatus as any) || 'paid',
        createdAt: new Date().toISOString(),
        hasReview: false,
        accessCode: '4082',
        co2SavedKg: targetListing.impactScoreKgCo2SavedPerNight * nights
      };
      adminCreateBooking(newBooking);
    }
    setIsBookingModalOpen(false);
  };

  // ----------------------------------------------------
  // DELETION CONFIRM
  // ----------------------------------------------------
  const confirmDeleteAction = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'listing') {
      deleteListing(deleteConfirm.id);
    } else if (deleteConfirm.type === 'user') {
      adminDeleteUser(deleteConfirm.id);
    } else if (deleteConfirm.type === 'booking') {
      deleteBooking(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  };

  // Filtered entities
  const filteredCmsListings = listings.filter(l => {
    const q = searchQuery.toLowerCase();
    const matchSearch = l.title.toLowerCase().includes(q) || l.commune.toLowerCase().includes(q) || l.id.toLowerCase().includes(q);
    const matchStatus = filterListingStatus === 'all' || l.status === filterListingStatus;
    return matchSearch && matchStatus;
  });

  const filteredCmsUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const filteredCmsBookings = bookings.filter(b => {
    const q = searchQuery.toLowerCase();
    return (
      b.id.toLowerCase().includes(q) ||
      b.listingTitle.toLowerCase().includes(q) ||
      b.travelerName.toLowerCase().includes(q)
    );
  });

  return (
    <div id="admin-cms-container" className="space-y-6">
      
      {/* CMS Sub-Navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            id="cms-tab-listings"
            onClick={() => { setCmsSection('listings'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              cmsSection === 'listings'
                ? 'bg-[#243E36] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Gîtes & Annonces ({listings.length})</span>
          </button>

          <button
            id="cms-tab-users"
            onClick={() => { setCmsSection('users'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              cmsSection === 'users'
                ? 'bg-[#243E36] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Utilisateurs & Rôles ({users.length})</span>
          </button>

          <button
            id="cms-tab-bookings"
            onClick={() => { setCmsSection('bookings'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              cmsSection === 'bookings'
                ? 'bg-[#243E36] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Réservations ({bookings.length})</span>
          </button>

          <button
            id="cms-tab-settings"
            onClick={() => setCmsSection('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              cmsSection === 'settings'
                ? 'bg-[#243E36] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Paramètres Plateforme</span>
          </button>

          <button
            id="cms-tab-architecture"
            onClick={() => { setCmsSection('architecture'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              cmsSection === 'architecture'
                ? 'bg-[#243E36] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-500" />
            <span>Architecture & API</span>
          </button>
        </div>

        {/* Create Button depending on section */}
        {cmsSection === 'listings' && (
          <button
            id="cms-btn-create-listing"
            onClick={openNewListingModal}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un hébergement</span>
          </button>
        )}

        {cmsSection === 'users' && (
          <button
            id="cms-btn-create-user"
            onClick={openNewUserModal}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un utilisateur</span>
          </button>
        )}

        {cmsSection === 'bookings' && (
          <div className="flex items-center gap-2">
            <button
              id="cms-btn-export-bookings-csv"
              onClick={handleExportBookingsCsv}
              disabled={isExportingCsv}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 border border-stone-200 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              title="Exporter les données de la table 'bookings' de Supabase au format CSV"
            >
              {isExportingCsv ? (
                <RefreshCw className="w-4 h-4 animate-spin text-stone-600" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              )}
              <span>Exporter CSV (Supabase)</span>
            </button>

            <button
              id="cms-btn-create-booking"
              onClick={openNewBookingModal}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle réservation</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: LISTINGS CRUD */}
      {/* ======================================================== */}
      {cmsSection === 'listings' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                id="cms-search-listings"
                type="text"
                placeholder="Rechercher (titre, commune, ID)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-stone-500 font-medium">Statut :</span>
              <select
                id="cms-filter-listing-status"
                value={filterListingStatus}
                onChange={(e) => setFilterListingStatus(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="all">Tous les statuts</option>
                <option value="publiee">Publiée</option>
                <option value="en_attente">En attente</option>
                <option value="a_modifier">À modifier</option>
                <option value="rejetee">Rejetée</option>
              </select>
            </div>
          </div>

          {/* Listings Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 uppercase border-b border-stone-200 font-semibold">
                  <tr>
                    <th className="p-3.5">Hébergement</th>
                    <th className="p-3.5">Localisation</th>
                    <th className="p-3.5">Capacité & Type</th>
                    <th className="p-3.5">Tarif / nuit</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5">Labels</th>
                    <th className="p-3.5 text-right">Actions CRUD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCmsListings.map(listing => (
                    <tr key={listing.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={listing.images?.[0] || 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=150&q=80'}
                          alt={listing.title}
                          className="w-12 h-12 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                        />
                        <div>
                          <div className="font-bold text-stone-900 line-clamp-1">{listing.title}</div>
                          <div className="text-[10px] text-stone-500 font-mono">ID: {listing.id} • Hôte: {listing.hostName}</div>
                        </div>
                      </td>
                      <td className="p-3.5 text-stone-700">
                        <div className="font-medium">{listing.commune} ({listing.department})</div>
                        <div className="text-[10px] text-stone-500">{listing.region}</div>
                      </td>
                      <td className="p-3.5 text-stone-700">
                        <div className="font-medium">{listing.capacity} pers. • {listing.bedrooms} ch.</div>
                        <div className="text-[10px] text-stone-500 capitalize">{listing.propertyType.replace('_', ' ')}</div>
                      </td>
                      <td className="p-3.5 font-bold text-emerald-800">
                        {listing.pricePerNight} €
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          listing.status === 'publiee'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : listing.status === 'en_attente'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : listing.status === 'a_modifier'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {listing.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {listing.labels.map(lbl => (
                            <span key={lbl} className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-[9px] text-stone-700">
                              {lbl.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditListingModal(listing)}
                            className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                            title="Modifier l'annonce (Update)"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'listing', id: listing.id, title: listing.title })}
                            className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Supprimer définitivement (Delete)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCmsListings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-500">
                        Aucun hébergement ne correspond aux filtres actuels.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: USERS CRUD */}
      {/* ======================================================== */}
      {cmsSection === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                id="cms-search-users"
                type="text"
                placeholder="Rechercher utilisateur (nom, email)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-stone-500 font-medium">Filtrer par rôle :</span>
              <select
                id="cms-filter-user-role"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="all">Tous les rôles</option>
                <option value="voyageur">Voyageur</option>
                <option value="hote">Hôte rural</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 uppercase border-b border-stone-200 font-semibold">
                  <tr>
                    <th className="p-3.5">Utilisateur</th>
                    <th className="p-3.5">Email & Téléphone</th>
                    <th className="p-3.5">Rôle</th>
                    <th className="p-3.5">Statut de vérification</th>
                    <th className="p-3.5">Date création</th>
                    <th className="p-3.5 text-right">Actions CRUD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCmsUsers.map(user => (
                    <tr key={user.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-stone-200 flex-shrink-0"
                        />
                        <div>
                          <div className="font-bold text-stone-900">{user.name}</div>
                          <div className="text-[10px] text-stone-500 font-mono">ID: {user.id}</div>
                        </div>
                      </td>
                      <td className="p-3.5 text-stone-700">
                        <div className="font-medium text-stone-900">{user.email}</div>
                        <div className="text-[10px] text-stone-500">{user.phone}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'admin'
                            ? 'bg-stone-800 text-stone-100'
                            : user.role === 'hote'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-stone-700">
                          {user.role === 'hote' ? (
                            user.isHostVerified ? (
                              <span className="text-emerald-700 flex items-center gap-1 font-semibold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Hôte Vérifié
                              </span>
                            ) : (
                              <span className="text-amber-600 flex items-center gap-1 font-medium text-[11px]">
                                <AlertCircle className="w-3.5 h-3.5" /> Dossier en attente
                              </span>
                            )
                          ) : (
                            <span className="text-stone-500 text-[11px]">Compte actif</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-stone-500 text-[11px]">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditUserModal(user)}
                            className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                            title="Modifier le compte"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {user.id !== currentUser.id && (
                            <button
                              onClick={() => setDeleteConfirm({ type: 'user', id: user.id, title: user.name })}
                              className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCmsUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-500">
                        Aucun utilisateur trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: BOOKINGS CRUD */}
      {/* ======================================================== */}
      {cmsSection === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                id="cms-search-bookings"
                type="text"
                placeholder="Rechercher réservation (n°, gîte, voyageur)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-xs text-stone-500 font-medium">
                Volume total géré : <strong className="text-stone-900">{bookings.reduce((sum, b) => sum + b.totalPrice, 0).toLocaleString()} €</strong>
              </div>
              <button
                id="cms-btn-export-bookings-table-csv"
                onClick={handleExportBookingsCsv}
                disabled={isExportingCsv}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Exporter les données de la table 'bookings' de Supabase au format CSV"
              >
                {isExportingCsv ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                )}
                <span>Exporter CSV (Supabase)</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 uppercase border-b border-stone-200 font-semibold">
                  <tr>
                    <th className="p-3.5">Réf & Hébergement</th>
                    <th className="p-3.5">Voyageur</th>
                    <th className="p-3.5">Dates du séjour</th>
                    <th className="p-3.5">Montant total</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">Actions CRUD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCmsBookings.map(bk => (
                    <tr key={bk.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-stone-900">{bk.id}</div>
                        <div className="font-semibold text-emerald-950">{bk.listingTitle}</div>
                        <div className="text-[10px] text-stone-500">{bk.listingCommune}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-stone-900">{bk.travelerName}</div>
                        <div className="text-[10px] text-stone-500">{bk.travelerEmail}</div>
                      </td>
                      <td className="p-3.5 text-stone-700">
                        <div className="font-medium">{new Date(bk.startDate).toLocaleDateString('fr-FR')} → {new Date(bk.endDate).toLocaleDateString('fr-FR')}</div>
                        <div className="text-[10px] text-stone-500">{bk.nightsCount} nuits • {bk.guestsCount} voyageurs</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-stone-900">{bk.totalPrice} €</div>
                        <div className="text-[10px] text-stone-500">Net hôte: {bk.hostNetEarnings} € • Comm: {bk.serviceFee} €</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          bk.status === 'confirmee'
                            ? 'bg-emerald-100 text-emerald-800'
                            : bk.status === 'en_attente_hote'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}>
                          {bk.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditBookingModal(bk)}
                            className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                            title="Modifier la réservation"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'booking', id: bk.id, title: `Réservation ${bk.id}` })}
                            className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Annuler/Supprimer la réservation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCmsBookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-500">
                        Aucune réservation trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: PLATFORM SETTINGS */}
      {/* ======================================================== */}
      {cmsSection === 'settings' && (
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            updatePlatformSettings(settingsForm);
          }} 
          className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6 max-w-3xl"
        >
          <div>
            <h3 className="text-base font-bold text-stone-900">Paramètres Généraux du CMS MyStay</h3>
            <p className="text-xs text-stone-500">Configurez les variables éditoriales, économiques et d'annonce de la plateforme en temps réel.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 uppercase mb-1">Accroche de la page d'accueil (Hero Tagline)</label>
              <input
                type="text"
                value={settingsForm.heroTagline}
                onChange={(e) => setSettingsForm({ ...settingsForm, heroTagline: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 uppercase mb-1">Sous-titre explicatif</label>
              <textarea
                rows={2}
                value={settingsForm.heroSubheadline}
                onChange={(e) => setSettingsForm({ ...settingsForm, heroSubheadline: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Taux de commission plateforme (%)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  value={settingsForm.commissionRatePercent}
                  onChange={(e) => setSettingsForm({ ...settingsForm, commissionRatePercent: parseFloat(e.target.value) || 12 })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Taxe de séjour forfaitaire (€ / nuit)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.10"
                  value={settingsForm.touristTaxPerNight}
                  onChange={(e) => setSettingsForm({ ...settingsForm, touristTaxPerNight: parseFloat(e.target.value) || 1.50 })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 uppercase mb-1">Bandeau d'annonce / Engagement de la Charte</label>
              <input
                type="text"
                value={settingsForm.charterAnnouncement}
                onChange={(e) => setSettingsForm({ ...settingsForm, charterAnnouncement: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              id="cms-save-settings-btn"
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-2 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer la configuration</span>
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* SECTION 5: ARCHITECTURE & API */}
      {/* ======================================================== */}
      {cmsSection === 'architecture' && (
        <NoCodeInspectorModal embedded={true} />
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE / EDIT LISTING */}
      {/* ======================================================== */}
      {isListingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingListing ? `Modifier l'hébergement : ${editingListing.title}` : 'Créer un nouvel hébergement (CMS)'}
              </h3>
              <button onClick={() => setIsListingModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveListingForm} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Titre de l'annonce *</label>
                <input
                  type="text"
                  required
                  value={listingForm.title}
                  onChange={(e) => setListingForm({ ...listingForm, title: e.target.value })}
                  placeholder="ex: Le Mas des Abeilles Sauvages"
                  className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Région rurale</label>
                  <select
                    value={listingForm.region || 'Occitanie'}
                    onChange={(e) => {
                      const newReg = e.target.value;
                      const comms = getCommunesForRegion(newReg);
                      const firstC = comms[0];
                      setListingForm({
                        ...listingForm,
                        region: newReg,
                        commune: firstC ? firstC.name : (listingForm.commune || ''),
                        department: firstC ? firstC.department : (listingForm.department || '')
                      });
                    }}
                    className="w-full p-2.5 border border-stone-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-700"
                  >
                    {RURAL_REGIONS.map(r => (
                      <option key={r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Commune rurale *</label>
                  <select
                    value={listingForm.commune || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const found = findRuralCommune(listingForm.region || 'Occitanie', val);
                      setListingForm({
                        ...listingForm,
                        commune: val,
                        department: found ? found.department : listingForm.department
                      });
                    }}
                    className="w-full p-2.5 border border-stone-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="" disabled>-- Sélectionner une commune rurale --</option>
                    {getCommunesForRegion(listingForm.region || 'Occitanie').map(c => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.department})
                      </option>
                    ))}
                    {listingForm.commune && !findRuralCommune(listingForm.region || 'Occitanie', listingForm.commune) && (
                      <option value={listingForm.commune}>{listingForm.commune} (personnalisée)</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Département *</label>
                  <input
                    type="text"
                    required
                    value={listingForm.department}
                    onChange={(e) => setListingForm({ ...listingForm, department: e.target.value })}
                    placeholder="ex: Lozère (48)"
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Prix / nuit (€)</label>
                  <input
                    type="number"
                    min="20"
                    max="1000"
                    required
                    value={listingForm.pricePerNight}
                    onChange={(e) => setListingForm({ ...listingForm, pricePerNight: Number(e.target.value) })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Capacité</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={listingForm.capacity}
                    onChange={(e) => setListingForm({ ...listingForm, capacity: Number(e.target.value) })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Chambres</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={listingForm.bedrooms}
                    onChange={(e) => setListingForm({ ...listingForm, bedrooms: Number(e.target.value) })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Statut</label>
                  <select
                    value={listingForm.status}
                    onChange={(e) => setListingForm({ ...listingForm, status: e.target.value as ListingStatus })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="publiee">Publiée</option>
                    <option value="en_attente">En attente</option>
                    <option value="a_modifier">À modifier</option>
                    <option value="rejetee">Rejetée</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Description détaillée</label>
                <textarea
                  rows={3}
                  value={listingForm.description}
                  onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })}
                  className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  📸 Image Principale du Site d'Accueil (Où le voyageur séjournera)
                </label>
                <input
                  type="text"
                  value={listingForm.images?.[0] || ''}
                  onChange={(e) => setListingForm({ 
                    ...listingForm, 
                    images: [e.target.value, ...(listingForm.images?.slice(1) || [])],
                    siteImageUrl: e.target.value
                  })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  🎬 Vidéo de Présentation du Site & d'Accueil (YouTube / Vimeo / MP4)
                </label>
                <input
                  type="text"
                  value={listingForm.videoUrl || ''}
                  onChange={(e) => setListingForm({ ...listingForm, videoUrl: e.target.value, videos: e.target.value ? [e.target.value] : [] })}
                  placeholder="https://www.youtube.com/watch?v=... ou https://.../visite.mp4"
                  className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsListingModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
                >
                  {editingListing ? 'Sauvegarder les modifications' : 'Créer l\'hébergement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE / EDIT USER */}
      {/* ======================================================== */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingUser ? `Modifier l'utilisateur : ${editingUser.name}` : 'Ajouter un utilisateur (CMS)'}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveUserForm} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Nom et Prénom *</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="ex: Marianne Dubois"
                  className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="marianne@example.fr"
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Rôle</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="voyageur">Voyageur</option>
                    <option value="hote">Hôte rural</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Mot de passe</label>
                  <input
                    type="text"
                    value={userForm.password || ''}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {userForm.role === 'hote' && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <input
                    type="checkbox"
                    id="user-is-verified"
                    checked={!!userForm.isHostVerified}
                    onChange={(e) => setUserForm({ ...userForm, isHostVerified: e.target.checked })}
                    className="rounded border-stone-300 text-emerald-700"
                  />
                  <label htmlFor="user-is-verified" className="font-semibold text-amber-900 cursor-pointer">
                    Hôte vérifié (Charte éco-tourisme & documents conformes)
                  </label>
                </div>
              )}

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Biographie / Notes internes</label>
                <textarea
                  rows={2}
                  value={userForm.bio}
                  onChange={(e) => setUserForm({ ...userForm, bio: e.target.value })}
                  className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
                >
                  {editingUser ? 'Sauvegarder l\'utilisateur' : 'Créer l\'utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE / EDIT BOOKING */}
      {/* ======================================================== */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingBooking ? `Modifier réservation : ${editingBooking.id}` : 'Créer une réservation manuelle (CMS)'}
              </h3>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveBookingForm} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Gîte réservé *</label>
                <select
                  value={bookingForm.listingId}
                  onChange={(e) => {
                    const l = listings.find(item => item.id === e.target.value);
                    setBookingForm({
                      ...bookingForm,
                      listingId: e.target.value,
                      listingTitle: l?.title || 'Gîte'
                    });
                  }}
                  className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                >
                  {listings.map(l => (
                    <option key={l.id} value={l.id}>{l.title} ({l.commune}) - {l.pricePerNight} €/nuit</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Nom du voyageur</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.travelerName}
                    onChange={(e) => setBookingForm({ ...bookingForm, travelerName: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Email voyageur</label>
                  <input
                    type="email"
                    required
                    value={bookingForm.travelerEmail}
                    onChange={(e) => setBookingForm({ ...bookingForm, travelerEmail: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Date d'arrivée</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.startDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Date de départ</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.endDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Montant Total (€)</label>
                  <input
                    type="number"
                    required
                    value={bookingForm.totalPrice}
                    onChange={(e) => setBookingForm({ ...bookingForm, totalPrice: Number(e.target.value) })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Nbre voyageurs</label>
                  <input
                    type="number"
                    min="1"
                    value={bookingForm.guestsCount}
                    onChange={(e) => setBookingForm({ ...bookingForm, guestsCount: Number(e.target.value) })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Statut</label>
                  <select
                    value={bookingForm.status}
                    onChange={(e) => setBookingForm({ ...bookingForm, status: e.target.value as BookingStatus })}
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="confirmee">Confirmée</option>
                    <option value="en_attente_hote">En attente hôte</option>
                    <option value="terminee">Terminée</option>
                    <option value="annulee">Annulée</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
                >
                  {editingBooking ? 'Sauvegarder réservation' : 'Enregistrer réservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ======================================================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-base text-stone-900">Confirmer la suppression ?</h4>
              <p className="text-xs text-stone-600 mt-1">
                Êtes-vous certain de vouloir supprimer définitivement <strong>{deleteConfirm.title}</strong> ? Cette opération est irréversible.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                Annuler
              </button>
              <button
                id="btn-confirm-delete"
                type="button"
                onClick={confirmDeleteAction}
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
