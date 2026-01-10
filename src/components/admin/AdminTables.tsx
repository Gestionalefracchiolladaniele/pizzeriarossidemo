import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Save, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type RestaurantTable = Tables<"restaurant_tables">;

export const AdminTables = () => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);

  const [formData, setFormData] = useState({
    table_number: "",
    seats: "",
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
      setFormData({
        table_number: "",
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

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestione Tavoli</h1>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" /> Aggiungi Tavolo
        </Button>
      </div>

      {tables.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Nessun tavolo configurato</p>
          <Button className="mt-4" onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" /> Aggiungi il primo tavolo
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className={`p-4 ${!table.is_active ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">{table.table_number}</span>
                  </div>
                  <Switch
                    checked={table.is_active ?? true}
                    onCheckedChange={() => toggleActive(table)}
                  />
                </div>

                <h3 className="font-bold text-lg mb-1">Tavolo {table.table_number}</h3>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Users className="w-4 h-4" /> {table.seats} posti
                </p>

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
              <Input
                type="number"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                placeholder="4"
              />
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
