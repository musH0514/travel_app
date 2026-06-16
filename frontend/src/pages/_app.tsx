import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from '@/components/Layout';
import '@/styles/globals.css';

function TripWiseApp({ Component, pageProps, router }: AppProps) {
  const getLayoutProps = () => {
    const path = router.pathname;

    const noBackPages = ['/', '/profile'];
    const titles: Record<string, string | undefined> = {
      '/': undefined,
      '/profile': undefined,
      '/create-trip': '创建新行程',
      '/trip-plan': '行程详情',
      '/my-tracks': '我的足迹',
      '/history-trips': '历史行程',
      '/settings': '设置',
    };

    return {
      title: titles[path],
      showBack: !noBackPages.includes(path),
    };
  };

  const layoutProps = getLayoutProps();

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TripWise" />
        <meta name="theme-color" content="#0F766E" />
        <meta name="msapplication-navbutton-color" content="#0F766E" />
        <meta name="format-detection" content="telephone=no" />
        <title>TripWise - 智能行程规划</title>
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
