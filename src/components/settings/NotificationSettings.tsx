import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, Smartphone, AlertTriangle, Check, Loader2, ExternalLink } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const NotificationSettings = () => {
  const { user, isAdmin } = useAuth();
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    isiOS,
    isPWA,
    isInIframe,
    logs,
    subscribe,
    unsubscribe,
    sendTestNotification,
    clearLogs
  } = usePushNotifications();

  const [showLogs, setShowLogs] = useState(false);

  const handleToggleNotifications = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
        toast.success("Notifiche disattivate");
      } else {
        await subscribe();
        toast.success("Notifiche attivate!");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Errore gestione notifiche");
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      toast.success("Notifica di test inviata!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Errore invio notifica");
    }
  };

  if (!user) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <AlertTriangle className="w-5 h-5" />
          <p>Devi effettuare il login per gestire le notifiche.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Notifiche Push</h3>
          <p className="text-sm text-muted-foreground">
            {isAdmin 
              ? "Ricevi notifiche per ogni nuovo ordine" 
              : "Ricevi aggiornamenti sui tuoi ordini"}
          </p>
        </div>
      </div>

      {/* Status indicators */}
      <div className="space-y-3 text-sm">
        {isInIframe && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
            <ExternalLink className="w-4 h-4" />
            <span>Per attivare le notifiche, apri l'app in una nuova finestra</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(window.location.href, '_blank')}
            >
              Apri
            </Button>
          </div>
        )}

        {isiOS && !isPWA && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
            <Smartphone className="w-4 h-4" />
            <span>Su iOS, installa l'app come PWA per ricevere notifiche (Condividi → Aggiungi a Home)</span>
          </div>
        )}

        {!isSupported && !isInIframe && !isiOS && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
            <BellOff className="w-4 h-4" />
            <span>Le notifiche push non sono supportate su questo browser</span>
          </div>
        )}

        {permission === 'denied' && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span>Hai bloccato le notifiche. Modificalo nelle impostazioni del browser.</span>
          </div>
        )}
      </div>

      {/* Main toggle */}
      {isSupported && !isInIframe && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground" />
            )}
            <span className="font-medium">
              {isSubscribed ? "Notifiche attive" : "Notifiche disattivate"}
            </span>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggleNotifications}
            disabled={isLoading || permission === 'denied'}
          />
        </div>
      )}

      {/* Actions */}
      {isSubscribed && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestNotification}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Invia notifica di test
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLogs(!showLogs)}
          >
            {showLogs ? "Nascondi log" : "Mostra log"}
          </Button>
        </div>
      )}

      {/* Debug logs */}
      {showLogs && logs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Log</span>
            <Button variant="ghost" size="sm" onClick={clearLogs}>
              Pulisci
            </Button>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 max-h-40 overflow-y-auto">
            {logs.map((log, i) => (
              <p key={i} className="text-xs font-mono text-muted-foreground">
                {log}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-muted-foreground">
        {isAdmin 
          ? "Come admin, riceverai una notifica ogni volta che un cliente effettua un nuovo ordine."
          : "Riceverai notifiche quando lo stato del tuo ordine cambia (es. 'In preparazione', 'Pronto')."}
      </p>
    </Card>
  );
};
