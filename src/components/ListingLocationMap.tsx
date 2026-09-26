import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Listing } from '../types';
import { MapPin, Navigation, ShieldCheck, Lock } from 'lucide-react';

interface ListingLocationMapProps {
  listing: Listing;
  isBookedByMe: boolean;
}

export const ListingLocationMap: React.FC<ListingLocationMapProps> = ({ listing, isBookedByMe }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Avoid multiple instances
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const lat = listing.lat || 46.6;
    const lng = listing.lng || 2.2;
    const zoomLevel = isBookedByMe ? 14 : 12;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: zoomLevel,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Tile layer: OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // If booked: display exact pin
    if (isBookedByMe) {
      const pinIcon = L.divIcon({
        className: 'custom-exact-marker',
        html: `
          <div style="transform: translate(-50%, -100%);" class="flex flex-col items-center">
            <div class="bg-[#243E36] text-white p-2 rounded-full shadow-lg border-2 border-white ring-2 ring-[#A3E5C8]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div class="w-2 h-2 bg-[#243E36] rotate-45 -mt-1"></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      });

      const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      marker.bindPopup(`
        <div class="text-xs p-1">
          <strong class="font-bold text-stone-900 block">${listing.title}</strong>
          <span class="text-stone-600 block mt-0.5">${listing.exactAddress || listing.commune}</span>
          <span class="text-emerald-700 font-semibold block mt-1">✓ Adresse exacte débloquée</span>
        </div>
      `).openPopup();
    } else {
      // Not yet booked: draw approximate privacy circle
      L.circle([lat, lng], {
        color: '#243E36',
        fillColor: '#A3E5C8',
        fillOpacity: 0.25,
        radius: 2500, // 2.5 km
        weight: 2,
        dashArray: '5, 8'
      }).addTo(map);

      const zoneIcon = L.divIcon({
        className: 'custom-approx-marker',
        html: `
          <div style="transform: translate(-50%, -50%);" class="bg-[#243E36] text-white px-2.5 py-1 rounded-full shadow-md text-[11px] font-bold border border-white/80 whitespace-nowrap flex items-center gap-1">
            <span>Zone : ${listing.commune}</span>
          </div>
        `,
        iconSize: [120, 26],
        iconAnchor: [60, 13]
      });

      L.marker([lat, lng], { icon: zoneIcon }).addTo(map);
    }

    // Force map redraw to prevent grey tiles
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [listing, isBookedByMe]);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${listing.lat},${listing.lng}`;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#243E36]" />
          <h4 className="font-serif font-bold text-sm text-stone-900">
            Géolocalisation & Territoire
          </h4>
        </div>
        <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
          GPS: {listing.lat.toFixed(3)}° N, {listing.lng.toFixed(3)}° E
        </span>
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-300 h-64 w-full shadow-inner">
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {/* Floating Controls / Badge */}
        <div className="absolute top-3 right-3 z-10">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-stone-800 rounded-xl text-xs font-semibold shadow-md border border-stone-200 transition backdrop-blur-xs cursor-pointer"
            title="Ouvrir dans Google Maps"
          >
            <Navigation className="w-3.5 h-3.5 text-[#243E36]" />
            <span>Ouvrir l'itinéraire</span>
          </a>
        </div>

        {/* Bottom privacy info bar */}
        <div className="absolute bottom-2 left-2 right-2 z-10 bg-white/95 backdrop-blur-sm p-2 rounded-xl text-[11px] border border-stone-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-stone-700 truncate">
            {isBookedByMe ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium truncate">
                  <strong>Adresse vérifiée :</strong> {listing.exactAddress || `${listing.commune}, ${listing.department}`}
                </span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span className="truncate">
                  <strong>Zone préservée :</strong> {listing.approxLocation} (adresse exacte transmise après réservation)
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
