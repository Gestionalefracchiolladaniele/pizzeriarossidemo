import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Package, Calendar, LogOut, ArrowLeft, Settings, History, Clock, ChevronDown, ChevronUp, AlertCircle, Save, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { NotificationPromptDialog } from "@/components/NotificationPromptDialog";
import { HistoryCalendarDialog } from "@/components/HistoryCalendarDialog";
import { LiveDeliveryMap } from "@/components/ordina/LiveDeliveryMap";
import { toast } from "sonner";


type Order = Tables<"orders">;
type Reservation = Tables<"reservations">;

interface HistoryItem {
  id: string;
  type: 'order' | 'reservation';
  date: Date;
  status: string;
  details: Order | Reservation;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500",
  received: "bg-blue-500",
  read: "bg-purple-500",
  preparing: "bg-orange-500",
  done: "bg-green-500",
  out_for_delivery: "bg-cyan-500",
  delivered: "bg-gray-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  pending: "Inviato",
  received: "Ricevuto",
  read: "Letto",
  preparing: "In Preparazione",
  done: "Fatto",
  out_for_delivery: "In Consegna",
  delivered: "Consegnato",
  cancelled: "Annullato",
};

const reservationStatusLabels: Record<string, string> = {
  pending: "In Attesa",
  confirmed: "Confermata",
  cancelled: "Annullata",
  completed: "Completata",
};

const deliveryTypeLabels: Record<string, string> = {
  takeaway: "Ritiro",
  delivery: "Consegna",
  dine_in: "Al Tavolo",
};

const VISIBLE_ITEMS_COUNT = 5;

const Profilo = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  
  // Profile editing state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [needsProfileUpdate, setNeedsProfileUpdate] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
      
      // Initialize profile form
      const fullName = user.user_metadata?.full_name || "";
      const nameParts = fullName.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setPhone(user.user_metadata?.phone || "");
      
      // Check if profile needs update (no name)
      setNeedsProfileUpdate(!fullName.trim());
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

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Nome e cognome sono obbligatori");
      return;
    }

    setIsSavingProfile(true);
    
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        phone: phone.trim(),
      }
    });

    if (error) {
      toast.error("Errore nel salvataggio del profilo");
      setIsSavingProfile(false);
      return;
    }

    // Also update profiles table if it exists
    await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone.trim(),
      })
      .eq("user_id", user?.id);

    setNeedsProfileUpdate(false);
    toast.success("Profilo aggiornato con successo!");
    setIsSavingProfile(false);
  };

  // Unified history combining orders and reservations
  const historyItems: HistoryItem[] = useMemo(() => {
    const items: HistoryItem[] = [];
    
    orders.forEach(order => {
      items.push({
        id: order.id,
        type: 'order',
        date: new Date(order.created_at),
        status: order.status,
        details: order,
      });
    });
    
    reservations.forEach(reservation => {
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
  }, [orders, reservations]);

  // Visible items (last 5 or all)
  const visibleHistoryItems = showAllHistory 
    ? historyItems 
    : historyItems.slice(0, VISIBLE_ITEMS_COUNT);

  // Count active orders/reservations
  const activeOrdersCount = orders.filter(o => !['delivered', 'cancelled', 'done'].includes(o.status)).length;
  const activeReservationsCount = reservations.filter(r => !['completed', 'cancelled'].includes(r.status)).length;

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
          {/* Profile Update Required Alert */}
          {needsProfileUpdate && (
            <Card className="p-4 mb-6 border-amber-500/50 bg-amber-500/10">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-amber-700">Completa il tuo profilo</p>
                  <p className="text-sm text-muted-foreground">
                    Per continuare, inserisci il tuo nome e cognome nella sezione Impostazioni.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* User Info Card with Quick Actions */}
          <Card className="p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">
                  {firstName || lastName ? `${firstName} ${lastName}`.trim() : user.email?.split('@')[0] || "Utente"}
                </h2>
                <p className="text-muted-foreground">{user.email}</p>
                {phone && (
                  <p className="text-sm text-muted-foreground">{phone}</p>
                )}
              </div>
              
              {/* Quick Action Buttons - Always visible */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button onClick={() => navigate("/ordina")} className="flex-1 sm:flex-none">
                  <Package className="w-4 h-4 mr-2" />
                  Nuovo Ordine
                </Button>
                <Button variant="outline" onClick={() => navigate("/prenota")} className="flex-1 sm:flex-none">
                  <Calendar className="w-4 h-4 mr-2" />
                  Prenota Tavolo
                </Button>
              </div>
            </div>
          </Card>

          {/* Tabs for History, Orders, Reservations and Settings */}
          <Tabs defaultValue={needsProfileUpdate ? "settings" : "history"} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Storico</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Ordini</span>
                {activeOrdersCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeOrdersCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="reservations" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Prenotazioni</span>
                {activeReservationsCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeReservationsCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Impostazioni</span>
                {needsProfileUpdate && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </TabsTrigger>
            </TabsList>

            {/* History Tab - Unified view with last 5 + calendar */}
            <TabsContent value="history" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Attività recente</h3>
                <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(true)}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Sfoglia Calendario
                </Button>
              </div>
              
              {loadingData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : historyItems.length === 0 ? (
                <Card className="p-8 text-center">
                  <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Nessuna attività ancora</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => navigate("/ordina")}>
                      <Package className="w-4 h-4 mr-2" />
                      Fai un ordine
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/prenota")}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Prenota un tavolo
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {visibleHistoryItems.map((item) => (
                    <Card key={`${item.type}-${item.id}`} className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.type === 'order' ? 'bg-primary/10' : 'bg-secondary'
                        }`}>
                          {item.type === 'order' ? (
                            <Package className="w-5 h-5 text-primary" />
                          ) : (
                            <Calendar className="w-5 h-5 text-secondary-foreground" />
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-bold">
                              {item.type === 'order' 
                                ? `Ordine #${(item.details as Order).order_number}`
                                : `Prenotazione ${new Date((item.details as Reservation).reservation_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}`
                              }
                            </span>
                            <Badge className={
                              item.type === 'order' 
                                ? statusColors[item.status] || "bg-gray-500"
                                : item.status === 'confirmed' ? 'bg-green-500' 
                                : item.status === 'pending' ? 'bg-amber-500' 
                                : item.status === 'cancelled' ? 'bg-red-500' 
                                : 'bg-gray-500'
                            }>
                              {item.type === 'order' 
                                ? statusLabels[item.status] || item.status
                                : reservationStatusLabels[item.status] || item.status
                              }
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {item.date.toLocaleDateString('it-IT', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          
                          {item.type === 'order' && (
                            <p className="text-sm mt-1 truncate">
                              {Array.isArray((item.details as Order).items) && 
                                ((item.details as Order).items as any[]).slice(0, 3).map((i: any, idx: number) => (
                                  <span key={idx}>
                                    {i.quantity}x {i.name}
                                    {idx < Math.min(((item.details as Order).items as any[]).length, 3) - 1 ? ", " : ""}
                                  </span>
                                ))
                              }
                              {Array.isArray((item.details as Order).items) && ((item.details as Order).items as any[]).length > 3 && "..."}
                            </p>
                          )}
                          
                          {item.type === 'reservation' && (
                            <p className="text-sm mt-1">
                              Ore {(item.details as Reservation).reservation_time.slice(0, 5)} • {(item.details as Reservation).guests_count} {(item.details as Reservation).guests_count === 1 ? 'persona' : 'persone'}
                            </p>
                          )}
                        </div>
                        
                        {/* Right side - amount or details */}
                        <div className="text-right">
                          {item.type === 'order' && (
                            <>
                              <p className="text-lg font-bold text-primary">
                                €{(item.details as Order).total.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {deliveryTypeLabels[(item.details as Order).delivery_type] || (item.details as Order).delivery_type}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* Show More/Less Button */}
                  {historyItems.length > VISIBLE_ITEMS_COUNT && (
                    <div className="flex justify-center pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAllHistory(!showAllHistory)}
                        className="gap-2"
                      >
                        {showAllHistory ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Mostra meno
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Mostra altri {historyItems.length - VISIBLE_ITEMS_COUNT}
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
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
                  {orders.slice(0, showAllHistory ? undefined : VISIBLE_ITEMS_COUNT).map((order) => (
                    <Card key={order.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-bold">Ordine #{order.order_number}</h3>
                            <Badge className={statusColors[order.status] || "bg-gray-500"}>
                              {statusLabels[order.status] || order.status}
                            </Badge>
                          </div>
                          {(order as any).confirmation_code && (
                            <div className="flex items-center gap-1 mb-2">
                              <span className="text-xs text-muted-foreground">Codice:</span>
                              <span className="font-mono text-sm font-medium">{(order as any).confirmation_code}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5"
                                onClick={() => {
                                  navigator.clipboard.writeText((order as any).confirmation_code);
                                  toast.success("Codice copiato!");
                                }}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
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
                            {deliveryTypeLabels[order.delivery_type] || order.delivery_type}
                          </p>
                        </div>
                      </div>

                      {/* Live Tracking Map for orders out for delivery */}
                      {order.status === 'out_for_delivery' && 
                       order.delivery_type === 'delivery' && 
                       order.delivery_address && 
                       order.delivery_lat && 
                       order.delivery_lng && (
                        <div className="mt-4 pt-4 border-t">
                          <LiveDeliveryMap
                            orderId={order.id}
                            orderNumber={order.order_number}
                            deliveryAddress={order.delivery_address}
                            deliveryLat={Number(order.delivery_lat)}
                            deliveryLng={Number(order.delivery_lng)}
                          />
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reservations" className="mt-6">
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
                  {reservations.slice(0, showAllHistory ? undefined : VISIBLE_ITEMS_COUNT).map((reservation) => {
                    // Calculate if cancellation is still allowed (24 hours before reservation)
                    const reservationDateTime = new Date(reservation.reservation_date);
                    const [hours, minutes] = reservation.reservation_time.split(':').map(Number);
                    reservationDateTime.setHours(hours, minutes, 0, 0);
                    const hoursUntilReservation = (reservationDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
                    const canCancel = hoursUntilReservation >= 24 && reservation.status !== 'cancelled' && reservation.status !== 'completed';
                    
                    const handleCancelReservation = async () => {
                      if (!canCancel) return;
                      
                      const { error } = await supabase
                        .from("reservations")
                        .update({ status: "cancelled" })
                        .eq("id", reservation.id);
                      
                      if (error) {
                        toast.error("Errore nella cancellazione");
                        return;
                      }
                      
                      toast.success("Prenotazione cancellata");
                      fetchUserData();
                    };
                    
                    return (
                      <Card key={reservation.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-bold">
                                {new Date(reservation.reservation_date).toLocaleDateString('it-IT', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long'
                                })}
                              </h3>
                              <Badge className={
                                reservation.status === 'confirmed' ? 'bg-green-500' :
                                reservation.status === 'pending' ? 'bg-amber-500' :
                                reservation.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                              }>
                                {reservationStatusLabels[reservation.status] || reservation.status}
                              </Badge>
                            </div>
                            {(reservation as any).confirmation_code && (
                              <div className="flex items-center gap-1 mb-2">
                                <span className="text-xs text-muted-foreground">Codice:</span>
                                <span className="font-mono text-sm font-medium">{(reservation as any).confirmation_code}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5"
                                  onClick={() => {
                                    navigator.clipboard.writeText((reservation as any).confirmation_code);
                                    toast.success("Codice copiato!");
                                  }}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
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
                          <div className="text-right">
                            {canCancel ? (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={handleCancelReservation}
                              >
                                Disdici
                              </Button>
                            ) : reservation.status !== 'cancelled' && hoursUntilReservation > 0 && hoursUntilReservation < 24 ? (
                              <p className="text-xs text-muted-foreground max-w-[120px]">
                                Non è più possibile disdire (meno di 24h)
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="mt-6 space-y-6">
              {/* Profile Form */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Dati Personali
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Il tuo nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Cognome *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Il tuo cognome"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone">Telefono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+39 123 456 7890"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isSavingProfile}
                      className="w-full sm:w-auto"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSavingProfile ? "Salvataggio..." : "Salva Profilo"}
                    </Button>
                  </div>
                </div>
              </Card>
              
              <NotificationSettings />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* History Calendar Dialog */}
      <HistoryCalendarDialog
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={historyItems}
        title="Il Tuo Storico"
      />
    </div>
  );
};

export default Profilo;
