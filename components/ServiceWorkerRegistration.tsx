'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
      return;
    }

    // Outside production, tear down any worker still registered for this origin.
    //
    // A service worker outlives the server that registered it. Running
    // `npm run build && npm start` on localhost registers one, and it stays active
    // when you go back to `npm run dev` on the same port — intercepting requests and
    // serving stale-while-revalidate copies of /_next/ chunks. Turbopack reuses dev
    // chunk filenames across builds, so that returns a stale body for a current URL
    // and the page dies with a ChunkLoadError.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length === 0) return;

      for (const registration of registrations) {
        registration.unregister();
      }
      if ('caches' in window) {
        caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
      }
      console.info('Unregistered a leftover service worker from a local production build.');
    });
  }, []);

  return null;
}
