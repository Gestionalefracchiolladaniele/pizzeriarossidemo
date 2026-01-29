/// <reference types="@types/google.maps" />
import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Navigation, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGoogleMaps, calculateDistance } from "@/hooks/useGoogleMaps";
import { supabase } from "@/integrations/supabase/client";

interface DeliveryCoordinates {
  lat: number;
  lng: number;
  address: string;
  distance: number;
}

interface PizzeriaSettings {
  pizzeria_lat: number | null;
  pizzeria_lng: number | null;
  delivery_radius_km: number;
}

interface DeliveryAddressMapProps {
  onAddressChange: (coords: DeliveryCoordinates | null) => void;
  onValidityChange: (isValid: boolean) => void;
}

export const DeliveryAddressMap = ({ onAddressChange, onValidityChange }: DeliveryAddressMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  const { isLoaded, isLoading: mapsLoading, error: mapsError, loadGoogleMaps } = useGoogleMaps();
  
  const [pizzeriaSettings, setPizzeriaSettings] = useState<PizzeriaSettings | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [distance, setDistance] = useState<number | null>(null);
  const [isWithinRange, setIsWithinRange] = useState<boolean | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Fetch pizzeria settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("pizzeria_settings")
        .select("pizzeria_lat, pizzeria_lng, delivery_radius_km")
        .limit(1)
        .maybeSingle();
      
      if (data) {
        setPizzeriaSettings({
          pizzeria_lat: data.pizzeria_lat ? Number(data.pizzeria_lat) : null,
          pizzeria_lng: data.pizzeria_lng ? Number(data.pizzeria_lng) : null,
          delivery_radius_km: data.delivery_radius_km || 5,
        });
      }
    };
    fetchSettings();
  }, []);

  // Load Google Maps when component mounts
  useEffect(() => {
    loadGoogleMaps();
  }, [loadGoogleMaps]);

  // Update marker and calculate distance
  const updatePosition = useCallback(
    async (lat: number, lng: number) => {
      if (!mapInstanceRef.current || !pizzeriaSettings?.pizzeria_lat) return;

      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setPosition({ lat, lng });
      } else {
        markerRef.current = new google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
          draggable: true,
          icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: "#3b82f6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          title: "La tua posizione (trascina per correggere)",
        });

        // Handle marker drag
        markerRef.current.addListener("dragend", () => {
          const pos = markerRef.current?.getPosition();
          if (pos) {
            updatePosition(pos.lat(), pos.lng());
          }
        });
      }

      mapInstanceRef.current.panTo({ lat, lng });
      mapInstanceRef.current.setZoom(15);
      setUserPosition({ lat, lng });

      // Reverse geocode to get address
      let formattedAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      try {
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({ location: { lat, lng } });
        if (result.results[0]) {
          formattedAddress = result.results[0].formatted_address;
          setAddress(formattedAddress);
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
      }

      // Calculate distance
      const dist = calculateDistance(
        pizzeriaSettings.pizzeria_lat,
        pizzeriaSettings.pizzeria_lng!,
        lat,
        lng
      );
      setDistance(dist);

      const withinRange = dist <= pizzeriaSettings.delivery_radius_km;
      setIsWithinRange(withinRange);
      onValidityChange(withinRange);

      if (withinRange) {
        onAddressChange({
          lat,
          lng,
          address: formattedAddress,
          distance: dist,
        });
      } else {
        onAddressChange(null);
      }
    },
    [pizzeriaSettings, onAddressChange, onValidityChange]
  );

  // Initialize map when loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !pizzeriaSettings?.pizzeria_lat) return;

    const pizzeriaCenter = {
      lat: pizzeriaSettings.pizzeria_lat,
      lng: pizzeriaSettings.pizzeria_lng!,
    };

    // Create map
    const map = new google.maps.Map(mapRef.current, {
      center: pizzeriaCenter,
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapInstanceRef.current = map;

    // Add pizzeria marker
    new google.maps.Marker({
      position: pizzeriaCenter,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#ef4444",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
      title: "Pizzeria",
    });

    // Add delivery radius circle
    const circle = new google.maps.Circle({
      map,
      center: pizzeriaCenter,
      radius: pizzeriaSettings.delivery_radius_km * 1000,
      fillColor: "#22c55e",
      fillOpacity: 0.1,
      strokeColor: "#22c55e",
      strokeOpacity: 0.5,
      strokeWeight: 2,
    });
    circleRef.current = circle;

    // Add click listener to map
    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        updatePosition(e.latLng.lat(), e.latLng.lng());
      }
    });

    return () => {
      mapInstanceRef.current = null;
    };
  }, [isLoaded, pizzeriaSettings, updatePosition]);

  // Get user's current location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocalizzazione non supportata dal browser");
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updatePosition(position.coords.latitude, position.coords.longitude);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Permesso negato. Abilita la geolocalizzazione nelle impostazioni.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Posizione non disponibile. Riprova.");
            break;
          case error.TIMEOUT:
            setGeoError("Timeout. Riprova.");
            break;
          default:
            setGeoError("Errore sconosciuto nella geolocalizzazione.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Check if pizzeria coordinates are configured
  if (!pizzeriaSettings?.pizzeria_lat) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          La consegna non è al momento disponibile. Contatta il ristorante.
        </AlertDescription>
      </Alert>
    );
  }

  if (mapsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Caricamento mappa...</span>
      </div>
    );
  }

  if (mapsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Errore nel caricamento della mappa. Riprova più tardi.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* GPS Button */}
      <Button
        type="button"
        onClick={handleGetLocation}
        disabled={isLocating}
        className="w-full"
        variant="outline"
      >
        {isLocating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Localizzazione in corso...
          </>
        ) : (
          <>
            <Navigation className="w-4 h-4 mr-2" />
            Usa la mia posizione (GPS)
          </>
        )}
      </Button>

      {/* Error message */}
      {geoError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{geoError}</AlertDescription>
        </Alert>
      )}

      {/* Map */}
      <div
        ref={mapRef}
        className="w-full h-64 rounded-lg border bg-muted"
        style={{ minHeight: "250px" }}
      />

      {/* Instructions */}
      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
        <MapPin className="w-3 h-3" />
        Clicca sulla mappa o trascina il marker per selezionare il punto esatto di consegna
      </p>

      {/* Distance feedback */}
      {distance !== null && (
        <Card className={`p-4 ${isWithinRange ? "border-primary/50 bg-primary/5" : "border-destructive/50 bg-destructive/5"}`}>
          <div className="flex items-center gap-3">
            {isWithinRange ? (
              <CheckCircle2 className="w-6 h-6 text-primary" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-destructive" />
            )}
            <div>
              <p className={`font-semibold ${isWithinRange ? "text-primary" : "text-destructive"}`}>
                {isWithinRange
                  ? `Consegna disponibile! (${distance.toFixed(1)} km)`
                  : `Spiacente, troppo distante per il servizio`}
              </p>
              {!isWithinRange && (
                <p className="text-sm text-muted-foreground">
                  Distanza: {distance.toFixed(1)} km (max {pizzeriaSettings.delivery_radius_km} km)
                </p>
              )}
              {userPosition && address && (
                <p className="text-xs text-muted-foreground mt-1 truncate max-w-[300px]">
                  {address}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Instructions when no position selected */}
      {!userPosition && (
        <p className="text-sm text-muted-foreground text-center">
          Usa il GPS o clicca sulla mappa per verificare la disponibilità della consegna.
        </p>
      )}
    </div>
  );
};
