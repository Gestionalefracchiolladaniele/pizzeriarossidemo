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
      className="py-16 lg:py-24 flex items-center justify-center relative will-change-transform"
    >
      <div className="container mx-auto px-4">
        <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center justify-center gap-8 lg:gap-16`}>
          
          {/* Pizza Image - Simplified animations */}
          <motion.div
            style={{ opacity, y }}
            className="relative w-[75vw] max-w-[500px] lg:w-[45vw] lg:max-w-[550px] aspect-square will-change-transform"
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
              className="absolute inset-4 rounded-full bg-[hsl(var(--gold))]/15 blur-2xl"
            />

            {/* Pizza image - circular with soft shadow */}
            <motion.img
              src={pizza.image}
              alt={pizza.name}
              className="relative z-10 w-full h-full object-cover rounded-full shadow-2xl"
              style={{
                boxShadow: isInView 
                  ? "0 25px 80px -20px hsl(var(--pizzeria-red) / 0.4), 0 15px 40px -15px rgba(0,0,0,0.3)"
                  : "0 10px 30px -10px rgba(0,0,0,0.2)"
              }}
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            />

            {/* Price badge floating */}
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={isInView ? { scale: 1, rotate: -12 } : { scale: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute -top-2 -right-2 lg:top-4 lg:right-4 z-20 bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-xl lg:text-2xl shadow-red-lg"
            >
              €{pizza.price}
            </motion.div>

            {/* Tag badge floating */}
            <motion.div
              initial={{ scale: 0, x: 20 }}
              animate={isInView ? { scale: 1, x: 0 } : { scale: 0, x: 20 }}
              transition={{ delay: 0.4, type: "spring" }}
              className={`absolute -bottom-2 -left-2 lg:bottom-8 lg:left-8 z-20 flex items-center gap-2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-border ${tag.color}`}
            >
              <TagIcon className="w-4 h-4" />
              <span className="font-semibold text-sm">{tag.label}</span>
            </motion.div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            style={{ x: smoothTextX, opacity: smoothTextOpacity }}
            className={`text-center lg:text-left max-w-lg ${isEven ? '' : 'lg:text-right'}`}
          >
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="text-primary font-medium tracking-wider uppercase text-sm mb-2"
            >
              {pizza.subtitle}
            </motion.p>

            {/* Pizza Name - Large display */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, type: "spring" }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-black text-foreground mb-4 tracking-tight"
            >
              {pizza.name}
            </motion.h2>

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className={`h-1 bg-gradient-red w-24 mb-6 ${isEven ? 'lg:origin-left' : 'lg:origin-right lg:ml-auto'} mx-auto lg:mx-0`}
            />

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-sm md:text-base tracking-wide leading-relaxed"
            >
              {pizza.description}
            </motion.p>

            {/* Order button - only on last pizza or when visible */}
            {index === totalPizzas - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 }}
                className="mt-8"
              >
                <Button 
                  asChild
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-red-lg hover-glow-red text-lg px-8"
                >
                  <Link to="/menu">Vedi Tutto il Menu</Link>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator dots on the side */}
      <div className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
        {pizzas.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i === index && isInView ? 1.5 : 1,
              backgroundColor: i === index && isInView 
                ? "hsl(var(--primary))" 
                : "hsl(var(--muted))"
            }}
            className="w-2 h-2 rounded-full transition-colors"
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
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[hsl(var(--gold))]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-[hsl(var(--section-orange-strong-light))]/25 rounded-full blur-3xl pointer-events-none" />

      {/* Header - Sticky */}
      <div 
        ref={headerRef}
        className="sticky top-20 z-20 py-8 pointer-events-none"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={isHeaderInView ? { scale: 1 } : {}}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-border shadow-lg mb-4"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Le Nostre Specialità</span>
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
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-20 text-center relative z-10"
      >
        <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
          E molte altre <span className="text-gradient-red">delizie</span> ti aspettano
        </h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Scopri il nostro menu completo con oltre 30 pizze artigianali
        </p>
        <Button 
          asChild
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-red-lg hover-glow-red text-lg px-10 py-6"
        >
          <Link to="/menu">Esplora il Menu Completo</Link>
        </Button>
      </motion.div>
    </section>
  );
};

export default PizzaScrollShowcase;
