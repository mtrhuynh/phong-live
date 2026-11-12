/* Phong Live service worker: cache the app shell and models on first visit
   so the hall reopens fast and full-screen from the home screen. */
const CACHE = 'phong-live-cache-2';
const CORE = [
  'index.html', 'control.html', 'xam-data.js',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png',
  'vendor/three.module.js',
  'vendor/addons/controls/OrbitControls.js',
  'vendor/addons/environments/RoomEnvironment.js',
  'vendor/addons/loaders/GLTFLoader.js',
  'vendor/addons/utils/BufferGeometryUtils.js',
  'models/buddha.glb', 'models/monk2.glb', 'models/burner.glb',
  'models/xam-set.glb', 'models/temple.glb',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => {
    if (hit) return hit;
    return fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    });
  }));
});
