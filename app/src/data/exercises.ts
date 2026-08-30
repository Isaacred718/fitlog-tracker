export interface ExerciseOption {
  id: string;
  name: string;
  muscle: string;
}

export const exerciseOptions: ExerciseOption[] = [
  ['barbell-bench-press', 'Barbell Bench Press', 'Chest'], ['incline-bench-press', 'Incline Bench Press', 'Chest'],
  ['dumbbell-fly', 'Dumbbell Fly', 'Chest'], ['overhead-press', 'Overhead Press', 'Shoulders'],
  ['lateral-raise', 'Lateral Raise', 'Shoulders'], ['tricep-pushdown', 'Tricep Pushdown', 'Triceps'],
  ['deadlift', 'Deadlift', 'Back'], ['barbell-row', 'Barbell Row', 'Back'], ['pull-up', 'Pull-up', 'Back'],
  ['lat-pulldown', 'Lat Pulldown', 'Back'], ['face-pull', 'Face Pull', 'Shoulders'], ['barbell-curl', 'Barbell Curl', 'Biceps'],
  ['barbell-squat', 'Barbell Squat', 'Legs'], ['romanian-deadlift', 'Romanian Deadlift', 'Legs'],
  ['leg-press', 'Leg Press', 'Legs'], ['leg-curl', 'Leg Curl', 'Legs'], ['calf-raise', 'Standing Calf Raise', 'Legs'],
  ['plank', 'Plank', 'Core'], ['cable-crunch', 'Cable Crunch', 'Core'],
].map(([id, name, muscle]) => ({ id, name, muscle }));
