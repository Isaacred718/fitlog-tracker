import { useEffect } from 'react';
import { GlassNav } from './components/GlassNav';
import { Toast } from './components/Toast';
import { LibraryScreen } from './features/library/LibraryScreen';
import { PlanScreen } from './features/plan/PlanScreen';
import { ProgressScreen } from './features/progress/ProgressScreen';
import { SettingsScreen } from './features/progress/SettingsScreen';
import { useRoute } from './lib/router';

export function App() {
  const route = useRoute();
  // Plan day changes keep their scroll; switching screens starts at the top.
  const screen = route.tab === 'library' ? `library/${route.sub}/${route.id ?? ''}` : route.tab === 'progress' ? `progress/${route.sub ?? ''}` : 'plan';

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen]);

  return (
    <>
      <div className="ambient" aria-hidden="true" />
      <main className="app-shell">
        {route.tab === 'plan' && <PlanScreen day={route.day} sheet={route.sheet} />}
        {route.tab === 'progress' && (route.sub === 'settings' ? <SettingsScreen /> : <ProgressScreen />)}
        {route.tab === 'library' && <LibraryScreen sub={route.sub} id={route.id} />}
      </main>
      <Toast />
      <GlassNav current={route.tab} />
    </>
  );
}
