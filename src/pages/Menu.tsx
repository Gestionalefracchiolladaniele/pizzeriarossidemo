import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Leaf, Flame, WheatOff, Search, ShoppingCart, Plus, Minus } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface MenuItem {
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

interface MenuCategory {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number | null;
}

const tagConfig: Record<string, { icon: typeof Leaf; label: string; className: string }> = {
  vegetariano: { icon: Leaf, label: "Vegetariano", className: "bg-basil/10 text-basil border-basil/30" },
  vegano: { icon: Leaf, label: "Vegano", className: "bg-basil/10 text-basil border-basil/30" },
  piccante: { icon: Flame, label: "Piccante", className: "bg-tomato/10 text-tomato border-tomato/30" },
  "senza-glutine": { icon: WheatOff, label: "Senza Glutine", className: "bg-olive-oil/10 text-olive-oil border-olive-oil/30" },
};

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { addItem, totalItems, totalPrice, cart, updateQuantity } = useCart();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    setIsLoading(true);
    
    // Fetch categories and items in parallel
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

  const handleAddItem = (item: MenuItem) => {
    // Convert to cart format
    addItem({
      id: item.id,
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: "pizze",
      image: item.image_url || "/placeholder.svg",
      tags: (item.tags || []) as any,
    });
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = item.category_id === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilters = activeFilters.length === 0 ||
      activeFilters.every(filter => (item.tags || []).includes(filter));
    return matchesCategory && matchesSearch && matchesFilters;
  });

  // Get cart item for a menu item
  const getCartItem = (itemId: string) => cart.items.find(ci => ci.menuItem.id === itemId);

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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Il Nostro <span className="text-primary">Menu</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Scopri tutte le nostre specialità, dalla tradizione napoletana alle creazioni dello chef
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Cerca nel menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {Object.entries(tagConfig).map(([key, config]) => (
              <Button
                key={key}
                variant={activeFilters.includes(key) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter(key)}
                className={activeFilters.includes(key) ? "" : config.className}
              >
                <config.icon className="w-4 h-4 mr-1" />
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
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

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => {
            const cartItem = getCartItem(item.id);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold text-sm">
                    €{item.price.toFixed(2)}
                  </div>
                  {item.is_popular && (
                    <div className="absolute top-2 left-2 bg-tomato text-white px-2 py-1 rounded-full text-xs font-medium">
                      Popolare
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-display text-lg font-bold text-foreground mb-1">
                    {item.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  {(item.tags || []).length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-3">
                      {(item.tags || []).map((tag) => {
                        const config = tagConfig[tag];
                        if (!config) return null;
                        return (
                          <Badge key={tag} variant="outline" className={`text-xs ${config.className}`}>
                            <config.icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  
                  {cartItem ? (
                    <div className="flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="font-bold">{cartItem.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleAddItem(item)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Aggiungi
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              Nessun piatto trovato. Prova a modificare i filtri.
            </p>
          </div>
        )}
      </div>

      {/* Cart Floating Button */}
      {totalItems > 0 && (
        <Sheet>
          <SheetTrigger asChild>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="fixed bottom-6 right-6 z-40"
            >
              <Button size="lg" className="rounded-full shadow-lg shadow-primary/30 h-16 px-6">
                <ShoppingCart className="w-5 h-5 mr-2" />
                <span className="font-bold">{totalItems}</span>
                <span className="mx-2">|</span>
                <span>€{totalPrice.toFixed(2)}</span>
              </Button>
            </motion.div>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Il Tuo Carrello</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {cart.items.map((item) => (
                <div key={item.menuItem.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.menuItem.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      €{item.menuItem.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-lg font-bold mb-4">
                  <span>Totale</span>
                  <span>€{totalPrice.toFixed(2)}</span>
                </div>
                <Link to="/ordina">
                  <Button className="w-full" size="lg">
                    Procedi all'Ordine
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      <Footer />
    </div>
  );
};

export default Menu;
