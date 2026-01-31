import { motion } from "framer-motion";
import { Flame, Pizza, Star, Users } from "lucide-react";
import { CountUpNumber } from "@/components/animations/CountUpNumber";

const stats = [
  {
    icon: Flame,
    value: 30,
    suffix: "+",
    label: "Anni di Tradizione",
    description: "Forno a legna dal 1990",
    featured: false,
  },
  {
    icon: Pizza,
    value: 10000,
    suffix: "+",
    label: "Pizze Servite",
    description: "Ogni anno con amore",
    featured: true,
  },
  {
    icon: Star,
    value: 4.9,
    suffix: "",
    label: "Stelle Rating",
    description: "Su Google Reviews",
    isDecimal: true,
    featured: false,
  },
  {
    icon: Users,
    value: 100,
    suffix: "%",
    label: "Clienti Soddisfatti",
    description: "La nostra priorità",
    featured: false,
  },
];

const StatsSection = () => {
  return (
    <section className="py-16 lg:py-20 bg-gradient-cream relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-pattern-dots opacity-30" />
      
      {/* Decorative elements */}
      <motion.div
        animate={{ y: [0, -8, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-16 right-16 w-24 h-24 rounded-full bg-primary/10 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 8, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute bottom-16 left-16 w-32 h-32 rounded-full bg-[hsl(var(--gold))]/10 blur-3xl"
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="relative group"
            >
              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                className={`
                  bg-card rounded-xl p-4 lg:p-6 text-center h-full
                  border-2 transition-all duration-300
                  ${stat.featured 
                    ? 'border-primary/40 shadow-[0_6px_24px_-6px_hsl(var(--pizzeria-red)/0.2)]' 
                    : 'border-border/50 shadow-[0_3px_16px_-3px_rgba(0,0,0,0.04)]'
                  }
                  hover:shadow-[0_10px_32px_-6px_rgba(0,0,0,0.08)]
                  hover:border-primary/30
                `}
              >
                {/* Featured badge */}
                {stat.featured && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full shadow-red"
                  >
                    Top
                  </motion.div>
                )}
                
                {/* Icon */}
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`
                    inline-flex items-center justify-center w-11 h-11 lg:w-12 lg:h-12 rounded-xl mb-3
                    ${stat.featured 
                      ? 'bg-gradient-red text-primary-foreground shadow-red' 
                      : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                    }
                    transition-all duration-300
                  `}
                >
                  <stat.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                </motion.div>

                {/* Value with CountUp Animation */}
                <div className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-1.5 ${stat.featured ? 'text-gradient-red' : 'text-foreground'}`}>
                  {stat.isDecimal ? (
                    <span>{stat.value}{stat.suffix}</span>
                  ) : (
                    <CountUpNumber 
                      value={stat.value} 
                      suffix={stat.suffix}
                      duration={2.5}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="text-xs lg:text-sm font-semibold text-foreground mb-0.5">
                  {stat.label}
                </div>

                {/* Description */}
                <div className="text-xs text-muted-foreground">
                  {stat.description}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
