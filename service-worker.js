var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/',
  '/css/main.css',
  '/scripts/main.js'
];

self.addEventListener('install', function(event) {
  // インストール処理
  debugger
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // キャッシュがあったのでレスポンスを返す
        if (response) {
          return response;
        }

        // 重要：リクエストをcloneする。リクエストはStreamなので
        // 一度しか処理できない。ここではキャッシュ用、fetch用と2回
        // 必要なので、リクエストはcloneしないといけない
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // レスポンスが正しいかをチェック
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 重要：レスポンスをclone する。レスポンスはStreamで
            // ブラウザ用とキャッシュ用の2回必要。なのでcloneして
            // 2つのStreamがあるようにする
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

self.addEventListener('activate', function(event) {

  var cacheWhitelist = ['pages-cache-v1', 'blog-posts-cache-v1'];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});