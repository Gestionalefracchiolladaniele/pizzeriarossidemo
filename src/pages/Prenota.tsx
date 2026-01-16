import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, Check, User, AlertCircle, SquareStack } from "lucide-react";
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

interface TableAvailability {
  [tableId: string]: boolean; // true = available, false = booked
}

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

const peopleOptions = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

interface BookingData {
  date: Date | null;
  time: string;
  people: number;
  tableId: string;
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

// Visual table representation for selection
const TableVisual = ({ table, isSelected, isAvailable, onClick }: { 
  table: RestaurantTableWithHours; 
  isSelected: boolean;
  isAvailable: boolean;
  onClick: () => void;
}) => {
  const seats = table.seats;
  const tableNumber = table.table_number;
  
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
      className={`relative w-20 h-20 mx-auto cursor-pointer transition-all ${
        !isAvailable ? 'opacity-40 cursor-not-allowed' : ''
      }`}
      onClick={isAvailable ? onClick : undefined}
      whileHover={isAvailable ? { scale: 1.1 } : undefined}
      whileTap={isAvailable ? { scale: 0.95 } : undefined}
    >
      {/* Table surface */}
      <div
        className={`absolute inset-2 ${isRound ? 'rounded-full' : 'rounded-lg'} 
          ${isSelected ? 'bg-primary ring-4 ring-primary/30' : isAvailable ? 'bg-gradient-to-br from-amber-600 to-amber-800' : 'bg-muted'} 
          shadow-lg flex items-center justify-center border-4 ${isSelected ? 'border-primary-foreground/30' : 'border-amber-900/30'}`}
      >
        <span className={`text-sm font-bold ${isSelected || isAvailable ? 'text-white' : 'text-muted-foreground'}`}>
          {tableNumber}
        </span>
      </div>
      
      {/* Seats */}
      {seatPositions.slice(0, seats).map((pos, idx) => (
        <div
          key={idx}
          className={`absolute w-3 h-3 rounded-full shadow-sm
            ${isSelected ? 'bg-primary' : isAvailable ? 'bg-gradient-to-br from-gray-600 to-gray-800' : 'bg-gray-400'}`}
          style={pos}
        />
      ))}
    </motion.div>
  );
};

const Prenota = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booking, setBooking] = useState<BookingData>({
    date: null,
    time: "",
    people: 2,
    tableId: "",
    name: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [bookingCode, setBookingCode] = useState("");
  const [settings, setSettings] = useState<ReservationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [tables, setTables] = useState<RestaurantTableWithHours[]>([]);
  const [tableAvailability, setTableAvailability] = useState<TableAvailability>({});

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

  // Fetch table availability when date, time and people are selected
  useEffect(() => {
    if (booking.date && booking.time && booking.people > 0) {
      fetchTableAvailability(booking.date, booking.time);
    }
  }, [booking.date, booking.time, booking.people]);

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

  const fetchTableAvailability = async (date: Date, time: string) => {
    const dateStr = format(date, "yyyy-MM-dd");
    
    const { data, error } = await supabase
      .from("reservations")
      .select("table_id")
      .eq("reservation_date", dateStr)
      .eq("reservation_time", time)
      .neq("status", "cancelled")
      .not("table_id", "is", null);

    if (error) {
      console.error("Error fetching table reservations:", error);
      return;
    }

    const bookedTableIds = new Set((data || []).map(r => r.table_id));
    
    const availability: TableAvailability = {};
    tables.forEach(table => {
      // Table is available if:
      // 1. Not booked for this date/time
      // 2. Has enough seats for the party
      // 3. Has this time in its available_hours
      const hasTime = (table.available_hours || []).includes(time);
      availability[table.id] = !bookedTableIds.has(table.id) && table.seats >= booking.people && hasTime;
    });

    setTableAvailability(availability);
  };

  const isDayAvailable = (date: Date) => {
    const dayIndex = getDay(date);
    const dayKey = DAY_KEYS[dayIndex];
    return settings.days_available[dayKey];
  };

  const dates = Array.from({ length: settings.advance_booking_days }, (_, i) => addDays(new Date(), i + 1))
    .filter(isDayAvailable);

  // Calculate available time slots based on tables that can accommodate the party size
  const availableTimeSlots = useMemo(() => {
    // Get tables that have enough seats for the party
    const suitableTables = tables.filter(t => t.seats >= booking.people);
    
    if (suitableTables.length === 0) return [];
    
    // Get union of all available hours from suitable tables
    const allHours = new Set<string>();
    suitableTables.forEach(table => {
      (table.available_hours || []).forEach(hour => allHours.add(hour));
    });
    
    // Sort and return
    return Array.from(allHours).sort();
  }, [tables, booking.people]);

  // Filter tables suitable for the number of people AND have the selected time
  const suitableTables = tables.filter(t => 
    t.seats >= booking.people && 
    (t.available_hours || []).includes(booking.time)
  );
  const availableTables = suitableTables.filter(t => tableAvailability[t.id]);

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
      case 1: return booking.people > 0 && booking.date !== null && booking.time !== "";
      case 2: return booking.tableId !== "" || availableTables.length === 0;
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
        {/* Progress Steps - simplified to 4 steps */}
        {step < 5 && (
          <div className="flex justify-between mb-12 relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10" />
            {[
              { num: 1, icon: Users, label: "Dettagli" },
              { num: 2, icon: SquareStack, label: "Tavolo" },
              { num: 3, icon: User, label: "Dati" },
              { num: 4, icon: Check, label: "Riepilogo" },
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

        {/* Step 1: People, Date & Time Selection - All in one */}
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
                    onClick={() => setBooking({ ...booking, people: num, tableId: "", time: "" })}
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
                      onClick={() => setBooking({ ...booking, date, tableId: "", time: "" })}
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

            {/* Time Selection - filtered based on table availability */}
            {booking.date && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                  <Clock className="w-6 h-6 text-primary" />
                  A che ora?
                </h2>
                {availableTimeSlots.length === 0 ? (
                  <Card className="p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Nessun orario disponibile per {booking.people} persone.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Prova a selezionare un numero diverso di persone.
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 max-w-xl mx-auto">
                    {availableTimeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={booking.time === time ? "default" : "outline"}
                        size="lg"
                        onClick={() => setBooking({ ...booking, time, tableId: "" })}
                        className="text-lg"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 2: Table Selection */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Seleziona il tavolo</h2>
              <p className="text-muted-foreground">
                {format(booking.date!, "EEEE d MMMM", { locale: it })} alle {booking.time} • {booking.people} {booking.people === 1 ? 'persona' : 'persone'}
              </p>
            </div>

            {suitableTables.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  Nessun tavolo disponibile per {booking.people} persone alle {booking.time}.
                </p>
                <p className="text-sm text-muted-foreground">
                  Prova a selezionare un orario diverso.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setStep(1)}>
                  Cambia orario
                </Button>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {suitableTables.map((table) => {
                    const isAvailable = tableAvailability[table.id] ?? false;
                    const isSelected = booking.tableId === table.id;

                    return (
                      <Card
                        key={table.id}
                        className={`p-4 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary"
                            : isAvailable
                            ? "hover:border-primary cursor-pointer"
                            : "opacity-50"
                        }`}
                      >
                        <TableVisual
                          table={table}
                          isSelected={isSelected}
                          isAvailable={isAvailable}
                          onClick={() => setBooking({ ...booking, tableId: table.id })}
                        />
                        <div className="text-center mt-3">
                          <p className="font-semibold">Tavolo {table.table_number}</p>
                          <p className="text-sm text-muted-foreground">{table.seats} posti</p>
                          {!isAvailable && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              Occupato
                            </Badge>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {availableTables.length === 0 && suitableTables.length > 0 && (
                  <Card className="p-4 bg-muted/50 text-center">
                    <p className="text-muted-foreground">
                      Tutti i tavoli per {booking.people} persone sono già prenotati alle {booking.time}.
                    </p>
                    <Button variant="link" onClick={() => setStep(1)}>
                      Scegli un altro orario
                    </Button>
                  </Card>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Step 3: Personal Info */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 max-w-md mx-auto"
          >
            <h2 className="text-2xl font-bold text-center mb-8">I tuoi dati</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome e Cognome *</label>
                <Input
                  value={booking.name}
                  onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                  placeholder="Mario Rossi"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Telefono *</label>
                <Input
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
                  placeholder="mario@email.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Note (opzionale)</label>
                <Textarea
                  value={booking.notes}
                  onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                  placeholder="Allergie, richieste speciali..."
                  rows={3}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 max-w-md mx-auto"
          >
            <h2 className="text-2xl font-bold text-center mb-8">Riepilogo Prenotazione</h2>

            <Card className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data</span>
                <span className="font-semibold">
                  {booking.date && format(booking.date, "EEEE d MMMM yyyy", { locale: it })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orario</span>
                <span className="font-semibold">{booking.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Persone</span>
                <span className="font-semibold">{booking.people}</span>
              </div>
              {selectedTable && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tavolo</span>
                  <span className="font-semibold">
                    Tavolo {selectedTable.table_number} ({selectedTable.seats} posti)
                  </span>
                </div>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nome</span>
                  <span className="font-semibold">{booking.name}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-muted-foreground">Telefono</span>
                  <span className="font-semibold">{booking.phone}</span>
                </div>
                {booking.email && (
                  <div className="flex justify-between mt-2">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-semibold">{booking.email}</span>
                  </div>
                )}
                {booking.notes && (
                  <div className="mt-2">
                    <span className="text-muted-foreground">Note:</span>
                    <p className="text-sm mt-1 italic">"{booking.notes}"</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground text-center">
                Riceverai una conferma via email una volta che la prenotazione sarà accettata.
              </p>
            </Card>
          </motion.div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold mb-4">Prenotazione Inviata!</h1>

            <Card className="p-6 mb-6">
              <div className="text-sm text-muted-foreground mb-2">Codice prenotazione</div>
              <div className="text-3xl font-mono font-bold text-primary mb-4">{bookingCode}</div>
              <p className="text-muted-foreground">
                Ti contatteremo per confermare la prenotazione per il{" "}
                <strong>
                  {booking.date && format(booking.date, "d MMMM", { locale: it })} alle {booking.time}
                </strong>
                .
              </p>
            </Card>

            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Torna alla Home
            </Button>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        {step < 5 && (
          <div className="flex justify-between mt-12">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                ← Indietro
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
              >
                Avanti →
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Invio in corso..." : "Conferma Prenotazione"}
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
