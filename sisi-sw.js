const VERSION = '20261020-1';
const CACHE_NAME = `sisi-offline-${VERSION}`;
const MINECRAFT_VERSION = '20261020-1';
const MINECRAFT_CACHE_NAME = `minecraft-offline-${MINECRAFT_VERSION}`;
const QUEUE_DB = 'sisi-offline-progress';
const QUEUE_STORE = 'requests';

const LESSONS = [
  'space', 'music', 'ocean', 'detective', 'kitchen', 'dino', 'art', 'weather',
  'factory', 'garden', 'park', 'mail', 'cinema', 'escape', 'finale',
];

const PACK_URLS = [
  '/sisi.html', '/sisi.webmanifest', '/assets/course-covers/sisi.svg',
  '/css/quick-classroom-embed.css', '/css/how-to.css', '/css/platform-home-link.css',
  '/js/quick-classroom-embed.js', '/js/classroom-storage-scope.js',
  '/js/classroom-session.js', '/js/course-certificate.js', '/js/feedback-widget.js',
  ...LESSONS.flatMap(name => [
    `/${name}.html`, `/${name}-play.html`, `/css/${name}.css`,
    `/js/${name}-lessons.js`, `/js/${name}-play.js`,
  ]),
  ...Array.from({ length: 12 }, (_, index) =>
    `/assets/sisi-space-lesson1/mission-${String(index + 1).padStart(2, '0')}.svg`),
];

const MINECRAFT_PACK_URLS = [
  '/minecraft.html', '/minecraft-play.html', '/minecraft.webmanifest',
  '/assets/course-covers/minecraft.svg',
  '/css/platform-home-link.css', '/css/quick-classroom-embed.css',
  '/js/minecraft-lessons-20260820-stairs.js',
  '/js/vendor/blockly/blockly.min.js', '/js/vendor/blockly/msg/he.js',
  '/js/quick-classroom-embed.js', '/js/classroom-storage-scope.js',
  '/js/classroom-session.js', '/js/feedback-widget.js',
];

function openQueue() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(QUEUE_DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(QUEUE_STORE)) {
        request.result.createObjectStore(QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, callback) {
  const db = await openQueue();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(QUEUE_STORE, mode);
    const store = transaction.objectStore(QUEUE_STORE);
    const result = callback(store);
    transaction.oncomplete = () => { db.close(); resolve(result); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}

async function queueProgress(request) {
  const body = await request.clone().text();
  const headers = {};
  request.headers.forEach((value, key) => { headers[key] = value; });
  await withStore('readwrite', store => store.add({
    url: request.url,
    method: request.method,
    headers,
    body,
    createdAt: new Date().toISOString(),
  }));
  if (self.registration.sync) {
    try { await self.registration.sync.register('sisi-progress-sync'); } catch {}
  }
}

async function queuedRequests() {
  const db = await openQueue();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(QUEUE_STORE, 'readonly');
    const request = transaction.objectStore(QUEUE_STORE).getAll();
    request.onsuccess = () => { db.close(); resolve(request.result || []); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

async function deleteQueued(id) {
  await withStore('readwrite', store => store.delete(id));
}

async function flushProgressQueue() {
  const rows = await queuedRequests();
  let synced = 0;
  for (const row of rows) {
    try {
      const response = await fetch(row.url, {
        method: row.method,
        headers: row.headers,
        body: row.body,
        credentials: 'include',
      });
      if (!response.ok) break;
      await deleteQueued(row.id);
      synced += 1;
    } catch {
      break;
    }
  }
  await notifyClients({ type: 'SISI_SYNC_RESULT', synced, pending: rows.length - synced });
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach(client => client.postMessage(message));
}

async function downloadPack() {
  const cache = await caches.open(CACHE_NAME);
  const uniqueUrls = [...new Set(PACK_URLS)];
  let completed = 0;
  const failures = [];
  for (const url of uniqueUrls) {
    try {
      const response = await fetch(url, { credentials: 'include', cache: 'reload' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await cache.put(url, response);
    } catch (error) {
      failures.push({ url, message: String(error?.message || error) });
    }
    completed += 1;
    await notifyClients({ type: 'SISI_CACHE_PROGRESS', completed, total: uniqueUrls.length });
  }
  if (failures.length) {
    await notifyClients({ type: 'SISI_CACHE_ERROR', failures });
    return;
  }
  await cache.put('/sisi-offline-ready.json', new Response(JSON.stringify({ version: VERSION, cachedAt: new Date().toISOString() }), {
    headers: { 'Content-Type': 'application/json' },
  }));
  await notifyClients({ type: 'SISI_CACHE_READY', version: VERSION, total: uniqueUrls.length });
}

async function downloadMinecraftPack() {
  const cache = await caches.open(MINECRAFT_CACHE_NAME);
  const uniqueUrls = [...new Set(MINECRAFT_PACK_URLS)];
  let completed = 0;
  const failures = [];
  for (const url of uniqueUrls) {
    try {
      const response = await fetch(url, { credentials: 'include', cache: 'reload' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await cache.put(url, response);
    } catch (error) {
      failures.push({ url, message: String(error?.message || error) });
    }
    completed += 1;
    await notifyClients({ type: 'MINECRAFT_CACHE_PROGRESS', completed, total: uniqueUrls.length });
  }
  if (failures.length) {
    await notifyClients({ type: 'MINECRAFT_CACHE_ERROR', failures });
    return;
  }
  await cache.put('/minecraft-offline-ready.json', new Response(JSON.stringify({
    version: MINECRAFT_VERSION,
    cachedAt: new Date().toISOString(),
  }), { headers: { 'Content-Type': 'application/json' } }));
  await notifyClients({ type: 'MINECRAFT_CACHE_READY', version: MINECRAFT_VERSION, total: uniqueUrls.length });
}

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('sisi-offline-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await Promise.all(keys.filter(key => key.startsWith('minecraft-offline-') && key !== MINECRAFT_CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SISI_CACHE_DOWNLOAD') event.waitUntil(downloadPack());
  if (event.data?.type === 'MINECRAFT_CACHE_DOWNLOAD') event.waitUntil(downloadMinecraftPack());
  if (event.data?.type === 'SISI_SYNC_NOW') event.waitUntil(flushProgressQueue());
  if (event.data?.type === 'SISI_CACHE_CLEAR') {
    event.waitUntil((async () => {
      await caches.delete(CACHE_NAME);
      await notifyClients({ type: 'SISI_CACHE_CLEARED' });
    })());
  }
  if (event.data?.type === 'MINECRAFT_CACHE_CLEAR') {
    event.waitUntil((async () => {
      await caches.delete(MINECRAFT_CACHE_NAME);
      await notifyClients({ type: 'MINECRAFT_CACHE_CLEARED' });
    })());
  }
});

self.addEventListener('sync', event => {
  if (event.tag === 'sisi-progress-sync') event.waitUntil(flushProgressQueue());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.method === 'POST' && url.pathname === '/api/classroom/progress') {
    event.respondWith((async () => {
      try {
        return await fetch(event.request.clone());
      } catch {
        await queueProgress(event.request);
        await notifyClients({ type: 'SISI_PROGRESS_QUEUED' });
        return new Response(JSON.stringify({ ok: true, saved: false, queued: true, offline: true }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    })());
    return;
  }

  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      return await fetch(event.request);
    } catch {
      if (event.request.mode === 'navigate') {
        return (await caches.match('/sisi.html')) || Response.error();
      }
      return Response.error();
    }
  })());
});
