import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Maximize2, Minimize2, MapPin, Navigation, Clock, Loader2, X } from "lucide-react";
import { useDeliveryTracking } from "@/hooks/useDeliveryTracking";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { supabase } from "@/integrations/supabase/client";

interface LiveDeliveryMapProps {
  orderId: string;
  orderNumber: number;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
}

export const LiveDeliveryMap = ({
  orderId,
  orderNumber,
  deliveryAddress,
  deliveryLat,
  deliveryLng,
}: LiveDeliveryMapProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pizzeriaLocation, setPizzeriaLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [estimatedDistance, setEstimatedDistance] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  
  const mapContainerId = `live-map-${orderId}`;
  const fullscreenMapId = `fullscreen-map-${orderId}`;
  
  const { isTracking, driverLocation, lastUpdated } = useDeliveryTracking({ 
    orderId, 
    isDriver: false 
  });
  
  const { isLoaded, error: mapsError, loadGoogleMaps } = useGoogleMaps();

  // Load Google Maps
  useEffect(() => {
    loadGoogleMaps();
  }, [loadGoogleMaps]);

  // Fetch pizzeria location
  useEffect(() => {
    const fetchPizzeriaLocation = async () => {
      const { data } = await supabase
        .from("pizzeria_settings")
        .select("pizzeria_lat, pizzeria_lng")
        .limit(1)
        .maybeSingle();

      if (data?.pizzeria_lat && data?.pizzeria_lng) {
        setPizzeriaLocation({
          lat: Number(data.pizzeria_lat),
          lng: Number(data.pizzeria_lng),
        });
      }
    };
    fetchPizzeriaLocation();
  }, []);

  // Calculate distance between driver and destination
  useEffect(() => {
    if (driverLocation && deliveryLat && deliveryLng) {
      const R = 6371; // Earth radius in km
      const dLat = (deliveryLat - driverLocation.lat) * Math.PI / 180;
      const dLng = (deliveryLng - driverLocation.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(driverLocation.lat * Math.PI / 180) * Math.cos(deliveryLat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      if (distance < 1) {
        setEstimatedDistance(`${Math.round(distance * 1000)} m`);
      } else {
        setEstimatedDistance(`${distance.toFixed(1)} km`);
      }
    }
  }, [driverLocation, deliveryLat, deliveryLng]);

  // Initialize or update map
  const initializeMap = (containerId: string, height: string) => {
    if (!isLoaded || mapsError || !window.google) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    container.style.height = height;

    const centerLat = driverLocation?.lat || pizzeriaLocation?.lat || deliveryLat;
    const centerLng = driverLocation?.lng || pizzeriaLocation?.lng || deliveryLng;

    const map = new google.maps.Map(container, {
      center: { lat: centerLat, lng: centerLng },
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    mapRef.current = map;

    // Pizzeria marker (red)
    if (pizzeriaLocation) {
      new google.maps.Marker({
        position: pizzeriaLocation,
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
    }

    // Destination marker (blue)
    new google.maps.Marker({
      position: { lat: deliveryLat, lng: deliveryLng },
      map,
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 10,
        fillColor: "#3b82f6",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
      title: "La tua posizione",
    });

    // Driver marker (orange, animated)
    if (driverLocation) {
      driverMarkerRef.current = new google.maps.Marker({
        position: { lat: driverLocation.lat, lng: driverLocation.lng },
        map,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 8,
          fillColor: "#f97316",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
          rotation: 0,
        },
        title: "Fattorino",
        zIndex: 1000,
      });
    }

    // Fit bounds
    const bounds = new google.maps.LatLngBounds();
    if (pizzeriaLocation) {
      bounds.extend(pizzeriaLocation);
    }
    bounds.extend({ lat: deliveryLat, lng: deliveryLng });
    if (driverLocation) {
      bounds.extend({ lat: driverLocation.lat, lng: driverLocation.lng });
    }
    map.fitBounds(bounds, 50);
  };

  // Update driver marker position
  useEffect(() => {
    if (driverLocation && driverMarkerRef.current && mapRef.current) {
      driverMarkerRef.current.setPosition({ 
        lat: driverLocation.lat, 
        lng: driverLocation.lng 
      });
    } else if (driverLocation && mapRef.current && !driverMarkerRef.current) {
      // Create marker if it doesn't exist
      driverMarkerRef.current = new google.maps.Marker({
        position: { lat: driverLocation.lat, lng: driverLocation.lng },
        map: mapRef.current,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 8,
          fillColor: "#f97316",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
        title: "Fattorino",
        zIndex: 1000,
      });
    }
  }, [driverLocation]);

  // Initialize small map
  useEffect(() => {
    if (!isFullscreen) {
      const timer = setTimeout(() => initializeMap(mapContainerId, "200px"), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, mapsError, pizzeriaLocation, isFullscreen]);

  // Initialize fullscreen map
  useEffect(() => {
    if (isFullscreen) {
      const timer = setTimeout(() => initializeMap(fullscreenMapId, "100%"), 100);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen, isLoaded, mapsError, pizzeriaLocation]);

  // Time since last update
  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return null;
    const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s fa`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min fa`;
  };

  if (mapsError) {
    return (
      <Card className="p-4 text-center text-destructive">
        Errore caricamento mappa
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden border-primary/30">
        {/* Header */}
        <div className="p-4 bg-primary/10 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-primary" />
              <span className="font-semibold">Ordine #{orderNumber} in arrivo!</span>
            </div>
            {isTracking && driverLocation && (
              <Badge variant="default" className="animate-pulse">
                🛵 In viaggio
              </Badge>
            )}
          </div>
          
          {/* Stats row */}
          <div className="flex items-center gap-4 mt-2 text-sm">
            {estimatedDistance && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Distanza: {estimatedDistance}</span>
              </div>
            )}
            {lastUpdated && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Aggiornato: {getTimeSinceUpdate()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Map container */}
        <div className="relative">
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}
          <div id={mapContainerId} className="w-full" style={{ height: '200px' }} />
          
          {/* Fullscreen button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 shadow-lg"
            onClick={() => setIsFullscreen(true)}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="p-3 bg-muted/50 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Fattorino</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Tu</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span>Pizzeria</span>
          </div>
        </div>

        {/* Delivery address */}
        <div className="p-3 border-t text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{deliveryAddress}</span>
          </div>
        </div>
      </Card>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-full w-full h-full max-h-full p-0 rounded-none">
          <div className="relative w-full h-full">
            {/* Fullscreen map */}
            <div id={fullscreenMapId} className="w-full h-full" />
            
            {/* Close button */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 shadow-lg z-10"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Minimize button */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 left-4 shadow-lg z-10"
              onClick={() => setIsFullscreen(false)}
            >
              <Minimize2 className="w-5 h-5" />
            </Button>

            {/* Info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm p-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Ordine #{orderNumber}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                    {deliveryAddress}
                  </div>
                </div>
                <div className="text-right">
                  {estimatedDistance && (
                    <div className="text-lg font-bold text-primary">{estimatedDistance}</div>
                  )}
                  {lastUpdated && (
                    <div className="text-xs text-muted-foreground">
                      Aggiornato {getTimeSinceUpdate()}
                    </div>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Fattorino</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Tu</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Pizzeria</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
