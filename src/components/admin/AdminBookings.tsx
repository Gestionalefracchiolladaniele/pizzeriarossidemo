import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { Calendar, Clock, Phone, User, Users } from "lucide-react";

type Reservation = Tables<"reservations">;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-green-500",
  cancelled: "bg-red-500",
  completed: "bg-gray-500",
};

const statusLabels: Record<string, string> = {
  pending: "In Attesa",
  confirmed: "Confermata",
  cancelled: "Annullata",
  completed: "Completata",
};

export const AdminBookings = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
    
    const channel = supabase
      .channel('reservations-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reservations' },
        () => fetchReservations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("reservation_date", { ascending: true });

    if (error) {
      toast.error("Errore nel caricamento prenotazioni");
      return;
    }

    setReservations(data || []);
    setIsLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error("Errore: " + error.message);
      return;
    }

    toast.success("Stato aggiornato!");
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestione Prenotazioni</h1>

      {reservations.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Nessuna prenotazione presente</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reservations.map((res) => (
            <Card key={res.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg">{res.guest_name}</h3>
                <Badge className={statusColors[res.status]}>
                  {statusLabels[res.status] || res.status}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {new Date(res.reservation_date).toLocaleDateString('it-IT', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {res.reservation_time}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  {res.guests_count} {res.guests_count === 1 ? 'persona' : 'persone'}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {res.guest_phone}
                </p>
              </div>

              {res.notes && (
                <p className="mt-3 text-sm italic text-muted-foreground border-t pt-3">
                  "{res.notes}"
                </p>
              )}

              <div className="mt-4">
                <Select 
                  value={res.status} 
                  onValueChange={(v) => updateStatus(res.id, v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">In Attesa</SelectItem>
                    <SelectItem value="confirmed">Confermata</SelectItem>
                    <SelectItem value="completed">Completata</SelectItem>
                    <SelectItem value="cancelled">Annullata</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
