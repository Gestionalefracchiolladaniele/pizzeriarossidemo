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
    pizzeria_lat: null as number | null,
    pizzeria_lng: null as number | null,
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
        pizzeria_lat: (data as any).pizzeria_lat ? Number((data as any).pizzeria_lat) : null,
        pizzeria_lng: (data as any).pizzeria_lng ? Number((data as any).pizzeria_lng) : null,
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
        pizzeria_lat: settings.pizzeria_lat,
        pizzeria_lng: settings.pizzeria_lng,
      } as any);

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

          <div className="pt-4 border-t">
            <h3 className="text-md font-semibold mb-3">Posizione Pizzeria (per calcolo distanza)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Latitudine</label>
                <Input 
                  type="number"
                  step="0.000001"
                  value={settings.pizzeria_lat || ""}
                  onChange={(e) => setSettings({ ...settings, pizzeria_lat: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="Es: 41.9028"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Longitudine</label>
                <Input 
                  type="number"
                  step="0.000001"
                  value={settings.pizzeria_lng || ""}
                  onChange={(e) => setSettings({ ...settings, pizzeria_lng: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="Es: 12.4964"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Puoi trovare le coordinate cercando il tuo indirizzo su Google Maps, tasto destro → "Cosa c'è qui?"
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
