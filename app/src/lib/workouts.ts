import type { Workout, WorkoutExercise, WorkoutSet } from '../types/domain';

export function createId(): string {
  return crypto.randomUUID();
}

export function setVolume(set: WorkoutSet): number {
  return set.completed ? set.actualReps * set.actualWeight : 0;
}

export function workoutVolume(workout: Workout): number {
  return workout.exercises.reduce(
    (total, exercise) => total + exercise.sets.reduce((sum, set) => sum + setVolume(set), 0),
    0,
  );
}

export function completedSetCount(workout: Workout): number {
  return workout.exercises.reduce(
    (total, exercise) => total + exercise.sets.filter((set) => set.completed).length,
    0,
  );
}

export function totalSetCount(workout: { exercises: WorkoutExercise[] }): number {
  return workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
}

export function formatDuration(milliseconds: number): string {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
}

/** 135 → "135", 132.5 → "132.5" */
export function formatWeight(weight: number): string {
  return Number.isInteger(weight) ? String(weight) : weight.toFixed(1).replace(/\.0$/, '');
}

/** Newest first. */
export function sortedHistory(workouts: Workout[]): Workout[] {
  return [...workouts].sort((a, b) => b.startTime - a.startTime);
}

/** Completed sets from the most recent finished workout that logged this exercise. */
export function lastPerformance(workouts: Workout[], exerciseId: string): WorkoutSet[] | null {
  for (const workout of sortedHistory(workouts)) {
    const exercise = workout.exercises.find((item) => item.exerciseId === exerciseId);
    const done = exercise?.sets.filter((set) => set.completed) ?? [];
    if (done.length) return done;
  }
  return null;
}

/** Heaviest completed set ever logged for the exercise (ties broken by reps). */
export function bestSet(workouts: Workout[], exerciseId: string): { weight: number; reps: number } | null {
  let best: { weight: number; reps: number } | null = null;
  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      if (exercise.exerciseId !== exerciseId) continue;
      for (const set of exercise.sets) {
        if (!set.completed) continue;
        if (!best || set.actualWeight > best.weight || (set.actualWeight === best.weight && set.actualReps > best.reps)) {
          best = { weight: set.actualWeight, reps: set.actualReps };
        }
      }
    }
  }
  return best;
}

/**
 * Compact summary used for "Last: 3×8 @ 130" and collapsed exercise lines.
 * Uniform sets collapse to N×reps @ weight; mixed sets show the top set.
 */
export function summarizeSets(sets: WorkoutSet[], source: 'actual' | 'planned' = 'actual'): string {
  if (!sets.length) return 'No sets';
  const reps = sets.map((set) => (source === 'actual' ? set.actualReps : set.reps));
  const weights = sets.map((set) => (source === 'actual' ? set.actualWeight : set.weight));
  const uniform = reps.every((value) => value === reps[0]) && weights.every((value) => value === weights[0]);
  if (uniform) return weights[0] > 0 ? `${sets.length}×${reps[0]} @ ${formatWeight(weights[0])}` : `${sets.length}×${reps[0]}`;
  const top = Math.max(...weights);
  const topReps = reps[weights.indexOf(top)];
  return top > 0 ? `${sets.length} sets · top ${formatWeight(top)}×${topReps}` : `${sets.length} sets`;
}

/** Carry last session's numbers forward so an unchanged set is one tap. */
export function prefillSets(planned: WorkoutSet[], last: WorkoutSet[] | null): WorkoutSet[] {
  return planned.map((set, index) => {
    const source = last ? last[index] ?? last[last.length - 1] : null;
    const weight = source ? source.actualWeight : set.weight;
    const reps = source ? source.actualReps : set.reps;
    // A fresh session starts unrated: effort is an outcome, never a plan.
    return { ...set, weight, actualWeight: weight, actualReps: reps, completed: false, rpe: undefined };
  });
}

/** Mean RPE over completed sets that were rated; null when nothing was rated. */
export function averageRpe(sets: WorkoutSet[]): number | null {
  const rated = sets.filter((set) => set.completed && typeof set.rpe === 'number');
  if (!rated.length) return null;
  return rated.reduce((sum, set) => sum + (set.rpe ?? 0), 0) / rated.length;
}

export function workoutRpe(workout: Workout): number | null {
  return averageRpe(workout.exercises.flatMap((exercise) => exercise.sets));
}

export function ratedSetCount(workout: Workout): number {
  return workout.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.filter((set) => set.completed && typeof set.rpe === 'number').length, 0);
}

/** 8 -> "8", 8.5 -> "8.5": one decimal, no trailing zero. */
export function formatRpe(value: number): string {
  return (Math.round(value * 10) / 10).toString();
}

export function prefillExercise(exercise: WorkoutExercise, workouts: Workout[]): WorkoutExercise {
  return { ...exercise, sets: prefillSets(exercise.sets, lastPerformance(workouts, exercise.exerciseId)) };
}

export interface SetPointer { exerciseIndex: number; setIndex: number }

/** First incomplete set at or after the pointer, wrapping to the start of the workout. */
export function nextIncomplete(workout: Workout, from?: SetPointer): SetPointer | null {
  const flat: SetPointer[] = [];
  workout.exercises.forEach((exercise, exerciseIndex) => exercise.sets.forEach((_, setIndex) => flat.push({ exerciseIndex, setIndex })));
  const start = from ? Math.max(0, flat.findIndex((p) => p.exerciseIndex === from.exerciseIndex && p.setIndex === from.setIndex)) : 0;
  for (let offset = 0; offset < flat.length; offset += 1) {
    const pointer = flat[(start + offset) % flat.length];
    if (!workout.exercises[pointer.exerciseIndex].sets[pointer.setIndex].completed) return pointer;
  }
  return null;
}

export function isValidPointer(workout: Workout, pointer: SetPointer | null): pointer is SetPointer {
  return !!pointer && !!workout.exercises[pointer.exerciseIndex]?.sets[pointer.setIndex];
}

/** Exercises in this workout whose top set beats every earlier session. */
export function workoutPRs(workout: Workout, history: Workout[]): string[] {
  const previous = history.filter((item) => item.id !== workout.id && item.startTime < workout.startTime);
  return workout.exercises.filter((exercise) => {
    const top = Math.max(0, ...exercise.sets.filter((set) => set.completed).map((set) => set.actualWeight));
    const before = bestSet(previous, exercise.exerciseId);
    return top > 0 && !!before && top > before.weight;
  }).map((exercise) => exercise.name);
}
