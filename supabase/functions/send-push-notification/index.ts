import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper functions for Web Push encryption
function base64UrlToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function uint8ArrayToBase64Url(uint8Array: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

async function generateVapidAuthHeader(
  endpoint: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ authorization: string; cryptoKey: string }> {
  const audience = new URL(endpoint).origin;
  const expiration = Math.floor(Date.now() / 1000) + 12 * 60 * 60;

  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = {
    aud: audience,
    exp: expiration,
    sub: 'mailto:info@pizzeriarossi.it',
  };

  const headerB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key for signing
  const publicKeyBytes = base64UrlToUint8Array(vapidPublicKey);
  const privateKeyBytes = base64UrlToUint8Array(vapidPrivateKey);

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    {
      kty: 'EC',
      crv: 'P-256',
      x: uint8ArrayToBase64Url(publicKeyBytes.slice(1, 33)),
      y: uint8ArrayToBase64Url(publicKeyBytes.slice(33, 65)),
      d: uint8ArrayToBase64Url(privateKeyBytes),
    },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert DER signature to raw format (64 bytes)
  const signatureBytes = new Uint8Array(signature);
  const signatureB64 = uint8ArrayToBase64Url(signatureBytes);

  const jwt = `${unsignedToken}.${signatureB64}`;

  return {
    authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
    cryptoKey: vapidPublicKey,
  };
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  // Use ArrayBuffer for crypto operations
  const keyMaterial = await crypto.subtle.importKey(
    'raw', 
    ikm.buffer as ArrayBuffer, 
    { name: 'HKDF' }, 
    false, 
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: salt.buffer as ArrayBuffer,
      info: info.buffer as ArrayBuffer,
    },
    keyMaterial,
    length * 8
  );

  return new Uint8Array(derivedBits);
}

async function encryptPayload(
  payload: string,
  clientPublicKey: Uint8Array,
  clientAuth: Uint8Array
): Promise<{ encrypted: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  // Generate server key pair
  const serverKeys = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );

  const serverPublicKeyRaw = await crypto.subtle.exportKey('raw', serverKeys.publicKey);
  const serverPublicKey = new Uint8Array(serverPublicKeyRaw);

  // Import client public key
  const clientKey = await crypto.subtle.importKey(
    'raw',
    clientPublicKey.buffer as ArrayBuffer,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  // Derive shared secret
  const sharedSecretBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: clientKey },
    serverKeys.privateKey,
    256
  );
  const sharedSecret = new Uint8Array(sharedSecretBits);

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // RFC 8291 key derivation
  const authInfo = concatUint8Arrays(
    new TextEncoder().encode('WebPush: info\0'),
    clientPublicKey,
    serverPublicKey
  );

  const prk = await hkdf(clientAuth, sharedSecret, authInfo, 32);

  const cekInfo = new TextEncoder().encode('Content-Encoding: aes128gcm\0');
  const nonceInfo = new TextEncoder().encode('Content-Encoding: nonce\0');

  const contentEncryptionKey = await hkdf(salt, prk, cekInfo, 16);
  const nonce = await hkdf(salt, prk, nonceInfo, 12);

  // Encrypt with AES-GCM
  const aesKey = await crypto.subtle.importKey(
    'raw',
    contentEncryptionKey.buffer as ArrayBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  // Add padding (2 bytes for padding length + delimiter)
  const paddedPayload = concatUint8Arrays(
    new Uint8Array([0, 0]), // padding length
    new TextEncoder().encode(payload),
    new Uint8Array([2]) // delimiter
  );

  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce.buffer as ArrayBuffer },
    aesKey,
    paddedPayload.buffer as ArrayBuffer
  );

  return {
    encrypted: new Uint8Array(encryptedData),
    salt,
    serverPublicKey,
  };
}

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<Response> {
  const clientPublicKey = base64UrlToUint8Array(subscription.p256dh);
  const clientAuth = base64UrlToUint8Array(subscription.auth);

  // Encrypt the payload
  const { encrypted, salt, serverPublicKey } = await encryptPayload(
    payload,
    clientPublicKey,
    clientAuth
  );

  // Build the body according to RFC 8291
  const recordSize = new Uint8Array(4);
  new DataView(recordSize.buffer).setUint32(0, 4096, false);

  const body = concatUint8Arrays(
    salt,                           // 16 bytes
    recordSize,                     // 4 bytes
    new Uint8Array([serverPublicKey.length]), // 1 byte
    serverPublicKey,                // 65 bytes
    encrypted                       // encrypted data
  );

  // Generate VAPID headers
  const { authorization } = await generateVapidAuthHeader(
    subscription.endpoint,
    vapidPublicKey,
    vapidPrivateKey
  );

  // Send the push message
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400',
      'Authorization': authorization,
    },
    body: body.buffer as ArrayBuffer,
  });

  return response;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { endpoint, title, body: notificationBody, url, userId, userType, type, relatedId } = body;

    console.log('[send-push] Request:', { endpoint: endpoint?.substring(0, 50), title, userId, userType, type });

    let subscriptions: { endpoint: string; p256dh: string; auth: string; user_id: string | null }[] = [];

    if (endpoint) {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth, user_id')
        .eq('endpoint', endpoint)
        .eq('is_enabled', true)
        .single();

      if (error || !data) {
        console.log('[send-push] Subscription not found:', error);
        throw new Error('Subscription not found');
      }
      subscriptions = [data];
    } else if (userId) {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth, user_id')
        .eq('user_id', userId)
        .eq('is_enabled', true);

      if (error) throw error;
      subscriptions = data || [];
    } else if (userType) {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth, user_id')
        .eq('user_type', userType)
        .eq('is_enabled', true);

      if (error) throw error;
      subscriptions = data || [];
    }

    if (subscriptions.length === 0) {
      console.log('[send-push] No subscriptions found');
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

    console.log('[send-push] Sending to', subscriptions.length, 'subscriptions');

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const response = await sendWebPush(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            payload,
            vapidPublicKey,
            vapidPrivateKey
          );

          console.log('[send-push] Response status:', response.status, 'for endpoint:', sub.endpoint.substring(0, 50));

          if (!response.ok) {
            const errorText = await response.text();
            console.error('[send-push] Push failed:', response.status, errorText);
            
            // Remove invalid subscriptions
            if (response.status === 404 || response.status === 410) {
              await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
              console.log('[send-push] Removed invalid subscription');
            }
            
            throw new Error(`Push failed: ${response.status}`);
          }

          // Log successful notification
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
          console.error('[send-push] Error for endpoint:', sub.endpoint.substring(0, 50), error);
          
          // Log failed notification
          await supabase.from('notification_logs').insert({
            user_id: sub.user_id,
            title: title || 'Pizzeria Rossi',
            body: notificationBody || 'Hai una nuova notifica',
            type: type || 'general',
            related_id: relatedId || null,
            was_successful: false
          });
          
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
