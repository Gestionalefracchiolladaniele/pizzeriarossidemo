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
              "relative p-4 rounded-xl border-2 text-left transition-all",
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
                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-primary-foreground" />
              </motion.div>
            )}

            {/* Icon */}
            <div 
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
              )}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Title and Subtitle */}
            <h3 className="text-sm font-bold mb-0.5">{option.title}</h3>
            <p className="text-xs text-muted-foreground mb-1">{option.subtitle}</p>
            
            {/* Description */}
            <p className="text-[10px] text-muted-foreground/70 leading-tight">{option.description}</p>

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
