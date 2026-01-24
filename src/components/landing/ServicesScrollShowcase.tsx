import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { UtensilsCrossed, ShoppingBag, Truck, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const services = [
  {
    id: 1,
    title: "Mangia da Noi",
    subtitle: "Esperienza Completa",
    description: "Vivi l'atmosfera autentica del nostro locale. Prenota il tuo tavolo e goditi una serata speciale con famiglia o amici.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200",
    icon: UtensilsCrossed,
    cta: { text: "Prenota Tavolo", link: "/prenota" },
    features: ["Ambiente accogliente", "Forno a vista", "Vini selezionati"],
  },
  {
    id: 2,
    title: "Asporto Veloce",
    subtitle: "Pronta in 20 Minuti",
    description: "Ordina online e ritira la tua pizza calda e fragrante. Sempre perfetta, pronta quando arrivi tu.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200",
    icon: ShoppingBag,
    cta: { text: "Ordina Asporto", link: "/ordina" },
    features: ["Ordine online", "Ritiro veloce", "Pizza sempre calda"],
  },
  {
    id: 3,
    title: "Consegna a Domicilio",
    subtitle: "Calda a Casa Tua",
    description: "La nostra pizza arriva a casa tua in 30 minuti. Calda, fragrante, come appena sfornata dal nostro forno.",
    image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=1200",
    icon: Truck,
    cta: { text: "Ordina Delivery", link: "/ordina" },
    features: ["Consegna 30 min", "Tracking ordine", "Pagamento alla consegna"],
  },
];

interface ServiceItemProps {
  service: typeof services[0];
  index: number;
  totalServices: number;
}

const ServiceItem = ({ service, index, totalServices }: ServiceItemProps) => {
  const itemRef = useRef<HTMLDivElement>(null);
  
  // Scroll-based animations like PizzaScrollShowcase
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start end", "end start"]
  });

  // Spring config for smooth animations
  const springConfig = { stiffness: 50, damping: 20 };

  // Transforms like PizzaScrollShowcase
  const rawOpacity = useTransform(scrollYProgress, [0, 0.2, 0.5, 0.8, 1], [0, 1, 1, 1, 0]);
  const rawY = useTransform(scrollYProgress, [0, 0.2, 0.5, 0.8, 1], [80, 0, 0, 0, -80]);
  
  const opacity = useSpring(rawOpacity, springConfig);
  const y = useSpring(rawY, springConfig);

  // Text animations
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.3, 0.5, 0.7, 0.9], [0, 1, 1, 1, 0]);
  const textX = useTransform(scrollYProgress, [0.1, 0.3], [index % 2 === 0 ? -30 : 30, 0]);
  
  const smoothTextOpacity = useSpring(textOpacity, springConfig);
  const smoothTextX = useSpring(textX, springConfig);

  // Alternate layout direction
  const isEven = index % 2 === 0;

  return (
    <div ref={itemRef} className="min-h-[80vh] flex items-center justify-center relative py-12">
      {/* Scroll indicator dots - like PizzaScrollShowcase */}
      <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-20">
        {[...Array(totalServices)].map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === index ? 'bg-white scale-150' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      <div className={`container mx-auto px-4 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center`}>
        
        {/* Image Side with scroll-based animation */}
        <motion.div 
          style={{ opacity, y }}
          className={`relative flex justify-center will-change-transform ${isEven ? 'lg:order-1' : 'lg:order-2'}`}
        >
          {/* Pulsing glow effect behind image - like PizzaScrollShowcase */}
          <motion.div
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-[85%] h-[85%] rounded-3xl bg-gradient-to-br from-white/40 via-white/20 to-transparent blur-3xl" />
          </motion.div>
          
          {/* Main Image */}
          <div className="relative w-full max-w-md lg:max-w-lg">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              {/* Icon Badge - animated */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
                className="absolute bottom-4 right-4 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white shadow-lg"
              >
                <service.icon className="w-8 h-8" />
              </motion.div>
            </motion.div>
            
            {/* Decorative elements */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -top-4 -left-4 w-16 h-16 border-2 border-dashed border-white/30 rounded-full"
            />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-white/20 rounded-3xl" />
          </div>
        </motion.div>

        {/* Content Side with scroll-based animation */}
        <motion.div 
          style={{ opacity: smoothTextOpacity, x: smoothTextX }}
          className={`space-y-6 will-change-transform ${isEven ? 'lg:order-2' : 'lg:order-1'} ${isEven ? 'lg:text-left' : 'lg:text-right'}`}
        >
          {/* Subtitle Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/20 ${isEven ? '' : 'lg:ml-auto'}`}
          >
            <service.icon className="w-4 h-4" />
            {service.subtitle}
          </motion.div>
          
          {/* Title */}
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white"
          >
            {service.title}
          </motion.h2>
          
          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-white/80 text-lg lg:text-xl leading-relaxed max-w-lg"
          >
            {service.description}
          </motion.p>
          
          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className={`flex flex-wrap gap-3 ${isEven ? '' : 'lg:justify-end'}`}
          >
            {service.features.map((feature, i) => (
              <motion.span 
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white/90"
              >
                {feature}
              </motion.span>
            ))}
          </motion.div>
          
          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
          >
            <Link to={service.cta.link}>
              <Button 
                size="lg" 
                className="bg-white hover:bg-white/90 text-[hsl(var(--section-green))] rounded-full px-8 shadow-lg group"
              >
                {service.cta.text}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

const ServicesScrollShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <section id="servizi" className="relative bg-[hsl(var(--section-green))]">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_hsl(var(--section-green-light)/0.4)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_hsl(var(--section-green-light)/0.3)_0%,_transparent_50%)]" />
      
      {/* Decorative dots pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}
      />
      
      {/* Floating decorative circles */}
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-40 right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl"
      />
      
      {/* Section Header */}
      <div className="pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 text-center"
        >
          <div className="inline-block px-4 py-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/20 mb-4">
            I Nostri Servizi
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Come Vuoi la Tua <span className="text-[hsl(var(--gold-light))]">Pizza</span>?
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Scegli il modo che preferisci per gustare le nostre specialità artigianali
          </p>
        </motion.div>
      </div>
      
      {/* Services Items - with scroll animations */}
      <div ref={containerRef}>
        {services.map((service, index) => (
          <ServiceItem 
            key={service.id} 
            service={service} 
            index={index} 
            totalServices={services.length}
          />
        ))}
      </div>
      
      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-20 text-center"
      >
        <p className="text-white/70 mb-6">
          Non sai cosa scegliere? Chiamaci!
        </p>
        <Button 
          variant="outline" 
          size="lg" 
          className="rounded-full border-white/30 text-white hover:bg-white hover:text-[hsl(var(--section-green))] bg-transparent"
        >
          📞 02 1234567
        </Button>
      </motion.div>
    </section>
  );
};

export default ServicesScrollShowcase;