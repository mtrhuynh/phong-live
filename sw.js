/* Phong Live service worker: cache the app shell and models on first visit
   so the hall reopens fast and full-screen from the home screen. */
const CACHE = 'phong-live-cache-33'; /* v0.1.29: healing bed set rotation (#37); beds stream on demand, not precached. cache-33: piece 18 breathing pauses widened (#38) */
const CORE = [
  'index.html', 'control.html', 'dai-phat.html', 'xam-data.js',
  'playlist.json', 'audio/bed.mp3',
  'ARTWORK_tranh-nen-ban-tho_v3.webp',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png',
  'vendor/three.module.js',
  'vendor/supabase.min.js', /* v0.1.27: Supabase JS client (Realtime channel) */
  'vendor/addons/controls/OrbitControls.js',
  'vendor/addons/environments/RoomEnvironment.js',
  'vendor/addons/loaders/GLTFLoader.js',
  'vendor/addons/utils/BufferGeometryUtils.js',
  'vendor/addons/utils/meshopt_decoder.mjs', /* v0.1.26: meshopt decoder */
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
  /* v0.1.25 (#29): media elements fetch with a Range header. Serving a
     cached FULL response to a range request stalls <audio> forever
     (verified headless: bed.mp3 stuck at readyState 0 under the SW,
     loads in ~1 s with this bypass). Ranges always go to the network. */
  if (e.request.headers.get('range')) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => {
    if (hit) return hit;
    return fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    });
  }));
});
