import { GoogleMap, Marker } from "@react-google-maps/api";
import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { getRestaurantMarkerIcon, getUserMarkerIcon } from "@/utils/mapMarkers";
import { MapPin, AlertTriangle } from "lucide-react";

interface Position {
  lat: number;
  lng: number;
}

interface Restaurant {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

interface RestaurantMapProps {
  restaurants: Restaurant[];
  userLocation: Position;
  isLoaded: boolean;
  onBoundsChanged?: (bounds: google.maps.LatLngBounds) => void;
}

export const RestaurantMap = ({
  restaurants,
  userLocation,
  isLoaded,
  onBoundsChanged,
}: RestaurantMapProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const hasFitBounds = useRef(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const containerStyle = useMemo(
    () => ({ width: "100%", height: "320px" }),
    []
  );

  const coords = useMemo(
    () =>
      restaurants
        .filter((r) => r.latitude != null && r.longitude != null)
        .map((r) => ({ lat: Number(r.latitude), lng: Number(r.longitude), id: r.id, name: r.name })),
    [restaurants]
  );

  const fitAllBounds = useCallback(() => {
    if (!mapRef.current || typeof window === "undefined" || !window.google) return;

    // If no restaurant coords, center on user at a reasonable zoom
    if (!coords.length) {
      mapRef.current.setCenter(userLocation);
      mapRef.current.setZoom(12);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(new window.google.maps.LatLng(userLocation.lat, userLocation.lng));
    coords.forEach((c) => bounds.extend(new window.google.maps.LatLng(c.lat, c.lng)));

    mapRef.current.fitBounds(bounds, 64);
    // Don't call onBoundsChanged here - let handleIdle do it to avoid render loops
  }, [coords, userLocation]);

  const handleLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    hasFitBounds.current = false;
    setMapError(null);
    // Fit after mount to avoid layout thrash
    setTimeout(() => {
      fitAllBounds();
      hasFitBounds.current = true;
    }, 100);
  }, [fitAllBounds]);

  // Re-fit bounds when user location or restaurants change
  useEffect(() => {
    if (mapRef.current && hasFitBounds.current) {
      fitAllBounds();
    }
  }, [userLocation, coords, fitAllBounds]);

  const handleIdle = useCallback(() => {
    if (!mapRef.current) return;
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      const b = mapRef.current?.getBounds();
      if (b) onBoundsChanged?.(b);
    }, 300);
  }, [onBoundsChanged]);

  const restaurantIcon = useMemo(() => {
    if (typeof window === "undefined" || !window.google) return undefined;
    return getRestaurantMarkerIcon();
  }, []);

  const userIcon = useMemo(() => getUserMarkerIcon(), []);

  // Listen for Google Maps authentication errors
  useEffect(() => {
    const handleAuthError = () => {
      setMapError("Map authentication failed. The API key may need to be configured for this domain.");
    };

    // Google Maps fires this event on auth failures
    window.gm_authFailure = handleAuthError;

    return () => {
      delete window.gm_authFailure;
    };
  }, []);

  if (!isLoaded) return null;

  // Show fallback UI if there's a map error
  if (mapError) {
    return (
      <div className="w-full mb-4">
        <div 
          className="bg-muted rounded-lg flex flex-col items-center justify-center gap-3 p-6"
          style={{ height: "320px" }}
        >
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            {mapError}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{coords.length} restaurants nearby</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-4">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation}
        zoom={12}
        onLoad={handleLoad}
        onIdle={handleIdle}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          minZoom: 3,
          maxZoom: 18,
        }}
      >
        <Marker
          position={userLocation}
          icon={userIcon}
          title="Your Location"
        />
        {coords.map((c) => (
          <Marker 
            key={c.id}
            position={{ lat: c.lat, lng: c.lng }} 
            title={c.name}
            icon={restaurantIcon}
          />
        ))}
      </GoogleMap>
    </div>
  );
};
