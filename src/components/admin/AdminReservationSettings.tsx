import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Save, RotateCcw, Plus, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReservationSettings {
  time_slots: string[];
  days_available: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  max_reservations_per_slot: number;
  advance_booking_days: number;
}

const DAYS = [
  { key: "monday", label: "Lunedì" },
  { key: "tuesday", label: "Martedì" },
  { key: "wednesday", label: "Mercoledì" },
  { key: "thursday", label: "Giovedì" },
  { key: "friday", label: "Venerdì" },
  { key: "saturday", label: "Sabato" },
  { key: "sunday", label: "Domenica" },
] as const;

const DEFAULT_SETTINGS: ReservationSettings = {
  time_slots: ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"],
  days_available: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: false,
  },
  max_reservations_per_slot: 5,
  advance_booking_days: 14,
};

export const AdminReservationSettings = () => {
  const [settings, setSettings] = useState<ReservationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("pizzeria_settings")
      .select("reservation_settings")
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching reservation settings:", error);
      setIsLoading(false);
      return;
    }

    if (data?.reservation_settings) {
      const fetchedSettings = data.reservation_settings as unknown as ReservationSettings;
      setSettings({
        ...DEFAULT_SETTINGS,
        ...fetchedSettings,
        days_available: {
          ...DEFAULT_SETTINGS.days_available,
          ...(fetchedSettings.days_available || {}),
        },
      });
    }

    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);

    const { data: settingsData } = await supabase
      .from("pizzeria_settings")
      .select("id")
      .limit(1)
      .single();

    const { error } = await supabase
      .from("pizzeria_settings")
      .update({ reservation_settings: JSON.parse(JSON.stringify(settings)) })
      .eq("id", settingsData?.id || "");

    if (error) {
      toast.error("Errore nel salvataggio: " + error.message);
      setIsSaving(false);
      return;
    }

    toast.success("Impostazioni prenotazioni aggiornate!");
    setIsSaving(false);
  };

  const toggleDay = (day: keyof ReservationSettings["days_available"]) => {
    setSettings(prev => ({
      ...prev,
      days_available: {
        ...prev.days_available,
        [day]: !prev.days_available[day],
      },
    }));
  };

  const addTimeSlot = () => {
    if (!newTimeSlot) return;
    if (settings.time_slots.includes(newTimeSlot)) {
      toast.error("Questa fascia oraria esiste già");
      return;
    }
    
    const updatedSlots = [...settings.time_slots, newTimeSlot].sort();
    setSettings(prev => ({
      ...prev,
      time_slots: updatedSlots,
    }));
    setNewTimeSlot("");
    toast.success("Fascia oraria aggiunta");
  };

  const removeTimeSlot = (slot: string) => {
    setSettings(prev => ({
      ...prev,
      time_slots: prev.time_slots.filter(s => s !== slot),
    }));
    toast.info("Fascia oraria rimossa");
  };

  const resetToDefault = () => {
    setSettings(DEFAULT_SETTINGS);
    toast.info("Impostazioni resettate ai valori predefiniti");
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8 text-primary" />
            Disponibilità Prenotazioni
          </h1>
          <p className="text-muted-foreground mt-1">
            Configura giorni, orari e limiti per le prenotazioni tavoli
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefault}>
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salva"}
          </Button>
        </div>
      </div>

      {/* Days Available */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Giorni Disponibili
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DAYS.map((day, index) => (
            <motion.div
              key={day.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                settings.days_available[day.key]
                  ? "bg-primary/10 border-primary"
                  : "bg-muted/50 border-border"
              }`}
              onClick={() => toggleDay(day.key)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{day.label}</span>
                <Switch
                  checked={settings.days_available[day.key]}
                  onCheckedChange={() => toggleDay(day.key)}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Time Slots */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Fasce Orarie</h2>
        
        <div className="flex gap-2 mb-4">
          <Input
            type="time"
            value={newTimeSlot}
            onChange={(e) => setNewTimeSlot(e.target.value)}
            className="w-40"
            placeholder="Aggiungi orario"
          />
          <Button onClick={addTimeSlot} disabled={!newTimeSlot}>
            <Plus className="w-4 h-4 mr-2" /> Aggiungi
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {settings.time_slots.map((slot) => (
            <motion.div
              key={slot}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full"
            >
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium">{slot}</span>
              <button
                onClick={() => removeTimeSlot(slot)}
                className="p-1 hover:bg-destructive/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-destructive" />
              </button>
            </motion.div>
          ))}
        </div>

        {settings.time_slots.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            Nessuna fascia oraria configurata. Aggiungi almeno un orario.
          </p>
        )}
      </Card>

      {/* Limits */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Limiti</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="max-reservations">
              Prenotazioni massime per fascia oraria
            </Label>
            <Input
              id="max-reservations"
              type="number"
              min={1}
              max={50}
              value={settings.max_reservations_per_slot}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                max_reservations_per_slot: parseInt(e.target.value) || 1,
              }))}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Numero massimo di prenotazioni accettate per ogni fascia oraria
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="advance-days">
              Giorni di anticipo prenotazione
            </Label>
            <Input
              id="advance-days"
              type="number"
              min={1}
              max={60}
              value={settings.advance_booking_days}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                advance_booking_days: parseInt(e.target.value) || 1,
              }))}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Quanti giorni in anticipo i clienti possono prenotare
            </p>
          </div>
        </div>
      </Card>

      {/* Preview */}
      <Card className="p-6 bg-primary/5">
        <h3 className="font-semibold mb-4 text-lg">Riepilogo Configurazione</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Giorni attivi:</span>
            <p className="font-medium">
              {DAYS.filter(d => settings.days_available[d.key]).map(d => d.label).join(", ") || "Nessuno"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Fasce orarie:</span>
            <p className="font-medium">{settings.time_slots.length} disponibili</p>
          </div>
          <div>
            <span className="text-muted-foreground">Capacità:</span>
            <p className="font-medium">
              {settings.max_reservations_per_slot} prenotazioni/slot, {settings.advance_booking_days} giorni anticipo
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
