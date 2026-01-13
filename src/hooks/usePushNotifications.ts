import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export function usePushNotifications() {
  const { user, isAdmin } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false); // Nuovo: indica quando il check iniziale è completato
  const [isiOS, setIsiOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<PushSubscription | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const hasCheckedRef = useRef(false);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), `[${timestamp}] ${message}`]);
  }, []);

  // Controlla la subscription esistente
  const checkSubscription = useCallback(async (): Promise<boolean> => {
    try {
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      const registration = await navigator.serviceWorker.getRegistration('/sw-push.js');
      if (!registration) {
        setIsSubscribed(false);
        setCurrentSubscription(null);
        return false;
      }

      const subscription = await registration.pushManager.getSubscription();
      const subscribed = !!subscription;
      setIsSubscribed(subscribed);
      setCurrentSubscription(subscription);
      return subscribed;
    } catch (error) {
      console.error('[Push] Error checking subscription:', error);
      setIsSubscribed(false);
      setCurrentSubscription(null);
      return false;
    }
  }, []);

  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const init = async () => {
      const inIframe = window.self !== window.top;
      setIsInIframe(inIframe);

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
      } else {
        setIsSupported(hasServiceWorker && hasPushManager && hasNotification);
      }

      if ('Notification' in window) {
        setPermission(Notification.permission);
      }

      // Check subscription e poi setta isReady
      await checkSubscription();
      setIsReady(true);

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'PUSH_RECEIVED') {
            addLog(`📨 Notifica ricevuta: ${event.data.payload.title}`);
          }
        });
      }
    };

    init();
  }, [addLog, checkSubscription]);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported');
    }

    setIsLoading(true);
    addLog('🔄 Avvio sottoscrizione...');

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      addLog(`📋 Permesso: ${perm}`);

      if (perm !== 'granted') {
        throw new Error('Permesso notifiche negato');
      }

      addLog('📝 Registrazione Service Worker...');
      const registration = await navigator.serviceWorker.register('/sw-push.js', {
        scope: '/'
      });

      addLog(`✅ Service Worker registrato`);

      await navigator.serviceWorker.ready;
      addLog('✅ Service Worker pronto');

      addLog('🔑 Recupero chiave VAPID...');
      const { data: vapidData, error: vapidError } = await supabase.functions.invoke('get-vapid-key');

      if (vapidError || !vapidData?.vapidPublicKey) {
        throw new Error('Impossibile recuperare la chiave VAPID');
      }

      addLog('✅ Chiave VAPID ottenuta');

      addLog('📲 Sottoscrizione push...');
      const applicationServerKey = urlBase64ToUint8Array(vapidData.vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer
      });

      addLog('✅ Sottoscrizione push creata');

      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');

      if (!p256dhKey || !authKey) {
        throw new Error('Failed to get subscription keys');
      }

      const p256dh = btoa(String.fromCharCode(...new Uint8Array(p256dhKey)));
      const auth = btoa(String.fromCharCode(...new Uint8Array(authKey)));

      addLog('💾 Salvataggio nel database...');
      
      // Salva nel database solo se c'è un utente loggato
      if (user) {
        // Delete any existing subscription for this user
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id);

        const { error } = await supabase
          .from('push_subscriptions')
          .insert({
            user_id: user.id,
            endpoint: subscription.endpoint,
            p256dh,
            auth,
            user_type: isAdmin ? 'admin' : 'customer',
            is_enabled: true
          });

        if (error) {
          console.error('[Push] Error storing subscription:', error);
          throw error;
        }

        // Update profile
        await supabase
          .from('profiles')
          .update({ notifications_enabled: true })
          .eq('user_id', user.id);
      }

      setIsSubscribed(true);
      setCurrentSubscription(subscription);
      addLog('🎉 Sottoscrizione completata con successo!');

    } catch (error) {
      console.error('[Push] Error subscribing:', error);
      addLog(`❌ Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user, isAdmin, addLog]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    addLog('🔄 Annullamento sottoscrizione...');

    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw-push.js');
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      if (user) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id);

        await supabase
          .from('profiles')
          .update({ notifications_enabled: false })
          .eq('user_id', user.id);
      }

      setIsSubscribed(false);
      setCurrentSubscription(null);
      addLog('✅ Sottoscrizione annullata');

    } catch (error) {
      console.error('[Push] Error unsubscribing:', error);
      addLog(`❌ Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, addLog]);

  // Versione silenziosa di unsubscribe (senza loading/logs)
  const silentUnsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw-push.js');
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      if (user) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id);

        await supabase
          .from('profiles')
          .update({ notifications_enabled: false })
          .eq('user_id', user.id);
      }

      setIsSubscribed(false);
      setCurrentSubscription(null);
    } catch (error) {
      console.error('[Push] Silent unsubscribe error:', error);
      // Non rilanciare l'errore - è silenzioso
    }
  }, [user]);

  const sendTestNotification = useCallback(async () => {
    if (!currentSubscription) {
      throw new Error('Non sei sottoscritto alle notifiche');
    }

    addLog(`📤 Invio notifica di test...`);

    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          endpoint: currentSubscription.endpoint,
          title: '🍕 Test Notifica',
          body: 'Le notifiche push funzionano correttamente!'
        }
      });

      if (error) {
        throw error;
      }

      addLog(`✅ Notifica inviata!`);
      return data;
    } catch (error) {
      console.error('[Push] Error sending notification:', error);
      addLog(`❌ Errore invio: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
      throw error;
    }
  }, [currentSubscription, addLog]);

  const clearLogs = () => setLogs([]);

  return {
    isSupported,
    isSubscribed,
    isReady, // Nuovo
    permission,
    isLoading,
    isiOS,
    isPWA,
    isInIframe,
    logs,
    subscribe,
    unsubscribe,
    silentUnsubscribe, // Nuovo
    sendTestNotification,
    clearLogs,
    checkSubscription // Esporta per refresh manuale
  };
}