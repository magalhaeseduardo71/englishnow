const CACHE_NAME = 'dailyenglish-v3';
const ASSETS = [
  'index.html', 'app.html',
  'css/reset.css', 'css/variables.css', 'css/auth.css', 'css/app.css',
  'js/config.js', 'js/auth.js', 'js/db.js', 'js/engine.js',
  'js/ui.js', 'js/progress.js', 'js/app.js',
  'js/modes/flashcard.js', 'js/modes/fillblank.js',
  'js/modes/translate.js', 'js/modes/listen.js', 'js/modes/order.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(ASSETS.map(url => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  if (url.hostname.includes('supabase.co')) {
    e.respondWith(
      fetch(e.request).catch(() => new Response('{}', { headers: { 'Content-Type': 'application/json' } }))
    );
    return;
  }

  // Navegação: rede primeiro, fallback para cache
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
