/* 考古題解題學習站 — Service Worker
 *
 * 策略
 *   · 導覽請求：network-first（拿到最新 HTML），離線時回快取，最後退回外殼。
 *   · 同源靜態資源：stale-while-revalidate（先給快取、背景更新），
 *     因此第一次看過的題庫與動畫，之後完全離線可讀。
 *   · 跨網域（KaTeX CDN 等）一律放行，不介入。
 */
const VERSION = 'exam-shell-v1';

const SHELL = [
  './',
  './index.html',
  './cross.html',
  './events.html',
  './quiz/',
  './quiz/index.html',
  './manifest.webmanifest',
  './assets/css/site.css',
  './assets/js/subjects.js',
  './assets/js/site.js',
  './assets/js/data/resources.js',
  './assets/anim/news/manifest.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    /* 個別加入，任何一個失敗都不會讓整次安裝失敗 */
    await Promise.allSettled(SHELL.map((u) => cache.add(new Request(u, { cache: 'reload' }))));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== self.location.origin) return;   /* 外部資源不介入 */
  if (url.pathname.endsWith('/sw.js')) return;

  /* 導覽：先網路、後快取 */
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        const cache = await caches.open(VERSION);
        cache.put(req, res.clone());
        return res;
      } catch (_) {
        const hit = await caches.match(req, { ignoreSearch: true });
        if (hit) return hit;
        const shell = await caches.match('./index.html');
        return shell || Response.error();
      }
    })());
    return;
  }

  /* 靜態資源：stale-while-revalidate */
  e.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: true });
    const update = fetch(req).then(async (res) => {
      if (res && res.status === 200 && res.type === 'basic') {
        const cache = await caches.open(VERSION);
        cache.put(req, res.clone());
      }
      return res;
    }).catch(() => hit);
    return hit || update;
  })());
});
