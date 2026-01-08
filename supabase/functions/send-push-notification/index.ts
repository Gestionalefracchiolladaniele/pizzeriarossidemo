import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webPush from 'https://esm.sh/web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Configure web-push
    webPush.setVapidDetails(
      'mailto:info@pizzeriarossi.it',
      vapidPublicKey,
      vapidPrivateKey
    );

    const body = await req.json();
    const { endpoint, title, body: notificationBody, url, userId, userType, type, relatedId } = body;

    console.log('[send-push] Request:', { endpoint, title, userId, userType, type });

    let subscriptions: { endpoint: string; p256dh: string; auth: string; user_id: string }[] = [];

    if (endpoint) {
      // Send to specific endpoint
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth, user_id')
        .eq('endpoint', endpoint)
        .eq('is_enabled', true)
        .single();

      if (error || !data) {
        throw new Error('Subscription not found');
      }
      subscriptions = [data];
    } else if (userId) {
      // Send to specific user
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth, user_id')
        .eq('user_id', userId)
        .eq('is_enabled', true);

      if (error) throw error;
      subscriptions = data || [];
    } else if (userType) {
      // Send to all users of a specific type (admin or customer)
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth, user_id')
        .eq('user_type', userType)
        .eq('is_enabled', true);

      if (error) throw error;
      subscriptions = data || [];
    }

    if (subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = JSON.stringify({
      title: title || 'Pizzeria Rossi',
      body: notificationBody || 'Hai una nuova notifica',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      url: url || '/',
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        try {
          await webPush.sendNotification(pushSubscription, payload);
          
          // Log notification
          await supabase.from('notification_logs').insert({
            user_id: sub.user_id,
            title: title || 'Pizzeria Rossi',
            body: notificationBody || 'Hai una nuova notifica',
            type: type || 'general',
            related_id: relatedId || null,
            was_successful: true
          });

          return { endpoint: sub.endpoint, success: true };
        } catch (error) {
          console.error('[send-push] Push failed for endpoint:', sub.endpoint, error);
          
          // Log failed notification
          await supabase.from('notification_logs').insert({
            user_id: sub.user_id,
            title: title || 'Pizzeria Rossi',
            body: notificationBody || 'Hai una nuova notifica',
            type: type || 'general',
            related_id: relatedId || null,
            was_successful: false
          });

          // Remove invalid subscriptions (410 Gone or 404 Not Found)
          const statusCode = (error as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
          }
          
          throw error;
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log('[send-push] Results:', { successful, failed });

    return new Response(
      JSON.stringify({ success: true, sent: successful, failed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[send-push] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
