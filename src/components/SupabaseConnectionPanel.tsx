import React, { useState, useEffect } from 'react';
import { 
  Database, Server, Globe, CheckCircle2, AlertTriangle, XCircle, 
  Copy, Check, RefreshCw, Send, ShieldCheck, FileCode, Play, Sparkles, Terminal,
  FileSpreadsheet
} from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured, getSupabaseUrl } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';
import { exportBookingsToCsv } from '../utils/exportBookingsCsv';

export const SupabaseConnectionPanel: React.FC = () => {
  const { showNotification, seedExampleBookings, refreshBookings } = useApp();

  const [supabaseUrlInput, setSupabaseUrlInput] = useState<string>(getSupabaseUrl() || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [copiedProfilesSql, setCopiedProfilesSql] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'status' | 'architecture' | 'sql' | 'logs'>('status');
  const [sqlViewMode, setSqlViewMode] = useState<'full' | 'profiles'>('profiles');

  // Diagnostic states
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [clientStatus, setClientStatus] = useState<any>(null);
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [profilesSql, setProfilesSql] = useState<string>('');
  const [queryLogs, setQueryLogs] = useState<any[]>([]);

  // Load status on mount
  const refreshStatus = async () => {
    setIsTesting(true);
    try {
      // 1. Check frontend client status
      const direct = await supabaseService.testDirectConnection();
      setClientStatus(direct);

      // 2. Check backend API status
      const backendRes = await supabaseService.getBackendSupabaseStatus();
      if (backendRes?.data) {
        setBackendStatus(backendRes.data);
        if (backendRes.data.url && !supabaseUrlInput && !backendRes.data.url.includes('Non')) {
          setSupabaseUrlInput(backendRes.data.url.replace('...', ''));
        }
      }
      if (backendRes?.logs) {
        setQueryLogs(backendRes.logs);
      }

      // 3. Load SQL Schema for preview
      const schemaRes = await fetch('/api/supabase/schema');
      if (schemaRes.ok) {
        const text = await schemaRes.text();
        setSqlSchema(text);
      }

      // 4. Load Profiles SQL script
      const profilesSqlRes = await fetch('/api/supabase/profiles-sql');
      if (profilesSqlRes.ok) {
        const pText = await profilesSqlRes.text();
        setProfilesSql(pText);
      }
    } catch (e: any) {
      console.warn('Erreur diagnostic Supabase:', e);
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const handleSaveAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrlInput || !supabaseKeyInput) {
      showNotification('Champs manquants', 'Veuillez saisir l\'URL et la clé API Supabase.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const res = await supabaseService.configureBackendSupabase(supabaseUrlInput, supabaseKeyInput);
      if (res.success) {
        showNotification('Supabase connecté !', res.message, 'success');
        await refreshStatus();
        await refreshBookings();
      } else {
        showNotification('Erreur de connexion', res.message, 'error');
      }
    } catch (err: any) {
      showNotification('Erreur inattendue', err.message || 'Impossible de contacter le serveur', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopySql = () => {
    if (!sqlSchema) return;
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    showNotification('Script SQL complet copié !', 'Collez-le dans l\'Éditeur SQL de votre projet Supabase.', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleCopyProfilesSql = () => {
    if (!profilesSql) return;
    navigator.clipboard.writeText(profilesSql);
    setCopiedProfilesSql(true);
    showNotification('Script Profiles copié !', 'Collez-le dans l\'Éditeur SQL Supabase pour débloquer et remplir la table profiles.', 'success');
    setTimeout(() => setCopiedProfilesSql(false), 3000);
  };

  const handleSeedData = async () => {
    try {
      await seedExampleBookings();
      showNotification('Données de test insérées', 'Des réservations de test ont été écrites dans votre base.', 'success');
      await refreshStatus();
    } catch (err: any) {
      showNotification('Erreur d\'insertion', err.message, 'error');
    }
  };

  const handleExportCsv = async () => {
    setIsExportingCsv(true);
    try {
      const result = await exportBookingsToCsv();
      if (result.success) {
        showNotification('Export CSV Supabase réussi', result.message, 'success');
      } else {
        showNotification('Information export', result.message, 'warning');
      }
    } catch (err: any) {
      showNotification('Erreur export', err.message || 'Impossible d\'exporter les réservations en CSV.', 'error');
    } finally {
      setIsExportingCsv(false);
    }
  };

  const isBackendConnected = backendStatus?.connected || backendStatus?.ready;
  const isDirectConnected = isSupabaseConfigured && clientStatus?.connected;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-8 animate-in fade-in">
      
      {/* Header section with badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                Interconnexion Supabase & Architecture Découplée
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                PostgreSQL Cloud • Accès Séparé Frontend (Client SDK) & Backend (API Sécurisée)
              </p>
            </div>
          </div>
          <p className="text-xs text-stone-600 mt-2 max-w-3xl leading-relaxed">
            Pour interconnecter votre propre projet Supabase de manière étanche et séparée, 
            MyStay met en œuvre deux couches distinctes : un <strong>client frontend typé</strong> pour les requêtes autorisées avec RLS, 
            et un <strong>service backend Node/Express</strong> pour les transactions sensibles et la persistance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="supabase-panel-export-bookings-csv-btn"
            onClick={handleExportCsv}
            disabled={isExportingCsv}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            title="Exporter les données de la table 'bookings' de Supabase au format CSV"
          >
            {isExportingCsv ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            )}
            <span>Exporter table 'bookings' (CSV)</span>
          </button>

          <button
            onClick={refreshStatus}
            disabled={isTesting}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>Tester l'état</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('status')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'status' 
              ? 'bg-[#243E36] text-white shadow-xs' 
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>1. Diagnostic & Connexion</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'architecture' 
              ? 'bg-[#243E36] text-white shadow-xs' 
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>2. Schéma d'Architecture Séparée</span>
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'sql' 
              ? 'bg-[#243E36] text-white shadow-xs' 
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>3. Script SQL (schema.sql)</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'logs' 
              ? 'bg-[#243E36] text-white shadow-xs' 
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>4. Logs de Requêtes ({queryLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: DIAGNOSTIC & FORMULAIRE DE CONNEXION */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          
          {/* Status Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Backend Connection Card */}
            <div className={`p-5 rounded-2xl border transition ${
              isBackendConnected 
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  <span className="font-bold text-sm">Couche Backend (API Express & server/db.ts)</span>
                </div>
                {isBackendConnected ? (
                  <span className="flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connecté à Supabase
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Option 1 : Base Serveur Active
                  </span>
                )}
              </div>
              <p className="text-xs mt-2 opacity-80 leading-relaxed">
                {isBackendConnected 
                  ? `Connecté à l'instance Supabase. Les mutations (POST/PATCH/DELETE) sont directement écrites dans PostgreSQL.`
                  : `Option 1 active : Toutes les données (utilisateurs, photos, réservations, annonces et avis) sont stockées de façon persistante dans la base locale du serveur (/data/*.json) avec latence 0 ms et sans dépendance externe.`}
              </p>
              <div className="mt-3 text-[11px] font-mono opacity-90 flex items-center gap-2">
                <span>Mode stockage :</span> 
                <strong className="px-2 py-0.5 bg-white/70 border border-stone-200 rounded text-stone-900">
                  {backendStatus?.mode === 'server_persistent_disk' ? 'Option 1 (Base Persistante Serveur)' : (backendStatus?.mode || 'server_persistent_disk')}
                </strong>
              </div>
            </div>

            {/* Frontend Connection Card */}
            <div className={`p-5 rounded-2xl border transition ${
              isDirectConnected 
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                : 'bg-stone-50 border-stone-200 text-stone-700'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  <span className="font-bold text-sm">Couche Frontend (src/lib/supabaseClient.ts)</span>
                </div>
                {isDirectConnected ? (
                  <span className="flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Direct Client Prêt
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold bg-stone-200 text-stone-700 px-2.5 py-1 rounded-full">
                    Via API Backend
                  </span>
                )}
              </div>
              <p className="text-xs mt-2 opacity-80 leading-relaxed">
                Le frontend interagit de façon transparente via l'API sécurisée. Si vous renseignez <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code>, le client typé direct s'active automatiquement avec gestion RLS.
              </p>
              <div className="mt-3 text-[11px] font-mono opacity-90">
                Client typé : <strong>{isDirectConnected ? 'Actif (Client Direct)' : 'Délégation vers API Express'}</strong>
              </div>
            </div>

          </div>

          {/* Tables Status Check */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center justify-between">
              <span>État des Tables PostgreSQL dans Supabase</span>
              <span className="text-xs font-sans font-normal text-stone-500">Vérifié automatiquement</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              
              <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-stone-800">public.profiles</div>
                  <div className="text-[11px] text-stone-500">Profils, rôles & avatars</div>
                </div>
                {backendStatus?.usersCount > 0 || clientStatus?.tables?.profiles ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Prête
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                    En attente SQL
                  </span>
                )}
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-stone-800">public.listings</div>
                  <div className="text-[11px] text-stone-500">Hébergements & Labels</div>
                </div>
                {backendStatus?.listingsCount > 0 || clientStatus?.tables?.listings ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Prête
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-stone-400 flex items-center gap-1">
                    En attente SQL
                  </span>
                )}
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-stone-800">public.bookings</div>
                  <div className="text-[11px] text-stone-500">Réservations & Paiements</div>
                </div>
                {backendStatus?.bookingsCount > 0 || clientStatus?.tables?.bookings ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Prête
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-stone-400 flex items-center gap-1">
                    En attente SQL
                  </span>
                )}
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-stone-800">public.reviews</div>
                  <div className="text-[11px] text-stone-500">Avis éco-tourisme</div>
                </div>
                {backendStatus?.reviewsCount > 0 || clientStatus?.tables?.reviews ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Prête
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-stone-400 flex items-center gap-1">
                    En attente SQL
                  </span>
                )}
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-stone-800">public.messages</div>
                  <div className="text-[11px] text-stone-500">Messagerie interne</div>
                </div>
                {backendStatus?.messagesCount > 0 || clientStatus?.tables?.messages ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Prête
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-stone-400 flex items-center gap-1">
                    En attente SQL
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* Form to connect credentials */}
          <form onSubmit={handleSaveAndConnect} className="p-6 rounded-2xl border border-stone-200 bg-[#FAF9F5] space-y-4">
            <div>
              <h4 className="font-serif font-bold text-sm text-stone-900">
                Connecter votre projet Supabase séparé
              </h4>
              <p className="text-xs text-stone-500">
                Saisissez l'URL de votre projet Supabase et votre clé API (clé <code>anon</code> ou <code>service_role</code>). 
                Ces clés seront automatiquement enregistrées et appliquées au backend et au fichier d'environnement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Project URL Supabase
                </label>
                <input
                  type="url"
                  placeholder="https://votre-projet.supabase.co"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#243E36] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Clé API Supabase (anon ou service_role)
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#243E36] font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-stone-500">
                💡 Retrouvez ces identifiants dans Supabase : <em>Project Settings &gt; API</em>.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSeedData}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-200 hover:bg-stone-300 text-stone-800 transition cursor-pointer flex items-center gap-1.5 w-full sm:w-auto justify-center"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#8C5E45]" />
                  <span>Insérer 3 réservations de test</span>
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#243E36] hover:bg-[#1b2f29] text-white transition cursor-pointer flex items-center gap-2 shadow-xs w-full sm:w-auto justify-center"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Enregistrer & Interconnecter</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

        </div>
      )}

      {/* TAB 2: ARCHITECTURE SCHÉMA */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="p-6 bg-[#FAF9F5] rounded-2xl border border-stone-200 space-y-4">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Comment fonctionne l'interconnexion de façon séparée ?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Pour garantir la sécurité et la séparation stricte des responsabilités (SOC), 
              la plateforme MyStay n'expose jamais vos clés secrètes au navigateur et découpe les flux en 3 blocs autonomes :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
              {/* Couche 1: Client Frontend */}
              <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wide">
                  <Globe className="w-4 h-4" />
                  <span>1. Frontend Client</span>
                </div>
                <div className="font-mono text-xs font-bold text-stone-800">
                  src/lib/supabaseClient.ts
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Utilise <code>@supabase/supabase-js</code> typé avec l'interface <code>Database</code>. 
                  Reçoit uniquement la clé anonyme publique <code>VITE_SUPABASE_ANON_KEY</code>. 
                  Protégé par les politiques Row-Level Security (RLS).
                </p>
              </div>

              {/* Couche 2: API Backend */}
              <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wide">
                  <Server className="w-4 h-4" />
                  <span>2. Backend Express</span>
                </div>
                <div className="font-mono text-xs font-bold text-stone-800">
                  server/db.ts & /api/*
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Serveur Node.js autonome. Gère les calculs de commissions MyStay, la conciliation Stripe, 
                  les logs d'audit et utilise <code>SUPABASE_SERVICE_ROLE_KEY</code> en environnement sécurisé.
                </p>
              </div>

              {/* Couche 3: Base Supabase */}
              <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wide">
                  <Database className="w-4 h-4" />
                  <span>3. Supabase Cloud</span>
                </div>
                <div className="font-mono text-xs font-bold text-stone-800">
                  PostgreSQL managé
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Hébergé chez Supabase. Contient les tables <code>listings</code>, <code>bookings</code>, 
                  <code>reviews</code> avec types énumérés et contraintes de clés étrangères.
                </p>
              </div>

            </div>

            {/* Step-by-step instructions */}
            <div className="mt-4 p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
              <div className="font-bold text-xs text-stone-800">
                Guide de mise en route en 4 étapes simples :
              </div>
              <ol className="list-decimal list-inside text-xs text-stone-600 space-y-2 leading-relaxed">
                <li>
                  Créez un projet gratuit sur <strong>supabase.com</strong> si ce n'est pas déjà fait.
                </li>
                <li>
                  Allez dans l'onglet <strong>3. Script SQL</strong> ci-dessus, cliquez sur <em>"Copier le script SQL complet"</em>.
                </li>
                <li>
                  Dans Supabase, ouvrez <strong>SQL Editor</strong> &gt; <strong>New Query</strong>, collez le script et cliquez sur <strong>Run</strong>.
                </li>
                <li>
                  Dans Supabase, allez dans <strong>Project Settings &gt; API</strong>, copiez l'URL et la clé, puis collez-les dans l'onglet <strong>1. Diagnostic & Connexion</strong>.
                </li>
              </ol>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: SCRIPT SQL SCHEMA */}
      {activeTab === 'sql' && (
        <div className="space-y-4">
          
          {/* Sub-navigation between Profiles Fix and Full Schema */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-stone-100 rounded-xl max-w-fit">
            <button
              onClick={() => setSqlViewMode('profiles')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                sqlViewMode === 'profiles'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>1. Table "profiles" (Déblocage & Données)</span>
            </button>
            <button
              onClick={() => setSqlViewMode('full')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                sqlViewMode === 'full'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-stone-500" />
              <span>2. Schéma complet (Toutes les tables)</span>
            </button>
          </div>

          {sqlViewMode === 'profiles' ? (
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Pourquoi la table profiles était vide ou masquée dans Supabase ?</span>
              </div>
              <p className="leading-relaxed">
                Par défaut dans Supabase, la table <code className="font-bold bg-white px-1.5 py-0.5 rounded border border-amber-300">public.profiles</code> applique la politique de sécurité stricte <em>(Row Level Security)</em> limitant l'accès aux seules requêtes avec jeton d'authentification utilisateur.
                Ce script rapide débloque les permissions <strong>SELECT/INSERT/UPDATE</strong> et insère immédiatement les <strong>4 profils officiels MyStay</strong> (dont Ba Tamsir, les hôtes éco-responsables et l'administrateur).
              </p>
            </div>
          ) : (
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-600">
              <p className="leading-relaxed">
                Ce schéma PostgreSQL complet génère l'ensemble des 5 tables (<em>listings, bookings, reviews, profiles, messages</em>), les index de performance géographique et configure les règles RLS permissives.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-serif font-bold text-sm text-stone-900">
                {sqlViewMode === 'profiles' ? 'Script Déblocage & Seed "profiles"' : 'Script SQL officiel complet (schema.sql)'}
              </h4>
              <p className="text-xs text-stone-500">
                Collez et exécutez ce script dans : <strong>Supabase Dashboard &gt; SQL Editor &gt; New Query &gt; Run</strong>.
              </p>
            </div>

            {sqlViewMode === 'profiles' ? (
              <button
                onClick={handleCopyProfilesSql}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-xs"
              >
                {copiedProfilesSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Script Profiles copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le script Profiles</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleCopySql}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#243E36] hover:bg-[#1b2f29] text-white transition cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copié dans le presse-papiers !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le schéma complet</span>
                  </>
                )}
              </button>
            )}
          </div>

          <pre className="p-4 bg-stone-900 text-emerald-300 text-xs font-mono rounded-2xl overflow-x-auto max-h-[420px] overflow-y-auto border border-stone-800">
            {sqlViewMode === 'profiles' ? (profilesSql || '-- Chargement du script profiles...') : (sqlSchema || '-- Chargement du schéma SQL...')}
          </pre>
        </div>
      )}

      {/* TAB 4: RECENT QUERY LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-sm text-stone-900">
              Journal des dernières requêtes vers Supabase
            </h4>
            <span className="text-xs text-stone-500">
              {queryLogs.length} événements récents enregistrés
            </span>
          </div>

          {queryLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500 bg-[#FAF9F5] rounded-2xl border border-stone-200">
              Aucune requête récente enregistrée pour le moment.
            </div>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {queryLogs.map((log, idx) => (
                <div key={log.id || idx} className="p-3 bg-stone-900 rounded-xl text-xs font-mono text-stone-300 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'supabase_success' ? 'bg-emerald-900 text-emerald-200' :
                      log.status === 'supabase_error' ? 'bg-rose-900 text-rose-200' : 'bg-slate-800 text-sky-200'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-stone-400 font-bold">{log.table}</span>
                    <span className="text-stone-500 text-[11px] truncate max-w-md">{log.details || log.sqlEquivalent}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-500 text-[11px] shrink-0">
                    <span>{log.durationMs}ms</span>
                    <span>•</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
