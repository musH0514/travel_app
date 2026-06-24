import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { AuthProvider } from '@/context/AuthContext';
import '@/styles/globals.css';

function TripWiseApp({ Component, pageProps, router }: AppProps) {
  const getLayoutProps = () => {
    const path = router.pathname;
    const hasId = !!router.query.id;

    const noBackPages = ['/', '/profile', '/login'];
    const noLayoutPages = ['/login'];
    const titles: Record<string, string | undefined> = {
      '/': undefined,
      '/profile': undefined,
      '/login': undefined,
      '/create-trip': '创建新行程',
      '/trip-plan': hasId ? undefined : '行程详情',
      '/my-tracks': '我的足迹',
      '/history-trips': '历史行程',
      '/settings': '设置',
    };

    return {
      title: titles[path],
      showBack: !noBackPages.includes(path),
      noLayout: noLayoutPages.includes(path),
    };
  };

  const layoutProps = getLayoutProps();

  const content = layoutProps.noLayout ? (
    <Component {...pageProps} />
  ) : (
    <Layout title={layoutProps.title} showBack={layoutProps.showBack}>
      <Component {...pageProps} />
    </Layout>
  );

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <title>TripWise - 智能行程规划</title>
      </Head>
      <AuthProvider>{content}</AuthProvider>
    </>
  );
}

export default TripWiseApp;
