import type { Route } from '../lib/router';
import { Icon, type IconName } from './Icon';

const tabs: { tab: Route['tab']; label: string; icon: IconName; href: string }[] = [
  { tab: 'plan', label: 'Plan', icon: 'plan', href: '#/plan' },
  { tab: 'progress', label: 'Progress', icon: 'progress', href: '#/progress' },
  { tab: 'library', label: 'Library', icon: 'library', href: '#/library' },
];

/** Floating three-tab glass nav, sitting in the thumb zone above the home indicator. */
export function GlassNav({ current }: { current: Route['tab'] }) {
  return (
    <nav className="tab-bar glass" aria-label="Main">
      {tabs.map((item) => (
        <a key={item.tab} href={item.href} className="tab" aria-current={current === item.tab ? 'page' : undefined}>
          <Icon name={item.icon} size={26} />
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
