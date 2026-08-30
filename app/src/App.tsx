import { completedSetCount, workoutVolume } from './lib/workouts';
import { WorkoutScreen } from './features/workouts/WorkoutScreen';
import { ExerciseCatalog } from './features/exercises/ExerciseCatalog';
import { TemplateEditor } from './features/templates/TemplateEditor';
import { useState } from 'react';
import { useAppStore } from './store/useAppStore';

export function App() {
  const [view, setView] = useState<'dashboard' | 'templates' | 'exercises'>('dashboard');
  const activeWorkout = useAppStore((state) => state.activeWorkout);
  const workouts = useAppStore((state) => state.workouts);
  const startEmptyWorkout = useAppStore((state) => state.startEmptyWorkout);
  const templates = useAppStore((state) => state.templates);
  const startTemplateWorkout = useAppStore((state) => state.startTemplateWorkout);

  const totalVolume = workouts.reduce((sum, workout) => sum + workoutVolume(workout), 0);

  return (
    <main className="app-shell">
      <nav className="top-nav"><button className={view === 'dashboard' ? 'selected' : 'secondary'} onClick={() => setView('dashboard')}>Home</button><button className={view === 'templates' ? 'selected' : 'secondary'} onClick={() => setView('templates')}>Templates</button><button className={view === 'exercises' ? 'selected' : 'secondary'} onClick={() => setView('exercises')}>Exercises</button></nav>
      {view === 'templates' ? <TemplateEditor /> : view === 'exercises' ? <ExerciseCatalog /> : <>
      <header>
        <p className="eyebrow">Lift Tracker · React migration</p>
        <h1>Dashboard</h1>
      </header>
      <section className="stats" aria-label="Workout statistics">
        <div><strong>{workouts.length}</strong><span>Workouts</span></div>
        <div><strong>{totalVolume.toLocaleString()}</strong><span>Volume (lbs)</span></div>
        <div><strong>{activeWorkout ? completedSetCount(activeWorkout) : 0}</strong><span>Sets today</span></div>
      </section>
      {activeWorkout ? <WorkoutScreen /> : (
        <section className="card">
          <h2>Ready when you are.</h2>
          <p>Start an empty workout, or choose a template once that feature is migrated.</p>
          <button type="button" onClick={startEmptyWorkout}>Start workout</button>
          <div className="template-list">{templates.map((template) => <button className="secondary" type="button" key={template.id} onClick={() => startTemplateWorkout(template)}>Start {template.name}</button>)}</div>
        </section>
      )}
      <p className="migration-note">The existing app remains the production app. This is the typed migration foundation.</p>
      </>}
    </main>
  );
}
