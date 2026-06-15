// ========== TripWise 布局组件 ==========
// 移动端底部导航栏 + 安全区域适配

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { BOTTOM_NAV_ITEMS } from '@/utils/constants';

interface LayoutProps {
  children: React.ReactNode;
  title?: string; // 页面标题
  showBack?: boolean; // 是否显示返回按钮
  onBack?: () => void; // 返回按钮回调
  rightAction?: React.ReactNode; // 右上角操作按钮
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // 同步当前路由到活动标签
  useEffect(() => {
    const currentPath = router.pathname;
    const activeItem = BOTTOM_NAV_ITEMS.find((item) => item.path === currentPath);
    if (activeItem) {
      setActiveTab(activeItem.key);
    }
  }, [router.pathname]);

  // 监听滚动隐藏/显示头部
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // 导航切换
  const handleTabPress = (item: typeof BOTTOM_NAV_ITEMS[number]) => {
    if (item.path === router.pathname) return;
    router.push(item.path);
  };

  // 返回上一页
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      {/* 桌面端容器 - 最大宽度480px模拟手机 */}
      <div className="w-full max-w-[480px] min-h-screen bg-white relative shadow-xl">
        {/* 顶部导航栏 */}
        <header
          className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100 transition-transform duration-300 ${
            showHeader ? 'translate-y-0' : '-translate-y-full'
          }`}
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="flex items-center justify-between h-12 px-4">
            {/* 左侧：返回按钮或标题 */}
            <div className="flex items-center gap-2 min-w-[40px]">
              {showBack ? (
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full active:bg-gray-100 transition-colors"
                  aria-label="返回"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              ) : (
                <span className="text-lg font-bold text-brand-700">TripWise</span>
              )}
            </div>

            {/* 中间标题 */}
            {title && (
              <h1 className="text-base font-semibold text-gray-800 truncate">{title}</h1>
            )}

            {/* 右侧操作按钮 */}
            <div className="flex items-center gap-1 min-w-[40px] justify-end">
              {rightAction || <div className="w-10" />}
            </div>
          </div>
        </header>

        {/* 主内容区域 - 为固定头部和底部导航留出空间 */}
        <main
          className="pt-12 pb-16 min-h-screen"
          style={{
            paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {children}
        </main>

        {/* 底部导航栏 */}
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 bg-white border-t border-gray-100 shadow-bottom-nav"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-center justify-around h-14">
            {BOTTOM_NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleTabPress(item)}
                  className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-200 ${
                    isActive
                      ? 'text-brand-600 scale-100'
                      : 'text-gray-400 scale-100'
                  }`}
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  {/* 图标 */}
                  <span className={`text-xl leading-none transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}>
                    {item.icon}
                  </span>
                  {/* 标签文字 */}
                  <span className={`text-[10px] font-medium transition-all duration-200 ${
                    isActive ? 'opacity-100' : 'opacity-80'
                  }`}>
                    {item.label}
                  </span>
                  {/* 活动指示器 */}
                  {isActive && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
