import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Upload, Save, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type MenuItem = Tables<"menu_items">;
type MenuCategory = Tables<"menu_categories">;

export const AdminMenu = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image_url: "",
    is_available: true,
    is_popular: false,
    tags: [] as string[],
    prep_time_minutes: "10",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    
    const [itemsRes, categoriesRes] = await Promise.all([
      supabase.from("menu_items").select("*").order("sort_order"),
      supabase.from("menu_categories").select("*").order("sort_order"),
    ]);

    if (itemsRes.data) setItems(itemsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    
    setIsLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `menu/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("pizzeria-images")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Errore durante l'upload: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("pizzeria-images")
      .getPublicUrl(filePath);

    setFormData({ ...formData, image_url: publicUrl });
    setUploading(false);
    toast.success("Immagine caricata!");
  };

  const openDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || "",
        price: item.price.toString(),
        category_id: item.category_id,
        image_url: item.image_url || "",
        is_available: item.is_available ?? true,
        is_popular: item.is_popular ?? false,
        tags: item.tags || [],
        prep_time_minutes: ((item as any).prep_time_minutes || 10).toString(),
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        category_id: categories[0]?.id || "",
        image_url: "",
        is_available: true,
        is_popular: false,
        tags: [],
        prep_time_minutes: "10",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category_id) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    const data = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      category_id: formData.category_id,
      image_url: formData.image_url || null,
      is_available: formData.is_available,
      is_popular: formData.is_popular,
      tags: formData.tags.length > 0 ? formData.tags : null,
      prep_time_minutes: parseInt(formData.prep_time_minutes) || 10,
    };

    if (editingItem) {
      const { error } = await supabase
        .from("menu_items")
        .update(data)
        .eq("id", editingItem.id);

      if (error) {
        toast.error("Errore: " + error.message);
        return;
      }
      toast.success("Prodotto aggiornato!");
    } else {
      const { error } = await supabase
        .from("menu_items")
        .insert(data);

      if (error) {
        toast.error("Errore: " + error.message);
        return;
      }
      toast.success("Prodotto aggiunto!");
    }

    setIsDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo prodotto?")) return;

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Errore: " + error.message);
      return;
    }

    toast.success("Prodotto eliminato!");
    fetchData();
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestione Menu</h1>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" /> Aggiungi Prodotto
        </Button>
      </div>

      {categories.map((category) => (
        <div key={category.id} className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {category.icon && <span>{category.icon}</span>}
            {category.name}
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.filter(item => item.category_id === category.id).map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    <p className="text-primary font-bold mt-1">€{item.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => openDialog(item)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Modifica Prodotto" : "Nuovo Prodotto"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nome *</label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome del prodotto"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Descrizione</label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrizione del prodotto"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Prezzo *</label>
                <Input 
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Categoria *</label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Tempo Preparazione (minuti)</label>
              <Input 
                type="number"
                min="1"
                max="120"
                value={formData.prep_time_minutes}
                onChange={(e) => setFormData({ ...formData, prep_time_minutes: e.target.value })}
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tempo necessario per preparare questo piatto
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Immagine</label>
              <div className="flex gap-4 items-center">
                {formData.image_url && (
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <label className="flex-1">
                  <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {uploading ? "Caricamento..." : "Carica immagine"}
                    </span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Disponibile</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.is_popular}
                  onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Popolare</span>
              </label>
            </div>

            <div className="flex gap-2 justify-end">
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
