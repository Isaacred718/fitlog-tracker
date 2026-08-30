export type SetType =
  | 'warmup'
  | 'working'
  | 'dropset'
  | 'failure'
  | 'amrap'
  | 'tempo'
  | 'pause'
  | 'cluster'
  | 'backoff';

export interface WorkoutSet {
  reps: number;
  weight: number;
  rest: number;
  type: SetType;
  actualReps: number;
  actualWeight: number;
  completed: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  muscle: string;
  sets: WorkoutSet[];
  supersetGroup?: number | null;
}

export interface Workout {
  id: string;
  templateId: string | null;
  name: string;
  date: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  exercises: WorkoutExercise[];
}

export interface Template {
  id: string;
  name: string;
  nutrition?: {
    pre: string;
    post: string;
    summary: string;
  };
  exercises: WorkoutExercise[];
}

export interface AppState {
  workouts: Workout[];
  activeWorkout: Workout | null;
  templates: Template[];
}
