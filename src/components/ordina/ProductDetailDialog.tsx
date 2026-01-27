import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  tags: string[] | null;
  is_popular?: boolean | null;
}

interface ProductDetailDialogProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number) => void;
  currentQuantity?: number;
}

const tagIcons: Record<string, string> = {
  vegetariano: "🌿",
  piccante: "🌶️",
  senza_glutine: "🌾",
  vegano: "🥬",
  tradizionale: "👨‍🍳",
  speciale: "⭐",
};

export const ProductDetailDialog = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
  currentQuantity = 0,
}: ProductDetailDialogProps) => {
  const [quantity, setQuantity] = useState(1);

  if (!item) return null;

  const handleAdd = () => {
    onAddToCart(item, quantity);
    setQuantity(1);
    onClose();
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg overflow-hidden p-0">
        {/* Image Header */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
          <img
            src={item.image_url || "/placeholder.svg"}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Price Badge */}
          <div className="absolute bottom-4 right-4">
            <Badge className="bg-primary text-primary-foreground text-lg font-bold px-3 py-1.5 shadow-lg">
              €{item.price.toFixed(2)}
            </Badge>
          </div>

          {/* Popular Badge */}
          {item.is_popular && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-gold text-black font-semibold">
                ⭐ Popolare
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <DialogHeader className="p-0">
            <DialogTitle className="text-2xl font-bold text-left">
              {item.name}
            </DialogTitle>
          </DialogHeader>

          {/* Description */}
          {item.description && (
            <p className="text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-sm py-1 px-3"
                >
                  {tagIcons[tag] || "🏷️"} {tag.replace("_", " ")}
                </Badge>
              ))}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Quantità:</span>
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={quantity}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="w-8 text-center font-bold text-lg"
                  >
                    {quantity}
                  </motion.span>
                </AnimatePresence>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={incrementQuantity}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-muted-foreground">Totale</div>
              <div className="text-xl font-bold text-primary">
                €{(item.price * quantity).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAdd}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {currentQuantity > 0 
              ? `Aggiungi altri ${quantity} al carrello` 
              : `Aggiungi ${quantity} al carrello`
            }
          </Button>

          {currentQuantity > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Hai già {currentQuantity} {item.name} nel carrello
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
