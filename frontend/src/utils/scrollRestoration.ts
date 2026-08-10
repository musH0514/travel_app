export function saveScrollPosition(key: string, container?: HTMLElement | null) {
  if (typeof window === 'undefined') return;
  const value = container ? container.scrollTop : window.scrollY;
  sessionStorage.setItem(key, String(value));
}

export function restoreScrollPosition(key: string, container?: HTMLElement | null) {
  if (typeof window === 'undefined') return;

  const saved = sessionStorage.getItem(key);
  if (saved === null) return;

  const y = Number.parseInt(saved, 10);
  if (Number.isNaN(y)) return;

  const apply = () => {
    if (container) {
      container.scrollTop = y;
    } else {
      window.scrollTo(0, y);
    }
  };

  requestAnimationFrame(() => {
    apply();
    requestAnimationFrame(apply);
  });
}
