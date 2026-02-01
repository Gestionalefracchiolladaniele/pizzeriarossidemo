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
    <div className="grid grid-cols-3 gap-2">
      {deliveryOptions.map((option) => {
        const isSelected = value === option.type;
        const Icon = option.icon;
        
        return (
          <motion.button
            key={option.type}
            onClick={() => onChange(option.type)}
            className={cn(
              "relative p-2.5 rounded-lg border-2 text-left transition-all",
              "hover:shadow-md",
              isSelected 
                ? "border-primary bg-primary/5 shadow-sm" 
                : "border-muted-foreground/20 bg-card hover:border-primary/50"
            )}
            whileTap={{ scale: 0.98 }}
          >
            {/* Selected Indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="w-2.5 h-2.5 text-primary-foreground" />
              </motion.div>
            )}

            {/* Icon */}
            <div 
              className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center mb-1.5 transition-colors",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
              )}
            >
              <Icon className="w-4 h-4" />
            </div>

            {/* Title and Subtitle */}
            <h3 className="text-xs font-bold leading-tight">{option.title}</h3>
            <p className="text-[10px] text-muted-foreground leading-tight">{option.subtitle}</p>

            {/* Extra cost badge */}
            {option.extra && (
              <div className="mt-1.5">
                <span className={cn(
                  "inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
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
