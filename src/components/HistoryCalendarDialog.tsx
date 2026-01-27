import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StyledCalendar } from "@/components/ui/styled-calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { Package, Calendar, Clock, ArrowLeft, X } from "lucide-react";

interface HistoryItem {
  id: string;
  type: 'order' | 'reservation';
  date: Date;
  status: string;
  details: any;
}

interface HistoryCalendarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  title?: string;
}

const statusColors: Record<string, string> = {
  received: "bg-blue-500",
  read: "bg-purple-500",
  preparing: "bg-orange-500",
  done: "bg-green-500",
  delivered: "bg-gray-500",
  cancelled: "bg-red-500",
  pending: "bg-yellow-500",
  confirmed: "bg-green-500",
  completed: "bg-gray-500",
};

const statusLabels: Record<string, string> = {
  received: "Ricevuto",
  read: "Letto",
  preparing: "In Preparazione",
  done: "Fatto",
  delivered: "Consegnato",
  cancelled: "Annullato",
  pending: "In Attesa",
  confirmed: "Confermata",
  completed: "Completata",
};

export const HistoryCalendarDialog = ({
  isOpen,
  onClose,
  items,
  title = "Storico",
}: HistoryCalendarDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Get dates that have items
  const datesWithItems = useMemo(() => {
    const dates: Date[] = [];
    const seen = new Set<string>();
    
    items.forEach(item => {
      const dateStr = item.date.toISOString().split('T')[0];
      if (!seen.has(dateStr)) {
        seen.add(dateStr);
        dates.push(new Date(dateStr));
      }
    });
    
    return dates;
  }, [items]);

  // Filter items for selected date
  const itemsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return items.filter(item => isSameDay(item.date, selectedDate));
  }, [items, selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleBack = () => {
    setSelectedDate(undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {selectedDate && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <DialogTitle className="text-xl">
                {selectedDate 
                  ? format(selectedDate, "EEEE d MMMM yyyy", { locale: it })
                  : title
                }
              </DialogTitle>
              <DialogDescription>
                {selectedDate 
                  ? `${itemsForSelectedDate.length} elementi trovati`
                  : "Seleziona una data per vedere i dettagli"
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!selectedDate ? (
          // Calendar View
          <div className="flex justify-center">
            <StyledCalendar
              selected={selectedDate}
              onSelect={handleDateSelect}
              highlightedDates={datesWithItems}
              disabled={(date) => {
                const dateStr = date.toISOString().split('T')[0];
                return !datesWithItems.some(d => d.toISOString().split('T')[0] === dateStr);
              }}
            />
          </div>
        ) : (
          // Items List View
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {itemsForSelectedDate.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Nessun elemento per questa data</p>
                </Card>
              ) : (
                itemsForSelectedDate.map((item) => (
                  <Card key={`${item.type}-${item.id}`} className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        item.type === 'order' ? 'bg-primary/10' : 'bg-secondary'
                      }`}>
                        {item.type === 'order' ? (
                          <Package className="w-5 h-5 text-primary" />
                        ) : (
                          <Calendar className="w-5 h-5 text-secondary-foreground" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold">
                            {item.type === 'order' 
                              ? `Ordine #${item.details.order_number}`
                              : `Prenotazione`
                            }
                          </span>
                          <Badge className={statusColors[item.status] || "bg-gray-500"}>
                            {statusLabels[item.status] || item.status}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {format(item.date, "HH:mm", { locale: it })}
                        </div>

                        {item.type === 'order' && (
                          <>
                            <p className="text-sm mt-1 truncate">
                              {Array.isArray(item.details.items) &&
                                item.details.items.slice(0, 2).map((i: any, idx: number) => (
                                  <span key={idx}>
                                    {i.quantity}x {i.name}
                                    {idx < Math.min(item.details.items.length, 2) - 1 ? ", " : ""}
                                  </span>
                                ))
                              }
                              {Array.isArray(item.details.items) && item.details.items.length > 2 && "..."}
                            </p>
                            <p className="text-lg font-bold text-primary mt-1">
                              €{item.details.total?.toFixed(2)}
                            </p>
                          </>
                        )}

                        {item.type === 'reservation' && (
                          <p className="text-sm mt-1">
                            Ore {item.details.reservation_time?.slice(0, 5)} • {item.details.guests_count} {item.details.guests_count === 1 ? 'persona' : 'persone'}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
