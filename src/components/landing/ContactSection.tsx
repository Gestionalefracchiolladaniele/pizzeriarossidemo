import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { usePizzeriaSettings } from "@/hooks/usePizzeriaSettings";

const ContactSection = () => {
  const { settings, isLoading } = usePizzeriaSettings();

  return (
    <section id="contatti" className="py-20 lg:py-28 bg-gradient-to-br from-[hsl(var(--section-orange-strong))] via-[hsl(var(--section-orange-strong-light))] to-[hsl(var(--section-orange-strong))] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_hsl(var(--gold)/0.15)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_hsl(var(--section-orange-strong-light)/0.4)_0%,_transparent_50%)]" />
      
      {/* Decorative dots pattern */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--pizzeria-red)) 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}
      />
      
      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 w-48 h-48 rounded-full bg-[hsl(var(--gold))]/20 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-20 w-56 h-56 rounded-full bg-[hsl(var(--pizzeria-red))]/15 blur-3xl"
      />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <div className="inline-block px-4 py-2 bg-foreground/10 backdrop-blur-sm text-foreground/90 text-sm font-semibold rounded-full mb-4 border border-foreground/20">
            Contatti
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Vieni a <span className="text-primary">Trovarci</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Siamo nel cuore di Milano. Passa a trovarci o contattaci per qualsiasi informazione
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative rounded-2xl overflow-hidden h-64 lg:h-80 border-2 border-foreground/15 shadow-lg">
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
          </motion.div>

          {/* Info Cards - Premium Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { 
                icon: MapPin, 
                title: "Indirizzo", 
                line1: settings.address?.split(',')[0] || "Via Roma 123", 
                line2: settings.address?.split(',').slice(1).join(',').trim() || "20121 Milano (MI)" 
              },
              { 
                icon: Phone, 
                title: "Telefono", 
                line1: settings.phone || "02 1234567", 
                line2: "WhatsApp attivo" 
              },
              { 
                icon: Mail, 
                title: "Email", 
                line1: settings.email || "info@pizzeriarossi.it", 
                line2: "ordini@pizzeriarossi.it" 
              },
              { icon: Clock, title: "Orari", line1: "Mar-Dom: 18:00-23:00", line2: "Lunedì: Chiuso" },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-card/90 backdrop-blur-sm rounded-2xl p-5 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-0.5">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.line1}
                      <span className="mx-2 text-muted-foreground/50">•</span>
                      {item.line2}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
