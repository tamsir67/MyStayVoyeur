import React, { useState, useEffect } from 'react';
import {
  Database, RefreshCw, CheckCircle2, AlertTriangle, XCircle,
  ExternalLink, Download, Upload, Copy, Check, ShieldCheck,
  Zap, Table, ArrowUpRight, ArrowDownLeft, FileSpreadsheet,
  Layers, Clock, Info, Key, X, Sparkles
} from 'lucide-react';
import { airtableService, AirtableStatusData, AirtableLogItem } from '../services/airtableService';
import { useApp } from '../context/AppContext';

interface AirtableSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AirtableSyncModal: React.FC<AirtableSyncModalProps> = ({ isOpen, onClose }) => {
  const { showNotification, refreshBookings, refreshListings, refreshUsers, refreshReviews, refreshMessages } = useApp();

  const [activeTab, setActiveTab] = useState<'sync' | 'csv' | 'config' | 'logs'>('sync');
  const [config, setConfig] = useState<AirtableStatusData | null>(null);
  const [logs, setLogs] = useState<AirtableLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Form states
  const [baseIdInput, setBaseIdInput] = useState<string>('appIt4PVIpjgrmhri');
  const [tokenInput, setTokenInput] = useState<string>('');
  const [autoSyncState, setAutoSyncState] = useState<boolean>(true);
  const [syncEngine, setSyncEngine] = useState<'airtable' | 'supabase' | 'local'>('airtable');

  // Action loading states
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);

  // CSV Import state
  const [rawJsonImport, setRawJsonImport] = useState<string>('');
  const [targetTable, setTargetTable] = useState<'Listings' | 'Bookings' | 'Users' | 'Reviews'>('Listings');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await airtableService.getConfig();
      if (res?.data) {
        setConfig(res.data);
        setBaseIdInput(res.data.baseId || 'appIt4PVIpjgrmhri');
        setAutoSyncState(res.data.autoSync ?? true);
        setSyncEngine(res.data.syncMode || 'airtable');
      }
      if (res?.logs) {
        setLogs(res.logs);
      }
    } catch (err: any) {
      console.warn('Erreur chargement config Airtable:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsTesting(true);
    try {
      const res = await airtableService.updateConfig({
        baseId: baseIdInput.trim() || 'appIt4PVIpjgrmhri',
        token: tokenInput.trim() || undefined,
        autoSync: autoSyncState,
        syncMode: syncEngine
      });

      if (res.testResult) {
        setTestResult(res.testResult);
        if (res.testResult.success) {
          showNotification('Airtable Connecté !', res.testResult.message, 'success');
        } else {
          showNotification('Attention', res.testResult.message, 'warning');
        }
      } else {
        showNotification('Succès', 'Paramètres Airtable enregistrés.', 'success');
      }

      await loadData();
    } catch (err: any) {
      showNotification('Erreur', err.message || 'Impossible de sauvegarder', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handlePushSync = async () => {
    setIsPushing(true);
    try {
      const res = await airtableService.syncPush();
      if (res.success) {
        showNotification('Synchronisation réussie !', res.message, 'success');
      } else {
        showNotification('Synchronisation partielle ou bloquée', res.message, 'warning');
      }
      await loadData();
    } catch (err: any) {
      showNotification('Erreur synchronisation', err.message || 'Échec de synchronisation vers Airtable', 'error');
    } finally {
      setIsPushing(false);
    }
  };

  const handlePullSync = async () => {
    setIsPulling(true);
    try {
      const res = await airtableService.syncPull();
      if (res.success) {
        showNotification('Données importées !', res.message, 'success');
        await Promise.all([refreshBookings(), refreshListings(), refreshUsers(), refreshReviews(), refreshMessages()]);
      } else {
        showNotification('Erreur import', res.message, 'warning');
      }
      await loadData();
    } catch (err: any) {
      showNotification('Erreur', err.message || 'Impossible de récupérer les données Airtable', 'error');
    } finally {
      setIsPulling(false);
    }
  };

  const handleTestToken = async () => {
    setIsTesting(true);
    try {
      const res = await airtableService.testConnection(baseIdInput, tokenInput.trim() || undefined);
      setTestResult(res);
      if (res.success) {
        showNotification('Test de connexion réussi', res.message, 'success');
      } else {
        showNotification('Vérification requise', res.message, 'warning');
      }
      await loadData();
    } catch (err: any) {
      showNotification('Erreur de test', err.message || 'Échec du test de connexion', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleImportJson = async () => {
    if (!rawJsonImport.trim()) {
      showNotification('Données vides', 'Veuillez coller le JSON ou les lignes de données à importer.', 'warning');
      return;
    }

    try {
      let parsed = JSON.parse(rawJsonImport);
      if (!Array.isArray(parsed)) {
        if (parsed.records && Array.isArray(parsed.records)) {
          parsed = parsed.records.map((r: any) => r.fields || r);
        } else {
          parsed = [parsed];
        }
      }
      const res = await airtableService.importData(targetTable, parsed);
      if (res.success) {
        showNotification('Importation réussie', res.message, 'success');
        setRawJsonImport('');
        await Promise.all([refreshBookings(), refreshListings(), refreshUsers(), refreshReviews(), refreshMessages()]);
        await loadData();
      } else {
        showNotification('Erreur import', res.message, 'error');
      }
    } catch (e: any) {
      showNotification('Format JSON invalide', 'Le format saisi n\'est pas un JSON valide.', 'error');
    }
  };

  const isConnected = Boolean(config?.hasToken && testResult?.success !== false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#18392b] via-[#243E36] to-[#2c4f45] text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-[#A3E5C8]/40 flex items-center justify-center text-[#A3E5C8] shadow-inner">
              <Database className="w-6 h-6 text-[#A3E5C8]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
                  Synchronisation Base de Données Airtable
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#A3E5C8]/20 text-[#A3E5C8] border border-[#A3E5C8]/40">
                  Base : {baseIdInput}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-xl">
                Connexion directe de votre base Airtable <strong className="text-white">appIt4PVIpjgrmhri</strong> en remplacement de Supabase, avec synchronisation bidirectionnelle.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Connection Status Banner */}
        <div className="bg-[#FAF9F5] border-b border-stone-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full ${config?.hasToken ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-semibold text-stone-800">
              {config?.hasToken 
                ? `Connecté à Airtable (${baseIdInput})` 
                : `Base ${baseIdInput} identifiée — Clé Token requise pour l'API automatique`}
            </span>
            {config?.lastSyncAt && (
              <span className="text-stone-500 border-l border-stone-300 pl-2">
                Dernière synchro : {new Date(config.lastSyncAt).toLocaleTimeString('fr-FR')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://airtable.com/appIt4PVIpjgrmhri"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#243E36] hover:text-[#18392b] font-medium flex items-center gap-1 hover:underline"
            >
              <span>Ouvrir sur Airtable</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 px-6 bg-stone-50 overflow-x-auto text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'sync'
                ? 'border-[#243E36] text-[#243E36] bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Zap className="w-4 h-4 text-[#8C5E45]" />
            <span>Synchronisation Directe</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'csv'
                ? 'border-[#243E36] text-[#243E36] bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Export & Import CSV (1-Clic)</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'config'
                ? 'border-[#243E36] text-[#243E36] bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Key className="w-4 h-4 text-amber-600" />
            <span>Clé API & Configuration</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'logs'
                ? 'border-[#243E36] text-[#243E36] bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Journaux ({logs.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* TAB 1: SYNCHRONISATION DIRECTE */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              
              {/* Notice why sync was blocked before */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-xs sm:text-sm text-stone-700 space-y-1">
                  <h4 className="font-bold text-stone-900 text-sm">
                    Votre base Airtable est désormais branchée à la plateforme !
                  </h4>
                  <p>
                    Auparavant, la plateforme n'acceptait que des identifiants Supabase (URL + Clé Anon PostgreSQL). 
                    Nous avons désormais configuré <strong className="text-emerald-900">Airtable (Base : appIt4PVIpjgrmhri)</strong> comme moteur principal.
                  </p>
                  <p className="text-[11px] text-stone-500 pt-1">
                    💡 Vous pouvez soit lancer la synchronisation automatique par API (avec un token), soit télécharger directement les tables CSV pré-remplies pour les importer dans votre Airtable en 10 secondes.
                  </p>
                </div>
              </div>

              {/* Quick Token Bar if not configured or success badge */}
              {!config?.hasToken ? (
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                      <Key className="w-4 h-4 text-amber-700" />
                      <span>Clé Token Airtable (Pour synchroniser en direct avec l'API)</span>
                    </div>
                    <a
                      href="https://airtable.com/create/tokens"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-semibold text-emerald-800 underline hover:text-emerald-950 flex items-center gap-1"
                    >
                      <span>Créer un token sur Airtable</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-stone-600">
                    Pour que MyStay puisse écrire et lire directement dans votre base <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px] font-bold">appIt4PVIpjgrmhri</code>, collez votre Personal Access Token (commençant par <code className="font-mono">pat...</code>) :
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="password"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="Collez votre Personal Access Token (pat...)"
                      className="flex-1 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl px-3 py-2 font-mono outline-hidden focus:ring-2 focus:ring-[#243E36]"
                    />
                    <button
                      onClick={() => handleSaveConfig()}
                      disabled={isTesting || !tokenInput.trim()}
                      className="px-4 py-2 bg-[#243E36] hover:bg-[#1A2E28] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isTesting ? 'Validation...' : 'Connecter le Token'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs sm:text-sm font-semibold text-emerald-950">
                      Token Airtable connecté ({config.maskedToken}) — Synchronisation en direct activée pour <code className="font-mono font-bold">{config.baseId}</code>
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('config')}
                    className="text-xs font-bold text-[#243E36] hover:underline cursor-pointer ml-2 shrink-0"
                  >
                    Gérer la clé
                  </button>
                </div>
              )}

              {/* Action Cards: PUSH & PULL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Push to Airtable */}
                <div className="bg-white border-2 border-stone-200 rounded-2xl p-5 flex flex-col justify-between hover:border-[#243E36]/50 transition shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-2.5 bg-[#243E36]/10 text-[#243E36] rounded-xl font-bold">
                        <ArrowUpRight className="w-5 h-5" />
                      </span>
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                        MyStay ➔ Airtable
                      </span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-base mb-1">
                      Envoyer vers Airtable (Push)
                    </h3>
                    <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                      Exporte et synchronise toutes les données locales (hébergements, réservations, utilisateurs et avis) directement dans votre base <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-[11px]">appIt4PVIpjgrmhri</code>.
                    </p>
                  </div>
                  <button
                    onClick={handlePushSync}
                    disabled={isPushing}
                    className="w-full py-2.5 px-4 bg-[#243E36] hover:bg-[#1A2E28] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isPushing ? 'animate-spin' : ''}`} />
                    <span>{isPushing ? 'Synchronisation en cours...' : 'Synchroniser tout vers Airtable'}</span>
                  </button>
                </div>

                {/* Pull from Airtable */}
                <div className="bg-white border-2 border-stone-200 rounded-2xl p-5 flex flex-col justify-between hover:border-[#8C5E45]/50 transition shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-2.5 bg-[#8C5E45]/10 text-[#8C5E45] rounded-xl font-bold">
                        <ArrowDownLeft className="w-5 h-5" />
                      </span>
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                        Airtable ➔ MyStay
                      </span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-base mb-1">
                      Importer depuis Airtable (Pull)
                    </h3>
                    <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                      Récupère les dernières annonces ou réservations saisies directement dans Airtable pour mettre à jour l'application en temps réel.
                    </p>
                  </div>
                  <button
                    onClick={handlePullSync}
                    disabled={isPulling}
                    className="w-full py-2.5 px-4 bg-[#8C5E45] hover:bg-[#734b36] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isPulling ? 'animate-spin' : ''}`} />
                    <span>{isPulling ? 'Importation en cours...' : 'Importer depuis Airtable'}</span>
                  </button>
                </div>

              </div>

              {/* Data Summary Grid */}
              <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="bg-stone-50 px-4 py-3 border-b border-stone-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Statut des Tables Airtable Prévues
                  </span>
                  <span className="text-xs text-stone-500">
                    Base : <strong className="font-mono text-stone-800">appIt4PVIpjgrmhri</strong>
                  </span>
                </div>
                <div className="divide-y divide-stone-100 text-xs sm:text-sm">
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <div>
                        <div className="font-semibold text-stone-900">Table "Listings" (Hébergements)</div>
                        <div className="text-[11px] text-stone-500">Titres, tarifs, photos, labels écologiques, coordonnées GPS</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#243E36] bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                      {config?.stats?.listings ?? 0} enregistrements
                    </span>
                  </div>

                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <div>
                        <div className="font-semibold text-stone-900">Table "Bookings" (Réservations)</div>
                        <div className="text-[11px] text-stone-500">Dates de séjour, voyageurs, paiements Stripe, codes digicode, bilan CO2</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#243E36] bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                      {config?.stats?.bookings ?? 0} enregistrements
                    </span>
                  </div>

                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <div>
                        <div className="font-semibold text-stone-900">Table "Users" (Utilisateurs & Hôtes)</div>
                        <div className="text-[11px] text-stone-500">Comptes utilisateurs, téléphones, avatars, badges vérifiés</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#243E36] bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                      {config?.stats?.users ?? 0} enregistrements
                    </span>
                  </div>

                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <div>
                        <div className="font-semibold text-stone-900">Table "Reviews" (Avis vérifiés)</div>
                        <div className="text-[11px] text-stone-500">Notes 1 à 5 étoiles, commentaires et retours d'expérience</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#243E36] bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                      {config?.stats?.reviews ?? 0} enregistrements
                    </span>
                  </div>
                </div>
              </div>

              {/* Auto-Sync Toggle */}
              <div className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Synchronisation automatique en direct</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Envoie immédiatement chaque nouvelle réservation ou annonce dans Airtable dès sa création.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSyncState}
                    onChange={(e) => {
                      setAutoSyncState(e.target.checked);
                      airtableService.updateConfig({ autoSync: e.target.checked });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#243E36]"></div>
                </label>
              </div>

            </div>
          )}

          {/* TAB 2: EXPORT & IMPORT CSV (1-CLIC SANS TOKEN) */}
          {activeTab === 'csv' && (
            <div className="space-y-6">
              
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-stone-700 space-y-1.5">
                <div className="font-bold text-stone-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-amber-700" />
                  <span>Méthode Immédiate sans clé API (Export / Import CSV)</span>
                </div>
                <p>
                  Si vous n'avez pas encore généré de Personal Access Token sur Airtable, vous pouvez <strong>télécharger directement les 4 tables au format CSV</strong> prêt pour Airtable et les glisser-déposer dans votre base <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px]">appIt4PVIpjgrmhri</code>.
                </p>
              </div>

              {/* 4 CSV Download Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="/api/airtable/export-csv/listings"
                  download="MyStay_LISTINGS_Airtable.csv"
                  className="p-4 bg-white border border-stone-200 rounded-2xl hover:border-emerald-600 transition flex items-center justify-between group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-105 transition">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 text-sm">Table Listings (CSV)</div>
                      <div className="text-[11px] text-stone-500">12 hébergements avec photos & labels</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#243E36] group-hover:underline">Télécharger</span>
                </a>

                <a
                  href="/api/airtable/export-csv/bookings"
                  download="MyStay_BOOKINGS_Airtable.csv"
                  className="p-4 bg-white border border-stone-200 rounded-2xl hover:border-emerald-600 transition flex items-center justify-between group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-105 transition">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 text-sm">Table Bookings (CSV)</div>
                      <div className="text-[11px] text-stone-500">Réservations, montants & statuts</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#243E36] group-hover:underline">Télécharger</span>
                </a>

                <a
                  href="/api/airtable/export-csv/users"
                  download="MyStay_USERS_Airtable.csv"
                  className="p-4 bg-white border border-stone-200 rounded-2xl hover:border-emerald-600 transition flex items-center justify-between group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-105 transition">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 text-sm">Table Users (CSV)</div>
                      <div className="text-[11px] text-stone-500">Voyageurs, hôtes et administrateurs</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#243E36] group-hover:underline">Télécharger</span>
                </a>

                <a
                  href="/api/airtable/export-csv/reviews"
                  download="MyStay_REVIEWS_Airtable.csv"
                  className="p-4 bg-white border border-stone-200 rounded-2xl hover:border-emerald-600 transition flex items-center justify-between group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-105 transition">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 text-sm">Table Reviews (CSV)</div>
                      <div className="text-[11px] text-stone-500">Avis vérifiés et notes de séjours</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#243E36] group-hover:underline">Télécharger</span>
                </a>

                <a
                  href="/api/airtable/export-csv/messages"
                  download="MyStay_MESSAGES_Airtable.csv"
                  className="p-4 bg-white border border-stone-200 rounded-2xl hover:border-emerald-600 transition flex items-center justify-between group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-105 transition">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 text-sm">Table Messages (CSV)</div>
                      <div className="text-[11px] text-stone-500">Échanges et messagerie voyageurs-hôtes</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#243E36] group-hover:underline">Télécharger</span>
                </a>
              </div>

              {/* Import Back into MyStay */}
              <div className="border border-stone-200 rounded-2xl p-5 bg-stone-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#243E36]" />
                    <span>Réimporter des données depuis Airtable</span>
                  </div>
                  <select
                    value={targetTable}
                    onChange={(e: any) => setTargetTable(e.target.value)}
                    className="text-xs bg-white border border-stone-300 rounded-lg px-2.5 py-1 font-semibold text-stone-700"
                  >
                    <option value="Listings">Table Listings</option>
                    <option value="Bookings">Table Bookings</option>
                    <option value="Users">Table Users</option>
                    <option value="Reviews">Table Reviews</option>
                    <option value="Messages">Table Messages</option>
                  </select>
                </div>
                <textarea
                  value={rawJsonImport}
                  onChange={(e) => setRawJsonImport(e.target.value)}
                  placeholder="Collez ici le JSON exporté d'Airtable (ex: [ { 'id': '...', 'title': '...' } ]) ou les données de votre table..."
                  rows={4}
                  className="w-full text-xs font-mono p-3 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#243E36] outline-hidden"
                />
                <button
                  onClick={handleImportJson}
                  className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importer dans MyStay</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: CONFIGURATION & CLÉ TOKEN */}
          {activeTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="space-y-6">
              
              {/* Step-by-step instructions */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
                <div className="font-bold text-stone-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-700" />
                    <span>Comment obtenir votre Token Airtable en 30 secondes :</span>
                  </span>
                  <a
                    href="https://airtable.com/create/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#243E36] text-white text-xs font-bold rounded-xl hover:bg-[#1A2E28] transition flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Créer le Token sur Airtable</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-stone-600 pl-1">
                  <li>Cliquez sur le bouton ci-dessus pour ouvrir <strong>airtable.com/create/tokens</strong>.</li>
                  <li>Cliquez sur <strong>+ Create new token</strong> et nommez-le (ex: <em>MyStay Platform</em>).</li>
                  <li>Sous <strong>Scopes</strong>, ajoutez : <code className="bg-stone-200 px-1 py-0.5 rounded font-mono text-[11px]">data.records:read</code>, <code className="bg-stone-200 px-1 py-0.5 rounded font-mono text-[11px]">data.records:write</code>, et <code className="bg-stone-200 px-1 py-0.5 rounded font-mono text-[11px]">schema.bases:read</code>.</li>
                  <li>Sous <strong>Access</strong>, sélectionnez votre base <strong>appIt4PVIpjgrmhri</strong> (ou <em>All workspaces</em>).</li>
                  <li>Copiez le token généré (commençant par <code className="bg-stone-200 px-1 py-0.5 rounded font-mono text-[11px]">pat...</code>) et collez-le ci-dessous.</li>
                </ol>
              </div>

              {/* Form inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Airtable Base ID
                  </label>
                  <input
                    type="text"
                    value={baseIdInput}
                    onChange={(e) => setBaseIdInput(e.target.value)}
                    placeholder="appIt4PVIpjgrmhri"
                    className="w-full text-sm font-mono p-3 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#243E36] outline-hidden"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Pré-rempli avec votre identifiant de base Airtable <strong className="text-stone-700">appIt4PVIpjgrmhri</strong>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Personal Access Token (PAT)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder={config?.maskedToken ? `Actuel : ${config.maskedToken}` : 'patXXXXXXXXXXXXXX.XXXXXXXX...'}
                      className="w-full text-sm font-mono p-3 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#243E36] outline-hidden pr-24"
                    />
                    <button
                      type="button"
                      onClick={handleTestToken}
                      disabled={isTesting}
                      className="absolute right-2 top-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg transition"
                    >
                      {isTesting ? 'Test...' : 'Tester'}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Token sécurisé injecté côté serveur pour dialoguer avec l'API Airtable.
                  </p>
                </div>

                {/* Primary Database Engine Selector */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Moteur de base de données principal
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setSyncEngine('airtable')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        syncEngine === 'airtable'
                          ? 'border-[#243E36] bg-emerald-50/60 ring-2 ring-[#243E36]'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className="font-bold text-xs text-stone-900 flex items-center justify-between">
                        <span>Airtable (Actif)</span>
                        {syncEngine === 'airtable' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">appIt4PVIpjgrmhri</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSyncEngine('supabase')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        syncEngine === 'supabase'
                          ? 'border-[#243E36] bg-emerald-50/60 ring-2 ring-[#243E36]'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className="font-bold text-xs text-stone-900 flex items-center justify-between">
                        <span>Supabase (PostgreSQL)</span>
                        {syncEngine === 'supabase' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">Alternative SQL</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSyncEngine('local')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        syncEngine === 'local'
                          ? 'border-[#243E36] bg-emerald-50/60 ring-2 ring-[#243E36]'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className="font-bold text-xs text-stone-900 flex items-center justify-between">
                        <span>Stockage Local</span>
                        {syncEngine === 'local' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">Disque serveur Node.js</div>
                    </button>
                  </div>
                </div>

                {/* Save button */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isTesting}
                    className="px-6 py-2.5 bg-[#243E36] hover:bg-[#1A2E28] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Enregistrer la configuration</span>
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* TAB 4: LOGS & HISTORIQUE */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Dernières requêtes de synchronisation ({logs.length})
                </span>
                <button
                  onClick={loadData}
                  className="text-xs text-[#243E36] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Actualiser</span>
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-10 text-stone-500 text-xs">
                  Aucun journal de synchronisation enregistré pour l'instant.
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1 font-mono"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                            log.status === 'success' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : log.status === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-stone-600 font-bold">{log.table}</span>
                        </div>
                        <span className="text-stone-400">
                          {new Date(log.timestamp).toLocaleTimeString('fr-FR')} • {log.durationMs}ms
                        </span>
                      </div>
                      <div className="text-stone-800 break-words font-sans text-xs">
                        {log.details}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 border-t border-stone-200 px-6 py-3.5 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Base ID : <code className="font-mono font-bold text-stone-800">appIt4PVIpjgrmhri</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-xl transition cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
