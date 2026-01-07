import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { Clock, Phone, MapPin, User } from "lucide-react";

type Order = Tables<"orders">;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  preparing: "bg-orange-500",
  ready: "bg-green-500",
  delivered: "bg-gray-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  pending: "In Attesa",
  confirmed: "Confermato",
  preparing: "In Preparazione",
  ready: "Pronto",
  delivered: "Consegnato",
  cancelled: "Annullato",
};

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Errore nel caricamento ordini");
      return;
    }

    setOrders(data || []);
    setIsLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Errore: " + error.message);
      return;
    }

    toast.success("Stato aggiornato!");
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestione Ordini</h1>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Nessun ordine presente</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-wrap gap-4 justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold">Ordine #{order.order_number}</h3>
                    <Badge className={statusColors[order.status]}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" /> {order.customer_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" /> {order.customer_phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {new Date(order.created_at).toLocaleString('it-IT')}
                    </span>
                  </div>

                  {order.delivery_address && (
                    <p className="flex items-center gap-1 text-sm">
                      <MapPin className="w-4 h-4" /> {order.delivery_address}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">€{order.total.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground capitalize">{order.delivery_type}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-2">Prodotti:</h4>
                <ul className="text-sm space-y-1">
                  {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                    <li key={idx}>
                      {item.quantity}x {item.name} - €{(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>

                {order.notes && (
                  <p className="mt-2 text-sm italic text-muted-foreground">
                    Note: {order.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <Select 
                  value={order.status} 
                  onValueChange={(v) => updateStatus(order.id, v)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">In Attesa</SelectItem>
                    <SelectItem value="confirmed">Confermato</SelectItem>
                    <SelectItem value="preparing">In Preparazione</SelectItem>
                    <SelectItem value="ready">Pronto</SelectItem>
                    <SelectItem value="delivered">Consegnato</SelectItem>
                    <SelectItem value="cancelled">Annullato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
