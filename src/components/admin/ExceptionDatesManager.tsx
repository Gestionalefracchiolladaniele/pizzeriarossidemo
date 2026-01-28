import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar as CalendarIcon, Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StyledCalendar } from "@/components/ui/styled-calendar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExceptionDate {
  date: string; // YYYY-MM-DD
  type: "closed" | "lunch_only" | "dinner_only";
  reason?: string;
}

interface ExceptionDatesManagerProps {
  onUpdate?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  closed: "Chiuso",
  lunch_only: "Solo Pranzo",
  dinner_only: "Solo Cena",
};

const TYPE_COLORS: Record<string, string> = {
  closed: "bg-red-500",
  lunch_only: "bg-amber-500",
  dinner_only: "bg-blue-500",
};

export const ExceptionDatesManager = ({ onUpdate }: ExceptionDatesManagerProps) => {
  const [exceptions, setExceptions] = useState<ExceptionDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // New exception form
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [exceptionType, setExceptionType] = useState<"closed" | "lunch_only" | "dinner_only">("closed");
  const [reason, setReason] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    fetchExceptions();
  }, []);

  const fetchExceptions = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from("pizzeria_settings")
      .select("exception_dates")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching exceptions:", error);
      setIsLoading(false);
      return;
    }

    if (data?.exception_dates && Array.isArray(data.exception_dates)) {
      // Filter out past dates and sort by date
      const today = format(new Date(), "yyyy-MM-dd");
      const validExceptions = (data.exception_dates as unknown as ExceptionDate[])
        .filter(e => e.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date));
      setExceptions(validExceptions);
    }
    
    setIsLoading(false);
  };

  const saveExceptions = async (newExceptions: ExceptionDate[]) => {
    setIsSaving(true);
    
    // Get the settings id first
    const { data: settingsData } = await supabase
      .from("pizzeria_settings")
      .select("id")
      .limit(1)
      .single();

    if (!settingsData?.id) {
      toast.error("Errore: impostazioni non trovate");
      setIsSaving(false);
      return;
    }

    const { error } = await supabase
      .from("pizzeria_settings")
      .update({ exception_dates: newExceptions as any })
      .eq("id", settingsData.id);

    if (error) {
      toast.error("Errore nel salvataggio: " + error.message);
      setIsSaving(false);
      return;
    }

    toast.success("Eccezioni salvate!");
    setIsSaving(false);
    onUpdate?.();
  };

  const handleAddException = async () => {
    if (!selectedDate) {
      toast.error("Seleziona una data");
      return;
    }

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    
    // Check if date already exists
    if (exceptions.some(e => e.date === dateStr)) {
      toast.error("Questa data è già presente nelle eccezioni");
      return;
    }

    const newException: ExceptionDate = {
      date: dateStr,
      type: exceptionType,
      reason: reason.trim() || undefined,
    };

    const newExceptions = [...exceptions, newException].sort((a, b) => a.date.localeCompare(b.date));
    setExceptions(newExceptions);
    await saveExceptions(newExceptions);
    
    // Reset form
    setSelectedDate(undefined);
    setExceptionType("closed");
    setReason("");
    setIsPopoverOpen(false);
  };

  const handleRemoveException = async (dateToRemove: string) => {
    const newExceptions = exceptions.filter(e => e.date !== dateToRemove);
    setExceptions(newExceptions);
    await saveExceptions(newExceptions);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          Caricamento eccezioni...
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Giorni di Eccezione
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            Gestisci chiusure, ferie e orari speciali. Gli utenti non potranno prenotare/ordinare in queste date.
          </p>
        </div>
      </div>

      {/* Add new exception */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <h4 className="font-medium mb-4">Aggiungi Eccezione</h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date picker */}
          <div>
            <Label className="mb-2 block">Data</Label>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate 
                    ? format(selectedDate, "d MMMM yyyy", { locale: it }) 
                    : "Seleziona data"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <StyledCalendar
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setIsPopoverOpen(false);
                  }}
                  disabled={(date) => date < new Date()}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Exception type */}
          <div>
            <Label className="mb-2 block">Tipo</Label>
            <Select value={exceptionType} onValueChange={(v) => setExceptionType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="closed">Chiuso tutto il giorno</SelectItem>
                <SelectItem value="lunch_only">Solo Pranzo</SelectItem>
                <SelectItem value="dinner_only">Solo Cena</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div>
            <Label className="mb-2 block">Motivo (opzionale)</Label>
            <Input
              placeholder="Es: Ferie estive"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Add button */}
          <div className="flex items-end">
            <Button onClick={handleAddException} disabled={!selectedDate || isSaving} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi
            </Button>
          </div>
        </div>
      </div>

      {/* Exceptions list */}
      {exceptions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nessuna eccezione configurata</p>
          <p className="text-sm">Le prenotazioni e ordini sono sempre attivi negli orari standard.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {exceptions.map((exception) => (
            <div 
              key={exception.date} 
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[60px]">
                  <div className="text-2xl font-bold">
                    {format(parseISO(exception.date), "d")}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase">
                    {format(parseISO(exception.date), "MMM yyyy", { locale: it })}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {format(parseISO(exception.date), "EEEE", { locale: it })}
                    </span>
                    <Badge className={TYPE_COLORS[exception.type]}>
                      {TYPE_LABELS[exception.type]}
                    </Badge>
                  </div>
                  {exception.reason && (
                    <p className="text-sm text-muted-foreground">{exception.reason}</p>
                  )}
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleRemoveException(exception.date)}
                disabled={isSaving}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
