// ========== TripWise App 入口 ==========
// 全局布局、样式、状态管理

import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from '@/components/Layout';
import '@/styles/globals.css';

function TripWiseApp({ Component, pageProps, router }: AppProps) {
  // 根据路由判断是否显示某些特性
  const getLayoutProps = () => {
    const path = router.pathname;

    // 这些页面不显示底部导航
    const hideNav = false;

    return {
      title: getPageTitle(path),
      showBack: path !== '/',
    };
  };

  // 页面标题映射
  const getPageTitle = (path: string): string | undefined => {
    const titles: Record<string, string | undefined> = {
      '/': undefined,
      '/destinations': '目的地',
      '/trip-plan': '我的行程',
      '/weather': '天气',
      '/profile': '个人中心',
    };
    return titles[path];
  };

  const layoutProps = getLayoutProps();

  return (
    <>
      <Head>
        {/* 移动端视口设置 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        {/* PWA 状态栏样式 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TripWise" />
        {/* 主题色 */}
        <meta name="theme-color" content="#0F766E" />
        <meta name="msapplication-navbutton-color" content="#0F766E" />
        {/* 浏览器忽略电话号码检测 */}
        <meta name="format-detection" content="telephone=no" />
        {/* 页面标题 */}
        <title>TripWise - 智能行程规划</title>
        {/* 描述 */}
        <meta name="description" content="AI驱动的智能旅行规划助手，帮你轻松规划完美旅程" />
      </Head>

      <Layout
        title={layoutProps.title}
        showBack={layoutProps.showBack}
      >
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default TripWiseApp;
