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
  // Unregister the service worker.
  await self.registration.unregister();

  // Get a list of all clients (open tabs/windows) and force them to reload.
  // This is crucial to break them out of the old service worker's control.
  const clients = await self.clients.matchAll({
    type: 'window', includeUncontrolled: true,
  });
  for (const client of clients) {
    client.navigate(client.url);
  }
});
