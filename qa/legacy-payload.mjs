// A realistic legacy (vanilla app, schema v2) localStorage payload, shaped
// exactly like the root app writes it under the `liftTracker` key.
const iso = (day, h = 18) => new Date(`${day}T${h}:00:00`).toISOString();
const ts = (day, h = 18) => new Date(`${day}T${h}:00:00`).getTime();
const done = (reps, weight, rest = 90, type = 'working') => ({ reps, weight, rest, type, actualReps: reps, actualWeight: weight, completed: true });
const planned = (reps, weight, rest = 90, type = 'working') => ({ reps, weight, rest, type });

export const legacyState = {
  _schemaVersion: 2,
  templates: [
    { id: 'tpl-pull', name: 'Pull Day', exercises: [
      { exerciseId: 'deadlift', name: 'Deadlift', muscle: 'Back', sets: [planned(5, 245, 120), planned(5, 245, 120), planned(5, 245, 120)] },
      { exerciseId: 'bench-press', name: 'Bench Press', muscle: 'Chest', sets: [planned(5, 135, 90, 'warmup'), planned(8, 150, 90), planned(8, 150, 90)] },
    ]},
    { id: 'tpl-legs', name: 'Leg Day', exercises: [
      { exerciseId: 'barbell-squat', name: 'Barbell Squat', muscle: 'Legs', sets: [planned(5, 185, 120), planned(5, 185, 120), planned(5, 185, 120)] },
    ]},
  ],
  workouts: [
    { id: 'w-nov9', templateId: 'tpl-pull', name: 'Pull Day', date: iso('2026-11-09'), startTime: ts('2026-11-09'), endTime: ts('2026-11-09', 19), duration: 3600000,
      exercises: [
        { exerciseId: 'deadlift', name: 'Deadlift', muscle: 'Back', sets: [done(5, 235, 120), done(5, 235, 120), done(5, 235, 120)] },
        { exerciseId: 'bench-press', name: 'Bench Press', muscle: 'Chest', sets: [done(8, 145), done(8, 145), done(7, 145)] },
      ]},
    { id: 'w-nov16', templateId: 'tpl-pull', name: 'Pull Day', date: iso('2026-11-16'), startTime: ts('2026-11-16'), endTime: ts('2026-11-16', 19), duration: 3720000,
      exercises: [
        { exerciseId: 'deadlift', name: 'Deadlift', muscle: 'Back', sets: [done(5, 245, 120), done(5, 245, 120), done(5, 245, 120)] },
        // One set the user never edited: vanilla leaves the actuals null and
        // its volume math falls back to the planned numbers.
        { exerciseId: 'bench-press', name: 'Bench Press', muscle: 'Chest', sets: [
          { reps: 8, weight: 150, rest: 90, type: 'working', actualReps: null, actualWeight: null, completed: true },
          done(8, 150), done(8, 150),
        ]},
      ]},
    { id: 'w-nov18', templateId: 'tpl-legs', name: 'Leg Day', date: iso('2026-11-18'), startTime: ts('2026-11-18'), endTime: ts('2026-11-18', 19), duration: 3540000,
      exercises: [
        { exerciseId: 'barbell-squat', name: 'Barbell Squat', muscle: 'Legs', sets: [done(5, 185, 120), done(5, 185, 120), done(4, 185, 120)] },
      ]},
  ],
  measurements: [{ id: 'm1', date: '2026-11-01', values: { weight: 205, waist: 36 } }],
  customExercises: [{ id: 'custom-sled', name: 'Sled Push', muscle: 'Legs' }],
  settings: { bodyWeight: 205 },
  profile: null,
  heartRateData: [],
  activeWorkout: null,
};
export const legacyJSON = JSON.stringify(legacyState);
