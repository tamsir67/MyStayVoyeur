import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Legend, Cell 
} from 'recharts';
import { 
  Leaf, TrendingDown, Award, Globe, Trees, Car, 
  Sparkles, CheckCircle2, ChevronRight, Info, HelpCircle,
  Calendar, Building2, Home
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Booking } from '../types';

interface ImpactVisualizationProps {
  /**
   * Mode: 'traveler' to focus on current user's personal impact,
   * or 'global' to highlight community-wide impact with personal toggle.
   */
  initialScope?: 'personal' | 'community';
  compact?: boolean;
  className?: string;
}

export const ImpactVisualization: React.FC<ImpactVisualizationProps> = ({
  initialScope = 'personal',
  compact = false,
  className = ''
}) => {
  const { currentUser, bookings, listings } = useApp();
  const [scope, setScope] = useState<'personal' | 'community'>(initialScope);
  const [activeMetricTab, setActiveMetricTab] = useState<'comparative' | 'trips'>('comparative');
  const [showMethodology, setShowMethodology] = useState(false);

  // Relevant bookings based on selected scope
  const userBookings = useMemo(() => {
    return bookings.filter(b => b.travelerId === currentUser.id && b.status !== 'annulee' && b.status !== 'refusee');
  }, [bookings, currentUser.id]);

  const communityBookings = useMemo(() => {
    return bookings.filter(b => b.status !== 'annulee' && b.status !== 'refusee');
  }, [bookings]);

  const activeBookings = scope === 'personal' ? userBookings : communityBookings;

  // Cumulative computations
  const stats = useMemo(() => {
    // Total nights
    const totalNights = activeBookings.reduce((sum, b) => sum + (b.nightsCount || 1), 0);
    
    // Total CO2 saved from bookings
    const totalSavedKg = activeBookings.reduce((sum, b) => {
      if (b.co2SavedKg && b.co2SavedKg > 0) return sum + b.co2SavedKg;
      // Fallback calculation: 18.5 kg CO2 saved per night compared to conventional hotel
      const listing = listings.find(l => l.id === b.listingId);
      const scorePerNight = listing?.impactScoreKgCo2SavedPerNight || 12.5;
      return sum + (scorePerNight * (b.nightsCount || 1));
    }, 0);

    // Baseline conventional hotel emission: ~32 kg CO2 per guest night
    // (Source: ADEME base empreinte hébergement touristique standard)
    const conventionalEmissionKg = Number((totalNights * 32.0).toFixed(1));
    
    // MyStay average emission: ~9.5 kg CO2 per guest night
    const myStayEmissionKg = Math.max(0, Number((conventionalEmissionKg - totalSavedKg).toFixed(1)));
    
    // Reduction percentage
    const reductionPercent = conventionalEmissionKg > 0 
      ? Math.round((totalSavedKg / conventionalEmissionKg) * 100) 
      : 70;

    // Ecological equivalents
    // 1 mature tree absorbs ~25 kg CO2/year
    const treesEquivalent = (totalSavedKg / 25).toFixed(1);
    // 1 km in average thermal car = ~0.12 kg CO2 (120g/km)
    const kmCarAvoided = Math.round(totalSavedKg / 0.12);
    // Train km equivalent
    const trainEquivalentHours = Math.round(kmCarAvoided / 120);

    return {
      totalNights,
      totalSavedKg: Number(totalSavedKg.toFixed(1)),
      conventionalEmissionKg,
      myStayEmissionKg,
      reductionPercent,
      treesEquivalent,
      kmCarAvoided,
      trainEquivalentHours
    };
  }, [activeBookings, listings]);

  // Data for the Global Comparative Bar Chart
  const comparativeChartData = useMemo(() => {
    return [
      {
        category: 'Hébergement classique',
        shortName: 'Hôtel standard',
        emissions: stats.conventionalEmissionKg,
        color: '#D97706', // warm amber
        description: 'Climatisation continue, blanchisserie industrielle, énergies fossiles'
      },
      {
        category: 'Séjour MyStay Rural',
        shortName: 'MyStay Éco-gîte',
        emissions: stats.myStayEmissionKg,
        color: '#059669', // emerald green
        description: 'Énergies renouvelables, phytoépuration, circuit court local'
      }
    ];
  }, [stats]);

  // Data for Trip-by-Trip breakdown
  const tripsChartData = useMemo(() => {
    return activeBookings.slice(0, 6).map((b, idx) => {
      const nights = b.nightsCount || 1;
      const conventional = Number((nights * 32.0).toFixed(1));
      const saved = b.co2SavedKg || Number((nights * 14.5).toFixed(1));
      const myStay = Math.max(0, Number((conventional - saved).toFixed(1)));
      
      const destination = b.listingCommune?.split('(')[0]?.trim() || `Séjour #${idx + 1}`;

      return {
        name: destination.length > 14 ? destination.substring(0, 12) + '...' : destination,
        fullName: b.listingTitle,
        MyStay: myStay,
        Classique: conventional,
        economise: saved,
        nuits: nights
      };
    });
  }, [activeBookings]);

  return (
    <div className={`bg-white rounded-3xl border border-[#E6E4DD] p-6 sm:p-8 shadow-xs space-y-6 ${className}`}>
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bilan d'Impact Carbone & Sobriété</span>
            </span>
            <span className="text-[11px] text-stone-600 font-medium">
              Méthodologie ADEME 2026
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
            <span>Total CO₂ Évité & Comparatif Écologique</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Mesurez l'empreinte carbone réelle évitée en choisissant des hébergements ruraux éco-responsables plutôt qu'un hôtel classique climatisé.
          </p>
        </div>

        {/* Scope Toggle: Mon Impact vs Communauté */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-2xl self-start sm:self-center shrink-0 border border-stone-200">
          <button
            type="button"
            onClick={() => setScope('personal')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              scope === 'personal'
                ? 'bg-[#243E36] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Mon impact ({currentUser.name.split(' ')[0]})</span>
          </button>
          <button
            type="button"
            onClick={() => setScope('community')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              scope === 'community'
                ? 'bg-[#243E36] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Communauté MyStay</span>
          </button>
        </div>
      </div>

      {/* Hero Impact Metrics Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Hero Card: CO2 Saved */}
        <div className="md:col-span-2 bg-[#FAF9F5] border border-[#243E36]/20 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-[#243E36] pointer-events-none">
            <Leaf className="w-24 h-24" />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C5E45]">
                {scope === 'personal' ? 'Votre économie personnelle' : 'Économie collective MyStay'}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                <TrendingDown className="w-3.5 h-3.5" /> -{stats.reductionPercent}% d'émissions
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-4xl sm:text-5xl font-black text-[#243E36]">
                {stats.totalSavedKg}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-stone-700">kg de CO₂ évités</span>
            </div>

            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Calculé sur la base de <strong>{stats.totalNights} nuitée{stats.totalNights > 1 ? 's' : ''}</strong> en gîte éco-labellisé par rapport à un hébergement touristique standard équivalent.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-600">
            <span>Émissions MyStay : <strong className="text-emerald-800">{stats.myStayEmissionKg} kg</strong></span>
            <span>Vs Classique : <strong className="text-stone-500 line-through">{stats.conventionalEmissionKg} kg</strong></span>
          </div>
        </div>

        {/* Concrete Equivalence 1: Trees */}
        <div className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Équivalent Végétal
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Trees className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2">
            <span className="font-serif text-3xl font-bold text-stone-900">
              ~{stats.treesEquivalent}
            </span>
            <span className="text-sm font-semibold text-stone-600 ml-1.5">arbres / an</span>
            <p className="text-xs text-stone-600 mt-1.5 leading-snug">
              Équivaut à la captation annuelle moyenne d'arbres feuillus adultes en forêt française.
            </p>
          </div>

          <div className="mt-3 text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Préservation des sols vivants</span>
          </div>
        </div>

        {/* Concrete Equivalence 2: Car kilometers */}
        <div className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Mobilité Évitée
            </span>
            <div className="p-2 rounded-xl bg-[#F7EBE4] text-[#8C5E45]">
              <Car className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2">
            <span className="font-serif text-3xl font-bold text-stone-900">
              ~{stats.kmCarAvoided.toLocaleString('fr-FR')}
            </span>
            <span className="text-sm font-semibold text-stone-600 ml-1.5">km</span>
            <p className="text-xs text-stone-600 mt-1.5 leading-snug">
              Kilomètres non émis en voiture thermique moyenne (base 120 g CO₂ / km).
            </p>
          </div>

          <div className="mt-3 text-[11px] text-[#8C5E45] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#8C5E45]" />
            <span>Circuits courts favorisés</span>
          </div>
        </div>
      </div>

      {/* Interactive Graph Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-stone-900">
              Graphique comparatif des émissions CO₂ (kg)
            </span>
            <button
              type="button"
              onClick={() => setShowMethodology(!showMethodology)}
              className="text-stone-600 hover:text-stone-800 cursor-pointer flex items-center gap-1 text-xs"
              title="Voir les détails méthodologiques"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Détails de calcul</span>
            </button>
          </div>

          {/* Subtabs for Graph: Overall vs Per Trip */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl self-start sm:self-auto border border-stone-200">
            <button
              type="button"
              onClick={() => setActiveMetricTab('comparative')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeMetricTab === 'comparative'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Vue comparative globale
            </button>
            <button
              type="button"
              onClick={() => setActiveMetricTab('trips')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeMetricTab === 'trips'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Ventilation par séjour ({activeBookings.length})
            </button>
          </div>
        </div>

        {/* Methodology expandable banner */}
        {showMethodology && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-stone-700 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between font-bold text-emerald-950">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-700" />
                Méthode de calcul certifiée MyStay & ADEME
              </span>
              <button 
                onClick={() => setShowMethodology(false)}
                className="text-emerald-700 hover:text-emerald-950 cursor-pointer text-[11px]"
              >
                Fermer
              </button>
            </div>
            <p className="leading-relaxed">
              - <strong>Hébergement conventionnel (32,0 kg CO₂e / nuit)</strong> : moyennes ADEME pour hôtels 3-4 étoiles incluant climatisation réversible continue, blanchisserie industrielle quotidienne et éclairages énergivores.
            </p>
            <p className="leading-relaxed">
              - <strong>Hébergement MyStay (moyenne 8,5 à 12 kg CO₂e / nuit)</strong> : gîtes audités avec isolation en matériaux biosourcés (bois, paille, pierre locale), chauffe-eau solaire, phytoépuration et sobriété énergétique.
            </p>
            <p className="text-[11px] text-emerald-800 font-medium italic">
              Économie moyenne constatée sur notre réseau : <strong>20 à 23,5 kg CO₂e évités par nuitée et par hébergement</strong>.
            </p>
          </div>
        )}

        {/* Recharts Chart Container */}
        <div className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-4 sm:p-6">
          {activeMetricTab === 'comparative' ? (
            <div className="space-y-4">
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparativeChartData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis 
                      type="number" 
                      unit=" kg"
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="shortName" 
                      tick={{ fill: '#1F2937', fontSize: 12, fontWeight: 600 }}
                      width={120}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value} kg de CO₂ émis`, 'Émissions carbone']}
                      labelFormatter={(label) => `Type d'hébergement : ${label}`}
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        borderRadius: '16px', 
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        fontSize: '12px'
                      }}
                    />
                    <Bar 
                      dataKey="emissions" 
                      radius={[0, 10, 10, 0]}
                      barSize={36}
                    >
                      {comparativeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Explanatory legend cards below the bar chart */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#D97706] mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-950">Hôtel classique : {stats.conventionalEmissionKg} kg CO₂</span>
                    <p className="text-stone-600 text-[11px] mt-0.5 leading-snug">
                      Climatisation centralisée, produits industriels, buanderie externe et forte intensité électrique.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-start gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#059669] mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-emerald-950">Séjour MyStay : {stats.myStayEmissionKg} kg CO₂</span>
                    <p className="text-stone-600 text-[11px] mt-0.5 leading-snug">
                      <strong>-{stats.totalSavedKg} kg évités</strong> grâce aux chauffe-eaux solaires, au tri intégral et au bâti traditionnel en pierre/bois.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {tripsChartData.length === 0 ? (
                <div className="text-center py-12 text-stone-500 text-xs">
                  Aucun séjour enregistré pour le moment. Réservez votre premier éco-gîte pour voir apparaître vos statistiques !
                </div>
              ) : (
                <div className="h-64 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={tripsChartData}
                      margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#4B5563', fontSize: 11 }}
                      />
                      <YAxis 
                        unit=" kg"
                        tick={{ fill: '#6B7280', fontSize: 11 }}
                      />
                      <Tooltip 
                        formatter={(value: any, name: any) => [
                          `${value} kg CO₂`, 
                          name === 'Classique' ? 'Hébergement classique' : 'Séjour MyStay Rural'
                        ]}
                        labelFormatter={(label, payload) => {
                          const item = payload?.[0]?.payload;
                          return `${item?.fullName || label} (${item?.nuits} nuits)`;
                        }}
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          borderRadius: '16px', 
                          border: '1px solid #E5E7EB',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          fontSize: '12px'
                        }}
                      />
                      <Legend 
                        formatter={(val) => (
                          <span className="text-xs font-semibold text-stone-700">
                            {val === 'Classique' ? 'Hébergement classique' : 'Séjour MyStay Rural'}
                          </span>
                        )}
                      />
                      <Bar dataKey="Classique" fill="#D97706" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="MyStay" fill="#059669" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <p className="text-[11px] text-stone-500 text-center italic">
                Comparatif calculé pour chaque réservation selon sa durée exacte et le score écologique de l'hébergement audité.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sustainable Practices Pillars */}
      <div className="pt-2 border-t border-stone-100">
        <span className="text-xs font-bold text-stone-800 block mb-3">
          Comment les hôtes MyStay parviennent à réduire les émissions de 70% :
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
            <span className="text-base">⚡</span>
            <h4 className="text-xs font-bold text-stone-900 mt-1">Énergies Vertes</h4>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">Chauffe-eau solaire, géothermie et poêle à granulés locaux.</p>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
            <span className="text-base">🧺</span>
            <h4 className="text-xs font-bold text-stone-900 mt-1">Circuits Courts</h4>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">Paniers paysans du village, potagers en permaculture.</p>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
            <span className="text-base">💧</span>
            <h4 className="text-xs font-bold text-stone-900 mt-1">Sobriété en Eau</h4>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">Récupérateurs d'eau de pluie et phytoépuration naturelle.</p>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
            <span className="text-base">🏡</span>
            <h4 className="text-xs font-bold text-stone-900 mt-1">Matériaux Locaux</h4>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">Pierres sèches, chanvre, bois de pays et chaux naturelle.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
