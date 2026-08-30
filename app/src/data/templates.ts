import type { Template, WorkoutExercise } from '../types/domain';

const workingSets = (reps: number, rest: number, count = 3) =>
  Array.from({ length: count }, () => ({
    reps,
    weight: 0,
    rest,
    type: 'working' as const,
    actualReps: reps,
    actualWeight: 0,
    completed: false,
  }));

const exercise = (exerciseId: string, name: string, muscle: string, reps: number, rest: number, count = 3): WorkoutExercise => ({
  exerciseId, name, muscle, sets: workingSets(reps, rest, count),
});

export const defaultTemplates: Template[] = [
  {
    id: 'push-day', name: 'Push Day',
    nutrition: {
      pre: 'Eat a carb-heavy meal 1.5–2 hours before training.',
      post: 'Get 35–40g of protein within 90 minutes.',
      summary: 'Carbs before · protein after',
    },
    exercises: [
      exercise('barbell-bench-press', 'Barbell Bench Press', 'Chest', 8, 90),
      exercise('incline-bench-press', 'Incline Bench Press', 'Chest', 10, 75),
      exercise('overhead-press', 'Overhead Press', 'Shoulders', 10, 75),
      exercise('lateral-raise', 'Lateral Raise', 'Shoulders', 15, 45),
      exercise('tricep-pushdown', 'Tricep Pushdown', 'Triceps', 12, 60),
    ],
  },
  {
    id: 'pull-day', name: 'Pull Day',
    nutrition: {
      pre: 'Have slow-burn carbs about two hours before lifting.',
      post: 'Get 30–40g protein and fast carbs after the session.',
      summary: 'Slow carbs before · protein + carbs after',
    },
    exercises: [
      exercise('deadlift', 'Deadlift', 'Back', 5, 120),
      exercise('barbell-row', 'Barbell Row', 'Back', 8, 90),
      exercise('pull-up', 'Pull-up', 'Back', 8, 75),
      exercise('face-pull', 'Face Pull', 'Shoulders', 15, 45),
      exercise('barbell-curl', 'Barbell Curl', 'Biceps', 10, 60),
    ],
  },
  {
    id: 'leg-day', name: 'Leg Day',
    nutrition: {
      pre: 'Bring carbs. Leg training is not a fasted-heroism event.',
      post: 'Eat protein and carbs, then recover hard.',
      summary: 'Fuel the work · recover deliberately',
    },
    exercises: [
      exercise('barbell-squat', 'Barbell Squat', 'Legs', 8, 120),
      exercise('romanian-deadlift', 'Romanian Deadlift', 'Legs', 10, 90),
      exercise('leg-press', 'Leg Press', 'Legs', 12, 90),
      exercise('leg-curl', 'Leg Curl', 'Legs', 12, 60),
      exercise('calf-raise', 'Standing Calf Raise', 'Legs', 15, 45),
    ],
  },
];
