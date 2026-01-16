// キャッシュの名前（更新時はここを変える）
var CACHE_NAME = 'papanshiki-v1';
// キャッシュするファイルのリスト
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
  './hissan.html'
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

// リソースフェッチ時の処理
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // キャッシュにあればそれを返す
        if (response) {
          return response;
        }
        // なければネットワークに取りに行く
        return fetch(event.request);
      })
  );
});