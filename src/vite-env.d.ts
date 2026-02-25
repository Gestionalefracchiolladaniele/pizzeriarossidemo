/// <reference types="vite/client" />

declare interface ServiceWorkerRegistration {
  readonly pushManager: PushManager;
}

declare interface PushManager {
  getSubscription(): Promise<PushSubscription | null>;
  subscribe(options?: PushSubscriptionOptionsInit): Promise<PushSubscription>;
  permissionState(options?: PushSubscriptionOptionsInit): Promise<PushPermissionState>;
}

declare type PushPermissionState = 'denied' | 'granted' | 'prompt';

declare interface PushSubscription {
  readonly endpoint: string;
  readonly expirationTime: DOMHighResTimeStamp | null;
  readonly options: PushSubscriptionOptions;
  getKey(name: PushEncryptionKeyName): ArrayBuffer | null;
  toJSON(): PushSubscriptionJSON;
  unsubscribe(): Promise<boolean>;
}

declare type PushEncryptionKeyName = 'p256dh' | 'auth';

declare interface PushSubscriptionJSON {
  endpoint?: string;
  expirationTime?: DOMHighResTimeStamp | null;
  keys?: Record<string, string>;
}

declare interface PushSubscriptionOptionsInit {
  userVisibleOnly?: boolean;
  applicationServerKey?: BufferSource | string | null;
}

declare interface PushSubscriptionOptions {
  readonly userVisibleOnly: boolean;
  readonly applicationServerKey: ArrayBuffer | null;
}
