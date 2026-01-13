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
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const {
    isSupported,
    isSubscribed,
    isReady,
    isLoading,
    isiOS,
    isPWA,
    isInIframe,
    subscribe,
    silentUnsubscribe,
  } = usePushNotifications();

  useEffect(() => {
    // Aspetta che l'hook sia pronto e non sia in un iframe
    if (!isReady || isInIframe) return;
    
    // Evita doppia esecuzione in StrictMode
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      console.log('[NotificationPrompt] Init - isSupported:', isSupported, 'isSubscribed:', isSubscribed);
      
      // Non mostrare se non supportato o iOS non-PWA
      if (!isSupported) {
        console.log('[NotificationPrompt] Not supported, skipping');
        return;
      }
      
      if (isiOS && !isPWA) {
        console.log('[NotificationPrompt] iOS non-PWA, skipping');
        return;
      }

      setIsProcessing(true);
      
      try {
        // Step 1: Disabilita notifiche silenziosamente se erano attive
        if (isSubscribed) {
          console.log('[NotificationPrompt] Unsubscribing existing subscription...');
          await silentUnsubscribe();
        }
      } catch (error) {
        console.error('[NotificationPrompt] Silent unsubscribe error:', error);
      }
      
      setIsProcessing(false);
      
      // Step 2: Mostra il popup dopo un piccolo delay per UX migliore
      setTimeout(() => {
        console.log('[NotificationPrompt] Showing dialog');
        setOpen(true);
      }, 800);
    };

    // Piccolo delay per assicurarsi che il componente sia montato
    const timeout = setTimeout(init, 300);
    return () => clearTimeout(timeout);
  }, [isReady, isSupported, isSubscribed, isiOS, isPWA, isInIframe, silentUnsubscribe]);

  const handleEnable = async () => {
    setIsProcessing(true);
    try {
      await subscribe();
      setOpen(false);
      toast({
        title: "Notifiche abilitate ✅",
        description: "Riceverai notifiche push anche quando l'app è chiusa.",
      });
    } catch (error) {
      console.error('[NotificationPrompt] Subscribe error:', error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile abilitare le notifiche",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = () => {
    setOpen(false);
  };

  // Non renderizzare nulla durante il processing iniziale o se in iframe
  if (isProcessing && !open) {
    return null;
  }

  const title = "🔔 Notifiche non abilitate";
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
            disabled={isProcessing || isLoading}
          >
            No, grazie
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleEnable}
            disabled={isProcessing || isLoading}
            className="w-full sm:w-auto"
          >
            {isProcessing || isLoading ? (
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