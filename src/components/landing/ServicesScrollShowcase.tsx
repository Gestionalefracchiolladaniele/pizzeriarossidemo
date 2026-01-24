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
}

const ServiceItem = ({ service, index }: ServiceItemProps) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(itemRef, { margin: "-40% 0px -40% 0px" });
  
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start end", "end start"],
  });

  // Smooth spring animations
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  
  const rawScale = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [0.7, 0.95, 1, 0.95, 0.7]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0, 0.9, 1, 0.9, 0]);
  const rawRotate = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [-8, -2, 0, 2, 8]);
  const rawY = useTransform(scrollYProgress, [0, 0.5, 1], [80, 0, -80]);
  
  const scale = useSpring(rawScale, springConfig);
  const opacity = useSpring(rawOpacity, springConfig);
  const rotate = useSpring(rawRotate, springConfig);
  const y = useSpring(rawY, springConfig);

  // Alternate layout direction
  const isEven = index % 2 === 0;

  return (
    <div ref={itemRef} className="h-screen flex items-center justify-center relative">
      <div className={`container mx-auto px-4 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}>
        
        {/* Image Side */}
        <motion.div 
          style={{ scale, opacity, rotate, y }}
          className={`relative flex justify-center ${isEven ? 'lg:order-1' : 'lg:order-2'}`}
        >
          {/* Glow effect behind image */}
          <motion.div
            animate={{ 
              scale: isInView ? [1, 1.1, 1] : 1,
              opacity: isInView ? [0.3, 0.5, 0.3] : 0 
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-[90%] h-[90%] rounded-3xl bg-gradient-to-br from-white/30 via-white/20 to-transparent blur-3xl" />
          </motion.div>
          
          {/* Main Image */}
          <div className="relative w-full max-w-md lg:max-w-lg">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              {/* Icon Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: isInView ? 1 : 0 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="absolute bottom-4 right-4 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white shadow-lg"
              >
                <service.icon className="w-8 h-8" />
              </motion.div>
            </motion.div>
            
            {/* Decorative elements */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-4 -left-4 w-16 h-16 border-2 border-dashed border-white/30 rounded-full"
            />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-white/20 rounded-3xl" />
          </div>
        </motion.div>

        {/* Content Side */}
        <motion.div 
          style={{ opacity, y }}
          className={`space-y-6 ${isEven ? 'lg:order-2' : 'lg:order-1'} ${isEven ? 'lg:text-left' : 'lg:text-right'}`}
        >
          {/* Subtitle Badge */}
          <motion.div 
            initial={{ opacity: 0, x: isEven ? -20 : 20 }}
            animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : (isEven ? -20 : 20) }}
            transition={{ delay: 0.2 }}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/20 ${isEven ? '' : 'lg:ml-auto'}`}
          >
            <service.icon className="w-4 h-4" />
            {service.subtitle}
          </motion.div>
          
          {/* Title */}
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white"
          >
            {service.title}
          </motion.h2>
          
          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
            transition={{ delay: 0.4 }}
            className="text-white/80 text-lg lg:text-xl leading-relaxed max-w-lg"
          >
            {service.description}
          </motion.p>
          
          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
            transition={{ delay: 0.5 }}
            className={`flex flex-wrap gap-3 ${isEven ? '' : 'lg:justify-end'}`}
          >
            {service.features.map((feature, i) => (
              <span 
                key={i}
                className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white/90"
              >
                {feature}
              </span>
            ))}
          </motion.div>
          
          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
            transition={{ delay: 0.6 }}
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
      
      {/* Section Header - Sticky with SOLID background */}
      <div className="sticky top-0 z-30 bg-[hsl(var(--section-green))] pt-20 pb-16">
        {/* Bottom fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-[hsl(var(--section-green))] to-[hsl(var(--section-green)/0.95)]" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 text-center relative z-10"
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
      
      {/* Services Items */}
      <div ref={containerRef} className="-mt-20">
        {services.map((service, index) => (
          <ServiceItem key={service.id} service={service} index={index} />
        ))}
      </div>
      
      {/* Bottom Spacer with CTA */}
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
