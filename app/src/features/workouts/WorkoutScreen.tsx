import { useEffect, useState } from 'react';
import { exerciseOptions } from '../../data/exercises';
import { completedSetCount, formatDuration } from '../../lib/workouts';
import { useAppStore } from '../../store/useAppStore';

export function WorkoutScreen() {
  const workout = useAppStore((state) => state.activeWorkout);
  const addExercise = useAppStore((state) => state.addExercise);
  const addSet = useAppStore((state) => state.addSet);
  const updateSet = useAppStore((state) => state.updateSet);
  const toggleSet = useAppStore((state) => state.toggleSet);
  const finishWorkout = useAppStore((state) => state.finishWorkout);
  const [now, setNow] = useState(Date.now());
  const [restUntil, setRestUntil] = useState<number | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => {
    if (restUntil === null) return;
    const timer = window.setTimeout(() => setRestUntil(null), Math.max(0, restUntil - Date.now()));
    return () => window.clearTimeout(timer);
  }, [restUntil]);
  if (!workout) return null;

  return <>
    <section className="workout-heading"><div><p className="eyebrow">Workout in progress</p><h1>{workout.name}</h1></div><strong>{formatDuration(now - workout.startTime)}</strong></section>
    {restUntil !== null && <aside className="rest-timer" role="status">Rest timer: {formatDuration(Math.max(0, restUntil - now))} <button onClick={() => setRestUntil(null)}>Skip</button></aside>}
    {workout.exercises.map((exercise, exerciseIndex) => <section className="exercise-card" key={exercise.exerciseId}>
      <h2>{exercise.name}</h2><p>{exercise.muscle}</p>
      <div className="set-heading"><span>Set</span><span>Reps</span><span>Weight</span><span>Rest</span><span>Done</span></div>
      {exercise.sets.map((workoutSet, setIndex) => <div className="set-row" key={setIndex}>
        <span>{setIndex + 1}</span>
        <input aria-label={`${exercise.name} set ${setIndex + 1} reps`} type="number" value={workoutSet.actualReps} onChange={(event) => updateSet(exerciseIndex, setIndex, 'actualReps', Number(event.target.value))} />
        <input aria-label={`${exercise.name} set ${setIndex + 1} weight`} type="number" value={workoutSet.actualWeight} onChange={(event) => updateSet(exerciseIndex, setIndex, 'actualWeight', Number(event.target.value))} />
        <input aria-label={`${exercise.name} set ${setIndex + 1} rest`} type="number" value={workoutSet.rest} onChange={(event) => updateSet(exerciseIndex, setIndex, 'rest', Number(event.target.value))} />
        <button className={workoutSet.completed ? 'done' : ''} onClick={() => { toggleSet(exerciseIndex, setIndex); if (!workoutSet.completed && workoutSet.rest > 0) setRestUntil(Date.now() + workoutSet.rest * 1000); }}>{workoutSet.completed ? '✓' : '○'}</button>
      </div>)}
      <button className="secondary" onClick={() => addSet(exerciseIndex)}>+ Add set</button>
    </section>)}
    <label className="exercise-picker">Add an exercise<select defaultValue="" onChange={(event) => { const selected = exerciseOptions.find((item) => item.id === event.target.value); if (selected) addExercise(selected); event.currentTarget.value = ''; }}><option value="" disabled>Select an exercise</option>{exerciseOptions.map((option) => <option value={option.id} key={option.id}>{option.name} · {option.muscle}</option>)}</select></label>
    <button className="finish" disabled={completedSetCount(workout) === 0} onClick={finishWorkout}>Finish workout ({completedSetCount(workout)} sets)</button>
  </>;
}
