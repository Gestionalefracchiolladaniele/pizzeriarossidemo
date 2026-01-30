import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StyledCalendar } from "@/components/ui/styled-calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { Package, Calendar, Clock, ArrowLeft, MapPin, Phone, Mail, User, UtensilsCrossed, Copy } from "lucide-react";
import { toast } from "sonner";

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
  out_for_delivery: "bg-cyan-500",
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
  out_for_delivery: "In Consegna",
  delivered: "Consegnato",
  cancelled: "Annullato",
  pending: "In Attesa",
  confirmed: "Confermata",
  completed: "Completata",
};

const deliveryTypeLabels: Record<string, string> = {
  takeaway: "Ritiro",
  delivery: "Consegna a Domicilio",
  dine_in: "Al Tavolo",
};

export const HistoryCalendarDialog = ({
  isOpen,
  onClose,
  items,
  title = "Storico",
}: HistoryCalendarDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

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
    setExpandedItemId(null);
  };

  const handleBack = () => {
    if (expandedItemId) {
      setExpandedItemId(null);
    } else {
      setSelectedDate(undefined);
    }
  };

  const toggleExpandItem = (itemId: string) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiato negli appunti!");
  };

  const renderOrderDetails = (order: any) => (
    <div className="space-y-4 mt-4 p-4 bg-muted/50 rounded-lg">
      {/* Customer Info */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Dati Cliente</h4>
        <div className="grid gap-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-primary" />
            <span>{order.customer_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-primary" />
            <span>{order.customer_phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-primary" />
            <span>{order.customer_email}</span>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Consegna</h4>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{deliveryTypeLabels[order.delivery_type] || order.delivery_type}</Badge>
          {order.delivery_address && (
            <div className="flex items-center gap-1 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="truncate max-w-[200px]">{order.delivery_address}</span>
            </div>
          )}
          {order.pickup_time && (
            <div className="flex items-center gap-1 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span>Ritiro: {order.pickup_time}</span>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Prodotti Ordinati</h4>
        <div className="space-y-2">
          {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">
                  x{item.quantity}
                </span>
                <span className="font-medium">{item.name}</span>
              </div>
              <span className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="space-y-1 pt-2 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotale</span>
          <span>€{order.subtotal?.toFixed(2)}</span>
        </div>
        {order.delivery_fee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Consegna</span>
            <span>€{order.delivery_fee?.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg pt-1">
          <span>Totale</span>
          <span className="text-primary">€{order.total?.toFixed(2)}</span>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="space-y-1 pt-2 border-t border-border">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Note</h4>
          <p className="text-sm">{order.notes}</p>
        </div>
      )}

      {/* Confirmation Code */}
      {order.confirmation_code && (
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
          <div>
            <span className="text-xs text-muted-foreground">Codice Conferma</span>
            <p className="font-mono font-bold">{order.confirmation_code}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(order.confirmation_code)}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );

  const renderReservationDetails = (reservation: any) => (
    <div className="space-y-4 mt-4 p-4 bg-muted/50 rounded-lg">
      {/* Guest Info */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Dati Ospite</h4>
        <div className="grid gap-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-primary" />
            <span>{reservation.guest_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-primary" />
            <span>{reservation.guest_phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-primary" />
            <span>{reservation.guest_email}</span>
          </div>
        </div>
      </div>

      {/* Reservation Details */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Dettagli Prenotazione</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background p-3 rounded-lg">
            <span className="text-xs text-muted-foreground">Data</span>
            <p className="font-semibold">
              {format(new Date(reservation.reservation_date), "EEEE d MMMM yyyy", { locale: it })}
            </p>
          </div>
          <div className="bg-background p-3 rounded-lg">
            <span className="text-xs text-muted-foreground">Ora</span>
            <p className="font-semibold">{reservation.reservation_time?.slice(0, 5)}</p>
          </div>
          <div className="bg-background p-3 rounded-lg">
            <span className="text-xs text-muted-foreground">Numero Ospiti</span>
            <p className="font-semibold flex items-center gap-1">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
              {reservation.guests_count} {reservation.guests_count === 1 ? 'persona' : 'persone'}
            </p>
          </div>
          {reservation.table_id && (
            <div className="bg-background p-3 rounded-lg">
              <span className="text-xs text-muted-foreground">Tavolo</span>
              <p className="font-semibold">Tavolo assegnato</p>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {reservation.notes && (
        <div className="space-y-1 pt-2 border-t border-border">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Note</h4>
          <p className="text-sm">{reservation.notes}</p>
        </div>
      )}

      {/* Confirmation Code */}
      {reservation.confirmation_code && (
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
          <div>
            <span className="text-xs text-muted-foreground">Codice Conferma</span>
            <p className="font-mono font-bold">{reservation.confirmation_code}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(reservation.confirmation_code)}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {(selectedDate || expandedItemId) && (
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
                  <Card 
                    key={`${item.type}-${item.id}`} 
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${expandedItemId === item.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => toggleExpandItem(item.id)}
                  >
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

                        {item.type === 'order' && !expandedItemId && (
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

                        {item.type === 'reservation' && !expandedItemId && (
                          <p className="text-sm mt-1">
                            Ore {item.details.reservation_time?.slice(0, 5)} • {item.details.guests_count} {item.details.guests_count === 1 ? 'persona' : 'persone'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedItemId === item.id && (
                      item.type === 'order' 
                        ? renderOrderDetails(item.details)
                        : renderReservationDetails(item.details)
                    )}
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
