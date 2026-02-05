// キャッシュの名前（ここは更新しなくてOKになります）
var CACHE_NAME = 'papanshiki-network-first';
var urlsToCache = [
  './',
  './index.html',
  './sansuu.html',
  './99.html',
  './1gradekanji.html',
  './100home.html',
  './youji.html',
  './alphabet.html',
  './math100.html',
  './hissan.html',
  './icon-192.png',
  './icon-512.png'
];

// インストール処理
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// ★ここが変更点：通信時の処理（ネットワーク優先）
self.addEventListener('fetch', function(event) {
  event.respondWith(
    // まずネットワーク(最新)を取りに行く
    fetch(event.request)
      .then(function(response) {
        // 成功したらキャッシュにも保存して、その最新データを返す
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        var responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(function(cache) {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(function() {
        // ネットワークが繋がらない時だけ、保存したキャッシュを使う
        return caches.match(event.request);
      })
  );
});