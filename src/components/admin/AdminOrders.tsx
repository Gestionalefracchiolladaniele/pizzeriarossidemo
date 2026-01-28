import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { Clock, Phone, MapPin, User, History, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { HistoryCalendarDialog } from "@/components/HistoryCalendarDialog";

type Order = Tables<"orders">;

const statusColors: Record<string, string> = {
  pending: "bg-amber-500",
  received: "bg-blue-500",
  read: "bg-purple-500",
  preparing: "bg-orange-500",
  done: "bg-green-500",
  delivered: "bg-gray-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  pending: "Inviato",
  received: "Ricevuto",
  read: "Letto",
  preparing: "In Preparazione",
  done: "Fatto",
  delivered: "Consegnato",
  cancelled: "Annullato",
};

const deliveryTypeLabels: Record<string, string> = {
  takeaway: "Ritiro",
  delivery: "Consegna",
  dine_in: "Al Tavolo",
};

const VISIBLE_ORDERS_COUNT = 5;

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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

  // Active orders (not completed/cancelled)
  const activeOrders = useMemo(() => 
    orders.filter(o => !['delivered', 'cancelled', 'done'].includes(o.status)),
    [orders]
  );

  // Completed orders (for history)
  const completedOrders = useMemo(() => 
    orders.filter(o => ['delivered', 'cancelled', 'done'].includes(o.status)),
    [orders]
  );

  // History items for calendar
  const historyItems = useMemo(() => 
    completedOrders.map(order => ({
      id: order.id,
      type: 'order' as const,
      date: new Date(order.created_at),
      status: order.status,
      details: order,
    })),
    [completedOrders]
  );

  // Visible orders based on showAll state
  const visibleOrders = showAll ? activeOrders : activeOrders.slice(0, VISIBLE_ORDERS_COUNT);

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestione Ordini</h1>
          <p className="text-muted-foreground mt-1">
            {activeOrders.length} ordini attivi • {completedOrders.length} completati
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsHistoryOpen(true)}>
          <History className="w-4 h-4 mr-2" />
          Storico
        </Button>
      </div>

      {/* Active Orders Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-amber-500">
            {orders.filter(o => o.status === 'pending').length}
          </div>
          <div className="text-xs text-muted-foreground">Inviati</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-500">
            {orders.filter(o => o.status === 'received').length}
          </div>
          <div className="text-xs text-muted-foreground">Ricevuti</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">
            {orders.filter(o => o.status === 'preparing').length}
          </div>
          <div className="text-xs text-muted-foreground">In Preparazione</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-500">
            {orders.filter(o => o.status === 'done').length}
          </div>
          <div className="text-xs text-muted-foreground">Pronti</div>
        </Card>
      </div>

      {activeOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Nessun ordine attivo</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-wrap gap-4 justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-bold">Ordine #{order.order_number}</h3>
                    <Badge className={statusColors[order.status]}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                    <Badge variant="outline">
                      {deliveryTypeLabels[order.delivery_type] || order.delivery_type}
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
                    <SelectItem value="pending">Inviato</SelectItem>
                    <SelectItem value="received">Ricevuto</SelectItem>
                    <SelectItem value="read">Letto</SelectItem>
                    <SelectItem value="preparing">In Preparazione</SelectItem>
                    <SelectItem value="done">Fatto</SelectItem>
                    <SelectItem value="delivered">Consegnato</SelectItem>
                    <SelectItem value="cancelled">Annullato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          ))}

          {/* Show More/Less Button */}
          {activeOrders.length > VISIBLE_ORDERS_COUNT && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => setShowAll(!showAll)}
                className="gap-2"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Mostra meno
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Mostra altri {activeOrders.length - VISIBLE_ORDERS_COUNT} ordini
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* History Calendar Dialog */}
      <HistoryCalendarDialog
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={historyItems}
        title="Storico Ordini"
      />
    </div>
  );
};
