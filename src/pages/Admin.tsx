import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Pizza, Calendar, ShoppingBag, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Pizza, label: "Menu", id: "menu" },
  { icon: Calendar, label: "Prenotazioni", id: "bookings" },
  { icon: ShoppingBag, label: "Ordini", id: "orders" },
  { icon: Settings, label: "Impostazioni", id: "settings" },
];

const mockStats = {
  ordersToday: 24,
  bookingsToday: 8,
  revenue: 1250,
  pendingOrders: 3,
};

const Admin = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform lg:transform-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-4 border-b flex justify-between items-center">
          <Link to="/" className="font-display text-xl font-bold">
            Pizzeria <span className="text-primary">Rossi</span>
          </Link>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeSection === item.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8">
        <div className="lg:hidden mb-4">
          <Button variant="outline" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 mr-2" /> Menu
          </Button>
        </div>

        {activeSection === "dashboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6"><div className="text-3xl font-bold text-primary">{mockStats.ordersToday}</div><div className="text-muted-foreground">Ordini Oggi</div></Card>
              <Card className="p-6"><div className="text-3xl font-bold text-basil">{mockStats.bookingsToday}</div><div className="text-muted-foreground">Prenotazioni Oggi</div></Card>
              <Card className="p-6"><div className="text-3xl font-bold">€{mockStats.revenue}</div><div className="text-muted-foreground">Incasso Oggi</div></Card>
              <Card className="p-6"><div className="text-3xl font-bold text-tomato">{mockStats.pendingOrders}</div><div className="text-muted-foreground">Ordini in Attesa</div></Card>
            </div>
            <Card className="p-6"><h2 className="text-xl font-bold mb-4">Ordini Recenti</h2><p className="text-muted-foreground">Connetti Lovable Cloud per vedere i dati reali.</p></Card>
          </motion.div>
        )}

        {activeSection !== "dashboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h1 className="text-3xl font-bold capitalize">{activeSection}</h1>
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Questa sezione sarà disponibile dopo aver connesso Lovable Cloud per la persistenza dei dati.</p>
              <Button variant="outline">Scopri di più</Button>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Admin;
