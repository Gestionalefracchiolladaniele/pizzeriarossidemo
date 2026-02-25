import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Key, Copy, RefreshCw, Eye, EyeOff } from "lucide-react";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { LocationPickerMap } from "@/components/shared/LocationPickerMap";
import { nanoid } from "nanoid";

export const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState({
    name: "Pizzeria Rossi",
    address: "",
    phone: "",
    email: "",
    delivery_radius_km: 5,
    pizzeria_lat: null as number | null,
    pizzeria_lng: null as number | null,
    api_key: "" as string,
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
        pizzeria_lat: data.pizzeria_lat ? Number(data.pizzeria_lat) : null,
        pizzeria_lng: data.pizzeria_lng ? Number(data.pizzeria_lng) : null,
        api_key: (data as any).api_key || "",
      });
    }
    setIsLoading(false);
  };

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    setSettings(prev => ({
      ...prev,
      pizzeria_lat: lat,
      pizzeria_lng: lng,
      address: address || prev.address,
    }));
  };

  const generateApiKey = () => {
    const key = `pz_${nanoid(32)}`;
    setSettings(prev => ({ ...prev, api_key: key }));
    toast.info("Chiave API generata. Clicca 'Salva' per confermare.");
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(settings.api_key);
    toast.success("Chiave API copiata!");
  };

  const copyEndpoint = () => {
    const url = `https://ksebribqmjrqkxmraowe.supabase.co/functions/v1/get-financial-data`;
    navigator.clipboard.writeText(url);
    toast.success("URL endpoint copiato!");
  };

  const handleSave = async () => {
    const updateData = {
      name: settings.name,
      address: settings.address || null,
      phone: settings.phone || null,
      email: settings.email || null,
      delivery_radius_km: settings.delivery_radius_km,
      pizzeria_lat: settings.pizzeria_lat,
      pizzeria_lng: settings.pizzeria_lng,
      api_key: settings.api_key || null,
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

  const apiEndpoint = `https://ksebribqmjrqkxmraowe.supabase.co/functions/v1/get-financial-data`;

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
          <h2 className="text-xl font-semibold">Posizione Pizzeria</h2>
          <p className="text-sm text-muted-foreground">
            Clicca sulla mappa o usa il GPS per impostare la posizione della pizzeria.
            Questa serve per calcolare la distanza di consegna.
          </p>
          
          <LocationPickerMap
            initialLat={settings.pizzeria_lat}
            initialLng={settings.pizzeria_lng}
            onLocationChange={handleLocationChange}
            showGpsButton={true}
            height="250px"
            label="Clicca sulla mappa o trascina il marker"
          />
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

        {/* API Integration for Accountant App */}
        <Card className="p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Integrazione App Commercialista</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Genera una chiave API e usa l'endpoint qui sotto per collegare l'app del commercialista. 
            I dati finanziari (guadagni, ordini, incassi) saranno accessibili in tempo reale.
          </p>

          <div>
            <label className="text-sm font-medium mb-1 block">Chiave API</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={showApiKey ? settings.api_key : settings.api_key ? "•".repeat(20) : ""}
                  readOnly
                  placeholder="Nessuna chiave generata"
                  className="pr-10 font-mono text-xs"
                />
                {settings.api_key && (
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
              <Button variant="outline" size="icon" onClick={generateApiKey} title="Genera nuova chiave">
                <RefreshCw className="w-4 h-4" />
              </Button>
              {settings.api_key && (
                <Button variant="outline" size="icon" onClick={copyApiKey} title="Copia chiave">
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Endpoint API</label>
            <div className="flex gap-2">
              <Input
                value={apiEndpoint}
                readOnly
                className="font-mono text-xs"
              />
              <Button variant="outline" size="icon" onClick={copyEndpoint} title="Copia URL">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Come usare nell'app commercialista:</p>
            <pre className="text-xs bg-background rounded p-3 overflow-x-auto">
{`GET ${apiEndpoint}

Headers:
  X-Api-Key: <la_tua_chiave_api>

Query params (opzionali):
  ?period=today|week|month|all
  ?from=2025-01-01&to=2025-01-31`}
            </pre>
            <p className="text-xs text-muted-foreground">
              Risposta: riepilogo guadagni, ordini per data, per stato, e dettaglio ordini.
            </p>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="w-4 h-4 mr-2" /> Salva Impostazioni
        </Button>
      </div>
    </div>
  );
};
