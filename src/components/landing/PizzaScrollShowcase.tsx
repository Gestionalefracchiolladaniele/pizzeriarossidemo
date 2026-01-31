import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useRef } from "react";
import { Flame, Leaf, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const pizzas = [
  {
    id: 1,
    name: "MARGHERITA",
    subtitle: "La Regina delle Pizze",
    description: "POMODORO SAN MARZANO DOP • MOZZARELLA FIOR DI LATTE • BASILICO FRESCO • OLIO EVO",
    price: "8.00",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800",
    tag: "classica",
  },
  {
    id: 2,
    name: "DIAVOLA",
    subtitle: "Per Chi Ama il Piccante",
    description: "POMODORO • MOZZARELLA • SALAME PICCANTE CALABRESE • OLIO AL PEPERONCINO",
    price: "10.00",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800",
    tag: "piccante",
  },
  {
    id: 3,
    name: "QUATTRO FORMAGGI",
    subtitle: "Un'Esplosione di Sapori",
    description: "MOZZARELLA • GORGONZOLA DOP • FONTINA VALDOSTANA • PARMIGIANO 36 MESI",
    price: "11.00",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800",
    tag: "speciale",
  },
  {
    id: 4,
    name: "BUFALA E CRUDO",
    subtitle: "Il Gusto della Tradizione",
    description: "MOZZARELLA DI BUFALA DOP • PROSCIUTTO CRUDO DI PARMA 24 MESI • RUCOLA",
    price: "13.00",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800",
    tag: "speciale",
  },
  {
    id: 5,
    name: "ORTOLANA",
    subtitle: "Fresca e Leggera",
    description: "VERDURE GRIGLIATE DI STAGIONE • MOZZARELLA • OLIO EVO AL BASILICO",
    price: "10.00",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=800",
    tag: "vegetariana",
  },
];

const tagConfig = {
  classica: { icon: Sparkles, color: "text-primary", label: "Classica" },
  piccante: { icon: Flame, color: "text-red-500", label: "Piccante" },
  vegetariana: { icon: Leaf, color: "text-accent", label: "Vegetariana" },
  speciale: { icon: Star, color: "text-[hsl(var(--gold))]", label: "Speciale" },
};

interface PizzaItemProps {
  pizza: typeof pizzas[0];
  index: number;
  totalPizzas: number;
}

const PizzaItem = ({ pizza, index, totalPizzas }: PizzaItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20% 0px -20% 0px" });
  
  // Optimized spring config for smoother animations
  const springConfig = { stiffness: 50, damping: 20 };
  
  // Simplified transforms - only opacity and y for performance
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const rawOpacity = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [0.3, 1, 1, 1, 0.3]);
  const rawY = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -60]);
  
  const opacity = useSpring(rawOpacity, springConfig);
  const y = useSpring(rawY, springConfig);

  // Text animations
  const textX = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [-100, -30, 0, 30, 100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [0, 0.5, 1, 0.5, 0]);
  const smoothTextX = useSpring(textX, springConfig);
  const smoothTextOpacity = useSpring(textOpacity, springConfig);

  const tag = tagConfig[pizza.tag as keyof typeof tagConfig];
  const TagIcon = tag.icon;

  // Alternate layout for desktop
  const isEven = index % 2 === 0;

  return (
    <div 
      ref={ref}
      className="py-12 lg:py-20 flex items-center justify-center relative will-change-transform"
    >
      <div className="container mx-auto px-4">
        <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center justify-center gap-6 lg:gap-12`}>
          
          {/* Pizza Image - Simplified animations */}
          <motion.div
            style={{ opacity, y }}
            className="relative w-[65vw] max-w-[400px] lg:w-[40vw] lg:max-w-[450px] aspect-square will-change-transform"
          >
            {/* Glow effect behind pizza */}
            <motion.div
              animate={isInView ? { 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-primary/20 blur-3xl"
            />
            
            {/* Secondary glow */}
            <motion.div
              animate={isInView ? { 
                scale: [1.1, 1, 1.1],
                opacity: [0.2, 0.4, 0.2]
              } : {}}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute inset-3 rounded-full bg-[hsl(var(--gold))]/15 blur-2xl"
            />

            {/* Pizza image - circular with soft shadow */}
            <motion.img
              src={pizza.image}
              alt={pizza.name}
              className="relative z-10 w-full h-full object-cover rounded-full shadow-xl"
              style={{
                boxShadow: isInView 
                  ? "0 20px 60px -15px hsl(var(--pizzeria-red) / 0.35), 0 12px 32px -12px rgba(0,0,0,0.25)"
                  : "0 8px 24px -8px rgba(0,0,0,0.15)"
              }}
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            />

            {/* Price badge floating */}
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={isInView ? { scale: 1, rotate: -12 } : { scale: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute -top-1 -right-1 lg:top-3 lg:right-3 z-20 bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-bold text-lg lg:text-xl shadow-red-lg"
            >
              €{pizza.price}
            </motion.div>

            {/* Tag badge floating */}
            <motion.div
              initial={{ scale: 0, x: 16 }}
              animate={isInView ? { scale: 1, x: 0 } : { scale: 0, x: 16 }}
              transition={{ delay: 0.4, type: "spring" }}
              className={`absolute -bottom-1 -left-1 lg:bottom-6 lg:left-6 z-20 flex items-center gap-1.5 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-border ${tag.color}`}
            >
              <TagIcon className="w-3.5 h-3.5" />
              <span className="font-semibold text-xs">{tag.label}</span>
            </motion.div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            style={{ x: smoothTextX, opacity: smoothTextOpacity }}
            className={`text-center lg:text-left max-w-md ${isEven ? '' : 'lg:text-right'}`}
          >
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="text-primary font-medium tracking-wider uppercase text-xs mb-1.5"
            >
              {pizza.subtitle}
            </motion.p>

            {/* Pizza Name - Large display */}
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, type: "spring" }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-3 tracking-tight"
            >
              {pizza.name}
            </motion.h2>

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className={`h-0.5 bg-gradient-red w-20 mb-4 ${isEven ? 'lg:origin-left' : 'lg:origin-right lg:ml-auto'} mx-auto lg:mx-0`}
            />

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-xs md:text-sm tracking-wide leading-relaxed"
            >
              {pizza.description}
            </motion.p>

            {/* Order button - only on last pizza or when visible */}
            {index === totalPizzas - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 }}
                className="mt-6"
              >
                <Button 
                  asChild
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-red-lg hover-glow-red text-base px-6"
                >
                  <Link to="/menu">Vedi Tutto il Menu</Link>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator dots on the side */}
      <div className="absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30">
        {pizzas.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i === index && isInView ? 1.4 : 1,
              backgroundColor: i === index && isInView 
                ? "hsl(var(--primary))" 
                : "hsl(var(--muted))"
            }}
            className="w-1.5 h-1.5 rounded-full transition-colors"
          />
        ))}
      </div>
    </div>
  );
};

const PizzaScrollShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  return (
    <section ref={containerRef} className="relative bg-gradient-to-br from-[hsl(var(--section-orange-strong))] via-[hsl(var(--section-orange-strong-light))] to-[hsl(var(--section-orange-strong))]">
      {/* Background gradients for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_hsl(var(--section-orange-strong-light)/0.8)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_hsl(var(--gold)/0.2)_0%,_transparent_50%)]" />
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-pattern-dots opacity-20" />
      
      {/* Ambient glow decorations */}
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-[hsl(var(--gold))]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-[hsl(var(--section-orange-strong-light))]/25 rounded-full blur-3xl pointer-events-none" />

      {/* Header - Sticky */}
      <div 
        ref={headerRef}
        className="sticky top-16 z-20 py-6 pointer-events-none"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={isHeaderInView ? { scale: 1 } : {}}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card/80 backdrop-blur-sm rounded-full border border-border shadow-md mb-3"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">Le Nostre Specialità</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Pizza Items - Each takes full viewport height */}
      <div className="relative">
        {pizzas.map((pizza, index) => (
          <PizzaItem 
            key={pizza.id} 
            pizza={pizza} 
            index={index}
            totalPizzas={pizzas.length}
          />
        ))}
      </div>

      {/* Final CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="py-16 text-center relative z-10"
      >
        <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
          E molte altre <span className="text-gradient-red">delizie</span> ti aspettano
        </h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
          Scopri il nostro menu completo con oltre 30 pizze artigianali
        </p>
        <Button 
          asChild
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-red-lg hover-glow-red text-base px-8 py-5"
        >
          <Link to="/menu">Esplora il Menu Completo</Link>
        </Button>
      </motion.div>
    </section>
  );
};

export default PizzaScrollShowcase;
