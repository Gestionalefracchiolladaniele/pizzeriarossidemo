import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DriverLocation {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
}

interface UseDeliveryTrackingOptions {
  orderId: string;
  isDriver?: boolean;
}

export const useDeliveryTracking = ({ orderId, isDriver = false }: UseDeliveryTrackingOptions) => {
  const [isTracking, setIsTracking] = useState(false);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastSentRef = useRef<{ lat: number; lng: number } | null>(null);

  // Calculate if position has changed significantly (>10 meters)
  const hasMovedSignificantly = (newLat: number, newLng: number): boolean => {
    if (!lastSentRef.current) return true;
    
    const R = 6371000; // Earth radius in meters
    const dLat = (newLat - lastSentRef.current.lat) * Math.PI / 180;
    const dLng = (newLng - lastSentRef.current.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lastSentRef.current.lat * Math.PI / 180) * Math.cos(newLat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance > 10; // 10 meters threshold
  };

  // Start tracking (driver mode)
  const startTracking = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("GPS non supportato dal browser");
      toast.error("GPS non supportato");
      return;
    }

    try {
      // Create tracking record in database
      const { error: dbError } = await supabase
        .from("delivery_tracking")
        .upsert({
          order_id: orderId,
          is_active: true,
          started_at: new Date().toISOString(),
        }, { onConflict: 'order_id' });

      if (dbError) {
        console.error("Error creating tracking record:", dbError);
      }

      // Setup realtime channel
      const channel = supabase.channel(`delivery-${orderId}`);
      channelRef.current = channel;

      await channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Driver subscribed to channel');
        }
      });

      // Start GPS watch
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Only send if moved significantly
          if (hasMovedSignificantly(latitude, longitude)) {
            const locationData: DriverLocation = {
              lat: latitude,
              lng: longitude,
              timestamp: Date.now(),
              accuracy,
            };

            // Broadcast via realtime
            await channel.send({
              type: 'broadcast',
              event: 'location_update',
              payload: locationData,
            });

            // Update database
            await supabase
              .from("delivery_tracking")
              .update({
                driver_lat: latitude,
                driver_lng: longitude,
              })
              .eq("order_id", orderId);

            lastSentRef.current = { lat: latitude, lng: longitude };
            setDriverLocation(locationData);
            setLastUpdated(new Date());
          }
        },
        (err) => {
          console.error("GPS error:", err);
          setError("Errore GPS: " + err.message);
          toast.error("Errore GPS");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      setIsTracking(true);
      setError(null);
      toast.success("Tracking avviato!");
    } catch (err) {
      console.error("Start tracking error:", err);
      setError("Errore avvio tracking");
    }
  }, [orderId]);

  // Stop tracking (driver mode)
  const stopTracking = useCallback(async () => {
    // Clear GPS watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Unsubscribe from channel
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Update database
    await supabase
      .from("delivery_tracking")
      .update({ is_active: false })
      .eq("order_id", orderId);

    setIsTracking(false);
    lastSentRef.current = null;
    toast.success("Tracking fermato");
  }, [orderId]);

  // Subscribe to tracking (customer mode)
  const subscribeToTracking = useCallback(async () => {
    // First, get current location from database
    const { data: trackingData } = await supabase
      .from("delivery_tracking")
      .select("*")
      .eq("order_id", orderId)
      .eq("is_active", true)
      .maybeSingle();

    if (trackingData && trackingData.driver_lat && trackingData.driver_lng) {
      setDriverLocation({
        lat: Number(trackingData.driver_lat),
        lng: Number(trackingData.driver_lng),
        timestamp: new Date(trackingData.last_updated_at).getTime(),
      });
      setLastUpdated(new Date(trackingData.last_updated_at));
    }

    // Setup realtime subscription
    const channel = supabase.channel(`delivery-${orderId}`);
    channelRef.current = channel;

    channel.on('broadcast', { event: 'location_update' }, (payload) => {
      const location = payload.payload as DriverLocation;
      setDriverLocation(location);
      setLastUpdated(new Date(location.timestamp));
    });

    await channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Customer subscribed to tracking');
        setIsTracking(true);
      }
    });
  }, [orderId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // Auto-subscribe if not driver
  useEffect(() => {
    if (!isDriver && orderId) {
      subscribeToTracking();
    }
  }, [isDriver, orderId, subscribeToTracking]);

  return {
    isTracking,
    driverLocation,
    lastUpdated,
    error,
    startTracking,
    stopTracking,
    subscribeToTracking,
  };
};
