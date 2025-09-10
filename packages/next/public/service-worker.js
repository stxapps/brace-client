/**
 * This is a "nuking" service worker.
 * It is served from the same path as the old Create React App service worker.
 * Its sole purpose is to unregister itself and any other service workers
 * from this origin, ensuring that users of the old PWA can successfully
 * load the new Next.js application without being trapped by the old cache.
 */
self.addEventListener('install', () => {
  // Skip waiting and become the active service worker immediately.
  self.skipWaiting();
});

self.addEventListener('activate', async () => {
  // When this new service worker activates, it will take over.
  // First, we clear out all the old caches.
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));

  // Then, we unregister this service worker, so it doesn't stick around.
  await self.registration.unregister();

  // Users will get the new version on their next navigation or manual page refresh.
});
