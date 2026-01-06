import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, Check, ArrowLeft, ArrowRight, Phone, User } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

const timeSlots = [
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"
];

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

const Prenota = () => {
  const [step, setStep] = useState(1);
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

  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  const handleSubmit = () => {
    const code = `PR${Date.now().toString(36).toUpperCase()}`;
    setBookingCode(code);
    setStep(5);
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
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {dates.map((date) => (
                <Card
                  key={date.toISOString()}
                  className={`p-4 text-center cursor-pointer transition-all hover:border-primary ${
                    booking.date && isSameDay(booking.date, date)
                      ? "border-primary bg-primary/10"
                      : ""
                  }`}
                  onClick={() => setBooking({ ...booking, date })}
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
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-2xl mx-auto">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={booking.time === time ? "default" : "outline"}
                  size="lg"
                  onClick={() => setBooking({ ...booking, time })}
                  className="text-lg"
                >
                  {time}
                </Button>
              ))}
            </div>
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
                disabled={!canProceed()}
              >
                Conferma Prenotazione
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
