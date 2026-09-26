import React from 'react';
import { Listing, MyStayLabel } from '../types';
import { useApp } from '../context/AppContext';
import { 
  Heart, Star, Leaf, Zap, Mail, Trees, 
  HeartHandshake, Shield, Sparkles, MapPin, Play
} from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  onSelect?: () => void;
  distanceKm?: number;
  onViewOnMap?: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ 
  listing, 
  onSelect, 
  distanceKm,
  onViewOnMap 
}) => {
  const { favorites, toggleFavorite, setSelectedListing } = useApp();
  const isFavorite = favorites.includes(listing.id);

  const handleClick = () => {
    if (onSelect) {
      onSelect();
    } else {
      setSelectedListing(listing);
    }
  };

  const labelConfig: Record<MyStayLabel, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
    eco_responsable: { label: 'Éco-responsable', icon: <Leaf className="w-3 h-3" />, bg: 'bg-emerald-100/90', text: 'text-emerald-900' },
    authentique: { label: 'Authentique', icon: <Trees className="w-3 h-3" />, bg: 'bg-amber-100/90', text: 'text-amber-900' },
    accueil_engage: { label: 'Accueil engagé', icon: <HeartHandshake className="w-3 h-3" />, bg: 'bg-orange-100/90', text: 'text-orange-900' },
    rural_prioritaire: { label: 'Rural prioritaire', icon: <Shield className="w-3 h-3" />, bg: 'bg-stone-200/90', text: 'text-stone-900' }
  };

  return (
    <div
      id={`listing-card-${listing.id}`}
      onClick={handleClick}
      className="group bg-white rounded-2xl border border-[#E6E4DD] hover:border-[#243E36] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.02] flex flex-col cursor-pointer transform"
    >
      {/* Image Thumbnail Container */}
      <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
        <img
          src={(listing.images && listing.images[0]) || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
          loading="lazy"
        />

        {/* Gradient overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

        {/* Favorite Button */}
        <button
          id={`favorite-btn-${listing.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(listing.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-xs text-stone-700 hover:text-rose-600 transition shadow-xs z-10 cursor-pointer"
          title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'text-rose-600 fill-rose-600' : ''}`} />
        </button>

        {/* Booking Mode Pill */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
          {listing.bookingMode === 'instant' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-900/80 text-emerald-100 backdrop-blur-xs px-2 py-0.5 rounded-full border border-emerald-500/30">
              <Zap className="w-3 h-3 text-amber-300" /> Instantané
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-stone-900/80 text-stone-100 backdrop-blur-xs px-2 py-0.5 rounded-full border border-stone-500/30">
              <Mail className="w-3 h-3 text-stone-300" /> Sur demande
            </span>
          )}

          {listing.videoUrl && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-900/85 text-amber-100 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-amber-400/40 shadow-xs">
              <Play className="w-2.5 h-2.5 fill-amber-300 text-amber-300" /> Vidéo du site
            </span>
          )}
        </div>

        {/* Location & Impact Pill at bottom of image */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs z-10">
          <div className="font-medium drop-shadow-sm truncate pr-2">
            {listing.commune} ({listing.department})
          </div>
          <div className="shrink-0 bg-[#243E36]/90 backdrop-blur-xs text-[#A3E5C8] font-semibold text-[11px] px-2 py-0.5 rounded-full border border-[#3A6054]">
            🌱 -{listing.impactScoreKgCo2SavedPerNight} kg CO₂ / nuit
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Official Labels Badge row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(listing.labels || []).slice(0, 2).map(label => {
            const cfg = labelConfig[label];
            if (!cfg) return null;
            return (
              <span
                key={label}
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.text}`}
              >
                {cfg.icon}
                {cfg.label}
              </span>
            );
          })}
          {(listing.labels?.length || 0) > 2 && (
            <span className="text-[10px] text-stone-500 font-medium">
              +{(listing.labels?.length || 0) - 2} label
            </span>
          )}
        </div>

        {/* Title & Geolocation info */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif font-bold text-base text-stone-900 leading-snug line-clamp-2 group-hover:text-[#243E36] transition flex-1">
              {listing.title}
            </h3>
            {onViewOnMap && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewOnMap(listing);
                }}
                className="shrink-0 px-2 py-1 rounded-lg bg-stone-100 hover:bg-[#243E36] hover:text-white text-stone-600 transition text-[10px] font-semibold flex items-center gap-1 cursor-pointer border border-stone-200"
                title="Localiser sur la carte interactive"
              >
                <MapPin className="w-3 h-3 text-[#243E36] group-hover:text-white" />
                <span>Carte</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
            <span className="truncate">{listing.approxLocation}</span>
            {distanceKm !== undefined && (
              <span className="shrink-0 font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                À {distanceKm} km
              </span>
            )}
          </div>
        </div>

        {/* Verified Sustainable Highlights */}
        <div className="bg-[#FAF9F5] p-2 rounded-xl border border-[#EBE9E1] text-[11px] text-stone-600 space-y-1">
          <div className="font-semibold text-[#243E36] flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3 h-3 text-[#C86D51]" />
            <span>Engagements vérifiés ({(listing.sustainablePractices || []).length}) :</span>
          </div>
          <p className="truncate text-stone-500">
            {(listing.sustainablePractices || []).slice(0, 2).join(' • ')}
          </p>
        </div>

        {/* Footer: Rating & Pricing */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          
          {/* Rating */}
          <div className="flex items-center gap-1 text-xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-bold text-stone-900">
              {listing.rating > 0 ? listing.rating.toFixed(2) : 'Nouveau'}
            </span>
            {listing.reviewCount > 0 && (
              <span className="text-stone-400">
                ({listing.reviewCount} avis)
              </span>
            )}
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="text-base font-bold text-[#243E36]">
              {listing.pricePerNight} € <span className="text-xs font-normal text-stone-500">/ nuit</span>
            </div>
            <div className="text-[10px] text-stone-400">
              Ménage {listing.cleaningFee} € • Transparence totale
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
