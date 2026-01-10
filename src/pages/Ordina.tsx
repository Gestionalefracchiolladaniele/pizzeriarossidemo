import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, MapPin, Clock, Trash2, Plus, Minus, Check, Bike, Store } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { menuItems, menuCategories, MenuItem } from "@/data/menuData";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const pickupTimes = [
  "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
];

const Ordina = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<"menu" | "checkout" | "confirmed">("menu");
  const [activeCategory, setActiveCategory] = useState("pizze");
  const [orderCode, setOrderCode] = useState("");
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
    setDeliveryType,
    setPickupTime,
    clearCart,
  } = useCart();

  // Pre-fill customer data if user is logged in
  useEffect(() => {
    if (user) {
      setCustomerName(user.user_metadata?.full_name || "");
      setCustomerPhone(user.user_metadata?.phone || "");
      setCustomerEmail(user.email || "");
    }
  }, [user]);

  const filteredItems = menuItems.filter(item => item.category === activeCategory);

  const handleConfirmOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const deliveryFee = cart.deliveryType === "delivery" ? 2.50 : 0;
    const finalTotal = totalPrice + deliveryFee;

    // Prepare order items for database
    const orderItems = cart.items.map(item => ({
      id: item.menuItem.id,
      name: item.menuItem.name,
      price: item.menuItem.price,
      quantity: item.quantity,
      notes: item.notes,
    }));

    try {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          customer_name: customerName,
          customer_email: customerEmail || `${Date.now()}@guest.pizzeria.com`,
          customer_phone: customerPhone,
          delivery_type: cart.deliveryType,
          delivery_address: cart.deliveryType === "delivery" ? deliveryAddress : null,
          pickup_time: cart.deliveryType === "asporto" ? cart.pickupTime : null,
          items: orderItems,
          subtotal: totalPrice,
          delivery_fee: deliveryFee,
          total: finalTotal,
          notes: orderNotes || null,
          status: "received",
        })
        .select("order_number")
        .single();

      if (error) {
        console.error("Error creating order:", error);
        toast.error("Errore durante l'invio dell'ordine");
        setIsSubmitting(false);
        return;
      }

      setOrderNumber(data.order_number);
      setOrderCode(`ORD${data.order_number}`);
      setStep("confirmed");
      clearCart();
      toast.success("Ordine inviato con successo!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Errore durante l'invio dell'ordine");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deliveryFee = cart.deliveryType === "delivery" ? 2.50 : 0;
  const finalTotal = totalPrice + deliveryFee;

  if (step === "confirmed") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="container mx-auto px-4 text-center max-w-lg"
          >
            <div className="w-20 h-20 bg-basil/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-basil" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Ordine Confermato!</h1>
            
            <Card className="p-6 mb-6">
              <div className="text-sm text-muted-foreground mb-2">Numero ordine</div>
              <div className="text-3xl font-mono font-bold text-primary mb-4">#{orderNumber}</div>
              <p className="text-muted-foreground">
                {cart.deliveryType === "delivery" 
                  ? "Il tuo ordine è in preparazione. Arriverà in circa 30-45 minuti."
                  : `Il tuo ordine sarà pronto per il ritiro alle ${cart.pickupTime || "ora selezionata"}.`
                }
              </p>
            </Card>
            
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Torna alla Home
            </Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-24 pb-8 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Ordina <span className="text-primary">Online</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Asporto o consegna a domicilio. Scegli dal nostro menu e ordina in pochi click.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {step === "menu" && (
              <>
                {/* Delivery Type Selection */}
                <Card className="p-4 mb-6">
                  <Tabs value={cart.deliveryType} onValueChange={(v) => setDeliveryType(v as any)}>
                    <TabsList className="w-full">
                      <TabsTrigger value="asporto" className="flex-1">
                        <Store className="w-4 h-4 mr-2" />
                        Asporto
                      </TabsTrigger>
                      <TabsTrigger value="delivery" className="flex-1">
                        <Bike className="w-4 h-4 mr-2" />
                        Consegna (+€2.50)
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </Card>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {menuCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? "default" : "outline"}
                      onClick={() => setActiveCategory(category.id)}
                      className="whitespace-nowrap"
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.label}
                    </Button>
                  ))}
                </div>

                {/* Menu Items */}
                <div className="space-y-4">
                  {filteredItems.map((item) => {
                    const cartItem = cart.items.find(ci => ci.menuItem.id === item.id);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="p-4 flex gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold">{item.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                              <span className="font-bold text-primary">
                                €{item.price.toFixed(2)}
                              </span>
                            </div>
                            
                            <div className="mt-3 flex justify-between items-center">
                              {item.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {item.tags.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag === "vegetariano" ? "🌿" : tag === "piccante" ? "🌶️" : "🌾"}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              {cartItem ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="w-8 text-center font-bold">{cartItem.quantity}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button size="sm" onClick={() => addItem(item)}>
                                  <Plus className="w-4 h-4 mr-1" />
                                  Aggiungi
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}

            {step === "checkout" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Button variant="ghost" onClick={() => setStep("menu")}>
                  ← Torna al menu
                </Button>
                
                <h2 className="text-2xl font-bold">Completa l'ordine</h2>
                
                {cart.deliveryType === "asporto" ? (
                  <Card className="p-4">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Orario di ritiro
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {pickupTimes.map(time => (
                        <Button
                          key={time}
                          variant={cart.pickupTime === time ? "default" : "outline"}
                          onClick={() => setPickupTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <Card className="p-4">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Indirizzo di consegna
                    </h3>
                    <Input
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Via Roma 123, Milano"
                    />
                  </Card>
                )}
                
                <Card className="p-4 space-y-4">
                  <h3 className="font-bold">I tuoi dati</h3>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nome e Cognome *"
                  />
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Email *"
                  />
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Telefono *"
                  />
                  <Textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Note per l'ordine (opzionale)"
                    rows={2}
                  />
                </Card>

                <Card className="p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground text-center">
                    💳 Pagamento alla consegna o al ritiro (contanti o carta)
                  </p>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-24">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Il Tuo Ordine
              </h3>
              
              {cart.items.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Il carrello è vuoto
                </p>
              ) : (
                <>
                  <div className="space-y-3 max-h-[40vh] overflow-auto">
                    {cart.items.map((item) => (
                      <div key={item.menuItem.id} className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg">
                        <img
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.menuItem.name}</p>
                          <p className="text-xs text-muted-foreground">
                            €{item.menuItem.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">
                            €{(item.menuItem.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeItem(item.menuItem.id)}
                            className="text-destructive hover:underline text-xs"
                          >
                            Rimuovi
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t mt-4 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotale</span>
                      <span>€{totalPrice.toFixed(2)}</span>
                    </div>
                    {cart.deliveryType === "delivery" && (
                      <div className="flex justify-between text-sm">
                        <span>Consegna</span>
                        <span>€{deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Totale</span>
                      <span className="text-primary">€{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {step === "menu" ? (
                    <Button
                      className="w-full mt-4"
                      size="lg"
                      onClick={() => setStep("checkout")}
                      disabled={totalItems === 0}
                    >
                      Procedi al Checkout
                    </Button>
                  ) : (
                    <Button
                      className="w-full mt-4"
                      size="lg"
                      onClick={handleConfirmOrder}
                      disabled={
                        isSubmitting ||
                        !customerName || !customerPhone || !customerEmail ||
                        (cart.deliveryType === "asporto" && !cart.pickupTime) ||
                        (cart.deliveryType === "delivery" && !deliveryAddress)
                      }
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Invio in corso..." : "Conferma Ordine"}
                    </Button>
                  )}
                </>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Ordina;
