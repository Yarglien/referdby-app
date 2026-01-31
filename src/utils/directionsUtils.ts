/**
 * Opens directions to a location in the user's preferred maps app.
 * Works on iOS (Apple Maps), Android (Google Maps), and web browsers.
 */
export const openDirections = (
  address: string,
  latitude?: number | null,
  longitude?: number | null,
  name?: string
) => {
  // Encode the address for URL
  const encodedAddress = encodeURIComponent(address);
  const encodedName = name ? encodeURIComponent(name) : '';
  
  // If we have coordinates, use them for more accurate directions
  const destination = latitude && longitude 
    ? `${latitude},${longitude}`
    : encodedAddress;

  // Detect platform
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  let mapsUrl: string;

  if (isIOS) {
    // Apple Maps URL scheme - will open in Apple Maps on iOS
    // Falls back to maps.apple.com on web
    mapsUrl = latitude && longitude
      ? `maps://maps.apple.com/?daddr=${latitude},${longitude}&q=${encodedName || encodedAddress}`
      : `maps://maps.apple.com/?daddr=${encodedAddress}&q=${encodedName || encodedAddress}`;
  } else if (isAndroid) {
    // Google Maps intent for Android
    mapsUrl = latitude && longitude
      ? `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedName})`
      : `geo:0,0?q=${encodedAddress}`;
  } else {
    // Web fallback - Google Maps works everywhere
    mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  }

  // Try to open the maps URL
  // For iOS, if maps:// doesn't work, fall back to universal link
  if (isIOS) {
    // Use a timeout to detect if the app opened
    const fallbackUrl = latitude && longitude
      ? `https://maps.apple.com/?daddr=${latitude},${longitude}&q=${encodedName || encodedAddress}`
      : `https://maps.apple.com/?daddr=${encodedAddress}`;
    
    window.location.href = mapsUrl;
    
    // Fallback after a short delay if the app didn't open
    setTimeout(() => {
      window.open(fallbackUrl, '_blank');
    }, 500);
  } else {
    window.open(mapsUrl, '_blank');
  }
};

/**
 * Opens Google Maps specifically (useful for users who prefer Google Maps)
 */
export const openGoogleMapsDirections = (
  address: string,
  latitude?: number | null,
  longitude?: number | null
) => {
  const destination = latitude && longitude 
    ? `${latitude},${longitude}`
    : encodeURIComponent(address);
  
  const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  window.open(url, '_blank');
};
