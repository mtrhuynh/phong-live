/* Phong Live service worker: cache the app shell and models on first visit
   so the hall reopens fast and full-screen from the home screen. */
const CACHE = 'phong-live-cache-40'; /* v0.1.37 (#64 follow-up): name-swap queue — a real raLay takes over the nearest in-flight demo performer (already en route) instead of waiting ~74 s for the pipeline to drain; nearest-seat-first picking. v0.1.36 was the #64 livelier idle rhythm (15 s demo pipeline, ambient 30-45 s, carpet restored to 2.4 m, cushions 0.40 m x 0.01 m) on the v0.1.35 #62 base. */
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
  'vendor/addons/utils/SkeletonUtils.js', /* v0.1.34: clone skinned girl actors */
  'models/buddha.glb', 'models/co-gai.glb', 'models/burner.glb', /* v0.1.34: monk2.glb removed (unused after the girl swap); co-gai.glb added */
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
