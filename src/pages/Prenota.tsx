import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, Check, ArrowLeft, ArrowRight, User, AlertCircle } from "lucide-react";
import { format, addDays, isSameDay, getDay } from "date-fns";
import { it } from "date-fns/locale";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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

interface SlotAvailability {
  [slot: string]: {
    count: number;
    available: number;
  };
}

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

const peopleOptions = [1, 2, 3, 4, 5, 6, 7, 8];

interface BookingData {
  date: Date | null;
  time: string;
  people: number;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const DEFAULT_SETTINGS: ReservationSettings = {
  time_slots: ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"],
  days_available: {
    monday: true, tuesday: true, wednesday: true, thursday: true,
    friday: true, saturday: true, sunday: false,
  },
  max_reservations_per_slot: 5,
  advance_booking_days: 14,
};

const Prenota = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booking, setBooking] = useState<BookingData>({
    date: null,
    time: "",
    people: 2,
    name: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [bookingCode, setBookingCode] = useState("");
  const [settings, setSettings] = useState<ReservationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [slotAvailability, setSlotAvailability] = useState<SlotAvailability>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (user) {
      setBooking(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || "",
        phone: user.user_metadata?.phone || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (booking.date) {
      fetchSlotAvailability(booking.date);
    }
  }, [booking.date]);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("pizzeria_settings")
      .select("reservation_settings")
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching settings:", error);
      setIsLoading(false);
      return;
    }

    if (data?.reservation_settings) {
      const fetched = data.reservation_settings as unknown as ReservationSettings;
      setSettings({
        ...DEFAULT_SETTINGS,
        ...fetched,
        days_available: {
          ...DEFAULT_SETTINGS.days_available,
          ...(fetched.days_available || {}),
        },
      });
    }
    setIsLoading(false);
  };

  const fetchSlotAvailability = async (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    
    const { data, error } = await supabase
      .from("reservations")
      .select("reservation_time")
      .eq("reservation_date", dateStr)
      .neq("status", "cancelled");

    if (error) {
      console.error("Error fetching reservations:", error);
      return;
    }

    // Count reservations per slot
    const counts: Record<string, number> = {};
    (data || []).forEach(r => {
      const time = r.reservation_time;
      counts[time] = (counts[time] || 0) + 1;
    });

    // Build availability map
    const availability: SlotAvailability = {};
    settings.time_slots.forEach(slot => {
      const count = counts[slot] || 0;
      availability[slot] = {
        count,
        available: settings.max_reservations_per_slot - count,
      };
    });

    setSlotAvailability(availability);
  };

  const isDayAvailable = (date: Date) => {
    const dayIndex = getDay(date);
    const dayKey = DAY_KEYS[dayIndex];
    return settings.days_available[dayKey];
  };

  const dates = Array.from({ length: settings.advance_booking_days }, (_, i) => addDays(new Date(), i + 1))
    .filter(isDayAvailable);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("reservations")
        .insert({
          user_id: user?.id || null,
          guest_name: booking.name,
          guest_email: booking.email || `${Date.now()}@guest.pizzeria.com`,
          guest_phone: booking.phone,
          reservation_date: booking.date ? format(booking.date, "yyyy-MM-dd") : "",
          reservation_time: booking.time,
          guests_count: booking.people,
          notes: booking.notes || null,
          status: "pending",
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error creating reservation:", error);
        toast.error("Errore durante la prenotazione");
        setIsSubmitting(false);
        return;
      }

      const code = `PR${data.id.slice(0, 8).toUpperCase()}`;
      setBookingCode(code);
      setStep(5);
      toast.success("Prenotazione inviata con successo!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Errore durante la prenotazione");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return booking.date !== null;
      case 2: return booking.time !== "";
      case 3: return booking.people > 0;
      case 4: return booking.name && booking.phone;
      default: return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Caricamento disponibilità...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-24 pb-8 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Prenota il Tuo <span className="text-primary">Tavolo</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Assicurati un posto nel nostro ristorante. Prenotazione facile e veloce.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Steps */}
        {step < 5 && (
          <div className="flex justify-between mb-12 relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10" />
            {[
              { num: 1, icon: Calendar, label: "Data" },
              { num: 2, icon: Clock, label: "Ora" },
              { num: 3, icon: Users, label: "Persone" },
              { num: 4, icon: User, label: "Dati" },
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    step >= s.num
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s.num ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={`text-sm mt-2 ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Date Selection */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center mb-8">Seleziona la data</h2>
            
            {dates.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nessuna data disponibile per le prenotazioni. Riprova più tardi.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {dates.map((date) => (
                  <Card
                    key={date.toISOString()}
                    className={`p-4 text-center cursor-pointer transition-all hover:border-primary ${
                      booking.date && isSameDay(booking.date, date)
                        ? "border-primary bg-primary/10"
                        : ""
                    }`}
                    onClick={() => setBooking({ ...booking, date, time: "" })}
                  >
                    <div className="text-sm text-muted-foreground">
                      {format(date, "EEE", { locale: it })}
                    </div>
                    <div className="text-2xl font-bold">{format(date, "d")}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(date, "MMM", { locale: it })}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Time Selection */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center mb-8">
              Seleziona l'orario per {booking.date && format(booking.date, "EEEE d MMMM", { locale: it })}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-w-2xl mx-auto">
              {settings.time_slots.map((time) => {
                const availability = slotAvailability[time];
                const isFull = availability && availability.available <= 0;
                const spotsLeft = availability?.available ?? settings.max_reservations_per_slot;
                
                return (
                  <div key={time} className="relative">
                    <Button
                      variant={booking.time === time ? "default" : "outline"}
                      size="lg"
                      onClick={() => !isFull && setBooking({ ...booking, time })}
                      className={`w-full text-lg ${isFull ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={isFull}
                    >
                      {time}
                    </Button>
                    {availability && (
                      <Badge 
                        variant={isFull ? "destructive" : spotsLeft <= 2 ? "secondary" : "outline"}
                        className="absolute -top-2 -right-2 text-xs"
                      >
                        {isFull ? "Pieno" : `${spotsLeft} posti`}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
            
            {settings.time_slots.length === 0 && (
              <Card className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nessuna fascia oraria disponibile per questa data.
                </p>
              </Card>
            )}
          </motion.div>
        )}

        {/* Step 3: People Selection */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center mb-8">Quante persone?</h2>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 max-w-2xl mx-auto">
              {peopleOptions.map((num) => (
                <Button
                  key={num}
                  variant={booking.people === num ? "default" : "outline"}
                  size="lg"
                  onClick={() => setBooking({ ...booking, people: num })}
                  className="text-xl aspect-square"
                >
                  {num}
                </Button>
              ))}
            </div>
            <p className="text-center text-muted-foreground">
              Per gruppi più numerosi, chiamaci al <span className="text-primary">02 1234567</span>
            </p>
          </motion.div>
        )}

        {/* Step 4: Contact Details */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 max-w-lg mx-auto"
          >
            <h2 className="text-2xl font-bold text-center mb-8">I tuoi dati</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nome e Cognome *</label>
                <Input
                  value={booking.name}
                  onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                  placeholder="Mario Rossi"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Telefono *</label>
                <Input
                  value={booking.phone}
                  onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                  placeholder="+39 333 1234567"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={booking.email}
                  onChange={(e) => setBooking({ ...booking, email: e.target.value })}
                  placeholder="mario@email.com"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Note (allergie, richieste speciali...)</label>
                <Textarea
                  value={booking.notes}
                  onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                  placeholder="Scrivi qui eventuali note..."
                  rows={3}
                />
              </div>
            </div>

            {/* Summary */}
            <Card className="p-4 bg-secondary/50">
              <h3 className="font-bold mb-2">Riepilogo prenotazione</h3>
              <div className="space-y-1 text-sm">
                <p><Calendar className="w-4 h-4 inline mr-2" />{booking.date && format(booking.date, "EEEE d MMMM yyyy", { locale: it })}</p>
                <p><Clock className="w-4 h-4 inline mr-2" />{booking.time}</p>
                <p><Users className="w-4 h-4 inline mr-2" />{booking.people} {booking.people === 1 ? "persona" : "persone"}</p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-12"
          >
            <div className="w-20 h-20 bg-basil/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-basil" />
            </div>
            
            <h2 className="text-3xl font-bold">Prenotazione Confermata!</h2>
            
            <Card className="p-6 max-w-md mx-auto">
              <div className="text-sm text-muted-foreground mb-2">Codice prenotazione</div>
              <div className="text-3xl font-mono font-bold text-primary mb-4">{bookingCode}</div>
              
              <div className="space-y-2 text-left">
                <p><strong>Data:</strong> {booking.date && format(booking.date, "EEEE d MMMM yyyy", { locale: it })}</p>
                <p><strong>Ora:</strong> {booking.time}</p>
                <p><strong>Persone:</strong> {booking.people}</p>
                <p><strong>Nome:</strong> {booking.name}</p>
              </div>
            </Card>
            
            <p className="text-muted-foreground">
              Ti abbiamo inviato un'email di conferma. Ti aspettiamo!
            </p>
            
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Torna alla Home
            </Button>
          </motion.div>
        )}

        {/* Navigation */}
        {step < 5 && (
          <div className="flex justify-between mt-12">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Indietro
            </Button>
            
            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
              >
                Avanti
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
              >
                {isSubmitting ? "Prenotando..." : "Conferma Prenotazione"}
                <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Prenota;
