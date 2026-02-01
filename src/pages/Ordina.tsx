import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, MapPin, Clock, Trash2, Plus, Minus, Check, User, UtensilsCrossed, Copy } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart, MenuItem } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { nanoid } from "nanoid";
import { ProductDetailDialog } from "@/components/ordina/ProductDetailDialog";
import { DeliveryTypeSelector } from "@/components/ordina/DeliveryTypeSelector";
import { DeliveryAddressMap } from "@/components/ordina/DeliveryAddressMap";
import { DeliveryTimeEstimate } from "@/components/ordina/DeliveryTimeEstimate";

interface DeliveryCoordinates {
  lat: number;
  lng: number;
  address: string;
  distance: number;
}

interface MenuCategory {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number | null;
}

interface DbMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string;
  image_url: string | null;
  tags: string[] | null;
  is_available: boolean | null;
  is_popular: boolean | null;
}

const pickupTimes = [
  "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
];

const Ordina = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<"menu" | "checkout" | "confirmed">("menu");
  const [activeCategory, setActiveCategory] = useState("");
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [confirmationCode, setConfirmationCode] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<DbMenuItem | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryCoords, setDeliveryCoords] = useState<DeliveryCoordinates | null>(null);
  const [isDeliveryValid, setIsDeliveryValid] = useState(false);
  
  // Dynamic menu state
  const [menuItems, setMenuItems] = useState<DbMenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
    setDeliveryType,
    setPickupTime,
    setTableNumber,
    clearCart,
  } = useCart();

  // No longer require auth - allow direct access for demo

  // Fetch menu data from Supabase
  useEffect(() => {
    fetchMenuData();
  }, []);

  // Pre-fill customer data if user is logged in
  useEffect(() => {
    if (user) {
      setCustomerName(user.user_metadata?.full_name || "");
      setCustomerPhone(user.user_metadata?.phone || "");
      setCustomerEmail(user.email || "");
    }
  }, [user]);

  const fetchMenuData = async () => {
    setIsLoading(true);
    
    const [categoriesRes, itemsRes] = await Promise.all([
      supabase
        .from("menu_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("menu_items")
        .select("*")
        .eq("is_available", true)
        .order("sort_order"),
    ]);

    if (categoriesRes.data) {
      setCategories(categoriesRes.data);
      if (categoriesRes.data.length > 0 && !activeCategory) {
        setActiveCategory(categoriesRes.data[0].id);
      }
    }

    if (itemsRes.data) {
      setMenuItems(itemsRes.data);
    }

    setIsLoading(false);
  };

  const filteredItems = menuItems.filter(item => item.category_id === activeCategory);

  // Convert DB item to cart MenuItem format
  const toCartItem = (item: DbMenuItem): MenuItem => ({
    id: item.id,
    name: item.name,
    description: item.description || "",
    price: item.price,
    category: item.category_id,
    image: item.image_url || "/placeholder.svg",
    tags: item.tags || [],
  });

  const handleConfirmOrder = async () => {
    if (isSubmitting) return;
    
    // Validate required fields
    if (!customerName.trim()) {
      toast.error("Inserisci il tuo nome");
      return;
    }
    if (!customerPhone.trim()) {
      toast.error("Inserisci il tuo telefono");
      return;
    }
    if (!customerEmail.trim()) {
      toast.error("Inserisci la tua email");
      return;
    }
    if (cart.deliveryType === "delivery" && !isDeliveryValid) {
      toast.error("Seleziona un indirizzo di consegna valido");
      return;
    }
    if (cart.deliveryType === "takeaway" && !cart.pickupTime) {
      toast.error("Seleziona un orario di ritiro");
      return;
    }

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

    // Generate confirmation code
    const generatedCode = `ORD-${nanoid(6).toUpperCase()}`;

    try {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          delivery_type: cart.deliveryType,
          delivery_address: cart.deliveryType === "delivery" ? (deliveryCoords?.address || deliveryAddress) : null,
          delivery_lat: cart.deliveryType === "delivery" ? deliveryCoords?.lat : null,
          delivery_lng: cart.deliveryType === "delivery" ? deliveryCoords?.lng : null,
          delivery_distance_km: cart.deliveryType === "delivery" ? deliveryCoords?.distance : null,
          pickup_time: cart.deliveryType === "takeaway" ? cart.pickupTime : null,
          items: orderItems,
          subtotal: totalPrice,
          delivery_fee: deliveryFee,
          total: finalTotal,
          notes: cart.deliveryType === "dine_in" && cart.tableNumber 
            ? `Tavolo: ${cart.tableNumber}${orderNotes ? ` - ${orderNotes}` : ""}`
            : orderNotes || null,
          status: "pending", // Shows as "Inviato" to user
          confirmation_code: generatedCode, // Save confirmation code to database
        })
        .select("order_number, confirmation_code")
        .single();

      if (error) {
        console.error("Error creating order:", error);
        toast.error("Errore durante l'invio dell'ordine");
        setIsSubmitting(false);
        return;
      }

      setOrderNumber(data.order_number);
      setConfirmationCode(generatedCode);
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

  const getDeliveryTypeLabel = () => {
    switch (cart.deliveryType) {
      case 'delivery': return 'Consegna';
      case 'dine_in': return 'Al Tavolo';
      default: return 'Ritiro';
    }
  };

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
            
            <h1 className="text-3xl font-bold mb-2">Ordine Inviato!</h1>
            <p className="text-muted-foreground mb-6">Il ristorante ha ricevuto il tuo ordine</p>
            
            <Card className="p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Numero ordine</div>
                  <div className="text-2xl font-mono font-bold text-primary">#{orderNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Codice conferma</div>
                  <div className="text-lg font-mono font-bold text-foreground flex items-center justify-center gap-2">
                    {confirmationCode}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => {
                        navigator.clipboard.writeText(confirmationCode);
                        toast.success("Codice copiato!");
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <Badge className="bg-amber-500 text-white mb-4">Inviato - In attesa di conferma</Badge>
              
              <p className="text-muted-foreground text-sm">
                {cart.deliveryType === "delivery" 
                  ? "Riceverai una notifica quando l'ordine sarà confermato. Arriverà in circa 30-45 minuti."
                  : cart.deliveryType === "dine_in"
                  ? "Riceverai una notifica quando l'ordine sarà confermato e ti verrà portato al tavolo."
                  : `Riceverai una notifica quando l'ordine sarà confermato. Ritiro previsto alle ${cart.pickupTime || "ora selezionata"}.`
                }
              </p>
            </Card>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user && (
                <Link to="/profilo">
                  <Button variant="outline">
                    <User className="w-4 h-4 mr-2" />
                    Vedi nel Profilo
                  </Button>
                </Link>
              )}
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Torna alla Home
              </Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Caricamento menu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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
              Asporto, consegna a domicilio o direttamente al tavolo. Scegli dal nostro menu.
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
                {/* Delivery Type Selection - 3 Clear Cards */}
                <div className="mb-6">
                  <h2 className="text-lg font-bold mb-4">Come vuoi ricevere il tuo ordine?</h2>
                  <DeliveryTypeSelector 
                    value={cart.deliveryType} 
                    onChange={(type) => setDeliveryType(type)} 
                  />
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? "default" : "outline"}
                      onClick={() => setActiveCategory(category.id)}
                      className="whitespace-nowrap"
                    >
                      <span className="mr-2">{category.icon || "🍽️"}</span>
                      {category.name}
                    </Button>
                  ))}
                </div>

                {/* Menu Items */}
                {filteredItems.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Nessun prodotto disponibile in questa categoria.
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredItems.map((item) => {
                      const cartItem = cart.items.find(ci => ci.menuItem.id === item.id);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Card 
                            className="p-4 flex gap-4 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => {
                              setSelectedProduct(item);
                              setIsProductDialogOpen(true);
                            }}
                          >
                            <img
                              src={item.image_url || "/placeholder.svg"}
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
                                {(item.tags || []).length > 0 && (
                                  <div className="flex gap-1">
                                    {(item.tags || []).slice(0, 2).map(tag => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag === "vegetariano" ? "🌿" : tag === "piccante" ? "🌶️" : "🌾"}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                
                                {cartItem ? (
                                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
                                  <Button size="sm" onClick={(e) => {
                                    e.stopPropagation();
                                    addItem(toCartItem(item));
                                    toast.success(`${item.name} aggiunto al carrello`);
                                  }}>
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
                )}
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
                
                {cart.deliveryType === "takeaway" && (
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
                )}

                {cart.deliveryType === "delivery" && (
                  <Card className="p-4">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Indirizzo di consegna
                    </h3>
                    <DeliveryAddressMap
                      onAddressChange={(coords) => {
                        setDeliveryCoords(coords);
                        if (coords) {
                          setDeliveryAddress(coords.address);
                        }
                      }}
                      onValidityChange={setIsDeliveryValid}
                    />
                    
                    {/* Show time estimate when address is valid */}
                    {isDeliveryValid && deliveryCoords && (
                      <div className="mt-4">
                        <DeliveryTimeEstimate
                          cartItems={cart.items}
                          distanceKm={deliveryCoords.distance}
                        />
                      </div>
                    )}
                  </Card>
                )}

                {cart.deliveryType === "dine_in" && (
                  <Card className="p-4">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-primary" />
                      Al Tavolo
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Inserisci il numero del tuo tavolo (opzionale)
                    </p>
                    <Input
                      value={cart.tableNumber || ""}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Es. 5"
                      className="max-w-[120px]"
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
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Telefono *"
                  />
                  <Textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Note per l'ordine (opzionale)"
                    rows={3}
                  />
                </Card>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Invio in corso..." : `Conferma Ordine - €${finalTotal.toFixed(2)}`}
                </Button>
              </motion.div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Il Tuo Ordine
                {cart.deliveryType && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {getDeliveryTypeLabel()}
                  </Badge>
                )}
              </h2>

              {cart.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Il carrello è vuoto</p>
                  <p className="text-sm">Aggiungi qualcosa dal menu</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                    {cart.items.map((item) => (
                      <div key={item.menuItem.id} className="flex items-center justify-between gap-2 pb-3 border-b">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.menuItem.name}</p>
                          <p className="text-xs text-muted-foreground">
                            €{item.menuItem.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeItem(item.menuItem.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Subtotale</span>
                      <span>€{totalPrice.toFixed(2)}</span>
                    </div>
                    {cart.deliveryType === "delivery" && (
                      <div className="flex justify-between text-sm">
                        <span>Consegna</span>
                        <span>€2.50</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Totale</span>
                      <span className="text-primary">€{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {step === "menu" && (
                    <Button
                      className="w-full mt-6"
                      size="lg"
                      onClick={() => setStep("checkout")}
                      disabled={totalItems === 0}
                    >
                      Procedi al Checkout
                    </Button>
                  )}
                </>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Product Detail Dialog */}
      <ProductDetailDialog
        item={selectedProduct}
        isOpen={isProductDialogOpen}
        onClose={() => {
          setIsProductDialogOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={(item, quantity) => {
          addItem(toCartItem(item as unknown as DbMenuItem), quantity);
          toast.success(`${item.name} aggiunto al carrello`);
        }}
        currentQuantity={selectedProduct ? cart.items.find(ci => ci.menuItem.id === selectedProduct.id)?.quantity : 0}
      />

      <Footer />
    </div>
  );
};

export default Ordina;
