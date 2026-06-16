import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { BOTTOM_NAV_ITEMS } from '@/utils/constants';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('trips');

  useEffect(() => {
    const currentPath = router.pathname;
    const activeItem = BOTTOM_NAV_ITEMS.find((item) => item.path === currentPath);
    if (activeItem) {
      setActiveTab(activeItem.key);
    }
  }, [router.pathname]);

  const handleTabPress = (item: typeof BOTTOM_NAV_ITEMS[number]) => {
    if (item.path === router.pathname) return;
    router.push(item.path);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const isHome = router.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen bg-white relative shadow-xl">
        <header
          className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 bg-white border-b border-gray-100"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="flex items-center justify-between h-12 px-4">
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

            {title && (
              <h1 className="text-base font-semibold text-gray-800 truncate">{title}</h1>
            )}

            <div className="flex items-center gap-1 min-w-[40px] justify-end">
              {isHome ? (
                <button
                  onClick={() => router.push('/profile')}
                  className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-sm overflow-hidden active:scale-95 transition-transform"
                >
                  <span className="text-brand-600 font-medium text-xs">U</span>
                </button>
              ) : rightAction ? (
                rightAction
              ) : (
                <div className="w-10" />
              )}
            </div>
          </div>
        </header>

        <main
          className="pt-12 pb-16 min-h-screen"
          style={{
            paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {children}
        </main>

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
                  <span className={`text-xl leading-none transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}>
                    {item.icon}
                  </span>
                  <span className={`text-[10px] font-medium transition-all duration-200 ${
                    isActive ? 'opacity-100' : 'opacity-80'
                  }`}>
                    {item.label}
                  </span>
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
