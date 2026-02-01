import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DaySchedule {
  open: string;
  close: string;
  is_closed: boolean;
}

interface OpeningHours {
  [key: string]: DaySchedule;
}

const DAYS = [
  { key: "monday", label: "Lunedì" },
  { key: "tuesday", label: "Martedì" },
  { key: "wednesday", label: "Mercoledì" },
  { key: "thursday", label: "Giovedì" },
  { key: "friday", label: "Venerdì" },
  { key: "saturday", label: "Sabato" },
  { key: "sunday", label: "Domenica" },
];

const DEFAULT_HOURS: OpeningHours = {
  monday: { open: "11:00", close: "23:00", is_closed: false },
  tuesday: { open: "11:00", close: "23:00", is_closed: false },
  wednesday: { open: "11:00", close: "23:00", is_closed: false },
  thursday: { open: "11:00", close: "23:00", is_closed: false },
  friday: { open: "11:00", close: "23:00", is_closed: false },
  saturday: { open: "11:00", close: "23:00", is_closed: false },
  sunday: { open: "11:00", close: "23:00", is_closed: false },
};

export const AdminOpeningHours = () => {
  const [hours, setHours] = useState<OpeningHours>(DEFAULT_HOURS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchHours();
  }, []);

  const fetchHours = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("pizzeria_settings")
      .select("opening_hours")
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching hours:", error);
      setIsLoading(false);
      return;
    }

    if (data?.opening_hours) {
      // Merge with defaults to ensure all days have is_closed property
      const fetchedHours = data.opening_hours as Record<string, { open: string; close: string; is_closed?: boolean }>;
      const mergedHours: OpeningHours = {};
      
      DAYS.forEach(day => {
        const fetched = fetchedHours[day.key];
        mergedHours[day.key] = {
          open: fetched?.open || "11:00",
          close: fetched?.close || "23:00",
          is_closed: fetched?.is_closed ?? false,
        };
      });
      
      setHours(mergedHours);
    }

    setIsLoading(false);
  };

  const updateDay = (dayKey: string, field: keyof DaySchedule, value: string | boolean) => {
    setHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Convert to JSON-safe format
    const hoursJson = JSON.parse(JSON.stringify(hours));
    
    const { data: settingsData } = await supabase
      .from("pizzeria_settings")
      .select("id")
      .limit(1)
      .single();

    const { error } = await supabase
      .from("pizzeria_settings")
      .update({ opening_hours: hoursJson })
      .eq("id", settingsData?.id || "");

    if (error) {
      toast.error("Errore nel salvataggio: " + error.message);
      setIsSaving(false);
      return;
    }

    toast.success("Orari aggiornati con successo!");
    setIsSaving(false);
  };

  const resetToDefault = () => {
    setHours(DEFAULT_HOURS);
    toast.info("Orari resettati ai valori predefiniti");
  };

  const copyToAll = (sourceDay: string) => {
    const source = hours[sourceDay];
    const newHours: OpeningHours = {};
    
    DAYS.forEach(day => {
      newHours[day.key] = { ...source };
    });
    
    setHours(newHours);
    toast.success("Orari copiati a tutti i giorni");
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            Orari di Apertura
          </h1>
          <p className="text-muted-foreground mt-1">
            Configura gli orari di apertura per ogni giorno della settimana
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={resetToDefault} className="w-full sm:w-auto">
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" /> 
            {isSaving ? "Salvando..." : "Salva Orari"}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {DAYS.map((day, index) => (
            <motion.div
              key={day.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-lg transition-colors
                ${hours[day.key].is_closed ? 'bg-red-50 dark:bg-red-950/20' : 'bg-secondary/30'}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                {/* Day + mobile toggle */}
                <div className="flex items-center justify-between gap-3 sm:w-36">
                  <span className="font-semibold">{day.label}</span>
                  <div className="flex items-center gap-2 sm:hidden">
                    <span className="text-sm text-muted-foreground">Aperto</span>
                    <Switch
                      checked={!hours[day.key].is_closed}
                      onCheckedChange={(checked) => updateDay(day.key, "is_closed", !checked)}
                    />
                  </div>
                </div>

                {/* Desktop toggle */}
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Aperto</span>
                  <Switch
                    checked={!hours[day.key].is_closed}
                    onCheckedChange={(checked) => updateDay(day.key, "is_closed", !checked)}
                  />
                </div>

                {/* Hours */}
                {!hours[day.key].is_closed ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full">
                    <div className="flex items-center gap-2 w-full">
                      <Input
                        type="time"
                        value={hours[day.key].open}
                        onChange={(e) => updateDay(day.key, "open", e.target.value)}
                        className="w-full sm:w-32 max-w-[160px]"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="time"
                        value={hours[day.key].close}
                        onChange={(e) => updateDay(day.key, "close", e.target.value)}
                        className="w-full sm:w-32 max-w-[160px]"
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToAll(day.key)}
                      className="text-xs w-full sm:w-auto sm:ml-auto"
                    >
                      Applica a tutti
                    </Button>
                  </div>
                ) : (
                  <div className="w-full sm:flex-1 sm:text-center">
                    <span className="text-destructive font-medium">Chiuso</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Preview Card */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 text-lg">Anteprima per i clienti</h3>
        <div className="bg-muted rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {DAYS.map(day => (
              <div key={day.key} className="flex justify-between py-1 border-b border-border/50">
                <span className="font-medium">{day.label}</span>
                <span className={hours[day.key].is_closed ? "text-red-600" : "text-muted-foreground"}>
                  {hours[day.key].is_closed 
                    ? "Chiuso" 
                    : `${hours[day.key].open} - ${hours[day.key].close}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
