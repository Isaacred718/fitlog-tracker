import { describe, expect, it } from 'vitest';
import {
  convertLegacyState, migrateLegacyStorage, resolveExerciseId, weekPlanForTemplates,
  LEGACY_KEY, STORE_KEY,
} from '../legacy';

const legacySave = {
  _schemaVersion: 2,
  templates: [
    { id: 'tpl-pull', name: 'Pull Day', exercises: [
      { exerciseId: 'deadlift', name: 'Deadlift', muscle: 'Back', sets: [{ reps: 5, weight: 245, rest: 120, type: 'working' }] },
      { exerciseId: 'bench-press', name: 'Bench Press', muscle: 'Chest', sets: [{ reps: 5, weight: 135, rest: 90, type: 'warmup' }] },
    ]},
  ],
  workouts: [
    { id: 'w1', templateId: 'tpl-pull', name: 'Pull Day', date: '2026-11-16T23:00:00.000Z', startTime: 1794877200000, endTime: 1794880920000, duration: 3720000,
      exercises: [
        { exerciseId: 'bench-press', name: 'Bench Press', muscle: 'Chest', sets: [
          { reps: 8, weight: 150, rest: 90, type: 'working', actualReps: null, actualWeight: null, completed: true },
          { reps: 8, weight: 150, rest: 90, type: 'working', actualReps: 7, actualWeight: 150, completed: true },
          { reps: 8, weight: 150, rest: 90, type: 'bogus', actualReps: 8, actualWeight: 150, completed: false },
        ]},
      ]},
    'not-a-record',
    null,
  ],
  activeWorkout: { id: 'live', name: 'Leg Day', date: '2026-11-21T15:00:00.000Z', startTime: 1795251600000,
    exercises: [{ exerciseId: 'standing-calf-raise', name: 'Standing Calf Raise', muscle: 'Legs', sets: [{ reps: 12, weight: 90, rest: 45 }] }] },
  measurements: [{ id: 'm1', date: '2026-11-01', values: { weight: 205 } }],
  settings: { bodyWeight: 205 },
};

describe('convertLegacyState', () => {
  const converted = convertLegacyState(legacySave)!;
  it('keeps workouts and templates, drops non-record entries', () => {
    expect(converted.workouts).toHaveLength(1);
    expect(converted.workouts[0].id).toBe('w1');
    expect(converted.templates).toHaveLength(1);
    expect(converted.activeWorkout?.id).toBe('live');
  });
  it('falls null actuals back to the planned numbers', () => {
    const set = converted.workouts[0].exercises[0].sets[0];
    expect([set.actualReps, set.actualWeight, set.completed]).toEqual([8, 150, true]);
  });
  it('keeps recorded actuals and repairs an unknown set type', () => {
    const sets = converted.workouts[0].exercises[0].sets;
    expect(sets[1].actualReps).toBe(7);
    expect(sets[2].type).toBe('working');
  });
  it('remaps renamed catalog exercises', () => {
    expect(converted.workouts[0].exercises[0].exerciseId).toBe('barbell-bench-press');
    expect(converted.activeWorkout?.exercises[0].exerciseId).toBe('calf-raise');
    expect(converted.templates[0].exercises[0].exerciseId).toBe('deadlift');
  });
  it('rejects non-object saves', () => {
    expect(convertLegacyState(null)).toBeNull();
    expect(convertLegacyState('liftTracker')).toBeNull();
    expect(convertLegacyState([1, 2])).toBeNull();
  });
});

describe('resolveExerciseId', () => {
  it('prefers the alias table, then catalog ids, then name matches', () => {
    expect(resolveExerciseId('face-pulls', 'Face Pulls')).toBe('face-pull');
    expect(resolveExerciseId('barbell-back-squat', 'Barbell Back Squat')).toBe('barbell-squat');
    expect(resolveExerciseId('deadlift', 'Deadlift')).toBe('deadlift');
    expect(resolveExerciseId('standing-calf-raise', 'Standing Calf Raise')).toBe('calf-raise');
    expect(resolveExerciseId('seated-cable-row', 'Seated Cable Row')).toBe('seated-cable-row');
    expect(resolveExerciseId('', 'Sled Push')).toBe('sled-push');
  });
});

describe('weekPlanForTemplates', () => {
  it('rebuilds the week from starter template names', () => {
    const plan = weekPlanForTemplates([
      { id: 'a', name: 'Push Day', exercises: [] },
      { id: 'b', name: 'leg day', exercises: [] },
      { id: 'c', name: 'Custom', exercises: [] },
    ]);
    expect(plan[1]).toBe('a');
    expect(plan[3]).toBeNull();
    expect(plan[5]).toBe('b');
  });
});

describe('migrateLegacyStorage', () => {
  const fakeStorage = (entries: Record<string, string>) => {
    const map = new Map(Object.entries(entries));
    return {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => { map.set(key, value); },
      map,
    };
  };
  it('seeds the redesign envelope from a legacy save and leaves the legacy key alone', () => {
    const storage = fakeStorage({ [LEGACY_KEY]: JSON.stringify(legacySave) });
    expect(migrateLegacyStorage(storage)).toBe(true);
    const envelope = JSON.parse(storage.map.get(STORE_KEY)!);
    expect(envelope.version).toBe(0);
    expect(envelope.state.workouts).toHaveLength(1);
    expect(envelope.state.templates).toHaveLength(1);
    expect(envelope.state.weekPlan[3]).toBe('tpl-pull');
    expect(envelope.state.planStart).toBe('2026-11-16');
    expect(storage.map.get(LEGACY_KEY)).toBe(JSON.stringify(legacySave));
  });
  it('does nothing when the redesign already has state', () => {
    const storage = fakeStorage({ [LEGACY_KEY]: JSON.stringify(legacySave), [STORE_KEY]: '{"state":{},"version":0}' });
    expect(migrateLegacyStorage(storage)).toBe(false);
  });
  it('does nothing for a corrupt or empty legacy save', () => {
    expect(migrateLegacyStorage(fakeStorage({ [LEGACY_KEY]: '{oops' }))).toBe(false);
    expect(migrateLegacyStorage(fakeStorage({ [LEGACY_KEY]: JSON.stringify({ workouts: [], templates: [], activeWorkout: null }) }))).toBe(false);
    expect(migrateLegacyStorage(fakeStorage({}))).toBe(false);
  });
});
