import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';

/** Web app config from Firebase console > Project settings > General. */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

/** Web Push certificate key pair (Cloud Messaging > Web configuration). */
export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY ?? '';

/** True only when all values required for FCM web push are present. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId &&
    vapidKey,
);

/** Returns the singleton Firebase app, or null when not configured. */
export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  return getApps()[0] ?? initializeApp(firebaseConfig);
}
