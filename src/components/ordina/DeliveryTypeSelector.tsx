import { motion } from "framer-motion";
import { Store, Bike, UtensilsCrossed, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type DeliveryType = 'takeaway' | 'delivery' | 'dine_in';

interface DeliveryTypeSelectorProps {
  value: DeliveryType;
  onChange: (type: DeliveryType) => void;
}

const deliveryOptions = [
  {
    type: 'takeaway' as const,
    icon: Store,
    title: 'Ritiro',
    subtitle: 'Vieni tu a ritirare',
    description: 'Ordina e passa a ritirare quando è pronto',
    color: 'hsl(var(--basil-green))',
  },
  {
    type: 'delivery' as const,
    icon: Bike,
    title: 'Consegna',
    subtitle: 'Ti portiamo noi',
    description: 'Consegna a domicilio in 30-45 min',
    extra: '+€2.50',
    color: 'hsl(var(--primary))',
  },
  {
    type: 'dine_in' as const,
    icon: UtensilsCrossed,
    title: 'Al Tavolo',
    subtitle: 'Ordina dal ristorante',
    description: 'Ordina comodamente dal tuo tavolo',
    color: 'hsl(var(--gold))',
  },
];

export const DeliveryTypeSelector = ({ value, onChange }: DeliveryTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {deliveryOptions.map((option) => {
        const isSelected = value === option.type;
        const Icon = option.icon;
        
        return (
          <motion.button
            key={option.type}
            onClick={() => onChange(option.type)}
            className={cn(
              "relative p-6 rounded-xl border-2 text-left transition-all",
              "hover:shadow-lg hover:scale-[1.02]",
              isSelected 
                ? "border-primary bg-primary/5 shadow-md" 
                : "border-muted-foreground/20 bg-card hover:border-primary/50"
            )}
            whileTap={{ scale: 0.98 }}
          >
            {/* Selected Indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-primary-foreground" />
              </motion.div>
            )}

            {/* Icon */}
            <div 
              className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
              )}
            >
              <Icon className="w-7 h-7" />
            </div>

            {/* Title and Subtitle */}
            <h3 className="text-lg font-bold mb-1">{option.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{option.subtitle}</p>
            
            {/* Description */}
            <p className="text-xs text-muted-foreground/70">{option.description}</p>

            {/* Extra cost badge */}
            {option.extra && (
              <div className="mt-3">
                <span className={cn(
                  "inline-block px-2 py-1 rounded-full text-xs font-semibold",
                  isSelected 
                    ? "bg-primary/20 text-primary" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {option.extra}
                </span>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
