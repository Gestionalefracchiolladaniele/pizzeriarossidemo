import { motion } from "framer-motion";
import { UtensilsCrossed, ShoppingBag, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: UtensilsCrossed,
    title: "Mangia da Noi",
    description: "Vivi l'esperienza completa nel nostro locale accogliente. Prenota il tuo tavolo e goditi l'atmosfera autentica.",
    cta: "Prenota Tavolo",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800",
  },
  {
    icon: ShoppingBag,
    title: "Asporto Veloce",
    description: "Ordina online e ritira la tua pizza calda e fragrante. Pronta in 20 minuti, sempre perfetta.",
    cta: "Ordina Asporto",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800",
  },
  {
    icon: Truck,
    title: "Consegna a Domicilio",
    description: "La nostra pizza arriva a casa tua in 30 minuti. Calda, fragrante, come appena sfornata.",
    cta: "Ordina Delivery",
    image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=800",
  },
];

const ServicesSection = () => {
  return (
    <section id="servizi" className="py-16 lg:py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 lg:mb-12"
        >
          <div className="inline-block px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
            I Nostri Servizi
          </div>
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Come Vuoi la Tua <span className="text-primary">Pizza</span>?
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Scegli il modo che preferisci per gustare le nostre specialità
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.6 }}
              className="group"
            >
              <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                {/* Image */}
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      <service.icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-1">
                    {service.description}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full group/btn border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground text-sm"
                  >
                    {service.cta}
                    <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
