import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { Calendar, Clock, Phone, Users, History, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { HistoryCalendarDialog } from "@/components/HistoryCalendarDialog";
import { format, isAfter, startOfDay } from "date-fns";
import { it } from "date-fns/locale";

type Reservation = Tables<"reservations">;

const statusColors: Record<string, string> = {
  pending: "bg-amber-500",
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

const VISIBLE_RESERVATIONS_COUNT = 6;

export const AdminBookings = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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

  // Upcoming reservations (today or future, not cancelled/completed)
  const upcomingReservations = useMemo(() => {
    const today = startOfDay(new Date());
    return reservations.filter(r => {
      const resDate = new Date(r.reservation_date);
      return (isAfter(resDate, today) || format(resDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) 
        && !['cancelled', 'completed'].includes(r.status);
    });
  }, [reservations]);

  // Past/completed reservations (for history)
  const pastReservations = useMemo(() => {
    const today = startOfDay(new Date());
    return reservations.filter(r => {
      const resDate = new Date(r.reservation_date);
      return !isAfter(resDate, today) || ['cancelled', 'completed'].includes(r.status);
    });
  }, [reservations]);

  // History items for calendar
  const historyItems = useMemo(() => 
    pastReservations.map(res => ({
      id: res.id,
      type: 'reservation' as const,
      date: new Date(res.created_at),
      status: res.status,
      details: res,
    })),
    [pastReservations]
  );

  // Visible reservations based on showAll state
  const visibleReservations = showAll 
    ? upcomingReservations 
    : upcomingReservations.slice(0, VISIBLE_RESERVATIONS_COUNT);

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Caricamento...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Gestione Prenotazioni</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {upcomingReservations.length} prenotazioni in arrivo • {pastReservations.length} passate
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(true)}>
          <History className="w-3.5 h-3.5 mr-1.5" />
          Storico
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <div className="text-xl font-bold text-amber-500">
            {reservations.filter(r => r.status === 'pending').length}
          </div>
          <div className="text-xs text-muted-foreground">In Attesa</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xl font-bold text-green-500">
            {reservations.filter(r => r.status === 'confirmed').length}
          </div>
          <div className="text-xs text-muted-foreground">Confermate</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xl font-bold text-primary">
            {upcomingReservations.reduce((sum, r) => sum + r.guests_count, 0)}
          </div>
          <div className="text-xs text-muted-foreground">Ospiti Attesi</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xl font-bold text-muted-foreground">
            {reservations.filter(r => r.status === 'completed').length}
          </div>
          <div className="text-xs text-muted-foreground">Completate</div>
        </Card>
      </div>

      {upcomingReservations.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-sm">Nessuna prenotazione in arrivo</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {visibleReservations.map((res) => (
              <Card key={res.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-sm">{res.guest_name}</h3>
                  <Badge className={statusColors[res.status]}>
                    {statusLabels[res.status] || res.status}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {format(new Date(res.reservation_date), "EEEE d MMMM", { locale: it })}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    {res.reservation_time.slice(0, 5)}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    {res.guests_count} {res.guests_count === 1 ? 'persona' : 'persone'}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    {res.guest_phone}
                  </p>
                </div>

                {res.notes && (
                  <p className="mt-2 text-xs italic text-muted-foreground border-t pt-2">
                    "{res.notes}"
                  </p>
                )}

                <div className="mt-3">
                  <Select 
                    value={res.status} 
                    onValueChange={(v) => updateStatus(res.id, v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
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

          {/* Show More/Less Button */}
          {upcomingReservations.length > VISIBLE_RESERVATIONS_COUNT && (
            <div className="flex justify-center">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="gap-1.5 h-8 text-xs"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    Mostra meno
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    Mostra altre {upcomingReservations.length - VISIBLE_RESERVATIONS_COUNT} prenotazioni
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* History Calendar Dialog */}
      <HistoryCalendarDialog
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={historyItems}
        title="Storico Prenotazioni"
      />
    </div>
  );
};
