// Firebase Messaging Service Worker — Pie-Fection
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBrXV0Pph8yvDSakjCxYjx5CTjE6B53_XE",
  authDomain: "pie-fection.firebaseapp.com",
  projectId: "pie-fection",
  storageBucket: "pie-fection.firebasestorage.app",
  messagingSenderId: "1018622684780",
  appId: "1:1018622684780:web:3bc7ab5aaa31fde71a3249"
});

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage(payload => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || '🍕 Pie-Fection', {
    body: body || 'Você tem uma nova notificação.',
    icon: icon || '/Pie-Fection/schedule/icon-192.png',
    badge: '/Pie-Fection/schedule/icon-192.png',
    tag: 'pie-fection-notification',
    renotify: true,
    data: payload.data || {}
  });
});

// Click on notification → open the app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('pie-fection') && 'focus' in client) return client.focus();
      }
      return clients.openWindow('https://pie-fection.github.io/Pie-Fection/schedule/');
    })
  );
});
