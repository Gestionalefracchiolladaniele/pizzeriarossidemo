import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ALL_TIME_SLOTS = [
  "12:00", "12:30", "13:00", "13:30", "14:00",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00"
];

interface BulkTableCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  startingTableNumber: number;
}

export const BulkTableCreateDialog = ({ 
  isOpen, 
  onOpenChange, 
  onCreated,
  startingTableNumber 
}: BulkTableCreateDialogProps) => {
  const [count, setCount] = useState(5);
  const [seats, setSeats] = useState(4);
  const [startNumber, setStartNumber] = useState(startingTableNumber);
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const toggleHour = (hour: string) => {
    setSelectedHours(prev => 
      prev.includes(hour) 
        ? prev.filter(h => h !== hour)
        : [...prev, hour].sort()
    );
  };

  const selectAllHours = (type: 'lunch' | 'dinner' | 'all' | 'none') => {
    if (type === 'none') {
      setSelectedHours([]);
    } else if (type === 'lunch') {
      setSelectedHours(ALL_TIME_SLOTS.filter(h => parseInt(h) < 15));
    } else if (type === 'dinner') {
      setSelectedHours(ALL_TIME_SLOTS.filter(h => parseInt(h) >= 18));
    } else {
      setSelectedHours([...ALL_TIME_SLOTS]);
    }
  };

  const handleCreate = async () => {
    if (count < 1 || count > 20) {
      toast.error("Puoi creare da 1 a 20 tavoli alla volta");
      return;
    }
    if (seats < 1 || seats > 20) {
      toast.error("I posti devono essere tra 1 e 20");
      return;
    }
    if (selectedHours.length === 0) {
      toast.error("Seleziona almeno un orario disponibile");
      return;
    }

    setIsCreating(true);

    const tablesToCreate = Array.from({ length: count }, (_, i) => ({
      table_number: startNumber + i,
      seats,
      is_active: true,
      available_hours: selectedHours,
    }));

    const { error } = await supabase
      .from("restaurant_tables")
      .insert(tablesToCreate);

    if (error) {
      toast.error("Errore nella creazione: " + error.message);
      setIsCreating(false);
      return;
    }

    toast.success(`${count} tavoli creati con successo!`);
    onCreated();
    onOpenChange(false);
    
    // Reset form
    setCount(5);
    setSeats(4);
    setSelectedHours([]);
    setIsCreating(false);
  };

  // Update starting number when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setStartNumber(startingTableNumber);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crea Tavoli in Blocco</DialogTitle>
          <DialogDescription>
            Crea più tavoli con le stesse caratteristiche in una sola operazione.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Number of tables */}
          <div>
            <Label className="mb-2 block">Quanti tavoli creare?</Label>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCount(Math.max(1, count - 1))}
                disabled={count <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={count}
                onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 text-center"
                min={1}
                max={20}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCount(Math.min(20, count + 1))}
                disabled={count >= 20}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Seats per table */}
          <div>
            <Label className="mb-2 block">Posti per tavolo</Label>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setSeats(Math.max(1, seats - 1))}
                disabled={seats <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={seats}
                onChange={(e) => setSeats(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 text-center"
                min={1}
                max={20}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setSeats(Math.min(20, seats + 1))}
                disabled={seats >= 20}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Starting table number */}
          <div>
            <Label className="mb-2 block">Numero tavolo iniziale</Label>
            <Input
              type="number"
              value={startNumber}
              onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
            />
            <p className="text-xs text-muted-foreground mt-1">
              I tavoli saranno numerati da {startNumber} a {startNumber + count - 1}
            </p>
          </div>

          {/* Available hours */}
          <div>
            <Label className="mb-2 block">Orari disponibili *</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              <Button variant="outline" size="sm" onClick={() => selectAllHours('lunch')}>
                Pranzo
              </Button>
              <Button variant="outline" size="sm" onClick={() => selectAllHours('dinner')}>
                Cena
              </Button>
              <Button variant="outline" size="sm" onClick={() => selectAllHours('all')}>
                Tutto il giorno
              </Button>
              <Button variant="ghost" size="sm" onClick={() => selectAllHours('none')}>
                Deseleziona
              </Button>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {ALL_TIME_SLOTS.map(hour => (
                <div
                  key={hour}
                  className={`p-2 rounded border text-center cursor-pointer transition-all text-sm ${
                    selectedHours.includes(hour)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                  onClick={() => toggleHour(hour)}
                >
                  {hour}
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Anteprima</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              {Array.from({ length: Math.min(count, 5) }, (_, i) => (
                <div key={i}>Tavolo {startNumber + i} ({seats} posti)</div>
              ))}
              {count > 5 && <div className="text-primary font-medium">... e altri {count - 5} tavoli</div>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleCreate}
              disabled={isCreating || selectedHours.length === 0}
            >
              {isCreating ? "Creazione..." : `Crea ${count} Tavoli`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
