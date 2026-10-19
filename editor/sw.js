const CACHE = 'mouthbeat-editor-v4';
const FILES = ['./', './index.html', './style.css', './app.js', './sounds/mb_kick.wav', './sounds/mb_snare.wav', './sounds/mb_hat.wav', './sounds/mb_clap.wav', './about.html', './vendor/strudel/index.mjs', './vendor/strudel/LICENSE', './vendor/strudel/assets/clockworker-ZDiUtESR.js'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => { if(event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return; event.respondWith(fetch(event.request).then(response => { if(response.ok) { const copy=response.clone(); caches.open(CACHE).then(cache => cache.put(event.request,copy)); } return response; }).catch(() => caches.match(event.request))); });
