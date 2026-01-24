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
    <section className="py-20 lg:py-24 bg-gradient-cream relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-pattern-dots opacity-30" />
      
      {/* Decorative elements */}
      <motion.div
        animate={{ y: [0, -10, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-20 right-20 w-32 h-32 rounded-full bg-primary/10 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 10, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-[hsl(var(--gold))]/10 blur-3xl"
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative group"
            >
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className={`
                  bg-card rounded-2xl p-6 lg:p-8 text-center h-full
                  border-2 transition-all duration-300
                  ${stat.featured 
                    ? 'border-primary/40 shadow-[0_8px_30px_-8px_hsl(var(--pizzeria-red)/0.25)]' 
                    : 'border-border/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]'
                  }
                  hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.1)]
                  hover:border-primary/30
                `}
              >
                {/* Featured badge */}
                {stat.featured && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full shadow-red"
                  >
                    Top
                  </motion.div>
                )}
                
                {/* Icon */}
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`
                    inline-flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 rounded-2xl mb-4
                    ${stat.featured 
                      ? 'bg-gradient-red text-primary-foreground shadow-red' 
                      : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                    }
                    transition-all duration-300
                  `}
                >
                  <stat.icon className="w-7 h-7 lg:w-8 lg:h-8" />
                </motion.div>

                {/* Value with CountUp Animation */}
                <div className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-2 ${stat.featured ? 'text-gradient-red' : 'text-foreground'}`}>
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
                <div className="text-sm lg:text-base font-semibold text-foreground mb-1">
                  {stat.label}
                </div>

                {/* Description */}
                <div className="text-xs lg:text-sm text-muted-foreground">
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
