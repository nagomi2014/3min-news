// 3分ニュース ─ Service Worker
// シェル（HTML/CSS/JS）はキャッシュ優先。号の一覧と各号は network-first で最新を取りに行く。
const CACHE = "3min-news-v2";
const SHELL = ["./", "./index.html", "./css/style.css", "./js/app.js", "./manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // データ（index.json / editions/*.json）は network-first（取れなければキャッシュ）
  if (url.pathname.includes("/data/")) {
    e.respondWith(
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // それ以外は cache-first
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
