import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Listing, MyStayLabel } from '../types';
import { useApp } from '../context/AppContext';
import { calculateDistanceKm } from '../utils/geo';
import { 
  MapPin, Navigation, Star, Leaf, Trees, HeartHandshake, 
  Shield, Crosshair, ZoomIn, ZoomOut, RotateCcw, X, ExternalLink 
} from 'lucide-react';

interface PublishedSitesMapProps {
  listings: Listing[];
  userLocation?: { lat: number; lng: number } | null;
  onGeolocateUser?: () => void;
  isLocating?: boolean;
}

export const PublishedSitesMap: React.FC<PublishedSitesMapProps> = ({
  listings,
  userLocation,
  onGeolocateUser,
  isLocating = false
}) => {
  const { setSelectedListing } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [activeListing, setActiveListing] = useState<Listing | null>(null);
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');

  // Filter listings by selected region if any
  const displayedListings = listings.filter(l => {
    // Only published listings
    if (l.status !== 'publiee') return false;
    if (selectedRegionFilter !== 'all' && l.region !== selectedRegionFilter) return false;
    return true;
  });

  const labelConfig: Record<MyStayLabel, { label: string; icon: React.ReactNode; bg: string }> = {
    eco_responsable: { label: 'Éco-responsable', icon: <Leaf className="w-3 h-3 text-emerald-700" />, bg: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
    authentique: { label: 'Authentique', icon: <Trees className="w-3 h-3 text-amber-700" />, bg: 'bg-amber-50 text-amber-900 border-amber-200' },
    accueil_engage: { label: 'Accueil engagé', icon: <HeartHandshake className="w-3 h-3 text-orange-700" />, bg: 'bg-orange-50 text-orange-900 border-orange-200' },
    rural_prioritaire: { label: 'Rural prioritaire', icon: <Shield className="w-3 h-3 text-stone-700" />, bg: 'bg-stone-100 text-stone-800 border-stone-200' }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center on France
    const map = L.map(mapContainerRef.current, {
      center: [46.603354, 2.3],
      zoom: 6,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Crisp OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 4,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initial resize trigger
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when displayedListings change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing listing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    if (displayedListings.length === 0) return;

    const bounds = L.latLngBounds([]);

    displayedListings.forEach(listing => {
      if (!listing.lat || !listing.lng) return;

      const isSelected = activeListing?.id === listing.id;

      // Custom divIcon for clean price badge
      const markerHtml = `
        <div style="transform: translate(-50%, -50%);" 
             class="group transition-all duration-200 cursor-pointer ${isSelected ? 'scale-115 z-30' : 'hover:scale-110 z-10'}">
          <div class="${isSelected ? 'bg-[#142923] text-[#A3E5C8] ring-4 ring-[#A3E5C8]/50 shadow-xl' : 'bg-[#243E36] text-white shadow-md hover:bg-[#1B2F29]'} 
                      px-2.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 border-2 border-white whitespace-nowrap">
            <span class="w-2 h-2 rounded-full bg-[#A3E5C8]"></span>
            <span>${listing.pricePerNight} €</span>
          </div>
          <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] ${isSelected ? 'border-t-[#142923]' : 'border-t-[#243E36]'} mx-auto -mt-0.5"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: `listing-marker-${listing.id}`,
        html: markerHtml,
        iconSize: [64, 34],
        iconAnchor: [32, 34]
      });

      const marker = L.marker([listing.lat, listing.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setActiveListing(listing);
        map.setView([listing.lat, listing.lng], Math.max(map.getZoom(), 11), {
          animate: true,
          duration: 0.8
        });
      });

      markersRef.current[listing.id] = marker;
      bounds.extend([listing.lat, listing.lng]);
    });

    // Fit bounds with padding if there are listings and no active manual zoom
    if (displayedListings.length > 0 && !activeListing) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
    }
  }, [displayedListings, activeListing]);

  // Update User Location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const userHtml = `
        <div style="transform: translate(-50%, -50%);" class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
          <div class="relative w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-white"></div>
          </div>
        </div>
      `;

      const userIcon = L.divIcon({
        className: 'user-loc-marker',
        html: userHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
      userMarker.bindPopup('<strong class="text-xs text-blue-900">📍 Votre position actuelle</strong>');
      userMarkerRef.current = userMarker;
    }
  }, [userLocation]);

  // Map Controls
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetView = () => {
    setActiveListing(null);
    setSelectedRegionFilter('all');
    mapInstanceRef.current?.setView([46.603354, 2.3], 6, { animate: true });
  };

  // Regions for fast chips
  const regionChips = [
    { id: 'all', label: 'Toute la France' },
    { id: 'Occitanie', label: 'Occitanie (Cévennes)' },
    { id: 'Bourgogne-Franche-Comté', label: 'Morvan' },
    { id: "Provence-Alpes-Côte d'Azur", label: 'Luberon' },
    { id: 'Nouvelle-Aquitaine', label: 'Pays Basque' },
    { id: 'Auvergne-Rhône-Alpes', label: 'Drôme' }
  ];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#E6E4DD] shadow-sm bg-[#FAF9F5]">
      
      {/* Top Filter Bar Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-3 pointer-events-none flex-wrap">
        
        {/* Region Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-stone-200 pointer-events-auto max-w-full">
          {regionChips.map(chip => (
            <button
              key={chip.id}
              onClick={() => {
                setSelectedRegionFilter(chip.id);
                setActiveListing(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedRegionFilter === chip.id
                  ? 'bg-[#243E36] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Geolocation Button */}
        {onGeolocateUser && (
          <button
            id="map-geolocate-btn"
            onClick={onGeolocateUser}
            disabled={isLocating}
            className="flex items-center gap-2 px-3.5 py-2 bg-white/95 hover:bg-white text-[#243E36] rounded-2xl text-xs font-bold shadow-md border border-stone-200 transition backdrop-blur-md pointer-events-auto cursor-pointer disabled:opacity-50"
            title="Centrer sur ma position géographique"
          >
            <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin text-emerald-600' : 'text-[#243E36]'}`} />
            <span className="hidden sm:inline">
              {isLocating ? 'Géolocalisation...' : userLocation ? 'Ma position active' : 'Autour de moi'}
            </span>
          </button>
        )}
      </div>

      {/* The Leaflet Map Canvas */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[580px] z-0 focus:outline-none"
        style={{ minHeight: '520px' }}
      />

      {/* Floating Map Zoom / Recenter Controls (Right side) */}
      <div className="absolute right-4 top-20 z-10 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="w-9 h-9 bg-white/95 hover:bg-white text-stone-800 rounded-xl shadow-md border border-stone-200 flex items-center justify-center transition cursor-pointer"
          title="Zoomer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-9 h-9 bg-white/95 hover:bg-white text-stone-800 rounded-xl shadow-md border border-stone-200 flex items-center justify-center transition cursor-pointer"
          title="Dézoomer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="w-9 h-9 bg-white/95 hover:bg-white text-stone-800 rounded-xl shadow-md border border-stone-200 flex items-center justify-center transition cursor-pointer"
          title="Recentrer sur la France"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend Indicator (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-stone-200 text-[11px] text-stone-700 hidden sm:flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-[#243E36] ring-1 ring-white"></span>
          <span>{displayedListings.length} sites ruraux publiés</span>
        </div>
        <div className="h-3 w-px bg-stone-300" />
        <div className="flex items-center gap-1 text-emerald-800 font-semibold">
          <Leaf className="w-3 h-3 text-emerald-600" />
          <span>Labels durables vérifiés</span>
        </div>
      </div>

      {/* Active Listing Preview Card (Drawer on Bottom or Popover) */}
      {activeListing && (
        <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-20 pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-[#243E36] space-y-3">
            
            {/* Close card button */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C5E45]">
                {activeListing.region} • {activeListing.department}
              </span>
              <button
                onClick={() => setActiveListing(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail + Details */}
            <div className="flex gap-3">
              <img
                src={(activeListing.images && activeListing.images[0]) || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80'}
                alt={activeListing.title}
                className="w-24 h-24 rounded-xl object-cover shrink-0 border border-stone-200"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-serif font-bold text-sm text-stone-900 line-clamp-2 leading-tight">
                  {activeListing.title}
                </h4>
                <div className="flex items-center gap-1 text-xs text-stone-600">
                  <MapPin className="w-3 h-3 text-[#243E36] shrink-0" />
                  <span className="truncate">{activeListing.commune}</span>
                </div>

                {/* Rating & Distance */}
                <div className="flex items-center gap-2 pt-0.5 text-xs">
                  <span className="flex items-center gap-0.5 font-bold text-stone-900">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{activeListing.rating}</span>
                  </span>
                  <span className="text-stone-400">•</span>
                  <span className="text-stone-500">{activeListing.reviewCount} avis</span>

                  {userLocation && (
                    <>
                      <span className="text-stone-400">•</span>
                      <span className="font-semibold text-emerald-700">
                        {calculateDistanceKm(userLocation.lat, userLocation.lng, activeListing.lat, activeListing.lng)} km
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Labels preview */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(activeListing.labels || []).slice(0, 2).map(labelKey => (
                <span
                  key={labelKey}
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${labelConfig[labelKey]?.bg || 'bg-stone-100'}`}
                >
                  {labelConfig[labelKey]?.icon}
                  <span>{labelConfig[labelKey]?.label}</span>
                </span>
              ))}
            </div>

            {/* Price & Action button */}
            <div className="flex items-center justify-between pt-1 border-t border-stone-100">
              <div>
                <span className="font-bold text-base text-stone-900">{activeListing.pricePerNight} €</span>
                <span className="text-[11px] text-stone-500"> / nuit</span>
              </div>

              <button
                id={`map-view-listing-${activeListing.id}`}
                onClick={() => setSelectedListing(activeListing)}
                className="px-3.5 py-2 bg-[#243E36] hover:bg-[#1B2F29] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Voir le séjour</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
