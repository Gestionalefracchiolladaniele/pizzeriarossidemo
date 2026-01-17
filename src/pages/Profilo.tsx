import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Package, Calendar, LogOut, ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { NotificationPromptDialog } from "@/components/NotificationPromptDialog";

type Order = Tables<"orders">;
type Reservation = Tables<"reservations">;

const statusColors: Record<string, string> = {
  received: "bg-blue-500",
  read: "bg-purple-500",
  preparing: "bg-orange-500",
  done: "bg-green-500",
  delivered: "bg-gray-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  received: "Ricevuto",
  read: "Letto",
  preparing: "In Preparazione",
  done: "Fatto",
  delivered: "Consegnato",
  cancelled: "Annullato",
};

const reservationStatusLabels: Record<string, string> = {
  pending: "In Attesa",
  confirmed: "Confermata",
  cancelled: "Annullata",
  completed: "Completata",
};

const Profilo = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    // Fetch user orders
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Fetch user reservations
    const { data: reservationsData } = await supabase
      .from("reservations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setOrders(ordersData || []);
    setReservations(reservationsData || []);
    setLoadingData(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Notification Prompt Dialog */}
      <NotificationPromptDialog userType="customer" />
      
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Il Mio Profilo</h1>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" /> Esci
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* User Info Card */}
          <Card className="p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {user.user_metadata?.full_name || "Utente"}
                </h2>
                <p className="text-muted-foreground">{user.email}</p>
                {user.user_metadata?.phone && (
                  <p className="text-sm text-muted-foreground">
                    {user.user_metadata.phone}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Tabs for Orders, Reservations and Settings */}
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Ordini</span> ({orders.length})
              </TabsTrigger>
              <TabsTrigger value="reservations" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Prenotazioni</span> ({reservations.length})
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Impostazioni</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-6">
              {/* Always visible button to create new order */}
              <div className="mb-6">
                <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate("/ordina")}>
                  <Package className="w-4 h-4 mr-2" />
                  Nuovo Ordine
                </Button>
              </div>

              {loadingData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : orders.length === 0 ? (
                <Card className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Non hai ancora effettuato ordini</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold">Ordine #{order.order_number}</h3>
                            <Badge className={statusColors[order.status] || "bg-gray-500"}>
                              {statusLabels[order.status] || order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('it-IT', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <div className="mt-2">
                            <p className="text-sm">
                              {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                                <span key={idx}>
                                  {item.quantity}x {item.name}
                                  {idx < (order.items as any[]).length - 1 ? ", " : ""}
                                </span>
                              ))}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">
                            €{order.total.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {order.delivery_type === 'delivery' ? 'Consegna' : 'Ritiro'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reservations" className="mt-6">
              {/* Always visible button to create new reservation */}
              <div className="mb-6">
                <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate("/prenota")}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Nuova Prenotazione
                </Button>
              </div>

              {loadingData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : reservations.length === 0 ? (
                <Card className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Non hai ancora effettuato prenotazioni</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reservations.map((reservation) => (
                    <Card key={reservation.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold">
                              {new Date(reservation.reservation_date).toLocaleDateString('it-IT', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                              })}
                            </h3>
                            <Badge className={
                              reservation.status === 'confirmed' ? 'bg-green-500' :
                              reservation.status === 'pending' ? 'bg-yellow-500' :
                              reservation.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                            }>
                              {reservationStatusLabels[reservation.status] || reservation.status}
                            </Badge>
                          </div>
                          <p className="text-lg font-semibold">
                            Ore {reservation.reservation_time.slice(0, 5)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {reservation.guests_count} {reservation.guests_count === 1 ? 'persona' : 'persone'}
                          </p>
                          {reservation.notes && (
                            <p className="text-sm italic mt-2">"{reservation.notes}"</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <NotificationSettings />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Profilo;
