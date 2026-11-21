import type { AppState, SetType, Template, Workout, WorkoutExercise, WorkoutSet } from '../types/domain';
import { exerciseOptions } from '../data/exercises';
import { createId } from './workouts';
import { todayKey, workoutDayKey } from './dates';

/**
 * One-time carry-over from the legacy app.
 *
 * The pre-redesign app (root index.html) stores its whole state as raw JSON
 * under the `liftTracker` key (schema v2). The redesign persists through
 * zustand under `liftTracker-v3` with a { state, version } envelope, so
 * without this step the redesign opens empty for every existing user.
 *
 * On first launch, if the redesign has no saved state yet but a legacy save
 * exists, the legacy workouts, templates and in-progress session are
 * converted and written as the redesign's initial state. The legacy key is
 * deliberately left untouched: the root app still owns it (cloud sync,
 * measurements and heart-rate data the redesign does not model yet).
 */

export const LEGACY_KEY = 'liftTracker';
export const STORE_KEY = 'liftTracker-v3';

const SET_TYPES: SetType[] = ['warmup', 'working', 'dropset', 'failure', 'amrap', 'tempo', 'pause', 'cluster', 'backoff'];

// The legacy catalog keyed exercises by name slug (Bench Press ->
// bench-press) and its starter templates used a few ids of their own. The
// redesign catalog renamed some entries; map the old ids onto the new ones
// so Library bests and last-session prefill line up with existing history.
export const EXERCISE_ID_ALIASES: Record<string, string> = {
  'bench-press': 'barbell-bench-press',
  'dumbbell-chest-fly': 'dumbbell-fly',
  'face-pulls': 'face-pull',
  'barbell-bicep-curl': 'barbell-curl',
  'barbell-back-squat': 'barbell-squat',
};

const catalogByName = new Map(exerciseOptions.map((option) => [option.name.toLowerCase(), option.id]));
const catalogIds = new Set(exerciseOptions.map((option) => option.id));

export function resolveExerciseId(legacyId: string, name: string): string {
  if (legacyId && EXERCISE_ID_ALIASES[legacyId]) return EXERCISE_ID_ALIASES[legacyId];
  if (legacyId && catalogIds.has(legacyId)) return legacyId;
  const byName = catalogByName.get(name.trim().toLowerCase());
  if (byName) return byName;
  if (legacyId) return legacyId;
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'exercise';
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

/** Finite, non-negative number, coerced from strings; otherwise the fallback. */
const num = (value: unknown, fallback: number, max: number): number => {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.min(parsed, max) : fallback;
};

/** Legacy actuals are null (or absent) when the set was never edited; the
 *  legacy app's own math falls back to the planned numbers, so do the same. */
const actualNum = (value: unknown, planned: number, max: number): number =>
  value == null ? planned : num(value, 0, max);

export function convertLegacySet(raw: unknown): WorkoutSet {
  const source = isRecord(raw) ? raw : {};
  const reps = num(source.reps, 0, 9999);
  const weight = num(source.weight, 0, 2000);
  return {
    reps,
    weight,
    rest: num(source.rest, 90, 3600),
    type: SET_TYPES.includes(source.type as SetType) ? (source.type as SetType) : 'working',
    actualReps: actualNum(source.actualReps, reps, 9999),
    actualWeight: actualNum(source.actualWeight, weight, 2000),
    completed: !!source.completed,
  };
}

export function convertLegacyExercise(raw: unknown): WorkoutExercise {
  const source = isRecord(raw) ? raw : {};
  const name = String(source.name || 'Exercise');
  const legacyId = typeof source.exerciseId === 'string' ? source.exerciseId : typeof source.id === 'string' ? source.id : '';
  const exercise: WorkoutExercise = {
    exerciseId: resolveExerciseId(legacyId, name),
    name,
    muscle: String(source.muscle || ''),
    sets: Array.isArray(source.sets) ? source.sets.filter(isRecord).map(convertLegacySet) : [],
  };
  if (typeof source.supersetGroup === 'number' || source.supersetGroup === null) {
    exercise.supersetGroup = source.supersetGroup as number | null;
  }
  return exercise;
}

const convertExercises = (value: unknown): WorkoutExercise[] =>
  Array.isArray(value) ? value.filter(isRecord).map(convertLegacyExercise) : [];

export function convertLegacyWorkout(raw: unknown): Workout {
  const source = isRecord(raw) ? raw : {};
  const parsedDate = typeof source.date === 'string' ? Date.parse(source.date) : NaN;
  const startTime = typeof source.startTime === 'number' && Number.isFinite(source.startTime)
    ? source.startTime
    : Number.isFinite(parsedDate) ? parsedDate : Date.now();
  const workout: Workout = {
    id: typeof source.id === 'string' && source.id ? source.id : createId(),
    templateId: typeof source.templateId === 'string' ? source.templateId : null,
    name: String(source.name || 'Workout'),
    date: Number.isFinite(parsedDate) ? new Date(parsedDate).toISOString() : new Date(startTime).toISOString(),
    startTime,
    exercises: convertExercises(source.exercises),
  };
  if (typeof source.endTime === 'number' && Number.isFinite(source.endTime)) workout.endTime = source.endTime;
  if (typeof source.duration === 'number' && Number.isFinite(source.duration) && source.duration >= 0) workout.duration = source.duration;
  return workout;
}

export function convertLegacyTemplate(raw: unknown): Template {
  const source = isRecord(raw) ? raw : {};
  const template: Template = {
    id: typeof source.id === 'string' && source.id ? source.id : createId(),
    name: String(source.name || 'Template'),
    exercises: convertExercises(source.exercises),
  };
  if (isRecord(source.nutrition)
    && typeof source.nutrition.pre === 'string'
    && typeof source.nutrition.post === 'string'
    && typeof source.nutrition.summary === 'string') {
    template.nutrition = { pre: source.nutrition.pre, post: source.nutrition.post, summary: source.nutrition.summary };
  }
  return template;
}

export interface LegacyConversion {
  workouts: Workout[];
  templates: Template[];
  activeWorkout: Workout | null;
}

export function convertLegacyState(raw: unknown): LegacyConversion | null {
  if (!isRecord(raw)) return null;
  return {
    workouts: Array.isArray(raw.workouts) ? raw.workouts.filter(isRecord).map(convertLegacyWorkout) : [],
    templates: Array.isArray(raw.templates) ? raw.templates.filter(isRecord).map(convertLegacyTemplate) : [],
    activeWorkout: isRecord(raw.activeWorkout) ? convertLegacyWorkout(raw.activeWorkout) : null,
  };
}

/** The legacy app had no weekly schedule; rebuild one from the starter
 *  template names so the Plan tab reflects the user's actual week. */
export function weekPlanForTemplates(templates: Template[]): AppState['weekPlan'] {
  const plan: AppState['weekPlan'] = { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null };
  for (const template of templates) {
    const name = template.name.trim().toLowerCase();
    if (name === 'push day' && plan[1] === null) plan[1] = template.id;
    else if (name === 'pull day' && plan[3] === null) plan[3] = template.id;
    else if ((name === 'leg day' || name === 'legs day') && plan[5] === null) plan[5] = template.id;
  }
  return plan;
}

interface KeyValueStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

/**
 * Seed the redesign's persisted state from the legacy save, once. Returns
 * true when a seed was written. Never throws and never touches the legacy
 * key; any problem just leaves the redesign to start fresh.
 */
export function migrateLegacyStorage(storage: KeyValueStorage): boolean {
  try {
    if (storage.getItem(STORE_KEY)) return false;
    const legacyText = storage.getItem(LEGACY_KEY);
    if (!legacyText) return false;
    let parsed: unknown;
    try { parsed = JSON.parse(legacyText); } catch { return false; }
    const converted = convertLegacyState(parsed);
    if (!converted) return false;
    const { workouts, templates, activeWorkout } = converted;
    if (!workouts.length && !templates.length && !activeWorkout) return false;
    const state = {
      workouts,
      activeWorkout,
      templates,
      // With no legacy templates the store's own defaults (and its default
      // week plan) should survive the persist merge, so send an empty plan.
      weekPlan: templates.length ? weekPlanForTemplates(templates) : {},
      planOverrides: {},
      planStart: workouts.length ? workouts.map((workout) => workoutDayKey(workout)).sort()[0] : todayKey(),
      restEndsAt: null,
      restDuration: 0,
    };
    storage.setItem(STORE_KEY, JSON.stringify({ state, version: 0 }));
    return true;
  } catch {
    return false;
  }
}
