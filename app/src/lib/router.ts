import { useSyncExternalStore } from 'react';
import { isDayKey } from './dates';

export type Route =
  | { tab: 'plan'; day?: string; sheet?: 'add' }
  | { tab: 'progress'; sub?: 'settings' }
  | { tab: 'library'; sub: 'exercises' | 'templates'; id?: string };

export function parseRoute(hash: string): Route {
  const [tab, a, b] = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (tab === 'progress') return { tab, sub: a === 'settings' ? 'settings' : undefined };
  if (tab === 'library') {
    if (a === 'templates') return { tab, sub: 'templates', id: b ? decodeURIComponent(b) : undefined };
    return { tab, sub: 'exercises' };
  }
  if (isDayKey(a)) return { tab: 'plan', day: a, sheet: b === 'add' ? 'add' : undefined };
  return { tab: 'plan', sheet: a === 'add' ? 'add' : undefined };
}

const subscribe = (callback: () => void) => {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
};

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => '');
  return parseRoute(hash);
}

/** Hash navigation keeps the browser/OS Back gesture inside the app. */
export function navigate(path: string, options: { replace?: boolean } = {}) {
  const hash = `#${path.startsWith('/') ? path : `/${path}`}`;
  if (window.location.hash === hash) return;
  if (options.replace) {
    window.history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = hash;
  }
}

export const planPath = (day?: string, sheet?: 'add') => `/plan${day ? `/${day}` : ''}${sheet ? `/${sheet}` : ''}`;

/** Sheets get their own history entry so the Back gesture closes them instead of leaving the app. */
export function openSheet(path: string) {
  window.history.pushState({ sheet: true }, '', `#${path}`);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export function closeSheet(day?: string) {
  if ((window.history.state as { sheet?: boolean } | null)?.sheet) window.history.back();
  else navigate(planPath(day), { replace: true });
}
