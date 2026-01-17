import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Users, Square, Clock, Settings, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RestaurantTableWithHours {
  id: string;
  table_number: number;
  seats: number;
  is_active: boolean | null;
  available_hours: string[] | null;
  created_at: string;
  updated_at: string;
}

interface ReservationSettings {
  time_slots: string[];
  days_available: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  max_reservations_per_slot: number;
  advance_booking_days: number;
}

const DEFAULT_SETTINGS: ReservationSettings = {
  time_slots: ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"],
  days_available: {
    monday: true, tuesday: true, wednesday: true, thursday: true,
    friday: true, saturday: true, sunday: false,
  },
  max_reservations_per_slot: 5,
  advance_booking_days: 14,
};

const ALL_TIME_SLOTS = [
  "12:00", "12:30", "13:00", "13:30", "14:00",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00"
];

const DAY_LABELS: Record<string, string> = {
  monday: "Lunedì",
  tuesday: "Martedì",
  wednesday: "Mercoledì",
  thursday: "Giovedì",
  friday: "Venerdì",
  saturday: "Sabato",
  sunday: "Domenica",
};

// Visual table representation component
const TableVisual = ({ table, isActive }: { table: RestaurantTableWithHours; isActive: boolean }) => {
  const seats = table.seats;
  const tableNumber = table.table_number;
  
  const getSeatPositions = () => {
    const positions: { top?: string; bottom?: string; left?: string; right?: string; transform?: string }[] = [];
    
    if (seats === 2) {
      positions.push({ left: "50%", top: "-8px", transform: "translateX(-50%)" });
      positions.push({ left: "50%", bottom: "-8px", transform: "translateX(-50%)" });
    } else if (seats === 4) {
      positions.push({ left: "50%", top: "-8px", transform: "translateX(-50%)" });
      positions.push({ left: "50%", bottom: "-8px", transform: "translateX(-50%)" });
      positions.push({ left: "-8px", top: "50%", transform: "translateY(-50%)" });
      positions.push({ right: "-8px", top: "50%", transform: "translateY(-50%)" });
    } else if (seats === 6) {
      positions.push({ left: "25%", top: "-8px", transform: "translateX(-50%)" });
      positions.push({ left: "75%", top: "-8px", transform: "translateX(-50%)" });
      positions.push({ left: "25%", bottom: "-8px", transform: "translateX(-50%)" });
      positions.push({ left: "75%", bottom: "-8px", transform: "translateX(-50%)" });
      positions.push({ left: "-8px", top: "50%", transform: "translateY(-50%)" });
      positions.push({ right: "-8px", top: "50%", transform: "translateY(-50%)" });
    } else {
      for (let i = 0; i < Math.min(seats, 8); i++) {
        const angle = (i * 360) / Math.min(seats, 8);
        const radius = 45;
        const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
        const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
        positions.push({
          left: `calc(50% + ${x}px)`,
          top: `calc(50% + ${y}px)`,
          transform: "translate(-50%, -50%)",
        });
      }
    }
    
    return positions;
  };
  
  const seatPositions = getSeatPositions();
  const isRound = seats <= 2 || seats >= 5;
  
  return (
    <div className="relative w-24 h-24 mx-auto">
      <motion.div
        className={`absolute inset-3 ${isRound ? 'rounded-full' : 'rounded-lg'} 
          ${isActive ? 'bg-gradient-to-br from-amber-600 to-amber-800' : 'bg-muted'} 
          shadow-lg flex items-center justify-center border-4 border-amber-900/30`}
        whileHover={{ scale: 1.05 }}
      >
        <span className={`text-lg font-bold ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
          {tableNumber}
        </span>
      </motion.div>
      
      {seatPositions.slice(0, seats).map((pos, idx) => (
        <motion.div
          key={idx}
          className={`absolute w-4 h-4 rounded-full shadow-md
            ${isActive ? 'bg-gradient-to-br from-gray-600 to-gray-800' : 'bg-gray-400'}`}
          style={pos}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: idx * 0.05 }}
        />
      ))}
    </div>
  );
};

export const AdminTables = () => {
  const [activeTab, setActiveTab] = useState("tables");
  const [tables, setTables] = useState<RestaurantTableWithHours[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTableWithHours | null>(null);
  const [reservationSettings, setReservationSettings] = useState<ReservationSettings>(DEFAULT_SETTINGS);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [formData, setFormData] = useState({
    table_number: "",
    seats: "4",
    is_active: true,
    available_hours: [] as string[],
  });

  useEffect(() => {
    fetchTables();
    fetchReservationSettings();
  }, []);

  const fetchTables = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("restaurant_tables")
      .select("*")
      .order("table_number");

    if (error) {
      toast.error("Errore nel caricamento tavoli");
      return;
    }

    setTables((data || []) as RestaurantTableWithHours[]);
    setIsLoading(false);
  };

  const fetchReservationSettings = async () => {
    const { data, error } = await supabase
      .from("pizzeria_settings")
      .select("reservation_settings")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching settings:", error);
      return;
    }

    if (data?.reservation_settings) {
      const fetched = data.reservation_settings as unknown as ReservationSettings;
      setReservationSettings({
        ...DEFAULT_SETTINGS,
        ...fetched,
        days_available: {
          ...DEFAULT_SETTINGS.days_available,
          ...(fetched.days_available || {}),
        },
      });
    }
  };

  const saveReservationSettings = async () => {
    setIsSavingSettings(true);
    
    const { error } = await supabase
      .from("pizzeria_settings")
      .update({ reservation_settings: reservationSettings as unknown as any })
      .eq("id", (await supabase.from("pizzeria_settings").select("id").limit(1).single()).data?.id);

    if (error) {
      toast.error("Errore nel salvataggio impostazioni");
      setIsSavingSettings(false);
      return;
    }

    toast.success("Impostazioni salvate!");
    setIsSavingSettings(false);
  };

  const openDialog = (table?: RestaurantTableWithHours) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        table_number: table.table_number.toString(),
        seats: table.seats.toString(),
        is_active: table.is_active ?? true,
        available_hours: table.available_hours || [],
      });
    } else {
      setEditingTable(null);
      const nextNumber = tables.length > 0 ? Math.max(...tables.map(t => t.table_number)) + 1 : 1;
      setFormData({
        table_number: nextNumber.toString(),
        seats: "4",
        is_active: true,
        available_hours: [], // Empty - admin MUST select hours
      });
    }
    setIsDialogOpen(true);
  };

  const toggleFormHour = (hour: string) => {
    const newHours = formData.available_hours.includes(hour)
      ? formData.available_hours.filter(h => h !== hour)
      : [...formData.available_hours, hour].sort();
    setFormData({ ...formData, available_hours: newHours });
  };

  const selectAllHours = (type: 'lunch' | 'dinner' | 'all' | 'none') => {
    let hours: string[] = [];
    if (type === 'lunch') {
      hours = ALL_TIME_SLOTS.filter(h => parseInt(h) < 15);
    } else if (type === 'dinner') {
      hours = ALL_TIME_SLOTS.filter(h => parseInt(h) >= 18);
    } else if (type === 'all') {
      hours = [...ALL_TIME_SLOTS];
    }
    setFormData({ ...formData, available_hours: hours });
  };

  const handleSave = async () => {
    if (!formData.table_number || !formData.seats) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    if (formData.available_hours.length === 0) {
      toast.error("Seleziona almeno un orario disponibile per il tavolo");
      return;
    }

    const data = {
      table_number: parseInt(formData.table_number),
      seats: parseInt(formData.seats),
      is_active: formData.is_active,
      available_hours: formData.available_hours,
    };

    if (editingTable) {
      const { error } = await supabase
        .from("restaurant_tables")
        .update(data)
        .eq("id", editingTable.id);

      if (error) {
        toast.error("Errore: " + error.message);
        return;
      }
      toast.success("Tavolo aggiornato!");
    } else {
      const { error } = await supabase
        .from("restaurant_tables")
        .insert(data);

      if (error) {
        toast.error("Errore: " + error.message);
        return;
      }
      toast.success("Tavolo aggiunto!");
    }

    setIsDialogOpen(false);
    fetchTables();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo tavolo?")) return;

    const { error } = await supabase
      .from("restaurant_tables")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Errore: " + error.message);
      return;
    }

    toast.success("Tavolo eliminato!");
    fetchTables();
  };

  const toggleActive = async (table: RestaurantTableWithHours) => {
    const { error } = await supabase
      .from("restaurant_tables")
      .update({ is_active: !table.is_active })
      .eq("id", table.id);

    if (error) {
      toast.error("Errore: " + error.message);
      return;
    }

    toast.success(table.is_active ? "Tavolo disattivato" : "Tavolo attivato");
    fetchTables();
  };

  const toggleDay = (day: keyof ReservationSettings["days_available"]) => {
    setReservationSettings({
      ...reservationSettings,
      days_available: {
        ...reservationSettings.days_available,
        [day]: !reservationSettings.days_available[day],
      },
    });
  };

  const totalTables = tables.length;
  const activeTables = tables.filter(t => t.is_active).length;
  const totalSeats = tables.reduce((sum, t) => sum + (t.is_active ? t.seats : 0), 0);
  const tablesWithoutHours = tables.filter(t => !t.available_hours || t.available_hours.length === 0);

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestione Tavoli</h1>
          <p className="text-muted-foreground mt-1">
            {activeTables} tavoli attivi • {totalSeats} posti totali
          </p>
        </div>
      </div>

      {/* Warning if tables without hours */}
      {tablesWithoutHours.length > 0 && (
        <Card className="p-4 border-orange-500/50 bg-orange-500/10">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <div>
              <p className="font-medium text-orange-700">
                {tablesWithoutHours.length} tavol{tablesWithoutHours.length === 1 ? 'o' : 'i'} senza orari configurati
              </p>
              <p className="text-sm text-muted-foreground">
                I tavoli senza orari non saranno visibili ai clienti durante la prenotazione.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="tables" className="flex items-center gap-2">
            <Square className="w-4 h-4" />
            Tavoli
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Impostazioni
          </TabsTrigger>
        </TabsList>

        {/* Tables Tab */}
        <TabsContent value="tables" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => openDialog()}>
              <Plus className="w-4 h-4 mr-2" /> Aggiungi Tavolo
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-primary">{totalTables}</div>
              <div className="text-sm text-muted-foreground">Tavoli Totali</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{activeTables}</div>
              <div className="text-sm text-muted-foreground">Tavoli Attivi</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{totalSeats}</div>
              <div className="text-sm text-muted-foreground">Posti Disponibili</div>
            </Card>
          </div>

          {tables.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Square className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">Nessun tavolo configurato</p>
              <Button onClick={() => openDialog()}>
                <Plus className="w-4 h-4 mr-2" /> Aggiungi il primo tavolo
              </Button>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tables.map((table) => {
                const hasNoHours = !table.available_hours || table.available_hours.length === 0;
                
                return (
                  <motion.div
                    key={table.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card className={`p-4 transition-all ${!table.is_active ? 'opacity-60 grayscale' : 'hover:shadow-lg'} ${hasNoHours ? 'border-orange-500/50' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium
                          ${table.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                        >
                          {table.is_active ? 'Attivo' : 'Disattivo'}
                        </div>
                        <Switch
                          checked={table.is_active ?? true}
                          onCheckedChange={() => toggleActive(table)}
                        />
                      </div>

                      <TableVisual table={table} isActive={table.is_active ?? true} />

                      <div className="text-center mt-4">
                        <h3 className="font-bold text-lg">Tavolo {table.table_number}</h3>
                        <p className="text-muted-foreground flex items-center justify-center gap-1">
                          <Users className="w-4 h-4" /> {table.seats} posti
                        </p>
                      </div>

                      {/* Show available hours */}
                      <div className="mt-3">
                        {hasNoHours ? (
                          <div className="flex items-center justify-center gap-1 text-orange-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>Nessun orario</span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {(table.available_hours || []).slice(0, 4).map(hour => (
                              <Badge key={hour} variant="secondary" className="text-xs">
                                {hour}
                              </Badge>
                            ))}
                            {(table.available_hours || []).length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{(table.available_hours || []).length - 4}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openDialog(table)}>
                          <Pencil className="w-4 h-4 mr-1" /> Modifica
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(table.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Giorni Disponibili per Prenotazioni</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Seleziona i giorni in cui accetti prenotazioni.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(DAY_LABELS) as Array<keyof typeof DAY_LABELS>).map((day) => (
                <div
                  key={day}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    reservationSettings.days_available[day as keyof ReservationSettings["days_available"]]
                      ? 'bg-primary/10 border-primary'
                      : 'bg-muted/50'
                  }`}
                  onClick={() => toggleDay(day as keyof ReservationSettings["days_available"])}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={reservationSettings.days_available[day as keyof ReservationSettings["days_available"]]}
                      onChange={() => {}}
                    />
                    <span className="font-medium">{DAY_LABELS[day]}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Altre Impostazioni</h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2 block">Giorni prenotazione in anticipo</Label>
                <Select
                  value={reservationSettings.advance_booking_days.toString()}
                  onValueChange={(v) => setReservationSettings({ ...reservationSettings, advance_booking_days: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[7, 14, 21, 30, 60].map(days => (
                      <SelectItem key={days} value={days.toString()}>{days} giorni</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">Max prenotazioni per slot</Label>
                <Select
                  value={reservationSettings.max_reservations_per_slot.toString()}
                  onValueChange={(v) => setReservationSettings({ ...reservationSettings, max_reservations_per_slot: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 5, 10, 15, 20].map(max => (
                      <SelectItem key={max} value={max.toString()}>{max}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveReservationSettings} disabled={isSavingSettings}>
              {isSavingSettings ? "Salvataggio..." : "Salva Impostazioni"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Table Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTable ? "Modifica Tavolo" : "Nuovo Tavolo"}</DialogTitle>
            <DialogDescription>
              {editingTable 
                ? "Modifica le informazioni del tavolo e gli orari disponibili."
                : "Configura il nuovo tavolo con numero, posti e orari disponibili."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Numero Tavolo *</Label>
                <Input
                  type="number"
                  value={formData.table_number}
                  onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div>
                <Label className="mb-2 block">Numero Posti *</Label>
                <Select
                  value={formData.seats}
                  onValueChange={(v) => setFormData({ ...formData, seats: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 4, 6, 8, 10, 12].map(seats => (
                      <SelectItem key={seats} value={seats.toString()}>{seats} posti</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Available Hours - REQUIRED */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Orari Disponibili *
                </Label>
                <span className="text-sm text-muted-foreground">
                  {formData.available_hours.length} selezionati
                </span>
              </div>
              
              {/* Quick select buttons */}
              <div className="flex gap-2 mb-3">
                <Button type="button" variant="outline" size="sm" onClick={() => selectAllHours('lunch')}>
                  Pranzo
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => selectAllHours('dinner')}>
                  Cena
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => selectAllHours('all')}>
                  Tutti
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => selectAllHours('none')}>
                  Nessuno
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-2 p-3 bg-muted/50 rounded-lg">
                {ALL_TIME_SLOTS.map(hour => (
                  <div
                    key={hour}
                    className={`p-2 text-center rounded cursor-pointer transition-all text-sm font-medium ${
                      formData.available_hours.includes(hour)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background hover:bg-muted'
                    }`}
                    onClick={() => toggleFormHour(hour)}
                  >
                    {hour}
                  </div>
                ))}
              </div>
              
              {formData.available_hours.length === 0 && (
                <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Seleziona almeno un orario
                </p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <Label>Tavolo Attivo</Label>
                <p className="text-sm text-muted-foreground">
                  I tavoli disattivi non sono prenotabili
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave}>
              {editingTable ? "Salva Modifiche" : "Crea Tavolo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
