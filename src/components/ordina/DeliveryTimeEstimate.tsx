import { useState, useEffect } from "react";
import { Clock, ChefHat, Truck, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  menuItem: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

interface DeliveryTimeEstimateProps {
  cartItems: CartItem[];
  distanceKm: number;
}

export const DeliveryTimeEstimate = ({ cartItems, distanceKm }: DeliveryTimeEstimateProps) => {
  const [prepTime, setPrepTime] = useState<number>(15);
  const [activeOrdersCount, setActiveOrdersCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Fetch prep times for cart items
      if (cartItems.length > 0) {
        const itemIds = cartItems.map(item => item.menuItem.id);
        const { data: menuItems } = await supabase
          .from("menu_items")
          .select("id, prep_time_minutes")
          .in("id", itemIds);

        if (menuItems && menuItems.length > 0) {
          const maxPrepTime = Math.max(
            ...menuItems.map(item => item.prep_time_minutes || 10)
          );
          setPrepTime(maxPrepTime);
        }
      }

      // Count active orders in queue
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "received", "preparing"]);

      setActiveOrdersCount(count || 0);
      setIsLoading(false);
    };

    fetchData();
  }, [cartItems]);

  // Calculate times
  const deliveryTime = Math.round(distanceKm * 2.5); // 2.5 min per km
  const queueTime = activeOrdersCount * 5; // 5 min per order in queue
  const totalTime = prepTime + deliveryTime + queueTime;

  if (isLoading) {
    return (
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4 animate-pulse" />
          <span className="text-sm">Calcolo tempo stimato...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-primary/30 bg-primary/5">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        Tempo Stimato di Consegna
      </h4>
      
      <div className="space-y-2 text-sm">
        {/* Preparation time */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <ChefHat className="w-4 h-4" />
            Preparazione
          </span>
          <span className="font-medium">~{prepTime} min</span>
        </div>

        {/* Delivery time */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Truck className="w-4 h-4" />
            Consegna ({distanceKm.toFixed(1)} km)
          </span>
          <span className="font-medium">~{deliveryTime} min</span>
        </div>

        {/* Queue time (only show if there are orders in queue) */}
        {activeOrdersCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              Ordini in coda ({activeOrdersCount})
            </span>
            <span className="font-medium">~{queueTime} min</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-primary/20 my-2" />

        {/* Total */}
        <div className="flex items-center justify-between text-base">
          <span className="font-semibold">Totale stimato</span>
          <span className="font-bold text-primary text-lg">~{totalTime} min</span>
        </div>
      </div>
    </Card>
  );
};
