import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { getFirebaseApp, isFirebaseConfigured, firebaseConfig, vapidKey } from './config';
import { registerDevice, unregisterDevice } from '@/api';

// FCM's conventional dedicated scope, so the messaging SW does not clash with the
// workbox PWA service worker that controls the root scope ('/').
const FCM_SW_SCOPE = '/firebase-cloud-messaging-push-scope';

let currentToken: string | null = null;
let initialized = false;

async function registerMessagingSW(): Promise<ServiceWorkerRegistration> {
  // The SW can't read import.meta.env, so the web config is passed via query string.
  const params = new URLSearchParams(firebaseConfig as Record<string, string>);
  return navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?${params.toString()}`,
    { scope: FCM_SW_SCOPE },
  );
}

/**
 * Request notification permission, obtain an FCM token, register it with the
 * backend, and listen for foreground messages. Safe no-op when Firebase is not
 * configured, unsupported, or permission is not granted. Idempotent.
 */
export async function initPushNotifications(): Promise<void> {
  if (initialized) return;
  if (!isFirebaseConfigured) return;
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window)) return;

  try {
    if (!(await isSupported())) return;

    if (Notification.permission === 'denied') return;
    const permission =
      Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();
    if (permission !== 'granted') return;

    const app = getFirebaseApp();
    if (!app) return;

    const swReg = await registerMessagingSW();
    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swReg,
    });
    if (!token) return;

    currentToken = token;
    initialized = true;
    await registerDevice(token, 'web').catch(() => {});

    // Foreground messages: the SW only fires when the app is backgrounded, so we
    // surface a notification ourselves and let the app refresh its unread badge.
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? 'Eurasia';
      const body = payload.notification?.body ?? '';
      window.dispatchEvent(new CustomEvent('fcm-message', { detail: payload }));
      try {
        new Notification(title, { body, icon: '/icons/icon-192x192.png' });
      } catch {
        /* ignore — some browsers disallow Notification ctor in foreground */
      }
    });
  } catch {
    /* messaging is best-effort; never block the app */
  }
}

/** Remove the current device token from the backend (call on logout). */
export async function teardownPushNotifications(): Promise<void> {
  if (!currentToken) return;
  await unregisterDevice(currentToken).catch(() => {});
  currentToken = null;
  initialized = false;
}
