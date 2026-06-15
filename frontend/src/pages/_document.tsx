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

        {/* 主题色 */}
        <meta name="theme-color" content="#0F766E" />

        {/* 预连接 API 域名 */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'} />

        {/* Service Worker 注册 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
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

        {/* 字体预加载 */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
