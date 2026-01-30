import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PizzeriaSettings {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  pizzeria_lat: number | null;
  pizzeria_lng: number | null;
  delivery_radius_km: number;
  opening_hours: any | null;
}

const DEFAULT_SETTINGS: PizzeriaSettings = {
  id: "",
  name: "Pizzeria Rossi",
  address: "Via Roma 123, Milano",
  phone: "02 1234567",
  email: "info@pizzeriarossi.it",
  pizzeria_lat: null,
  pizzeria_lng: null,
  delivery_radius_km: 5,
  opening_hours: null,
};

export const usePizzeriaSettings = () => {
  const [settings, setSettings] = useState<PizzeriaSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("pizzeria_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setSettings({
          id: data.id,
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          pizzeria_lat: data.pizzeria_lat ? Number(data.pizzeria_lat) : null,
          pizzeria_lng: data.pizzeria_lng ? Number(data.pizzeria_lng) : null,
          delivery_radius_km: data.delivery_radius_km || 5,
          opening_hours: data.opening_hours,
        });
      }
      setIsLoading(false);
    };

    fetchSettings();
  }, []);

  return { settings, isLoading };
};
