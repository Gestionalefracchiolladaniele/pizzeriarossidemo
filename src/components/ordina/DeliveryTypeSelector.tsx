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
    color: 'hsl(var(--basil-green))',
  },
  {
    type: 'delivery' as const,
    icon: Bike,
    title: 'Consegna',
    subtitle: 'Ti portiamo noi',
    extra: '+€2.50',
    color: 'hsl(var(--primary))',
  },
  {
    type: 'dine_in' as const,
    icon: UtensilsCrossed,
    title: 'Al Tavolo',
    subtitle: 'Ordina dal ristorante',
    color: 'hsl(var(--gold))',
  },
];

export const DeliveryTypeSelector = ({ value, onChange }: DeliveryTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-3 gap-1">
      {deliveryOptions.map((option) => {
        const isSelected = value === option.type;
        const Icon = option.icon;
        
        return (
          <motion.button
            key={option.type}
            onClick={() => onChange(option.type)}
            className={cn(
              "relative p-1.5 rounded-lg border-2 text-left transition-all overflow-hidden",
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
                className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="w-1.5 h-1.5 text-primary-foreground" />
              </motion.div>
            )}

            {/* Icon */}
            <div 
              className={cn(
                "w-6 h-6 rounded-md flex items-center justify-center mb-0.5 transition-colors",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
              )}
            >
              <Icon className="w-3 h-3" />
            </div>

            {/* Title and Subtitle */}
            <h3 className="text-[10px] font-bold leading-tight truncate">{option.title}</h3>
            <p className="text-[8px] text-muted-foreground leading-tight truncate">{option.subtitle}</p>

            {/* Extra cost badge */}
            {option.extra && (
              <div className="mt-0.5">
                <span className={cn(
                  "inline-block px-1 py-0.5 rounded-full text-[8px] font-semibold",
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
