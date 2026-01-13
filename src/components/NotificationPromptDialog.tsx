import { useState, useRef, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useToast } from "@/hooks/use-toast";

interface NotificationPromptDialogProps {
  userType: 'admin' | 'customer';
}

export const NotificationPromptDialog = ({ userType }: NotificationPromptDialogProps) => {
  const hasInitialized = useRef(false);
  const [open, setOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();
  
  const {
    isSupported,
    isSubscribed,
    isLoading,
    isiOS,
    isPWA,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      setIsInitializing(true);
      
      try {
        // Step 1: Disabilita notifiche silenziosamente se attive
        if (isSubscribed) {
          await unsubscribe();
        }
      } catch (error) {
        console.log('[NotificationPrompt] Silent unsubscribe error:', error);
      }
      
      setIsInitializing(false);
      
      // Step 2: Mostra sempre il popup (dopo un piccolo delay per UX)
      setTimeout(() => {
        setOpen(true);
      }, 500);
    };

    // Attendi un momento per assicurarsi che lo stato sia caricato
    const timeout = setTimeout(init, 300);
    return () => clearTimeout(timeout);
  }, []);

  const handleEnable = async () => {
    try {
      await subscribe();
      setOpen(false);
      toast({
        title: "Notifiche abilitate",
        description: "Riceverai notifiche push anche quando l'app è chiusa.",
      });
    } catch (error) {
      console.error('[NotificationPrompt] Subscribe error:', error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile abilitare le notifiche",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = () => {
    setOpen(false);
  };

  // Non mostrare su iOS non-PWA
  if (isiOS && !isPWA) {
    return null;
  }

  // Non mostrare se non supportato o sta caricando
  if (!isSupported || isInitializing) {
    return null;
  }

  const title = "Notifiche non abilitate";
  const description = userType === 'admin'
    ? "Vuoi abilitare le notifiche push? Riceverai una notifica ogni volta che arriva un nuovo ordine, anche quando l'app è chiusa."
    : "Vuoi abilitare le notifiche push? Riceverai aggiornamenti sullo stato dei tuoi ordini, anche quando l'app è chiusa.";

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <BellOff className="w-8 h-8 text-primary" />
          </div>
          <AlertDialogTitle className="text-center text-xl">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={handleDismiss}
            className="w-full sm:w-auto"
          >
            No
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleEnable}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Abilitazione...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Sì, abilita
              </span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
