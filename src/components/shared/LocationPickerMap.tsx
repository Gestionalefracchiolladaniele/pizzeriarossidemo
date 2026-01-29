/// <reference types="@types/google.maps" />
import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

interface LocationPickerMapProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
  showGpsButton?: boolean;
  height?: string;
  label?: string;
}

export const LocationPickerMap = ({
  initialLat,
  initialLng,
  onLocationChange,
  showGpsButton = true,
  height = "200px",
  label = "Clicca sulla mappa per selezionare la posizione",
}: LocationPickerMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const { isLoaded, isLoading, error, loadGoogleMaps } = useGoogleMaps();

  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  // Load Google Maps on mount
  useEffect(() => {
    loadGoogleMaps();
  }, [loadGoogleMaps]);

  // Update marker position
  const updateMarker = useCallback(
    async (lat: number, lng: number) => {
      if (!mapInstanceRef.current) return;

      const position = { lat, lng };

      if (markerRef.current) {
        markerRef.current.setPosition(position);
      } else {
        markerRef.current = new google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          draggable: true,
          icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 7,
            fillColor: "#ef4444",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          title: "Trascina per correggere la posizione",
        });

        // Handle drag
        markerRef.current.addListener("dragend", () => {
          const pos = markerRef.current?.getPosition();
          if (pos) {
            const newLat = pos.lat();
            const newLng = pos.lng();
            setCurrentPosition({ lat: newLat, lng: newLng });
            reverseGeocode(newLat, newLng);
          }
        });
      }

      mapInstanceRef.current.panTo(position);
      mapInstanceRef.current.setZoom(16);
      setCurrentPosition({ lat, lng });

      // Reverse geocode
      reverseGeocode(lat, lng);
    },
    [onLocationChange]
  );

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });
      const address = result.results[0]?.formatted_address || "";
      onLocationChange(lat, lng, address);
    } catch {
      onLocationChange(lat, lng);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Default center (Rome, Italy)
    const defaultCenter = { lat: 41.9028, lng: 12.4964 };
    const center = currentPosition || defaultCenter;

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom: currentPosition ? 16 : 6,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapInstanceRef.current = map;

    // Add click listener
    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        updateMarker(e.latLng.lat(), e.latLng.lng());
      }
    });

    // If initial position exists, add marker
    if (currentPosition) {
      updateMarker(currentPosition.lat, currentPosition.lng);
    }

    return () => {
      mapInstanceRef.current = null;
    };
  }, [isLoaded]);

  // Get current GPS position
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocalizzazione non supportata");
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateMarker(position.coords.latitude, position.coords.longitude);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError("Permesso negato. Abilita la geolocalizzazione.");
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError("Posizione non disponibile.");
            break;
          default:
            setGeoError("Errore nella geolocalizzazione.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8" style={{ height }}>
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Caricamento mappa...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Errore nel caricamento della mappa.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {showGpsButton && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetLocation}
          disabled={isLocating}
          className="w-full"
        >
        {isLocating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Ricerca posizione...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 mr-2" />
              📍 Usa la mia posizione attuale
            </>
          )}
        </Button>
      )}

      {geoError && (
        <Alert variant="destructive">
          <AlertDescription>{geoError}</AlertDescription>
        </Alert>
      )}

      <div
        ref={mapRef}
        className="w-full rounded-lg border bg-muted"
        style={{ height }}
      />

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
        <MapPin className="w-3 h-3" />
        {label}
      </p>

      {currentPosition && (
        <p className="text-xs text-center text-muted-foreground">
          📍 {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
};
