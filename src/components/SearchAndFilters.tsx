import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, MapPin, Calendar, Users, SlidersHorizontal, 
  RotateCcw, Award, Leaf, Shield, HeartHandshake, Trees 
} from 'lucide-react';
import { MyStayLabel } from '../types';

export const SearchAndFilters: React.FC = () => {
  const { filters, setFilters, resetFilters } = useApp();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const regions = [
    { value: 'all', label: 'Toutes les régions rurales' },
    { value: 'Occitanie', label: 'Occitanie (Cévennes, Lozère)' },
    { value: 'Bourgogne-Franche-Comté', label: 'Morvan & Terres d’eau' },
    { value: "Provence-Alpes-Côte d'Azur", label: 'Luberon & Pays d’Apt' },
    { value: 'Nouvelle-Aquitaine', label: 'Pays Basque & Pyrénées' },
    { value: 'Auvergne-Rhône-Alpes', label: 'Drôme des Collines & Vercors' }
  ];

  const propertyTypes = [
    { value: 'all', label: 'Tous types' },
    { value: 'moulin', label: 'Moulins à farine' },
    { value: 'eco_cabane', label: 'Éco-Cabanes en bois' },
    { value: 'bergerie', label: 'Bergeries en pierre' },
    { value: 'ferme_renovee', label: 'Fermes vivrières' },
    { value: 'yourte', label: 'Yourtes & habitats légers' }
  ];

  const labelsConfig: { id: MyStayLabel; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
    { 
      id: 'eco_responsable', 
      label: 'Éco-responsable', 
      icon: <Leaf className="w-3.5 h-3.5" />, 
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      desc: 'Pratiques environnementales documentées et vérifiées' 
    },
    { 
      id: 'authentique', 
      label: 'Authentique', 
      icon: <Trees className="w-3.5 h-3.5" />, 
      color: 'bg-amber-50 text-amber-800 border-amber-300',
      desc: 'Hébergement représentatif du patrimoine local' 
    },
    { 
      id: 'accueil_engage', 
      label: 'Accueil engagé', 
      icon: <HeartHandshake className="w-3.5 h-3.5" />, 
      color: 'bg-orange-50 text-orange-800 border-orange-300',
      desc: 'Hôte favorisant échanges, conseils et circuit court' 
    },
    { 
      id: 'rural_prioritaire', 
      label: 'Rural prioritaire', 
      icon: <Shield className="w-3.5 h-3.5" />, 
      color: 'bg-stone-100 text-stone-800 border-stone-300',
      desc: 'Territoire rural sous-exploité à revitaliser' 
    }
  ];

  const toggleLabel = (labelId: MyStayLabel) => {
    setFilters(prev => {
      const currentLabels = prev.labels || [];
      const exists = currentLabels.includes(labelId);
      return {
        ...prev,
        labels: exists ? currentLabels.filter(l => l !== labelId) : [...currentLabels, labelId]
      };
    });
  };

  return (
    <div className="bg-[#FAF9F5] border-b border-[#E6E4DD] py-5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Main Search Bar (5-step simple search) */}
        <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-[#DEDBD2] grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          
          {/* Destination */}
          <div className="md:col-span-4 flex items-center gap-3 px-3 py-1.5 border-b md:border-b-0 md:border-r border-stone-200">
            <div className="p-2 bg-[#F3F1E9] rounded-xl text-[#243E36]">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Destination rurale
              </label>
              <select
                id="search-region-select"
                value={filters.region}
                onChange={e => setFilters(prev => ({ ...prev, region: e.target.value }))}
                className="w-full text-xs font-semibold text-stone-900 bg-transparent outline-none truncate cursor-pointer"
              >
                {regions.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="md:col-span-4 flex items-center gap-3 px-3 py-1.5 border-b md:border-b-0 md:border-r border-stone-200">
            <div className="p-2 bg-[#F3F1E9] rounded-xl text-[#243E36]">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Arrivée
                </label>
                <input
                  id="search-start-date"
                  type="date"
                  value={filters.startDate}
                  onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full text-xs text-stone-900 bg-transparent outline-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Départ
                </label>
                <input
                  id="search-end-date"
                  type="date"
                  value={filters.endDate}
                  onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full text-xs text-stone-900 bg-transparent outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Guests & Actions */}
          <div className="md:col-span-4 flex items-center gap-3 px-3 py-1.5 justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#F3F1E9] rounded-xl text-[#243E36]">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Voyageurs
                </label>
                <select
                  id="search-guests-select"
                  value={filters.guests}
                  onChange={e => setFilters(prev => ({ ...prev, guests: Number(e.target.value) }))}
                  className="text-xs font-semibold text-stone-900 bg-transparent outline-none cursor-pointer"
                >
                  <option value={1}>1 voyageur</option>
                  <option value={2}>2 voyageurs</option>
                  <option value={3}>3 voyageurs</option>
                  <option value={4}>4 voyageurs</option>
                  <option value={5}>5 voyageurs et +</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id="search-toggle-filters-btn"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs font-medium ${
                  showAdvancedFilters || (filters.labels?.length || 0) > 0 || filters.propertyType !== 'all' || (filters.maxPrice !== undefined && filters.maxPrice < 250)
                    ? 'bg-[#243E36] text-white border-[#243E36]'
                    : 'bg-[#F7F6F0] text-stone-700 border-stone-200 hover:bg-[#EAE8DE]'
                }`}
                title="Filtres avancés & Labels MyStay"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filtres</span>
                {(filters.labels?.length || 0) > 0 && (
                  <span className="w-4 h-4 bg-[#A3E5C8] text-[#142923] rounded-full text-[10px] font-bold flex items-center justify-center">
                    {filters.labels?.length}
                  </span>
                )}
              </button>
            </div>

          </div>

        </div>

        {/* Labels Quick Pills */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#8C5E45]" /> Labels MyStay :
            </span>
            {labelsConfig.map(l => {
              const isSelected = (filters.labels || []).includes(l.id);
              return (
                <button
                  key={l.id}
                  id={`filter-label-${l.id}`}
                  onClick={() => toggleLabel(l.id)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1.5 font-medium ${
                    isSelected
                      ? `${l.color} shadow-xs ring-1 ring-[#243E36]`
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                  title={l.desc}
                >
                  {l.icon}
                  <span>{l.label}</span>
                </button>
              );
            })}
          </div>

          {/* Reset Filters button if any filter is active */}
          {(filters.region !== 'all' || filters.propertyType !== 'all' || (filters.labels?.length || 0) > 0 || (filters.maxPrice !== undefined && filters.maxPrice < 250) || filters.startDate) && (
            <button
              id="search-reset-filters-btn"
              onClick={resetFilters}
              className="text-xs text-stone-500 hover:text-stone-900 underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="bg-white rounded-2xl p-5 border border-[#DEDBD2] shadow-xs space-y-4 transition-all">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Type de logement */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                  Typologie d’habitat rural
                </label>
                <div className="space-y-1.5">
                  {propertyTypes.map(pt => (
                    <label 
                      key={pt.value} 
                      className="flex items-center gap-2 text-xs text-stone-700 hover:text-stone-900 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="propertyType"
                        value={pt.value}
                        checked={filters.propertyType === pt.value}
                        onChange={() => setFilters(prev => ({ ...prev, propertyType: pt.value }))}
                        className="text-[#243E36] focus:ring-[#243E36]"
                      />
                      <span>{pt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Prix maximum */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Budget max / nuit
                  </label>
                  <span className="text-sm font-bold text-[#243E36]">
                    {filters.maxPrice} €
                  </span>
                </div>
                <input
                  id="filter-max-price-slider"
                  type="range"
                  min={50}
                  max={250}
                  step={5}
                  value={filters.maxPrice}
                  onChange={e => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                  className="w-full accent-[#243E36] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-stone-400 mt-1">
                  <span>50 € (authentique sobre)</span>
                  <span>250 € (grand mas)</span>
                </div>
              </div>

              {/* Tri & Critère Écologique strict */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Trier les résultats
                  </label>
                  <select
                    id="filter-sort-by-select"
                    value={filters.sortBy}
                    onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="w-full p-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-900 cursor-pointer"
                  >
                    <option value="pertinence">Pertinence & Impact durable</option>
                    <option value="price_asc">Prix le plus bas en premier</option>
                    <option value="price_desc">Prix le plus élevé en premier</option>
                    <option value="rating">Mieux notés par les voyageurs</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-[#243E36] cursor-pointer bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                    <input
                      type="checkbox"
                      checked={filters.selectedSustainableOnly}
                      onChange={e => setFilters(prev => ({ ...prev, selectedSustainableOnly: e.target.checked }))}
                      className="rounded text-emerald-700 focus:ring-emerald-700"
                    />
                    <span>Exiger ≥ 4 engagements durables validés</span>
                  </label>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
