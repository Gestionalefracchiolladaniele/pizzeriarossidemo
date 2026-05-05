import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { NotificationSettings } from "@/components/settings/NotificationSettings";

export const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    name: "Pizzeria Rossi",
    address: "",
    phone: "",
    email: "",
    delivery_radius_km: 5,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("pizzeria_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (data) {
      setSettingsId(data.id);
      setSettings({
        name: data.name,
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        delivery_radius_km: data.delivery_radius_km || 5,
      });
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    const updateData = {
      name: settings.name,
      address: settings.address || null,
      phone: settings.phone || null,
      email: settings.email || null,
      delivery_radius_km: settings.delivery_radius_km,
    };

    let error;
    if (settingsId) {
      const result = await supabase
        .from("pizzeria_settings")
        .update(updateData)
        .eq("id", settingsId);
      error = result.error;
    } else {
      const result = await supabase
        .from("pizzeria_settings")
        .insert(updateData);
      error = result.error;
    }

    if (error) {
      toast.error("Errore: " + error.message);
      return;
    }

    toast.success("Impostazioni salvate!");
    if (!settingsId) {
      fetchSettings();
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Impostazioni Pizzeria</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Informazioni Generali</h2>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Nome Pizzeria</label>
            <Input 
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Indirizzo</label>
            <Input 
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="Via Roma 123, 00100 Roma"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Telefono</label>
            <Input 
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="+39 06 1234567"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <Input 
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="info@pizzeriarossi.it"
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Consegne</h2>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Raggio massimo consegna (km)</label>
            <Input 
              type="number"
              value={settings.delivery_radius_km}
              onChange={(e) => setSettings({ ...settings, delivery_radius_km: parseInt(e.target.value) || 5 })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Gli ordini oltre questo raggio verranno bloccati
            </p>
          </div>
        </Card>

        <NotificationSettings />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="w-4 h-4 mr-2" /> Salva Impostazioni
        </Button>
      </div>
    </div>
  );
};
