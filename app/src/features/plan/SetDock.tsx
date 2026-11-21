import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { RestTimerBar } from '../../components/RestTimerBar';
import { Stepper } from '../../components/Stepper';
import { useChromeHeight } from '../../lib/hooks';
import { formatWeight, isValidPointer, lastPerformance, nextIncomplete, summarizeSets, type SetPointer } from '../../lib/workouts';
import { useAppStore } from '../../store/useAppStore';
import type { Workout } from '../../types/domain';

const CHIPS = [-5, 2.5, 5, 10];

const RPE_VALUES = [5, 6, 7, 8, 9, 10];

export function pointerLabel(workout: Workout, pointer: SetPointer | null): string | null {
  if (!isValidPointer(workout, pointer)) return null;
  const exercise = workout.exercises[pointer.exerciseIndex];
  const set = exercise.sets[pointer.setIndex];
  const load = set.actualWeight > 0 ? `${set.actualReps} × ${formatWeight(set.actualWeight)} lb` : `${set.actualReps} reps`;
  return `${exercise.name}, set ${pointer.setIndex + 1}: ${load}`;
}

/**
 * The logging controls live in a glass dock in the thumb zone: weight stepper, plate chips,
 * reps stepper and a big Done. The list above stays readable and scrollable.
 */
export function SetDock({ workout, onFinish }: { workout: Workout; onFinish: () => void }) {
  const focus = useAppStore((state) => state.focus);
  const workouts = useAppStore((state) => state.workouts);
  const updateSet = useAppStore((state) => state.updateSet);
  const setRpe = useAppStore((state) => state.setRpe);
  const completeSet = useAppStore((state) => state.completeSet);
  const uncompleteSet = useAppStore((state) => state.uncompleteSet);
  const repeatLastSet = useAppStore((state) => state.repeatLastSet);
  const [collapsed, setCollapsed] = useState(false);
  const ref = useChromeHeight<HTMLDivElement>('--dock-h');

  const pointer = isValidPointer(workout, focus) ? focus : nextIncomplete(workout);
  const restNext = pointerLabel(workout, pointer);
  const done = workout.exercises.reduce((sum, exercise) => sum + exercise.sets.filter((item) => item.completed).length, 0);

  if (!pointer) {
    return (
      <div className="dock-stack" ref={ref}>
        <div className="dock glass dock-finish">
          <p className="dock-finish-copy"><strong>{done ? `All ${done} sets logged` : 'Add an exercise to begin'}</strong>
            {done ? <span>Nice work. Wrap it up when you’re ready.</span> : <span>Pick one below and its sets prefill from last time.</span>}</p>
          {done > 0 && <button type="button" className="cta" onClick={onFinish}><Icon name="flag" /> Finish workout</button>}
        </div>
      </div>
    );
  }

  const { exerciseIndex, setIndex } = pointer;
  const exercise = workout.exercises[exerciseIndex];
  const current = exercise.sets[setIndex];
  const last = lastPerformance(workouts, exercise.exerciseId);
  const canRepeat = exercise.sets.some((item, index) => item.completed && index !== setIndex);

  return (
    <div className="dock-stack" ref={ref}>
      <RestTimerBar nextLabel={restNext} />
      <section className={`dock glass${collapsed ? ' is-collapsed' : ''}`} aria-label="Log set">
        <div className="dock-head">
          <button type="button" className="dock-title" aria-expanded={!collapsed} onClick={() => setCollapsed((value) => !value)}>
            <strong>{exercise.name}</strong>
            <span>Set {setIndex + 1} of {exercise.sets.length}{last ? ` · Last ${summarizeSets(last)}` : ' · First time'}</span>
            <span className="visually-hidden">{collapsed ? 'Show set controls' : 'Hide set controls'}</span>
          </button>
          {collapsed
            ? <button type="button" className="cta cta-compact" onClick={() => completeSet(exerciseIndex, setIndex)} disabled={current.completed}><Icon name="check" /> Done</button>
            : canRepeat && <button type="button" className="glass-btn" onClick={() => repeatLastSet(exerciseIndex, setIndex)}><Icon name="repeat" size={20} /> Repeat last</button>}
        </div>
        {!collapsed && <>
          <Stepper label="Weight" unit="lb" decimal step={5} value={current.actualWeight}
            onChange={(value) => updateSet(exerciseIndex, setIndex, 'actualWeight', value)} />
          <div className="plate-chips" role="group" aria-label="Quick weight change">
            {CHIPS.map((chip) => (
              <button type="button" key={chip} className="chip chip-plate" aria-label={`${chip > 0 ? 'Add' : 'Remove'} ${Math.abs(chip)} pounds`}
                onClick={() => updateSet(exerciseIndex, setIndex, 'actualWeight', current.actualWeight + chip)}>
                {chip > 0 ? `+${formatWeight(chip)}` : `−${formatWeight(Math.abs(chip))}`}
              </button>
            ))}
          </div>
          <div className="dock-row">
            <Stepper label="Reps" step={1} max={100} value={current.actualReps}
              onChange={(value) => updateSet(exerciseIndex, setIndex, 'actualReps', value)} />
            {current.completed
              ? <button type="button" className="glass-btn done-btn" onClick={() => uncompleteSet(exerciseIndex, setIndex)}>Mark not done</button>
              : <button type="button" className="cta done-btn" onClick={() => { navigator.vibrate?.(12); completeSet(exerciseIndex, setIndex); }}>
                  <Icon name="check" size={28} /> Done
                </button>}
          </div>
          <div className="effort-row" role="group" aria-label={`Effort for ${exercise.name} set ${setIndex + 1}, RPE`}>
            <span className="effort-tag" aria-hidden="true">Effort</span>
            {RPE_VALUES.map((value) => (
              <button type="button" key={value} className="effort-chip" aria-pressed={current.rpe === value}
                aria-label={`RPE ${value}${current.rpe === value ? ', selected. Tap again to clear' : ''}`}
                onClick={() => setRpe(exerciseIndex, setIndex, current.rpe === value ? null : value)}>
                {value}
              </button>
            ))}
          </div>
        </>}
      </section>
    </div>
  );
}
