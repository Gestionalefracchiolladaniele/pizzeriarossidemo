import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, Calendar, TrendingUp, Clock, History } from "lucide-react";
import { HistoryCalendarDialog } from "@/components/HistoryCalendarDialog";

interface Stats {
  ordersToday: number;
  bookingsToday: number;
  revenue: number;
  pendingOrders: number;
}

interface HistoryItem {
  id: string;
  type: 'order' | 'reservation';
  date: Date;
  status: string;
  details: any;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    ordersToday: 0,
    bookingsToday: 0,
    revenue: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allReservations, setAllReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];

    // Fetch today's orders
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", today);

    // Fetch today's reservations
    const { data: reservationsData } = await supabase
      .from("reservations")
      .select("*")
      .eq("reservation_date", today);

    // Fetch pending orders
    const { data: pendingData } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["pending", "confirmed", "preparing"]);

    // Fetch recent orders
    const { data: recentData } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    // Fetch ALL orders for history
    const { data: allOrdersData } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch ALL reservations for history
    const { data: allReservationsData } = await supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });

    const todayRevenue = ordersData?.reduce((sum, order) => sum + order.total, 0) || 0;

    setStats({
      ordersToday: ordersData?.length || 0,
      bookingsToday: reservationsData?.length || 0,
      revenue: todayRevenue,
      pendingOrders: pendingData?.length || 0,
    });

    setRecentOrders(recentData || []);
    setAllOrders(allOrdersData || []);
    setAllReservations(allReservationsData || []);
    setIsLoading(false);
  };

  // Unified history combining orders and reservations
  const historyItems: HistoryItem[] = useMemo(() => {
    const items: HistoryItem[] = [];
    
    allOrders.forEach(order => {
      items.push({
        id: order.id,
        type: 'order',
        date: new Date(order.created_at),
        status: order.status,
        details: order,
      });
    });
    
    allReservations.forEach(reservation => {
      items.push({
        id: reservation.id,
        type: 'reservation',
        date: new Date(reservation.created_at),
        status: reservation.status,
        details: reservation,
      });
    });
    
    // Sort by date descending
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [allOrders, allReservations]);

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Caricamento...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={() => setIsHistoryOpen(true)}>
          <History className="w-4 h-4 mr-2" />
          Sfoglia Storico
        </Button>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{stats.ordersToday}</div>
              <div className="text-muted-foreground text-sm">Ordini Oggi</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-basil/10 rounded-lg">
              <Calendar className="w-6 h-6 text-basil" />
            </div>
            <div>
              <div className="text-3xl font-bold text-basil">{stats.bookingsToday}</div>
              <div className="text-muted-foreground text-sm">Prenotazioni Oggi</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <div className="text-3xl font-bold">€{stats.revenue.toFixed(2)}</div>
              <div className="text-muted-foreground text-sm">Incasso Oggi</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-tomato/10 rounded-lg">
              <Clock className="w-6 h-6 text-tomato" />
            </div>
            <div>
              <div className="text-3xl font-bold text-tomato">{stats.pendingOrders}</div>
              <div className="text-muted-foreground text-sm">Ordini in Attesa</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Ordini Recenti</h2>
        {recentOrders.length === 0 ? (
          <p className="text-muted-foreground">Nessun ordine recente.</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold">Ordine #{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                  {order.confirmation_code && (
                    <p className="text-xs font-mono text-primary">{order.confirmation_code}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">€{order.total.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* History Calendar Dialog */}
      <HistoryCalendarDialog
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={historyItems}
        title="Storico Completo"
      />
    </motion.div>
  );
};
