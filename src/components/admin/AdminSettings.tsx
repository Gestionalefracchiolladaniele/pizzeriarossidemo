import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Upload } from "lucide-react";
import { NotificationSettings } from "@/components/settings/NotificationSettings";

export const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState({
    name: "Pizzeria Rossi",
    address: "",
    phone: "",
    email: "",
    logo_url: "",
    average_prep_time_minutes: 30,
    delivery_radius_km: 5,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("pizzeria_settings")
      .select("*")
      .single();

    if (data) {
      setSettings({
        name: data.name,
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        logo_url: data.logo_url || "",
        average_prep_time_minutes: data.average_prep_time_minutes || 30,
        delivery_radius_km: data.delivery_radius_km || 5,
      });
    }
    setIsLoading(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `logo.${fileExt}`;
    const filePath = `branding/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("pizzeria-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Errore upload: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("pizzeria-images")
      .getPublicUrl(filePath);

    setSettings({ ...settings, logo_url: publicUrl });
    setUploading(false);
    toast.success("Logo caricato!");
  };

  const handleSave = async () => {
    // Upsert settings
    const { error } = await supabase
      .from("pizzeria_settings")
      .upsert({
        id: "default",
        name: settings.name,
        address: settings.address || null,
        phone: settings.phone || null,
        email: settings.email || null,
        logo_url: settings.logo_url || null,
        average_prep_time_minutes: settings.average_prep_time_minutes,
        delivery_radius_km: settings.delivery_radius_km,
      });

    if (error) {
      toast.error("Errore: " + error.message);
      return;
    }

    toast.success("Impostazioni salvate!");
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
          <h2 className="text-xl font-semibold">Logo e Branding</h2>
          
          <div className="flex items-center gap-4">
            {settings.logo_url && (
              <img 
                src={settings.logo_url} 
                alt="Logo" 
                className="w-24 h-24 object-contain rounded-lg bg-muted"
              />
            )}
            <label className="flex-1">
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                <span className="text-sm text-muted-foreground block mt-2">
                  {uploading ? "Caricamento..." : "Carica logo"}
                </span>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleLogoUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Consegne</h2>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Tempo preparazione medio (minuti)</label>
            <Input 
              type="number"
              value={settings.average_prep_time_minutes}
              onChange={(e) => setSettings({ ...settings, average_prep_time_minutes: parseInt(e.target.value) || 30 })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Raggio consegna (km)</label>
            <Input 
              type="number"
              value={settings.delivery_radius_km}
              onChange={(e) => setSettings({ ...settings, delivery_radius_km: parseInt(e.target.value) || 5 })}
            />
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
