import { describe, expect, it } from 'vitest';
import type { Workout, WorkoutSet } from '../../types/domain';
import { averageRpe, formatRpe, ratedSetCount, workoutRpe } from '../workouts';
import { convertLegacySet } from '../legacy';

const set = (over: Partial<WorkoutSet>): WorkoutSet => ({
  reps: 5, weight: 100, rest: 90, type: 'working', actualReps: 5, actualWeight: 100, completed: true, ...over,
});

describe('averageRpe', () => {
  it('averages rated completed sets only', () => {
    expect(averageRpe([set({ rpe: 8 }), set({ rpe: 9 }), set({})])).toBe(8.5);
  });
  it('ignores ratings on sets that were not completed', () => {
    expect(averageRpe([set({ rpe: 10, completed: false })])).toBeNull();
  });
  it('is null when nothing is rated', () => {
    expect(averageRpe([set({}), set({})])).toBeNull();
  });
});

describe('workoutRpe / ratedSetCount', () => {
  const workout = {
    exercises: [
      { exerciseId: 'a', name: 'A', muscle: 'X', sets: [set({ rpe: 7 }), set({ rpe: 9 })] },
      { exerciseId: 'b', name: 'B', muscle: 'Y', sets: [set({}), set({ rpe: 10, completed: false })] },
    ],
  } as unknown as Workout;
  it('rolls up across exercises', () => {
    expect(workoutRpe(workout)).toBe(8);
    expect(ratedSetCount(workout)).toBe(2);
  });
});

describe('formatRpe', () => {
  it('drops the trailing zero', () => {
    expect(formatRpe(8)).toBe('8');
    expect(formatRpe(8.5)).toBe('8.5');
    expect(formatRpe(8.25)).toBe('8.3');
  });
});

describe('convertLegacySet rpe passthrough', () => {
  it('keeps a valid rating from a redesign backup', () => {
    expect(convertLegacySet({ reps: 5, weight: 100, rpe: 9 }).rpe).toBe(9);
  });
  it('drops out-of-range ratings', () => {
    expect(convertLegacySet({ reps: 5, weight: 100, rpe: 42 }).rpe).toBeUndefined();
    expect(convertLegacySet({ reps: 5, weight: 100 }).rpe).toBeUndefined();
  });
});
