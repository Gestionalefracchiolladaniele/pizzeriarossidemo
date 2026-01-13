import { useState, useRef, useEffect, useCallback } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface NotificationPromptDialogProps {
  userType: 'admin' | 'customer';
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const NotificationPromptDialog = ({ userType }: NotificationPromptDialogProps) => {
  const hasInitialized = useRef(false);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isiOS, setIsiOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  // Check support on mount
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream: unknown }).MSStream;
    setIsiOS(isIOSDevice);

    const isPWAMode = window.matchMedia('(display-mode: standalone)').matches || 
                      (navigator as unknown as { standalone: boolean }).standalone === true;
    setIsPWA(isPWAMode);

    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasPushManager = 'PushManager' in window;
    const hasNotification = 'Notification' in window;

    if (isIOSDevice && !isPWAMode) {
      setIsSupported(false);
      return;
    }

    setIsSupported(hasServiceWorker && hasPushManager && hasNotification);
  }, []);

  // Silent unsubscribe function - doesn't require user state
  const silentUnsubscribe = useCallback(async () => {
    console.log('[NotificationPrompt] Silent unsubscribe starting...');
    
    try {
      // Step 1: Unsubscribe from push manager
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration('/sw-push.js');
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            await subscription.unsubscribe();
            console.log('[NotificationPrompt] Push subscription removed');
          }
        }
      }

      // Step 2: Delete from database if user is logged in
      if (user) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id);

        await supabase
          .from('profiles')
          .update({ notifications_enabled: false })
          .eq('user_id', user.id);
        
        console.log('[NotificationPrompt] Database records cleaned');
      }
    } catch (error) {
      console.log('[NotificationPrompt] Silent unsubscribe error (ignored):', error);
    }
  }, [user]);

  // Subscribe function
  const handleSubscribe = useCallback(async () => {
    if (!user) {
      throw new Error('Utente non autenticato');
    }

    console.log('[NotificationPrompt] Starting subscription...');

    // Step 1: Request permission
    const perm = await Notification.requestPermission();
    console.log('[NotificationPrompt] Permission:', perm);

    if (perm !== 'granted') {
      throw new Error('Permesso notifiche negato. Controlla le impostazioni del browser.');
    }

    // Step 2: Register service worker
    console.log('[NotificationPrompt] Registering service worker...');
    const registration = await navigator.serviceWorker.register('/sw-push.js', {
      scope: '/'
    });

    // Step 3: Wait for ready
    await navigator.serviceWorker.ready;
    console.log('[NotificationPrompt] Service worker ready');

    // Step 4: Get VAPID key
    console.log('[NotificationPrompt] Fetching VAPID key...');
    const { data: vapidData, error: vapidError } = await supabase.functions.invoke('get-vapid-key');

    if (vapidError || !vapidData?.vapidPublicKey) {
      console.error('[NotificationPrompt] VAPID error:', vapidError);
      throw new Error('Impossibile recuperare la chiave VAPID dal server');
    }

    // Step 5: Subscribe to push
    console.log('[NotificationPrompt] Creating push subscription...');
    const applicationServerKey = urlBase64ToUint8Array(vapidData.vapidPublicKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey.buffer as ArrayBuffer
    });

    // Step 6: Extract keys
    const p256dhKey = subscription.getKey('p256dh');
    const authKey = subscription.getKey('auth');

    if (!p256dhKey || !authKey) {
      throw new Error('Impossibile ottenere le chiavi di sottoscrizione');
    }

    const p256dh = btoa(String.fromCharCode(...new Uint8Array(p256dhKey)));
    const auth = btoa(String.fromCharCode(...new Uint8Array(authKey)));

    // Step 7: Save to database (delete existing first)
    console.log('[NotificationPrompt] Saving to database...');
    
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id);

    const { error: insertError } = await supabase
      .from('push_subscriptions')
      .insert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh,
        auth,
        user_type: isAdmin ? 'admin' : 'customer',
        is_enabled: true
      });

    if (insertError) {
      console.error('[NotificationPrompt] Insert error:', insertError);
      throw new Error('Impossibile salvare la sottoscrizione nel database');
    }

    // Step 8: Update profile
    await supabase
      .from('profiles')
      .update({ notifications_enabled: true })
      .eq('user_id', user.id);

    console.log('[NotificationPrompt] Subscription complete!');
  }, [user, isAdmin]);

  // Initialize on mount - unsubscribe then show dialog
  useEffect(() => {
    if (hasInitialized.current) return;
    if (!isSupported) return;
    if (!user) return;
    
    hasInitialized.current = true;

    const init = async () => {
      // Step 1: Always unsubscribe first (silent)
      await silentUnsubscribe();
      
      // Step 2: Show dialog after a short delay
      setTimeout(() => {
        setOpen(true);
      }, 500);
    };

    // Small delay to ensure everything is loaded
    const timeout = setTimeout(init, 300);
    return () => clearTimeout(timeout);
  }, [isSupported, user, silentUnsubscribe]);

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      await handleSubscribe();
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setOpen(false);
  };

  // Non mostrare su iOS non-PWA
  if (isiOS && !isPWA) {
    return null;
  }

  // Non mostrare se non supportato
  if (!isSupported) {
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
