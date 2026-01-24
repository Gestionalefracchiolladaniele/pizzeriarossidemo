import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Flame, Leaf, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const pizzas = [
  {
    id: 1,
    name: "Margherita",
    description: "Pomodoro San Marzano, mozzarella fior di latte, basilico fresco, olio evo",
    price: "8.00",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800",
    tag: "classica",
    rating: 4.9,
  },
  {
    id: 2,
    name: "Diavola",
    description: "Pomodoro, mozzarella, salame piccante calabrese, olio al peperoncino",
    price: "10.00",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800",
    tag: "piccante",
    rating: 4.8,
  },
  {
    id: 3,
    name: "Quattro Formaggi",
    description: "Mozzarella, gorgonzola DOP, fontina valdostana, parmigiano 36 mesi",
    price: "11.00",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800",
    tag: "speciale",
    rating: 4.9,
  },
  {
    id: 4,
    name: "Ortolana",
    description: "Verdure grigliate di stagione, mozzarella, olio evo al basilico",
    price: "10.00",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=800",
    tag: "vegetariana",
    rating: 4.7,
  },
  {
    id: 5,
    name: "Bufala e Prosciutto",
    description: "Mozzarella di bufala DOP, prosciutto crudo di Parma 24 mesi, rucola",
    price: "13.00",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800",
    tag: "speciale",
    rating: 5.0,
  },
];

const tagConfig = {
  classica: { icon: Sparkles, color: "bg-primary/20 text-primary", label: "Classica" },
  piccante: { icon: Flame, color: "bg-red-500/20 text-red-500", label: "Piccante" },
  vegetariana: { icon: Leaf, color: "bg-green-500/20 text-green-500", label: "Vegetariana" },
  speciale: { icon: Star, color: "bg-[hsl(var(--gold))]/20 text-[hsl(var(--gold))]", label: "Speciale" },
};

const PizzaShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(2);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const rotationY = useMotionValue(0);
  
  useEffect(() => {
    if (isInView) {
      animate(rotationY, 360, {
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      });
    }
  }, [isInView, rotationY]);

  const goToPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? pizzas.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev === pizzas.length - 1 ? 0 : prev + 1));
  };

  const getCardPosition = (index: number) => {
    const diff = index - activeIndex;
    const normalizedDiff = ((diff + pizzas.length) % pizzas.length);
    const adjustedDiff = normalizedDiff > pizzas.length / 2 ? normalizedDiff - pizzas.length : normalizedDiff;
    
    return {
      x: adjustedDiff * 280,
      z: -Math.abs(adjustedDiff) * 150,
      rotateY: adjustedDiff * -15,
      scale: 1 - Math.abs(adjustedDiff) * 0.15,
      opacity: Math.abs(adjustedDiff) > 2 ? 0 : 1 - Math.abs(adjustedDiff) * 0.3,
      zIndex: 10 - Math.abs(adjustedDiff),
    };
  };

  const activePizza = pizzas[activeIndex];
  const activeTag = tagConfig[activePizza.tag as keyof typeof tagConfig];
  const TagIcon = activeTag.icon;

  return (
    <section ref={containerRef} className="relative py-20 lg:py-32 overflow-hidden bg-gradient-cream">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-pattern-dots opacity-50" />
      
      {/* Floating decoration circles */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl"
      />
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-[hsl(var(--gold))]/10 blur-2xl"
      />

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Le Nostre Specialità</span>
          </motion.div>
          
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Pizze <span className="text-gradient-red">Artigianali</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ogni pizza è un'opera d'arte, cotta nel nostro forno a legna a 485°C
          </p>
        </motion.div>

        {/* 3D Carousel */}
        <div className="relative h-[500px] md:h-[550px] perspective-1000">
          {/* Navigation Buttons */}
          <button
            onClick={goToPrev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Cards Container */}
          <div className="relative h-full flex items-center justify-center" style={{ perspective: "1000px" }}>
            {pizzas.map((pizza, index) => {
              const position = getCardPosition(index);
              const isActive = index === activeIndex;
              
              return (
                <motion.div
                  key={pizza.id}
                  className="absolute cursor-pointer"
                  animate={{
                    x: position.x,
                    z: position.z,
                    rotateY: position.rotateY,
                    scale: position.scale,
                    opacity: position.opacity,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ 
                    zIndex: position.zIndex,
                    transformStyle: "preserve-3d"
                  }}
                  onClick={() => setActiveIndex(index)}
                  whileHover={isActive ? { scale: 1.05 } : undefined}
                >
                  <div className={`relative w-64 md:w-72 bg-card rounded-3xl overflow-hidden shadow-2xl border-2 transition-colors duration-300 ${
                    isActive ? "border-primary" : "border-border"
                  }`}>
                    {/* Image */}
                    <div className="relative h-48 md:h-56 overflow-hidden">
                      <motion.img
                        src={pizza.image}
                        alt={pizza.name}
                        className="w-full h-full object-cover"
                        animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Price Badge */}
                      <motion.div
                        initial={{ scale: 0, rotate: -12 }}
                        animate={{ scale: isActive ? 1 : 0.8, rotate: isActive ? -12 : -12 }}
                        className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold text-lg shadow-red"
                      >
                        €{pizza.price}
                      </motion.div>

                      {/* Tag */}
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`absolute bottom-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${activeTag.color}`}
                        >
                          <TagIcon className="w-3 h-3" />
                          {activeTag.label}
                        </motion.div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-display text-xl font-bold text-foreground mb-2">
                        {pizza.name}
                      </h3>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {pizza.description}
                          </p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(pizza.rating)
                                    ? "fill-[hsl(var(--gold))] text-[hsl(var(--gold))]"
                                    : "text-muted"
                                }`}
                              />
                            ))}
                            <span className="text-sm text-muted-foreground ml-1">{pizza.rating}</span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Active Glow */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 rounded-3xl pointer-events-none"
                        style={{
                          boxShadow: "0 0 60px hsl(var(--pizzeria-red) / 0.3), 0 0 100px hsl(var(--pizzeria-red) / 0.1)"
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {pizzas.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "bg-primary w-8"
                  : "bg-muted hover:bg-primary/50"
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-red-lg hover-glow-red text-lg px-8 py-6"
          >
            Vedi Menu Completo
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default PizzaShowcase;
