
// Conversion factor from kilometers to miles
const KM_TO_MILES = 0.621371;
const MILES_TO_KM = 1.60934;

/**
 * Calculate the distance between two points using the Haversine formula
 * @returns Distance in miles (internal standard unit)
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distanceKm = R * c;
  
  // Convert to miles (internal standard)
  return distanceKm * KM_TO_MILES;
};

/**
 * Format distance for display based on user's unit preference
 * @param distanceInMiles - Distance in miles (internal standard)
 * @param unit - User's preferred unit ('miles' or 'km')
 * @returns Formatted string like "3.5 mi" or "5.6 km"
 */
export const formatDistance = (distanceInMiles: number, unit: string = 'miles'): string => {
  if (unit === 'km') {
    const distanceKm = distanceInMiles * MILES_TO_KM;
    return `${distanceKm.toFixed(1)} km`;
  }
  return `${distanceInMiles.toFixed(1)} mi`;
};

export const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 }; // NYC coordinates
export const DEFAULT_ZOOM = 13;

export const getBoundsForCoordinates = (coordinates: Array<{ lat: number; lng: number }>) => {
  if (!coordinates.length) return null;
  
  const bounds = new google.maps.LatLngBounds();
  coordinates.forEach(coord => bounds.extend(new google.maps.LatLng(coord.lat, coord.lng)));
  return bounds;
};

// Static array of Google Maps libraries to prevent re-creation on render
// Includes 'places' for autocomplete and 'geocoding' for address lookups
export const GOOGLE_MAPS_LIBRARIES: ("places" | "geocoding")[] = ["places", "geocoding"];
