import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ContactSection = () => {
  return (
    <section id="contatti" className="py-20 lg:py-28 bg-gradient-cream relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-pattern-dots opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <div className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Contatti
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Vieni a <span className="text-gradient-red">Trovarci</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Siamo nel cuore di Milano. Passa a trovarci o contattaci per qualsiasi informazione
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Map & Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Map */}
            <div className="relative rounded-2xl overflow-hidden h-64 lg:h-80 border border-border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2798.0515!2d9.1900!3d45.4642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDI3JzUxLjEiTiA5wrAxMScyNC4wIkU!5e0!3m2!1sit!2sit!4v1600000000000!5m2!1sit!2sit"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mappa Pizzeria"
              />
            </div>

            {/* Info Cards - Premium Vertical List */}
            <div className="space-y-4">
              {[
                { icon: MapPin, title: "Indirizzo", line1: "Via Roma 123", line2: "20121 Milano (MI)" },
                { icon: Phone, title: "Telefono", line1: "02 1234567", line2: "WhatsApp attivo" },
                { icon: Mail, title: "Email", line1: "info@pizzeriarossi.it", line2: "ordini@pizzeriarossi.it" },
                { icon: Clock, title: "Orari", line1: "Mar-Dom: 18:00-23:00", line2: "Lunedì: Chiuso" },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4, scale: 1.01 }}
                  className="bg-card rounded-2xl p-5 border-2 border-border hover:border-primary/30 hover:shadow-[0_8px_30px_-8px_hsl(var(--pizzeria-red)/0.1)] transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground mb-0.5">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.line1}
                        <span className="mx-2 text-border">•</span>
                        {item.line2}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-card rounded-3xl p-6 lg:p-8 border-2 border-border shadow-[0_8px_30px_-8px_rgba(0,0,0,0.08)]">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4">
                Prenotazione
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Prenota il Tuo Tavolo
              </h3>
              <p className="text-muted-foreground mb-6">
                Compila il form e ti ricontatteremo per confermare la prenotazione
              </p>

              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nome *
                    </label>
                    <Input 
                      placeholder="Il tuo nome" 
                      className="bg-background border-border focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Telefono *
                    </label>
                    <Input 
                      placeholder="+39 333 1234567" 
                      className="bg-background border-border focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Data *
                    </label>
                    <Input 
                      type="date" 
                      className="bg-background border-border focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Ora *
                    </label>
                    <Input 
                      type="time" 
                      className="bg-background border-border focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Numero persone *
                  </label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="20" 
                    placeholder="2" 
                    className="bg-background border-border focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Note (opzionale)
                  </label>
                  <Textarea 
                    placeholder="Allergie, richieste speciali, occasioni particolari..."
                    rows={3}
                    className="bg-background border-border focus:border-primary resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-gold"
                >
                  Invia Richiesta
                  <Send className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Ti contatteremo entro 2 ore per confermare la prenotazione
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
