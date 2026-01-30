import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, Square, CheckCircle, Maximize2, Minimize2 } from "lucide-react";
import { useDeliveryTracking } from "@/hooks/useDeliveryTracking";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeliveryTrackerControlProps {
  orderId: string;
  orderNumber: number;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
  onStatusChange?: (newStatus: string) => void;
}

export const DeliveryTrackerControl = ({
  orderId,
  orderNumber,
  deliveryAddress,
  deliveryLat,
  deliveryLng,
  onStatusChange,
}: DeliveryTrackerControlProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pizzeriaLocation, setPizzeriaLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapContainerId = `driver-map-${orderId}`;
  
  const { isTracking, driverLocation, lastUpdated, error, startTracking, stopTracking } = 
    useDeliveryTracking({ orderId, isDriver: true });
  
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

  // Initialize map when expanded
  useEffect(() => {
    if (!isExpanded || !isLoaded || mapsError) return;

    const initMap = () => {
      const container = document.getElementById(mapContainerId);
      if (!container || !window.google) return;

      const centerLat = driverLocation?.lat || pizzeriaLocation?.lat || 41.9028;
      const centerLng = driverLocation?.lng || pizzeriaLocation?.lng || 12.4964;

      const map = new google.maps.Map(container, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
      });

      // Driver marker (orange)
      if (driverLocation) {
        new google.maps.Marker({
          position: { lat: driverLocation.lat, lng: driverLocation.lng },
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: "#f97316",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
          title: "La tua posizione",
        });
      }

      // Destination marker (blue)
      if (deliveryLat && deliveryLng) {
        new google.maps.Marker({
          position: { lat: deliveryLat, lng: deliveryLng },
          map,
          icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 8,
            fillColor: "#3b82f6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          title: "Destinazione",
        });
      }

      // Fit bounds to show all markers
      if (driverLocation && deliveryLat && deliveryLng) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: driverLocation.lat, lng: driverLocation.lng });
        bounds.extend({ lat: deliveryLat, lng: deliveryLng });
        map.fitBounds(bounds, 50);
      }
    };

    const timer = setTimeout(initMap, 100);
    return () => clearTimeout(timer);
  }, [isExpanded, isLoaded, mapsError, driverLocation, deliveryLat, deliveryLng, pizzeriaLocation, mapContainerId]);

  const handleMarkDelivered = async () => {
    await stopTracking();
    
    const { error: dbError } = await supabase
      .from("orders")
      .update({ status: "delivered" })
      .eq("id", orderId);

    if (dbError) {
      toast.error("Errore aggiornamento stato");
      return;
    }

    toast.success("Ordine consegnato!");
    onStatusChange?.("delivered");
  };

  return (
    <Card className="p-4 border-primary/30 bg-primary/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary" />
          <span className="font-semibold">Tracking Consegna #{orderNumber}</span>
        </div>
        {isTracking && (
          <Badge variant="default" className="animate-pulse">
            📡 Tracking Attivo
          </Badge>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive mb-3">{error}</p>
      )}

      <div className="text-sm text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{deliveryAddress}</span>
        </div>
      </div>

      {!isTracking ? (
        <Button onClick={startTracking} className="w-full">
          <Navigation className="w-4 h-4 mr-2" />
          Avvia Tracking GPS
        </Button>
      ) : (
        <div className="space-y-3">
          {/* Current position info */}
          {driverLocation && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <div className="flex justify-between items-center">
                <span>Posizione attuale</span>
                <span className="text-xs text-muted-foreground">
                  Aggiornato: {lastUpdated?.toLocaleTimeString('it-IT')}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {driverLocation.lat.toFixed(5)}, {driverLocation.lng.toFixed(5)}
              </div>
            </div>
          )}

          {/* Mini map toggle */}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <Minimize2 className="w-4 h-4 mr-2" />
                Nascondi Mappa
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 mr-2" />
                Mostra Mappa
              </>
            )}
          </Button>

          {/* Expandable map */}
          {isExpanded && (
            <div 
              id={mapContainerId}
              className="w-full h-48 rounded-lg overflow-hidden border"
            />
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={stopTracking}
              className="flex-1"
            >
              <Square className="w-4 h-4 mr-2" />
              Ferma
            </Button>
            <Button 
              onClick={handleMarkDelivered}
              className="flex-1"
              variant="default"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Consegnato
            </Button>
          </div>

          {/* Navigate button */}
          {deliveryLat && deliveryLng && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${deliveryLat},${deliveryLng}`,
                  '_blank'
                );
              }}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Apri in Google Maps
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
