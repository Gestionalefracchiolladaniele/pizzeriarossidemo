import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, Check, User, AlertCircle, SquareStack, Clock } from "lucide-react";
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
import { Link, useNavigate } from "react-router-dom";

interface RestaurantTableWithHours {
  id: string;
  table_number: number;
  seats: number;
  is_active: boolean | null;
  available_hours: string[] | null;
  created_at: string;
  updated_at: string;
}

interface ReservationSettings {
  days_available: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  advance_booking_days: number;
}

interface TableWithAvailability extends RestaurantTableWithHours {
  availableSlots: string[]; // Hours still available for this table on selected date
}

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

const peopleOptions = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

interface BookingData {
  date: Date | null;
  people: number;
  tableId: string;
  selectedTime: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const DEFAULT_SETTINGS: ReservationSettings = {
  days_available: {
    monday: true, tuesday: true, wednesday: true, thursday: true,
    friday: true, saturday: true, sunday: false,
  },
  advance_booking_days: 14,
};

// Visual table representation for selection
const TableVisual = ({ table, isSelected, availableSlots, onClick }: { 
  table: RestaurantTableWithHours; 
  isSelected: boolean;
  availableSlots: string[];
  onClick: () => void;
}) => {
  const seats = table.seats;
  const tableNumber = table.table_number;
  const hasSlots = availableSlots.length > 0;
  
  const getSeatPositions = () => {
    const positions: { top?: string; bottom?: string; left?: string; right?: string; transform?: string }[] = [];
    
    if (seats === 2) {
      positions.push({ left: "50%", top: "-6px", transform: "translateX(-50%)" });
      positions.push({ left: "50%", bottom: "-6px", transform: "translateX(-50%)" });
    } else if (seats === 4) {
      positions.push({ left: "50%", top: "-6px", transform: "translateX(-50%)" });
      positions.push({ left: "50%", bottom: "-6px", transform: "translateX(-50%)" });
      positions.push({ left: "-6px", top: "50%", transform: "translateY(-50%)" });
      positions.push({ right: "-6px", top: "50%", transform: "translateY(-50%)" });
    } else if (seats === 6) {
      positions.push({ left: "25%", top: "-6px", transform: "translateX(-50%)" });
      positions.push({ left: "75%", top: "-6px", transform: "translateX(-50%)" });
      positions.push({ left: "25%", bottom: "-6px", transform: "translateX(-50%)" });
      positions.push({ left: "75%", bottom: "-6px", transform: "translateX(-50%)" });
      positions.push({ left: "-6px", top: "50%", transform: "translateY(-50%)" });
      positions.push({ right: "-6px", top: "50%", transform: "translateY(-50%)" });
    } else {
      for (let i = 0; i < Math.min(seats, 8); i++) {
        const angle = (i * 360) / Math.min(seats, 8);
        const radius = 35;
        const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
        const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
        positions.push({
          left: `calc(50% + ${x}px)`,
          top: `calc(50% + ${y}px)`,
          transform: "translate(-50%, -50%)",
        });
      }
    }
    
    return positions;
  };
  
  const seatPositions = getSeatPositions();
  const isRound = seats <= 2 || seats >= 5;
  
  return (
    <motion.div
      className={`relative cursor-pointer transition-all ${
        !hasSlots ? 'opacity-40 cursor-not-allowed' : ''
      }`}
      onClick={hasSlots ? onClick : undefined}
      whileHover={hasSlots ? { scale: 1.05 } : undefined}
      whileTap={hasSlots ? { scale: 0.95 } : undefined}
    >
      <div className="w-24 h-24 mx-auto relative">
        {/* Table surface */}
        <div
          className={`absolute inset-2 ${isRound ? 'rounded-full' : 'rounded-lg'} 
            ${isSelected ? 'bg-primary ring-4 ring-primary/30' : hasSlots ? 'bg-gradient-to-br from-amber-600 to-amber-800' : 'bg-muted'} 
            shadow-lg flex items-center justify-center border-4 ${isSelected ? 'border-primary-foreground/30' : 'border-amber-900/30'}`}
        >
          <span className={`text-lg font-bold ${isSelected || hasSlots ? 'text-white' : 'text-muted-foreground'}`}>
            {tableNumber}
          </span>
        </div>
        
        {/* Seats */}
        {seatPositions.slice(0, seats).map((pos, idx) => (
          <div
            key={idx}
            className={`absolute w-3 h-3 rounded-full shadow-sm
              ${isSelected ? 'bg-primary' : hasSlots ? 'bg-gradient-to-br from-gray-600 to-gray-800' : 'bg-gray-400'}`}
            style={pos}
          />
        ))}
      </div>
      
      {/* Info below table */}
      <div className="text-center mt-2">
        <p className="text-sm font-medium">{seats} posti</p>
        {hasSlots ? (
          <p className="text-xs text-muted-foreground">{availableSlots.length} orari</p>
        ) : (
          <p className="text-xs text-destructive">Non disponibile</p>
        )}
      </div>
    </motion.div>
  );
};

const Prenota = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booking, setBooking] = useState<BookingData>({
    date: null,
    people: 2,
    tableId: "",
    selectedTime: "",
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Devi accedere per prenotare un tavolo");
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  const [bookingCode, setBookingCode] = useState("");
  const [settings, setSettings] = useState<ReservationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [tables, setTables] = useState<RestaurantTableWithHours[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Map<string, Set<string>>>(new Map()); // tableId -> Set of booked times

  useEffect(() => {
    fetchSettings();
    fetchTables();
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

  // Fetch booked slots when date is selected
  useEffect(() => {
    if (booking.date) {
      fetchBookedSlots(booking.date);
    }
  }, [booking.date]);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("pizzeria_settings")
      .select("reservation_settings")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching settings:", error);
      setIsLoading(false);
      return;
    }

    if (data?.reservation_settings) {
      const fetched = data.reservation_settings as any;
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

  const fetchTables = async () => {
    const { data, error } = await supabase
      .from("restaurant_tables")
      .select("*")
      .eq("is_active", true)
      .order("table_number");

    if (error) {
      console.error("Error fetching tables:", error);
      return;
    }

    setTables((data || []) as RestaurantTableWithHours[]);
  };

  const fetchBookedSlots = async (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    
    const { data, error } = await supabase
      .from("reservations")
      .select("table_id, reservation_time")
      .eq("reservation_date", dateStr)
      .neq("status", "cancelled")
      .not("table_id", "is", null);

    if (error) {
      console.error("Error fetching reservations:", error);
      return;
    }

    // Group booked times by table
    const booked = new Map<string, Set<string>>();
    (data || []).forEach(r => {
      if (!booked.has(r.table_id!)) {
        booked.set(r.table_id!, new Set());
      }
      // Normalize time format (remove seconds if present)
      const time = r.reservation_time.slice(0, 5);
      booked.get(r.table_id!)!.add(time);
    });
    
    setBookedSlots(booked);
  };

  const isDayAvailable = (date: Date) => {
    const dayIndex = getDay(date);
    const dayKey = DAY_KEYS[dayIndex];
    return settings.days_available[dayKey];
  };

  const dates = Array.from({ length: settings.advance_booking_days }, (_, i) => addDays(new Date(), i + 1))
    .filter(isDayAvailable);

  // Calculate available tables with their available time slots
  const tablesWithAvailability: TableWithAvailability[] = useMemo(() => {
    if (!booking.date) return [];
    
    return tables
      .filter(t => t.seats >= booking.people) // Only tables with enough seats
      .map(table => {
        const tableBookedTimes = bookedSlots.get(table.id) || new Set();
        const tableHours = table.available_hours || [];
        
        // Available slots = table's hours minus already booked
        const availableSlots = tableHours.filter(hour => !tableBookedTimes.has(hour));
        
        return {
          ...table,
          availableSlots,
        };
      })
      .sort((a, b) => {
        // Sort: available first, then by seats ascending
        if (a.availableSlots.length > 0 && b.availableSlots.length === 0) return -1;
        if (a.availableSlots.length === 0 && b.availableSlots.length > 0) return 1;
        return a.seats - b.seats;
      });
  }, [tables, booking.date, booking.people, bookedSlots]);

  const selectedTableData = tablesWithAvailability.find(t => t.id === booking.tableId);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    if (!booking.name.trim() || !booking.phone.trim()) {
      toast.error("Inserisci nome e telefono");
      return;
    }
    
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
          reservation_time: booking.selectedTime,
          guests_count: booking.people,
          table_id: booking.tableId || null,
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
      setStep(5); // Confirmation step
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
      case 1: return booking.people > 0 && booking.date !== null;
      case 2: return booking.tableId !== "" && booking.selectedTime !== "";
      case 3: return booking.name && booking.phone;
      default: return false;
    }
  };

  const selectedTable = tables.find(t => t.id === booking.tableId);

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
              { num: 2, icon: SquareStack, label: "Tavolo" },
              { num: 3, icon: User, label: "Dati" },
              { num: 4, icon: Check, label: "Conferma" },
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
                <span className={`text-xs mt-2 ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Step 1: People & Date */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Number of People */}
            <div>
              <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Quante persone?
              </h2>
              <div className="flex flex-wrap justify-center gap-3 max-w-md mx-auto">
                {peopleOptions.map((num) => (
                  <Button
                    key={num}
                    variant={booking.people === num ? "default" : "outline"}
                    size="lg"
                    className="w-14 h-14 text-lg font-bold"
                    onClick={() => setBooking({ ...booking, people: num, tableId: "", selectedTime: "" })}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                Quando?
              </h2>
              {dates.length === 0 ? (
                <Card className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nessuna data disponibile per le prenotazioni. Riprova più tardi.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3">
                  {dates.slice(0, 14).map((date) => (
                    <Card
                      key={date.toISOString()}
                      className={`p-3 text-center cursor-pointer transition-all hover:border-primary ${
                        booking.date && isSameDay(booking.date, date)
                          ? "border-primary bg-primary/10"
                          : ""
                      }`}
                      onClick={() => setBooking({ ...booking, date, tableId: "", selectedTime: "" })}
                    >
                      <div className="text-xs text-muted-foreground uppercase">
                        {format(date, "EEE", { locale: it })}
                      </div>
                      <div className="text-xl font-bold">{format(date, "d")}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(date, "MMM", { locale: it })}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={() => setStep(2)}
                disabled={!canProceed()}
              >
                Continua
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Table & Time Selection */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                ← Indietro
              </Button>
              <div className="text-sm text-muted-foreground">
                {booking.people} {booking.people === 1 ? "persona" : "persone"} • {booking.date && format(booking.date, "d MMMM", { locale: it })}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <SquareStack className="w-6 h-6 text-primary" />
              Scegli il tuo tavolo
            </h2>

            {tablesWithAvailability.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Nessun tavolo disponibile per {booking.people} persone in questa data.
                </p>
                <Button variant="outline" onClick={() => setStep(1)}>
                  Prova un'altra data
                </Button>
              </Card>
            ) : (
              <>
                {/* Tables Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {tablesWithAvailability.map((table) => (
                    <TableVisual
                      key={table.id}
                      table={table}
                      isSelected={booking.tableId === table.id}
                      availableSlots={table.availableSlots}
                      onClick={() => setBooking({ ...booking, tableId: table.id, selectedTime: "" })}
                    />
                  ))}
                </div>

                {/* Time Selection - shown after table is selected */}
                {booking.tableId && selectedTableData && selectedTableData.availableSlots.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8"
                  >
                    <h3 className="text-xl font-bold text-center mb-4 flex items-center justify-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Scegli l'orario per Tavolo {selectedTable?.table_number}
                    </h3>
                    <div className="flex flex-wrap justify-center gap-3">
                      {selectedTableData.availableSlots.map((time) => (
                        <Button
                          key={time}
                          variant={booking.selectedTime === time ? "default" : "outline"}
                          size="lg"
                          onClick={() => setBooking({ ...booking, selectedTime: time })}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}

            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={() => setStep(3)}
                disabled={!canProceed()}
              >
                Continua
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Personal Data */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                ← Indietro
              </Button>
              <div className="text-sm text-muted-foreground">
                Tavolo {selectedTable?.table_number} • {booking.selectedTime}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <User className="w-6 h-6 text-primary" />
              I tuoi dati
            </h2>

            <Card className="p-6 space-y-4 max-w-md mx-auto">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome *</label>
                <Input
                  value={booking.name}
                  onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                  placeholder="Mario Rossi"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Telefono *</label>
                <Input
                  type="tel"
                  value={booking.phone}
                  onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                  placeholder="+39 333 1234567"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input
                  type="email"
                  value={booking.email}
                  onChange={(e) => setBooking({ ...booking, email: e.target.value })}
                  placeholder="mario@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Note (opzionale)</label>
                <Textarea
                  value={booking.notes}
                  onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                  placeholder="Es. seggiolone, allergie, occasione speciale..."
                  rows={3}
                />
              </div>
            </Card>

            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={() => setStep(4)}
                disabled={!canProceed()}
              >
                Continua
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Button variant="ghost" onClick={() => setStep(3)}>
              ← Indietro
            </Button>

            <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Check className="w-6 h-6 text-primary" />
              Riepilogo Prenotazione
            </h2>

            <Card className="p-6 max-w-md mx-auto">
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium">
                    {booking.date && format(booking.date, "EEEE d MMMM yyyy", { locale: it })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Orario</span>
                  <span className="font-medium">{booking.selectedTime}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Persone</span>
                  <span className="font-medium">{booking.people}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Tavolo</span>
                  <span className="font-medium">N° {selectedTable?.table_number} ({selectedTable?.seats} posti)</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Nome</span>
                  <span className="font-medium">{booking.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Telefono</span>
                  <span className="font-medium">{booking.phone}</span>
                </div>
                {booking.notes && (
                  <div className="py-2">
                    <span className="text-muted-foreground block mb-1">Note</span>
                    <span className="text-sm">{booking.notes}</span>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Invio in corso..." : "Conferma Prenotazione"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-basil/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-basil" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Prenotazione Confermata!</h1>
            
            <Card className="p-6 mb-6 max-w-md mx-auto">
              <div className="text-sm text-muted-foreground mb-2">Codice prenotazione</div>
              <div className="text-2xl font-mono font-bold text-primary mb-4">{bookingCode}</div>
              <div className="text-left space-y-2">
                <p><strong>Data:</strong> {booking.date && format(booking.date, "EEEE d MMMM", { locale: it })}</p>
                <p><strong>Orario:</strong> {booking.selectedTime}</p>
                <p><strong>Tavolo:</strong> N° {selectedTable?.table_number}</p>
                <p><strong>Persone:</strong> {booking.people}</p>
              </div>
            </Card>
            
            <p className="text-muted-foreground mb-6">
              Riceverai una conferma quando la prenotazione sarà approvata.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user && (
                <Link to="/profilo">
                  <Button variant="outline">
                    <User className="w-4 h-4 mr-2" />
                    Vedi nel Profilo
                  </Button>
                </Link>
              )}
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Torna alla Home
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Prenota;
