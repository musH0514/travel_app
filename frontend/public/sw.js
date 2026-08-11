// TripWise Service Worker
// 离线缓存策略 - 优先使用缓存，网络请求失败时回退到缓存

// 升版本以淘汰旧缓存（例如早期五栏底部导航的 JS 产物）
const CACHE_NAME = 'tripwise-v2';

// 需要预缓存的静态资源
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
];

// 安装阶段 - 预缓存关键资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // 强制等待中的 service worker 被激活
  self.skipWaiting();
});

// 激活阶段 - 清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // 立即控制所有客户端
  self.clients.claim();
});

// 网络请求拦截
self.addEventListener('fetch', (event) => {
  // 只拦截 GET 请求
  if (event.request.method !== 'GET') return;

  const url = event.request.url;
  // API、HTML、JS：网络优先，避免旧导航等壳层资源被长期锁死
  if (
    url.includes('/api/') ||
    event.request.mode === 'navigate' ||
    url.includes('/_next/') ||
    url.endsWith('.js') ||
    url.endsWith('.css')
  ) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // 其余静态资源仍可缓存优先
  event.respondWith(cacheFirstStrategy(event.request));
});

// 缓存优先策略
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // 离线时返回自定义离线页面
    return new Response(
      JSON.stringify({
        error: '您当前处于离线状态',
        message: '请连接网络后重试',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// 网络优先策略
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(
      JSON.stringify({
        error: '网络请求失败',
        message: '请检查网络连接',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
