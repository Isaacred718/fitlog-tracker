import type { Workout, WorkoutSet } from '../types/domain';

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

export function formatDuration(milliseconds: number): string {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
