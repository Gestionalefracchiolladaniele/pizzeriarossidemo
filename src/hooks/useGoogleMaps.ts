import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    google?: typeof google;
  }
}

interface UseGoogleMapsResult {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  loadGoogleMaps: () => Promise<void>;
}

let googleMapsLoadPromise: Promise<void> | null = null;
let isGoogleMapsLoaded = false;

export const useGoogleMaps = (): UseGoogleMapsResult => {
  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGoogleMaps = useCallback(async () => {
    if (isGoogleMapsLoaded) {
      setIsLoaded(true);
      return;
    }

    if (googleMapsLoadPromise) {
      await googleMapsLoadPromise;
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    googleMapsLoadPromise = (async () => {
      try {
        // Fetch API key from edge function
        const { data, error: fetchError } = await supabase.functions.invoke("get-maps-key");
        
        if (fetchError || !data?.apiKey) {
          throw new Error(fetchError?.message || "Failed to get Google Maps API key");
        }

        // Load Google Maps script
        await new Promise<void>((resolve, reject) => {
          if (window.google?.maps) {
            resolve();
            return;
          }

          const script = document.createElement("script");
          script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places,geometry`;
          script.async = true;
          script.defer = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Google Maps"));
          document.head.appendChild(script);
        });

        isGoogleMapsLoaded = true;
      } catch (err) {
        googleMapsLoadPromise = null;
        throw err;
      }
    })();

    try {
      await googleMapsLoadPromise;
      setIsLoaded(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoaded, isLoading, error, loadGoogleMaps };
};

// Utility function to calculate distance between two points using Haversine formula
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
