// ========== 自定义 Document ==========
// PWA 相关标签和资源预加载

import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="zh-CN">
      <Head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS 图标 */}
        <link rel="apple-touch-icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' rx='32' fill='%230F766E'/%3E%3Ctext x='96' y='130' font-size='100' text-anchor='middle' fill='white'%3E✈%3C/text%3E%3C/svg%3E" />

        {/* iOS 启动画面 */}
        <link rel="apple-touch-startup-image" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 800'%3E%3Crect width='480' height='800' fill='%23F0FDFA'/%3E%3Ctext x='240' y='400' font-size='60' text-anchor='middle' fill='%230F766E'%3ETripWise%3C/text%3E%3C/svg%3E" />

        {/* 通用 Meta */}
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0F766E" />
        <meta name="description" content="AI驱动的智能旅行规划助手，帮你轻松规划完美旅程" />

        {/* PWA / iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TripWise" />
        <meta name="msapplication-navbutton-color" content="#0F766E" />
        <meta name="format-detection" content="telephone=no" />

        {/* 预连接 API 域名 */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'} />

        {/* Service Worker：本地开发主动卸载，避免旧五栏等缓存干扰；生产再注册 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  var isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
                  if (isLocal) {
                    navigator.serviceWorker.getRegistrations().then(function(regs) {
                      regs.forEach(function(r) { r.unregister(); });
                    });
                    if (window.caches && caches.keys) {
                      caches.keys().then(function(keys) {
                        keys.forEach(function(k) { caches.delete(k); });
                      });
                    }
                    return;
                  }
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker 注册成功:', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker 注册失败:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
