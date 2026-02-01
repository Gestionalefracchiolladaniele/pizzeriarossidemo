import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Pizza, Calendar, ShoppingBag, Settings, Menu, X, LogOut, Armchair, Clock } from "lucide-react";
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
import { NotificationPromptDialog } from "@/components/NotificationPromptDialog";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Pizza, label: "Menu", id: "menu" },
  { icon: Armchair, label: "Tavoli", id: "tables" },
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

  // Redirect to auth if not logged in or not admin
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/auth?role=admin");
      } else if (!isAdmin) {
        // User is logged in but not admin - redirect to home with message
        navigate("/");
      }
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }


  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboard />;
      case "menu":
        return <AdminMenu />;
      case "tables":
        return <AdminTables />;
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
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-48 bg-card border-r transform transition-transform lg:transform-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-2.5 border-b flex justify-between items-center">
          <Link to="/" className="font-display text-base font-bold">
            Pizzeria <span className="text-primary">Rossi</span>
          </Link>
          <Button variant="ghost" size="sm" className="lg:hidden h-7 w-7 p-0" onClick={() => setSidebarOpen(false)}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
        
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors text-xs ${activeSection === item.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-2 border-t">
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8" onClick={handleSignOut}>
            <LogOut className="w-3.5 h-3.5 mr-1.5" /> Esci
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-3 lg:p-4">
        <div className="lg:hidden mb-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-3.5 h-3.5 mr-1" /> Menu
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
