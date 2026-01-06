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
  },
  {
    icon: Pizza,
    value: 10000,
    suffix: "+",
    label: "Pizze Servite",
    description: "Ogni anno con amore",
  },
  {
    icon: Star,
    value: 4.9,
    suffix: "",
    label: "Stelle Rating",
    description: "Su Google Reviews",
    isDecimal: true,
  },
  {
    icon: Users,
    value: 100,
    suffix: "%",
    label: "Clienti Soddisfatti",
    description: "La nostra priorità",
  },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative group"
            >
              <div className="bg-background rounded-xl p-6 shadow-sm border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-red text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <stat.icon className="w-6 h-6" />
                </div>

                {/* Value with CountUp Animation */}
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
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
                <div className="text-sm font-medium text-foreground mb-1">
                  {stat.label}
                </div>

                {/* Description */}
                <div className="text-xs text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
