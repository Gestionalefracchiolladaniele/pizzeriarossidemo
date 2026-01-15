import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Pizza, Calendar, ShoppingBag, Settings, Menu, X, LogOut, Armchair, CalendarClock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminMenu } from "@/components/admin/AdminMenu";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminBookings } from "@/components/admin/AdminBookings";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminTables } from "@/components/admin/AdminTables";
import { AdminOpeningHours } from "@/components/admin/AdminOpeningHours";
import { AdminReservationSettings } from "@/components/admin/AdminReservationSettings";
import { NotificationPromptDialog } from "@/components/NotificationPromptDialog";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Pizza, label: "Menu", id: "menu" },
  { icon: Armchair, label: "Tavoli", id: "tables" },
  { icon: CalendarClock, label: "Disponibilità Prenotazioni", id: "reservation-settings" },
  { icon: Clock, label: "Orari Apertura", id: "hours" },
  { icon: Calendar, label: "Prenotazioni", id: "bookings" },
  { icon: ShoppingBag, label: "Ordini", id: "orders" },
  { icon: Settings, label: "Impostazioni", id: "settings" },
];

const Admin = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/admin-auth");
    } else if (!isLoading && user && !isAdmin) {
      navigate("/");
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboard />;
      case "menu":
        return <AdminMenu />;
      case "tables":
        return <AdminTables />;
      case "reservation-settings":
        return <AdminReservationSettings />;
      case "hours":
        return <AdminOpeningHours />;
      case "orders":
        return <AdminOrders />;
      case "bookings":
        return <AdminBookings />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Notification Prompt Dialog */}
      <NotificationPromptDialog userType="admin" />
      
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

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="w-5 h-5 mr-3" /> Esci
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8">
        <div className="lg:hidden mb-4">
          <Button variant="outline" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 mr-2" /> Menu
          </Button>
        </div>

        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
};

export default Admin;
