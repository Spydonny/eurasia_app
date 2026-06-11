/* Firebase Cloud Messaging service worker (background notifications).
 *
 * Registered by the app at scope "/firebase-cloud-messaging-push-scope" so it
 * does not clash with the workbox PWA service worker at "/". The web config is
 * passed as query params on the registration URL (a SW can't read build-time env).
 */
/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const params = new URLSearchParams(self.location.search);
const firebaseConfig = {
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
};

if (firebaseConfig.apiKey && firebaseConfig.messagingSenderId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const notification = payload.notification || {};
    const title = notification.title || 'Eurasia';
    self.registration.showNotification(title, {
      body: notification.body || '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: payload.data || {},
    });
  });
}

// Focus an existing tab (or open one) when a notification is clicked.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/notifications');
    }),
  );
});
