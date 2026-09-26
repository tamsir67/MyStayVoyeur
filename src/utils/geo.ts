// Haversine formula to compute distance in kilometers between two GPS coordinates
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place
}

// Default center coordinates for French regions
export const REGION_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  'all': { lat: 46.603354, lng: 1.888334, zoom: 6 },
  'Occitanie': { lat: 44.1, lng: 3.5, zoom: 8 },
  'Bourgogne-Franche-Comté': { lat: 47.1, lng: 4.1, zoom: 8 },
  "Provence-Alpes-Côte d'Azur": { lat: 43.9, lng: 5.5, zoom: 8 },
  'Nouvelle-Aquitaine': { lat: 43.5, lng: -0.8, zoom: 8 },
  'Auvergne-Rhône-Alpes': { lat: 44.8, lng: 4.9, zoom: 8 }
};
