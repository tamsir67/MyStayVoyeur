import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Listing, MyStayLabel, Review, AuditLog 
} from '../types';
import { 
  ShieldCheck, AlertCircle, CheckCircle2, XCircle, 
  Leaf, Trees, HeartHandshake, Shield, Star, 
  Clock, Eye, MessageSquare, Database, ArrowRight, 
  BarChart3, RefreshCw, Send, Check, SlidersHorizontal,
  FileSpreadsheet, Download, Video, Play, Image as ImageIcon, MessageSquarePlus, Lock, ExternalLink
} from 'lucide-react';
import { AdminCMSPanel } from './AdminCMSPanel';
import { NoCodeInspectorModal } from './NoCodeInspectorModal';
import { exportBookingsToCsv } from '../utils/exportBookingsCsv';

export const AdminDashboard: React.FC = () => {
  const { 
    currentUser, listings, moderateListing, reviews, 
    moderateReview, auditLogs, bookings, showNotification,
    openAirtableModal 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'cms' | 'architecture' | 'moderation' | 'reviews' | 'audit_logs' | 'impact' | 'supabase'>('cms');
  const [filterStatus, setFilterStatus] = useState<string>('en_attente');
  const [selectedListingForDecision, setSelectedListingForDecision] = useState<Listing | null>(null);

  // Decision state for selected listing
  const [chosenLabels, setChosenLabels] = useState<MyStayLabel[]>(['eco_responsable', 'authentique']);
  const [adminComment, setAdminComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  // Export CSV handler for bookings from Supabase
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

  // Filter listings
  const filteredListings = listings.filter(l => {
    if (filterStatus === 'all') return true;
    return l.status === filterStatus;
  });

  // Calculate platform metrics
  const totalGMV = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalCommission = bookings.reduce((sum, b) => sum + b.serviceFee, 0);
  const totalCo2Saved = listings.reduce((sum, l) => sum + l.impactScoreKgCo2SavedPerNight * 15, 0);
  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(1, reviews.length)).toFixed(2);

  const handleOpenDecision = (listing: Listing) => {
    setSelectedListingForDecision(listing);
    setChosenLabels(listing.labels || ['eco_responsable']);
    setAdminComment('');
  };

  const handleDecision = (action: 'valider' | 'a_modifier' | 'rejeter') => {
    if (!selectedListingForDecision) return;
    setIsProcessing(true);

    setTimeout(() => {
      moderateListing(
        selectedListingForDecision.id,
        action,
        chosenLabels,
        adminComment || (action === 'valider' ? 'Annonce vérifiée et conforme à la charte MyStay.' : 'Demande d’ajustement des informations.')
      );
      setIsProcessing(false);
      setSelectedListingForDecision(null);
    }, 400);
  };

  const toggleChosenLabel = (label: MyStayLabel) => {
    setChosenLabels(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const allPossibleLabels: { id: MyStayLabel; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'eco_responsable', label: 'Éco-responsable', icon: <Leaf className="w-3.5 h-3.5" />, desc: 'Pratiques environnementales vérifiées' },
    { id: 'authentique', label: 'Authentique', icon: <Trees className="w-3.5 h-3.5" />, desc: 'Patrimoine, bâtisse et matériaux locaux' },
    { id: 'accueil_engage', label: 'Accueil engagé', icon: <HeartHandshake className="w-3.5 h-3.5" />, desc: 'Transmission, conseils et produits du terroir' },
    { id: 'rural_prioritaire', label: 'Rural prioritaire', icon: <Shield className="w-3.5 h-3.5" />, desc: 'Territoire rural à revitaliser touristiquement' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Admin Banner */}
      <div className="bg-[#1F2923] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#2D453B] rounded-xl text-[#A3E5C8]">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="font-serif text-2xl font-bold">
              Back-Office Modération MyStay
            </h1>
          </div>
          <p className="text-xs text-stone-300 mt-2 max-w-2xl">
            Garantissez la qualité et le respect de la charte de tourisme rural durable. Contrôlez l'authenticité des hébergements, attribuez les labels officiels et auditez les actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="admin-btn-sync-airtable"
            onClick={openAirtableModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-95 text-white rounded-2xl font-bold text-xs shadow-sm transition cursor-pointer border border-emerald-400/40"
            title="Synchroniser la base Airtable appIt4PVIpjgrmhri"
          >
            <Database className="w-4 h-4 text-emerald-100" />
            <span>Airtable Sync (appIt4PVIpjgrmhri)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          </button>

          <button
            id="admin-btn-export-bookings-csv"
            onClick={handleExportBookingsCsv}
            disabled={isExportingCsv}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2A3E34] hover:bg-[#344e41] active:scale-95 text-white rounded-2xl font-bold text-xs shadow-sm transition disabled:opacity-50 cursor-pointer border border-[#3A5347]"
            title="Exporter les données de la table 'bookings' de Supabase au format CSV"
          >
            {isExportingCsv ? (
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-100" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            )}
            <span>Export CSV</span>
          </button>

          <div className="flex items-center gap-4 bg-[#2A3E34] px-4 py-2.5 rounded-2xl border border-[#3A5347] text-xs">
            <div>
              <div className="text-stone-400 text-[10px] uppercase font-bold">Modérateur actif</div>
              <div className="font-bold text-white">{currentUser.name}</div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          id="admin-tab-cms"
          onClick={() => setActiveTab('cms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'cms'
              ? 'bg-[#243E36] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>CMS Plateforme (CRUD Global)</span>
        </button>

        <button
          id="admin-tab-architecture"
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'architecture'
              ? 'bg-[#243E36] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Architecture & API</span>
        </button>

        <button
          id="admin-tab-moderation"
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'moderation'
              ? 'bg-[#243E36] text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>File de modération annonces ({listings.filter(l => l.status === 'en_attente').length} en attente)</span>
        </button>

        <button
          id="admin-tab-reviews"
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'reviews'
              ? 'bg-[#243E36] text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Modération des avis ({reviews.length})</span>
        </button>

        <button
          id="admin-tab-audit"
          onClick={() => setActiveTab('audit_logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'audit_logs'
              ? 'bg-[#243E36] text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Journal d'audit ({auditLogs.length} entrées)</span>
        </button>

        <button
          id="admin-tab-impact"
          onClick={() => setActiveTab('impact')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'impact'
              ? 'bg-[#243E36] text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Tableau de bord & Impact rural</span>
        </button>

        <button
          id="admin-tab-supabase"
          onClick={() => setActiveTab('supabase')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'supabase'
              ? 'bg-[#059669] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-300" />
          <span>Base de données (Airtable / Supabase)</span>
        </button>
      </div>

      {/* Tab 0: Platform CMS (CRUD) */}
      {activeTab === 'cms' && (
        <AdminCMSPanel />
      )}

      {/* Tab Architecture & API */}
      {activeTab === 'architecture' && (
        <NoCodeInspectorModal embedded={true} />
      )}

      {/* Tab 1: Moderation Queue */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          
          {/* Status filter bar */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold text-stone-500 mr-2">Filtrer par statut :</span>
            {[
              { id: 'en_attente', label: 'En attente', count: listings.filter(l => l.status === 'en_attente').length },
              { id: 'publiee', label: 'Publiées', count: listings.filter(l => l.status === 'publiee').length },
              { id: 'a_modifier', label: 'À modifier', count: listings.filter(l => l.status === 'a_modifier').length },
              { id: 'rejetee', label: 'Rejetées', count: listings.filter(l => l.status === 'rejetee').length },
              { id: 'all', label: 'Toutes', count: listings.length }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setFilterStatus(s.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === s.id
                    ? 'bg-[#243E36] text-white'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span>{s.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filterStatus === s.id ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  {s.count}
                </span>
              </button>
            ))}
          </div>

          {/* List of submissions */}
          <div className="space-y-4">
            {filteredListings.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
                Aucune annonce ne correspond à ce filtre.
              </div>
            ) : (
              filteredListings.map(listing => (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={(listing.images && listing.images[0]) || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'}
                      alt={listing.title}
                      className="w-24 h-20 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          listing.status === 'publiee'
                            ? 'bg-emerald-100 text-emerald-800'
                            : listing.status === 'en_attente'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : listing.status === 'a_modifier'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {listing.status === 'publiee' && 'Publiée'}
                          {listing.status === 'en_attente' && '⚠️ En attente de validation'}
                          {listing.status === 'a_modifier' && 'À modifier'}
                          {listing.status === 'rejetee' && 'Rejetée'}
                        </span>

                        {listing.modificationRequest && listing.modificationRequest.status === 'pending' && (
                          <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <MessageSquarePlus className="w-3 h-3" /> Demande de modification de l'hôte
                          </span>
                        )}

                        <span className="text-[10px] bg-stone-100 text-stone-700 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ImageIcon className="w-2.5 h-2.5" /> {listing.images?.length || 1} photo(s)
                        </span>

                        {(listing.videoUrl || (listing.videos && listing.videos.length > 0)) && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Play className="w-2.5 h-2.5 fill-amber-700 text-amber-700" /> Vidéo
                          </span>
                        )}

                        <span className="text-xs text-stone-400">Réf: {listing.id}</span>
                      </div>

                      <h3 className="font-serif font-bold text-base text-stone-900">
                        {listing.title}
                      </h3>
                      <p className="text-xs text-stone-500">
                        Localisation : <strong>{listing.commune} ({listing.department})</strong> • Hôte : {listing.hostName}
                      </p>

                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <span className="text-[11px] font-semibold text-[#243E36] bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E6E4DD]">
                          🌱 {(listing.sustainablePractices || []).length} pratiques durables
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {listing.pricePerNight} €/nuit • {listing.capacity} pers.
                        </span>
                        {listing.adminComment && (
                          <span className="text-[11px] text-amber-800 italic bg-amber-50 px-2 py-0.5 rounded">
                            « {listing.adminComment} »
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                    <button
                      id={`inspect-listing-btn-${listing.id}`}
                      onClick={() => handleOpenDecision(listing)}
                      className="px-4 py-2 rounded-xl bg-[#243E36] hover:bg-[#1B2F29] text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Examiner & Décider</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* Tab 2: Reviews Moderation */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200">
            <h3 className="font-serif font-bold text-base text-stone-900 mb-1">
              Contrôle de conformité des avis
            </h3>
            <p className="text-xs text-stone-500">
              Assurez la sincérité des retours d'expérience. Les avis signalés ou diffamatoires peuvent être masqués avec motif.
            </p>
          </div>

          <div className="space-y-3">
            {reviews.map(review => (
              <div key={review.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-stone-900">{review.travelerName}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-xs text-amber-600 font-bold flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> {review.rating}/5
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      review.status === 'valid' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {review.status === 'valid' ? 'En ligne' : 'Masqué par modération'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 italic">« {review.comment} »</p>
                  <div className="text-[11px] text-stone-400">
                    Logement concerné : {review.listingId} • Réservation : {review.bookingId}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {review.status === 'valid' ? (
                    <button
                      onClick={() => moderateReview(review.id, 'hidden')}
                      className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                    >
                      Masquer l'avis
                    </button>
                  ) : (
                    <button
                      onClick={() => moderateReview(review.id, 'valid')}
                      className="px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition cursor-pointer"
                    >
                      Rétablir l'avis
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === 'audit_logs' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Journal d'audit & Traçabilité des décisions
            </h3>
            <p className="text-xs text-stone-500">
              Conformément à la règle de gestion 4.7 : chaque action sensible (validation, modification, paiement, signalement) est historisée.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] text-stone-500 uppercase border-y border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Date & Heure</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Auteur</th>
                  <th className="py-2.5 px-3">Détails opérationnels</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-3 whitespace-nowrap text-stone-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleDateString('fr-FR')} {new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-stone-900">
                      <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded font-mono text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-stone-600 font-medium">
                      {log.authorName} ({log.authorRole})
                    </td>
                    <td className="py-2.5 px-3 text-stone-700 max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Impact & Analytics */}
      {activeTab === 'impact' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200">
              <div className="text-xs text-stone-500 uppercase font-semibold">Volume d'affaires (GMV)</div>
              <div className="text-2xl font-bold font-serif text-stone-900 mt-1">{totalGMV.toFixed(2)} €</div>
              <div className="text-[11px] text-stone-400 mt-1">Total des séjours ruraux réservés</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200">
              <div className="text-xs text-stone-500 uppercase font-semibold">Commissions MyStay (12%)</div>
              <div className="text-2xl font-bold font-serif text-[#243E36] mt-1">{totalCommission.toFixed(2)} €</div>
              <div className="text-[11px] text-stone-400 mt-1">Revenus de fonctionnement plateforme</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200">
              <div className="text-xs text-stone-500 uppercase font-semibold">Impact Carbone Évité</div>
              <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">~{totalCo2Saved.toFixed(0)} kg CO₂e</div>
              <div className="text-[11px] text-stone-400 mt-1">Par rapport au tourisme standard</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200">
              <div className="text-xs text-stone-500 uppercase font-semibold">Satisfaction Voyageurs</div>
              <div className="text-2xl font-bold font-serif text-amber-600 mt-1">{averageRating} / 5</div>
              <div className="text-[11px] text-stone-400 mt-1">Calculée sur les séjours certifiés</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Airtable & Supabase Interconnection Panel */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          {/* Airtable Integration Card */}
          <div className="bg-gradient-to-br from-[#1b3d30] via-[#243E36] to-[#172d24] text-white p-6 sm:p-7 rounded-3xl shadow-md border border-emerald-800/40 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="p-2 bg-white/10 rounded-xl text-[#A3E5C8] border border-[#A3E5C8]/30">
                    <Database className="w-5 h-5" />
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    Connecteur Actif
                  </span>
                  <span className="font-mono text-xs text-stone-300">Base ID : appIt4PVIpjgrmhri</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Base de Données Airtable (appIt4PVIpjgrmhri)
                </h3>
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                  Cette base Airtable remplace ou complète Supabase. Vous pouvez synchroniser automatiquement toutes les annonces, réservations, utilisateurs et avis en direct (API ou Export CSV 1-clic).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
                <button
                  id="admin-open-airtable-sync-modal"
                  onClick={openAirtableModal}
                  className="px-5 py-3 bg-[#A3E5C8] hover:bg-[#8ee0bc] text-[#132c22] font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <RefreshCw className="w-4 h-4 text-[#132c22]" />
                  <span>Ouvrir le Hub de Synchronisation</span>
                </button>

                <a
                  href="https://airtable.com/appIt4PVIpjgrmhri"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-2xl border border-white/20 transition flex items-center justify-center gap-1.5"
                >
                  <span>Voir sur Airtable</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

         
        </div>
      )}

      {/* Moderation Decision Modal */}
      {selectedListingForDecision && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF9F5]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#243E36]" />
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Examen de l'annonce : {selectedListingForDecision.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedListingForDecision(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              
              {/* Demande de modification de l'hôte (si existante) */}
              {selectedListingForDecision.modificationRequest && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-300 space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                    <MessageSquarePlus className="w-4 h-4 text-amber-700" />
                    <span>Demande de modification envoyée par l'hôte :</span>
                  </div>
                  <p className="text-amber-900 bg-white p-2.5 rounded-xl border border-amber-200 text-xs leading-relaxed italic">
                    « {selectedListingForDecision.modificationRequest.details} »
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-amber-800 pt-0.5">
                    <span>Statut : {selectedListingForDecision.modificationRequest.status === 'pending' ? '⏳ En attente de traitement admin' : '✅ Traitée'}</span>
                    <span className="text-stone-500">Règle : Seul l'administrateur peut modifier après publication</span>
                  </div>
                </div>
              )}

              {/* Photos & Vidéo du site soumises par l'hôte */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Photos soumises par l'hôte ({selectedListingForDecision.images?.length || 1})</span>
                  </span>
                  {(selectedListingForDecision.videoUrl || (selectedListingForDecision.videos && selectedListingForDecision.videos.length > 0)) && (
                    <span className="text-[10px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-amber-700 text-amber-700" /> Vidéo incluse
                    </span>
                  )}
                </div>

                {/* Galerie miniatures */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {selectedListingForDecision.images?.map((imgUrl, idx) => (
                    <a 
                      key={idx} 
                      href={imgUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="relative aspect-4/3 rounded-xl overflow-hidden border border-stone-200 group block bg-stone-100"
                    >
                      <img src={imgUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1 rounded">
                          Couverture
                        </span>
                      )}
                    </a>
                  ))}
                </div>

                {/* Lecteur Vidéo si l'hôte a posté un lien ou un fichier */}
                {(selectedListingForDecision.videoUrl || (selectedListingForDecision.videos && selectedListingForDecision.videos[0])) && (
                  <div className="pt-2 border-t border-stone-100 space-y-1.5">
                    <div className="font-bold text-stone-700 text-[11px] flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Vidéo de présentation du lieu :</span>
                    </div>
                    {(() => {
                      const vUrl = selectedListingForDecision.videoUrl || selectedListingForDecision.videos?.[0] || '';
                      return (
                        <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-black max-h-48 border border-stone-200">
                          {vUrl.includes('youtube.com') || vUrl.includes('youtu.be') ? (
                            <iframe
                              src={vUrl.replace('watch?v=', 'embed/').split('&')[0]}
                              title="Lecteur modération YouTube"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : vUrl.includes('vimeo.com') ? (
                            <iframe
                              src={`https://player.vimeo.com/video/${vUrl.split('/').pop()}`}
                              title="Lecteur modération Vimeo"
                              className="w-full h-full border-0"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video src={vUrl} controls className="w-full h-full object-cover" />
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Verification Checklist */}
              <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-stone-200 space-y-2">
                <div className="font-bold text-stone-800 text-xs">
                  Critères d'éligibilité Charte MyStay (Section 5.1) :
                </div>
                <div className="space-y-1 text-stone-600">
                  <div>✓ <strong>Localisation rurale :</strong> {selectedListingForDecision.commune} ({selectedListingForDecision.department}) - Hors zone urbaine dense.</div>
                  <div>✓ <strong>Authenticité :</strong> Bâtisse de type {selectedListingForDecision.propertyType}.</div>
                  <div>✓ <strong>Engagements durables :</strong> {(selectedListingForDecision.sustainablePractices || []).length} pratiques déclarées (minimum 3 requis).</div>
                </div>
              </div>

              {/* Attribution of official MyStay Labels */}
              <div className="space-y-2">
                <label className="block font-bold text-stone-800 text-xs">
                  Attribution des labels officiels MyStay (Section 5.2) :
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {allPossibleLabels.map(item => {
                    const isSelected = chosenLabels.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleChosenLabel(item.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center gap-2 ${
                          isSelected ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold' : 'bg-white border-stone-200 text-stone-600'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                          isSelected ? 'bg-emerald-700 text-white' : 'border border-stone-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <div>{item.label}</div>
                          <div className="text-[10px] text-stone-400 font-normal">{item.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Comment field */}
              <div className="space-y-1">
                <label className="block font-bold text-stone-800 text-xs">
                  Commentaire de modération (transmis à l'hôte) :
                </label>
                <textarea
                  rows={3}
                  value={adminComment}
                  onChange={e => setAdminComment(e.target.value)}
                  placeholder="Justification de la décision, conseils d'amélioration ou message de bienvenue..."
                  className="w-full p-3 rounded-xl border border-stone-300 outline-none focus:border-[#243E36]"
                />
              </div>

              {/* Decision Action Buttons */}
              <div className="pt-4 border-t border-stone-200 grid grid-cols-3 gap-3">
                <button
                  id="admin-validate-btn"
                  onClick={() => handleDecision('valider')}
                  disabled={isProcessing}
                  className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider & Publier</span>
                </button>

                <button
                  id="admin-request-changes-btn"
                  onClick={() => handleDecision('a_modifier')}
                  disabled={isProcessing}
                  className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>À modifier</span>
                </button>

                <button
                  id="admin-reject-btn"
                  onClick={() => handleDecision('rejeter')}
                  disabled={isProcessing}
                  className="py-2.5 px-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Rejeter</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
