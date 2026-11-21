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

/** Weekday (0 = Sunday … 6 = Saturday) → template id, or null for a rest day. */
export type WeekPlan = Record<number, string | null>;

export interface AppState {
  workouts: Workout[];
  activeWorkout: Workout | null;
  templates: Template[];
  /** Recurring weekly schedule. Added in the Dadbod Fitness redesign; defaults fill in for older saves. */
  weekPlan: WeekPlan;
  /** One-off changes to the plan for a specific day (YYYY-MM-DD): moved or skipped sessions. */
  planOverrides: Record<string, string | null>;
  /** First day the plan counts from (YYYY-MM-DD); planned days before it are never "missed". */
  planStart: string;
  /** Epoch ms when the inline rest timer ends, or null when no rest is running. */
  restEndsAt: number | null;
  /** Total length of the current rest in seconds, for the progress bar. */
  restDuration: number;
}
