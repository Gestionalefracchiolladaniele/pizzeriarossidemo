import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Save, X, Users, Circle, Square, Hexagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type RestaurantTable = Tables<"restaurant_tables">;

// Table shape icons based on seats
const getTableShape = (seats: number) => {
  if (seats <= 2) return { icon: Circle, shape: "round-small" };
  if (seats <= 4) return { icon: Square, shape: "square" };
  if (seats <= 6) return { icon: Hexagon, shape: "round-large" };
  return { icon: Hexagon, shape: "rectangular" };
};

// Visual table representation component
const TableVisual = ({ table, isActive }: { table: RestaurantTable; isActive: boolean }) => {
  const seats = table.seats;
  const tableNumber = table.table_number;
  
  // Generate seat positions based on table type
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
      // 8+ seats
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
      {/* Table surface */}
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
      
      {/* Seats */}
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
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);

  const [formData, setFormData] = useState({
    table_number: "",
    seats: "4",
    is_active: true,
  });

  useEffect(() => {
    fetchTables();
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

    setTables(data || []);
    setIsLoading(false);
  };

  const openDialog = (table?: RestaurantTable) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        table_number: table.table_number.toString(),
        seats: table.seats.toString(),
        is_active: table.is_active ?? true,
      });
    } else {
      setEditingTable(null);
      const nextNumber = tables.length > 0 ? Math.max(...tables.map(t => t.table_number)) + 1 : 1;
      setFormData({
        table_number: nextNumber.toString(),
        seats: "4",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.table_number || !formData.seats) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    const data = {
      table_number: parseInt(formData.table_number),
      seats: parseInt(formData.seats),
      is_active: formData.is_active,
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

  const toggleActive = async (table: RestaurantTable) => {
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

  // Statistics
  const totalTables = tables.length;
  const activeTables = tables.filter(t => t.is_active).length;
  const totalSeats = tables.reduce((sum, t) => sum + (t.is_active ? t.seats : 0), 0);

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
          {tables.map((table) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className={`p-4 transition-all ${!table.is_active ? 'opacity-60 grayscale' : 'hover:shadow-lg'}`}>
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
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTable ? "Modifica Tavolo" : "Nuovo Tavolo"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview */}
            <div className="bg-muted/50 rounded-lg p-4">
              <TableVisual 
                table={{ 
                  id: "preview", 
                  table_number: parseInt(formData.table_number) || 1, 
                  seats: parseInt(formData.seats) || 4,
                  is_active: formData.is_active,
                  created_at: "",
                  updated_at: ""
                }} 
                isActive={formData.is_active} 
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Numero Tavolo *</label>
              <Input
                type="number"
                value={formData.table_number}
                onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                placeholder="1"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Numero Posti *</label>
              <Select 
                value={formData.seats} 
                onValueChange={(v) => setFormData({ ...formData, seats: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 posti (piccolo)</SelectItem>
                  <SelectItem value="4">4 posti (standard)</SelectItem>
                  <SelectItem value="6">6 posti (grande)</SelectItem>
                  <SelectItem value="8">8 posti (extra large)</SelectItem>
                  <SelectItem value="10">10 posti (tavolo lungo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Attivo</label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" /> Annulla
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" /> Salva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
