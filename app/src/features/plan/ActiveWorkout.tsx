import { useEffect, useMemo, useRef } from 'react';
import { Icon } from '../../components/Icon';
import { useNow } from '../../lib/hooks';
import { openSheet, planPath } from '../../lib/router';
import {
  bestSet, completedSetCount, formatDuration, formatWeight, isValidPointer, lastPerformance, nextIncomplete,
  sortedHistory, summarizeSets, totalSetCount,
} from '../../lib/workouts';
import { exerciseOptions } from '../../data/exercises';
import { VideoGuideLink } from '../../components/VideoGuide';
import { useAppStore } from '../../store/useAppStore';
import type { Workout } from '../../types/domain';

export function ActiveWorkout({ workout, dayKey, onFinish }: { workout: Workout; dayKey: string; onFinish: () => void }) {
  const workouts = useAppStore((state) => state.workouts);
  const focus = useAppStore((state) => state.focus);
  const setFocus = useAppStore((state) => state.setFocus);
  const completeSet = useAppStore((state) => state.completeSet);
  const uncompleteSet = useAppStore((state) => state.uncompleteSet);
  const addSet = useAppStore((state) => state.addSet);
  const removeSet = useAppStore((state) => state.removeSet);
  const removeExercise = useAppStore((state) => state.removeExercise);
  const addExercise = useAppStore((state) => state.addExercise);
  const discardWorkout = useAppStore((state) => state.discardWorkout);
  const now = useNow();
  const pointer = isValidPointer(workout, focus) ? focus : nextIncomplete(workout);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const done = completedSetCount(workout);

  // Keep the card being logged in view above the dock.
  const firstRun = useRef(true);
  useEffect(() => {
    // Leave the session header (title, timer, Finish) in view when the screen first opens.
    if (firstRun.current) { firstRun.current = false; return; }
    if (!pointer) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cards.current[pointer.exerciseIndex]?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }, [pointer?.exerciseIndex, pointer?.setIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const recent = useMemo(() => {
    const inWorkout = new Set(workout.exercises.map((item) => item.exerciseId));
    const seen = new Set<string>();
    const picks: { id: string; name: string; muscle: string }[] = [];
    for (const past of sortedHistory(workouts)) {
      for (const item of past.exercises) {
        if (inWorkout.has(item.exerciseId) || seen.has(item.exerciseId)) continue;
        seen.add(item.exerciseId);
        picks.push({ id: item.exerciseId, name: item.name, muscle: item.muscle });
      }
    }
    // New users get sensible suggestions instead of an empty row.
    for (const option of exerciseOptions) {
      if (picks.length >= 3) break;
      if (!inWorkout.has(option.id) && !seen.has(option.id)) { seen.add(option.id); picks.push(option); }
    }
    return picks.slice(0, 3);
  }, [workouts, workout.exercises]);

  return (
    <div className="workout">
      <header className="day-head">
        <div>
          <h1>{workout.name}</h1>
          <p className="day-meta">
            {workout.exercises.length} exercises · {done}/{totalSetCount(workout)} sets ·{' '}
            <span className="elapsed" aria-label={`Elapsed ${formatDuration(now - workout.startTime)}`}>{formatDuration(now - workout.startTime)}</span>
          </p>
        </div>
        <button type="button" className="glass-btn finish-btn" disabled={done === 0} onClick={onFinish}><Icon name="flag" size={20} /> Finish</button>
      </header>

      <ol className="exercise-list">
        {workout.exercises.map((exercise, exerciseIndex) => {
          const isActive = pointer?.exerciseIndex === exerciseIndex;
          const completed = exercise.sets.filter((item) => item.completed).length;
          const allDone = completed === exercise.sets.length;
          const last = lastPerformance(workouts, exercise.exerciseId);
          const best = bestSet(workouts, exercise.exerciseId);
          const topNow = Math.max(0, ...exercise.sets.filter((item) => item.completed).map((item) => item.actualWeight));
          const isPR = !!best && topNow > best.weight;
          const openCard = () => {
            const next = nextIncomplete(workout, { exerciseIndex, setIndex: 0 });
            setFocus(next && next.exerciseIndex === exerciseIndex ? next : { exerciseIndex, setIndex: 0 });
          };
          return (
            <li key={exercise.exerciseId} ref={(node) => { cards.current[exerciseIndex] = node; }}
              className={`ex-card${isActive ? ' is-active' : ''}${allDone ? ' is-done' : ''}`}>
              <button type="button" className="ex-head" aria-expanded={isActive} onClick={openCard}>
                <span className="ex-title">{exercise.name}{isPR && <span className="badge-pr"><Icon name="trophy" size={14} /> PR</span>}</span>
                <span className="ex-sub">
                  {isActive
                    ? <>{exercise.muscle}{last ? ` · Last: ${summarizeSets(last)}` : ''}{best ? ` · Best ${formatWeight(best.weight)}` : ''}</>
                    : allDone ? `${summarizeSets(exercise.sets)} · done` : `${summarizeSets(exercise.sets)}${last ? ' · prefilled' : ''}`}
                </span>
                <span className={`ex-count${allDone ? ' is-done' : ''}`} aria-label={`${completed} of ${exercise.sets.length} sets done`}>
                  {allDone ? <Icon name="check" size={20} /> : `${completed}/${exercise.sets.length}`}
                </span>
              </button>
              {isActive && <>
                <div className="set-grid" role="group" aria-label={`${exercise.name} sets`}>
                  <div className="set-row set-labels" aria-hidden="true">
                    <span>Set</span><span>Target</span><span>lb</span><span>Reps</span><span />
                  </div>
                  {exercise.sets.map((item, setIndex) => {
                    const focused = pointer?.setIndex === setIndex;
                    return (
                      <div key={setIndex} className={`set-row${focused ? ' is-focused' : ''}${item.completed ? ' is-complete' : ''}`}>
                        <button type="button" className="set-main" aria-current={focused ? 'step' : undefined}
                          aria-label={`Edit set ${setIndex + 1}: ${item.actualReps} reps at ${formatWeight(item.actualWeight)} pounds${item.completed ? ', done' : ''}${item.rpe ? `, effort RPE ${item.rpe}` : ''}`}
                          onClick={() => setFocus({ exerciseIndex, setIndex })}>
                          <span className="set-num">{setIndex + 1}</span>
                          <span className="set-target">{item.reps}</span>
                          <span className="set-val">{formatWeight(item.actualWeight)}</span>
                          <span className="set-val">{item.actualReps}{item.rpe ? <small className="rpe-tag">RPE {item.rpe}</small> : null}</span>
                        </button>
                        <button type="button" className="set-check" aria-pressed={item.completed}
                          aria-label={item.completed ? `Set ${setIndex + 1} done. Mark not done` : `Mark set ${setIndex + 1} done`}
                          onClick={() => (item.completed ? uncompleteSet(exerciseIndex, setIndex) : completeSet(exerciseIndex, setIndex))}>
                          <Icon name="check" size={24} />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="ex-actions">
                  <button type="button" className="ghost-btn" onClick={() => addSet(exerciseIndex)}><Icon name="plus" size={20} /> Add set</button>
                  <VideoGuideLink name={exercise.name} />
                  {exercise.sets.length > 1 && pointer && (
                    <button type="button" className="ghost-btn" aria-label={`Remove set ${pointer.setIndex + 1}`} onClick={() => removeSet(exerciseIndex, pointer.setIndex)}>Remove set</button>
                  )}
                  <button type="button" className="icon-btn ghost-danger" aria-label={`Remove ${exercise.name}`} onClick={() => removeExercise(exerciseIndex)}>
                    <Icon name="trash" size={22} />
                  </button>
                </div>
              </>}
            </li>
          );
        })}
      </ol>

      <section className="add-row" aria-labelledby="add-title">
        <h2 id="add-title" className="section-title">Add exercise</h2>
        <div className="chip-row wrap">
          {recent.map((item) => (
            <button type="button" key={item.id} className="chip chip-lg" onClick={() => addExercise(item)}><Icon name="plus" size={18} /> {item.name}</button>
          ))}
          <button type="button" className="chip chip-lg" onClick={() => openSheet(planPath(dayKey, 'add'))}>More…</button>
        </div>
      </section>

      <button type="button" className="ghost-btn ghost-danger wide" onClick={discardWorkout}><Icon name="trash" size={20} /> Discard workout</button>
    </div>
  );
}
