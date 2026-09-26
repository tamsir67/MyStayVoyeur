import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Database, Workflow, CreditCard, Layers, ExternalLink, 
  CheckCircle2, Clock, Play, RefreshCw, FileText, 
  ArrowRight, ShieldCheck, Sparkles, Filter 
} from 'lucide-react';
import { SupabaseConnectionPanel } from './SupabaseConnectionPanel';

export interface NoCodeInspectorModalProps {
  embedded?: boolean;
}

export const NoCodeInspectorModal: React.FC<NoCodeInspectorModalProps> = ({ embedded = false }) => {
  const { 
    listings, bookings, reviews, auditLogs, makeExecutions, 
    triggerMakeScenario, showNotification, openAirtableModal 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'airtable' | 'make' | 'stripe' | 'softr' | 'supabase'>('airtable');
  const [selectedTable, setSelectedTable] = useState<'Listings' | 'Bookings' | 'Reviews' | 'Users' | 'Audit_Logs'>('Listings');

  const airtableTables: { id: typeof selectedTable; label: string; count: number; fieldsCount: number }[] = [
    { id: 'Listings', label: 'Listings (Hébergements)', count: listings.length, fieldsCount: 18 },
    { id: 'Bookings', label: 'Bookings (Réservations)', count: bookings.length, fieldsCount: 16 },
    { id: 'Reviews', label: 'Reviews (Avis vérifiés)', count: reviews.length, fieldsCount: 9 },
    { id: 'Audit_Logs', label: 'Audit_Logs (Journal)', count: auditLogs.length, fieldsCount: 6 }
  ];

  const handleTestScenario = (name: string, event: string) => {
    triggerMakeScenario(name, event, 'Exécution manuelle de test déclenchée depuis l’inspecteur Make');
    showNotification('Scénario Make exécuté', `Le webhook "${name}" a été déclenché avec succès.`, 'success');
  };

  return (
    <div className={embedded ? "space-y-6 animate-in fade-in duration-200" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200"}>
      
      {/* Blueprint Header */}
      <div className="bg-[#1E293B] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-700">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-800 rounded-xl text-sky-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold">
                Inspecteur de la Stack No-Code MyStay
              </h1>
              <span className="text-[11px] font-mono text-sky-300">
                Spécifications : Softr / Glide + Airtable + Make + Stripe
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
            Cet inspecteur temps réel permet d'auditer l'architecture sous-jacente du cahier des charges : explorez les tables Airtable vivantes, examinez les webhooks Make déclenchés et vérifiez les ventilations Stripe Connect.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">Synchronisation live active</span>
        </div>
      </div>

      {/* Stack Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('airtable')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'airtable'
              ? 'bg-[#E11D48] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>1. Base de données Airtable</span>
        </button>

        <button
          onClick={() => setActiveTab('make')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'make'
              ? 'bg-[#6D28D9] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Workflow className="w-4 h-4" />
          <span>2. Scénarios Make & Webhooks</span>
        </button>

        <button
          onClick={() => setActiveTab('stripe')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'stripe'
              ? 'bg-[#635BFF] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>3. Stripe Connect (Split Payment)</span>
        </button>

        <button
          onClick={() => setActiveTab('softr')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'softr'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>4. Modèle Softr / Glide (Frontend)</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'supabase'
              ? 'bg-[#059669] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>5. Supabase (Découplé & Séparé)</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
            activeTab === 'supabase' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            Actif
          </span>
        </button>
      </div>

      {/* Tab 1: Airtable Explorer */}
      {activeTab === 'airtable' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-mono">
                  Base ID : appIt4PVIpjgrmhri
                </span>
                <span className="text-xs text-stone-400">• Base branchée active</span>
                <button
                  onClick={openAirtableModal}
                  className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Synchroniser cette base</span>
                </button>
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-900 mt-1">
                Visualiseur de Tables Airtable (Base appIt4PVIpjgrmhri)
              </h3>
            </div>

            {/* Table Switcher */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {airtableTables.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTable(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedTable === t.id
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span>{t.label}</span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table Data View */}
          <div className="border border-stone-200 rounded-2xl overflow-x-auto">
            {selectedTable === 'Listings' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F5] text-stone-600 uppercase border-b border-stone-200 font-mono text-[10px]">
                  <tr>
                    <th className="p-3">ID (Primary)</th>
                    <th className="p-3">Title (Single Line)</th>
                    <th className="p-3">Status (Single Select)</th>
                    <th className="p-3">Labels MyStay (Multi-Select)</th>
                    <th className="p-3">Price / Night (Currency)</th>
                    <th className="p-3">Commune & Dept (Text)</th>
                    <th className="p-3">Booking Mode</th>
                    <th className="p-3">Host (Linked Record)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-sans">
                  {listings.map(l => (
                    <tr key={l.id} className="hover:bg-stone-50">
                      <td className="p-3 font-mono font-bold text-stone-900">{l.id}</td>
                      <td className="p-3 font-medium text-stone-800 max-w-xs truncate">{l.title}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          l.status === 'publiee' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 flex-wrap">
                          {l.labels.map(lbl => (
                            <span key={lbl} className="bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded text-[10px]">
                              {lbl}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-[#243E36]">{l.pricePerNight} €</td>
                      <td className="p-3 text-stone-600">{l.commune} ({l.department})</td>
                      <td className="p-3 text-stone-500 font-mono text-[11px]">{l.bookingMode}</td>
                      <td className="p-3 text-stone-700">{l.hostName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTable === 'Bookings' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F5] text-stone-600 uppercase border-b border-stone-200 font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Booking ID</th>
                    <th className="p-3">Listing (Linked)</th>
                    <th className="p-3">Dates (Arrival / Departure)</th>
                    <th className="p-3">Traveler</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Total Paid (Stripe)</th>
                    <th className="p-3">Host Net (88%)</th>
                    <th className="p-3">Service Fee (12%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-sans">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-stone-50">
                      <td className="p-3 font-mono font-bold text-stone-900">{b.id}</td>
                      <td className="p-3 font-medium text-stone-800 max-w-xs truncate">{b.listingTitle}</td>
                      <td className="p-3 text-stone-600 whitespace-nowrap">
                        {b.startDate} → {b.endDate} ({b.nightsCount}n)
                      </td>
                      <td className="p-3 text-stone-700">{b.travelerName}</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-[#243E36]">{b.totalPrice.toFixed(2)} €</td>
                      <td className="p-3 font-semibold text-stone-700">{b.hostNetEarnings.toFixed(2)} €</td>
                      <td className="p-3 text-[#8C5E45]">{b.serviceFee.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTable === 'Reviews' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F5] text-stone-600 uppercase border-b border-stone-200 font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Review ID</th>
                    <th className="p-3">Traveler</th>
                    <th className="p-3">Overall Rating</th>
                    <th className="p-3">Sub-Ratings (JSON / Rollup)</th>
                    <th className="p-3">Comment</th>
                    <th className="p-3">Host Reply</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-sans">
                  {reviews.map(r => (
                    <tr key={r.id} className="hover:bg-stone-50">
                      <td className="p-3 font-mono font-bold">{r.id}</td>
                      <td className="p-3">{r.travelerName}</td>
                      <td className="p-3 font-bold text-amber-600">{r.rating} / 5</td>
                      <td className="p-3 text-[10px] text-stone-500 font-mono">
                        {r.subRatings ? `P:${r.subRatings.cleanliness} A:${r.subRatings.authenticity} E:${r.subRatings.ecoResponsibility} H:${r.subRatings.hostWelcome}` : '—'}
                      </td>
                      <td className="p-3 max-w-sm truncate text-stone-700 italic">« {r.comment} »</td>
                      <td className="p-3 text-stone-600">{r.hostReply?.text ? 'Oui' : 'Non'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTable === 'Audit_Logs' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F5] text-stone-600 uppercase border-b border-stone-200 font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Log ID</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Author</th>
                    <th className="p-3">Details</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-sans">
                  {auditLogs.slice(0, 8).map(l => (
                    <tr key={l.id} className="hover:bg-stone-50">
                      <td className="p-3 font-mono">{l.id}</td>
                      <td className="p-3 font-bold text-stone-900">{l.action}</td>
                      <td className="p-3 text-stone-600">{l.authorName}</td>
                      <td className="p-3 text-stone-700 max-w-md">{l.details}</td>
                      <td className="p-3 text-stone-400 font-mono text-[11px]">{new Date(l.timestamp).toLocaleTimeString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Make Scenarios */}
      {activeTab === 'make' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Scénarios d'Automatisation Make (Integromat)
              </h3>
              <p className="text-xs text-stone-500">
                Ces 3 flux automatisés pilotent les notifications, les emails transactionnels et la synchronisation Airtable / Stripe sans code.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    Scénario 1 : Paiement Stripe
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <h4 className="font-bold text-xs text-stone-900">
                  Stripe Checkout → Airtable & Email Voyageur
                </h4>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Déclenché sur <code>stripe.payment_intent.succeeded</code>. Crée la ligne réservation, débloque l'adresse exacte et expédie le guide d'arrivée écologique.
                </p>
                <button
                  onClick={() => handleTestScenario('Scénario 1 : Paiement Stripe', 'stripe.payment_intent.succeeded')}
                  className="w-full py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  <span>Tester le scénario</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-sky-200 bg-sky-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                    Scénario 2 : Nouvelle Annonce
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <h4 className="font-bold text-xs text-stone-900">
                  Airtable New Listing → Slack Admin Alert
                </h4>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Déclenché sur soumission d'annonce statut <code>en_attente</code>. Notifie le canal modération MyStay et accuse réception auprès de l'hôte.
                </p>
                <button
                  onClick={() => handleTestScenario('Scénario 2 : Nouvelle Annonce', 'airtable.record.created')}
                  className="w-full py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  <span>Tester le scénario</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Scénario 3 : Clôture Séjour
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <h4 className="font-bold text-xs text-stone-900">
                  Date Départ → Relance Avis Vérifié 14j
                </h4>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Déclenché à J+1 du départ. Transmet le formulaire sécurisé d'avis vérifié et calcule les indicateurs d'impact environnemental.
                </p>
                <button
                  onClick={() => handleTestScenario('Scénario 3 : Clôture Séjour', 'airtable.formula_trigger')}
                  className="w-full py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  <span>Tester le scénario</span>
                </button>
              </div>
            </div>
          </div>

          {/* Execution History */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
            <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              Journal des dernières exécutions de webhooks Make
            </h4>

            <div className="space-y-2">
              {makeExecutions.map(exec => (
                <div key={exec.id} className="p-3 bg-[#FAF9F5] rounded-xl border border-stone-200 text-xs flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="font-bold text-stone-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{exec.scenarioName}</span>
                      <span className="font-mono text-[10px] text-stone-400">({exec.triggerEvent})</span>
                    </div>
                    <p className="text-stone-600 text-[11px]">{exec.payloadSummary}</p>
                  </div>
                  <div className="text-right text-[10px] text-stone-400 font-mono shrink-0">
                    <div>{exec.executionTimeMs} ms</div>
                    <div>{new Date(exec.timestamp).toLocaleTimeString('fr-FR')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Stripe Connect Flow */}
      {activeTab === 'stripe' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Architecture Stripe Connect & Répartition Financière
            </h3>
            <p className="text-xs text-stone-500">
              Spécification du cahier des charges : encaissement sécurisé, prélèvement de la commission MyStay (12%) et virement net vers l'hôte.
            </p>
          </div>

          {/* Split diagram */}
          <div className="p-6 bg-[#FAF9F5] rounded-2xl border border-stone-200 space-y-4">
            <div className="font-bold text-xs uppercase tracking-wider text-stone-500">
              Flux d'un paiement de séjour exemple (440.20 € TTC)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-stone-200 text-center space-y-1">
                <div className="text-xs text-stone-500">1. Voyageur règle par CB / Apple Pay</div>
                <div className="text-2xl font-bold font-serif text-stone-900">440.20 €</div>
                <div className="text-[10px] text-emerald-700 font-semibold">Stripe Checkout Hosted</div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-1">
                <div className="text-xs text-emerald-800">2. Net versé à l'Hôte (Stripe Custom)</div>
                <div className="text-2xl font-bold font-serif text-emerald-900">338.80 €</div>
                <div className="text-[10px] text-emerald-700 font-semibold">Virement bancaire SEPA à J+2</div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center space-y-1">
                <div className="text-xs text-amber-800">3. Commission MyStay (12%) + Taxes</div>
                <div className="text-2xl font-bold font-serif text-amber-900">101.40 €</div>
                <div className="text-[10px] text-amber-700 font-semibold">Frais service plateforme & taxe séjour</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Softr / Glide UI Blocks Mapping */}
      {activeTab === 'softr' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Mapping des Blocs UI Softr & Glide
            </h3>
            <p className="text-xs text-stone-500">
              Correspondance exacte des briques No-Code configurées dans le MVP :
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-stone-200 space-y-2 bg-[#FAF9F5]">
              <div className="font-bold text-sm text-[#243E36]">Bloc Softr : Dynamic Marketplace Grid</div>
              <p className="text-stone-600">
                Alimenté directement par la table Airtable <code>Listings</code> filtrée sur <code>Status = "publiee"</code>. Filtres instantanés par Tags (Labels MyStay) et champ de recherche régional.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-stone-200 space-y-2 bg-[#FAF9F5]">
              <div className="font-bold text-sm text-[#243E36]">Bloc Softr : Custom Form & File Upload</div>
              <p className="text-stone-600">
                Formulaire hôte en étapes validant les 3 pratiques durables minimum requises. Enregistrement direct dans Airtable avec statut automatique <code>en_attente</code>.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-stone-200 space-y-2 bg-[#FAF9F5]">
              <div className="font-bold text-sm text-[#243E36]">Glide / Softr : User Roles & Conditional Visibility</div>
              <p className="text-stone-600">
                Gestion des droits étanches (Voyageur, Hôte, Administrateur). Les coordonnées et l'adresse exacte sont masquées tant que la réservation n'est pas confirmée.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-stone-200 space-y-2 bg-[#FAF9F5]">
              <div className="font-bold text-sm text-[#243E36]">Stripe Checkout Extension</div>
              <p className="text-stone-600">
                Bouton de paiement dynamique avec calcul des frais en temps réel et redirection vers webhook Make après succès.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Supabase Decoupled Connection Panel */}
      {activeTab === 'supabase' && (
        <SupabaseConnectionPanel />
      )}

    </div>
  );
};
