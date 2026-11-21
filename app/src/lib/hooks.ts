import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Re-render on an interval while enabled; returns the current time. */
export function useNow(enabled = true, interval = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(id);
  }, [enabled, interval]);
  return now;
}

/**
 * Publishes an element's height as a CSS custom property on <html>, so scrolling content and
 * the toast can clear bottom-anchored glass chrome of any height.
 */
export function useChromeHeight<T extends HTMLElement>(variable: string) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    const root = document.documentElement;
    if (!element) return;
    const update = () => root.style.setProperty(variable, `${Math.ceil(element.getBoundingClientRect().height)}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => { observer.disconnect(); root.style.setProperty(variable, '0px'); };
  }, [variable]);
  return ref;
}
