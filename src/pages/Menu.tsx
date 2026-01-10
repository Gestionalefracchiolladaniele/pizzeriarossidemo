import { useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Flame, WheatOff, Search, ShoppingCart, LogIn } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { menuItems, menuCategories, MenuItem } from "@/data/menuData";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const tagConfig = {
  vegetariano: { icon: Leaf, label: "Vegetariano", className: "bg-basil/10 text-basil border-basil/30" },
  piccante: { icon: Flame, label: "Piccante", className: "bg-tomato/10 text-tomato border-tomato/30" },
  "senza-glutine": { icon: WheatOff, label: "Senza Glutine", className: "bg-olive-oil/10 text-olive-oil border-olive-oil/30" },
};

const Menu = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>("pizze");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { addItem, totalItems, totalPrice, cart, updateQuantity, removeItem } = useCart();

  const handleAddItem = (item: MenuItem) => {
    if (!user) {
      toast.error("Accedi per aggiungere prodotti al carrello", {
        action: {
          label: "Accedi",
          onClick: () => window.location.href = "/auth"
        }
      });
      return;
    }
    addItem(item);
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilters = activeFilters.length === 0 ||
      activeFilters.every(filter => item.tags.includes(filter as any));
    return matchesCategory && matchesSearch && matchesFilters;
  });

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

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => (
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
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold text-sm">
                  €{item.price.toFixed(2)}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-display text-lg font-bold text-foreground mb-1">
                  {item.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>
                
                {item.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-3">
                    {item.tags.map((tag) => {
                      const config = tagConfig[tag];
                      return (
                        <Badge key={tag} variant="outline" className={`text-xs ${config.className}`}>
                          <config.icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      );
                    })}
                  </div>
                )}
                
                <Button
                  className="w-full"
                  onClick={() => handleAddItem(item)}
                  variant={user ? "default" : "secondary"}
                >
                  {user ? (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Aggiungi
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Accedi per ordinare
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
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
