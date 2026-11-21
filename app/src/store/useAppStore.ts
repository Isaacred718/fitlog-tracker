import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createId, nextIncomplete, prefillExercise, type SetPointer } from '../lib/workouts';
import { defaultTemplates } from '../data/templates';
import { defaultWeekPlan } from '../lib/plan';
import { convertLegacyState, migrateLegacyStorage } from '../lib/legacy';
import { fromKey, isDayKey, todayKey, workoutDayKey } from '../lib/dates';
import type { AppState, Template, Workout, WorkoutExercise, WorkoutSet } from '../types/domain';

type ExerciseRef = { id: string; name: string; muscle: string };
type SetField = 'actualReps' | 'actualWeight';

export interface Toast { id: number; message: string; undo?: () => void }

interface UiState {
  /** The set the bottom dock is editing. Not persisted. */
  focus: SetPointer | null;
  toast: Toast | null;
  /** Toasts waiting behind the visible one, so a second message never
   *  silently discards an earlier toast's Undo. */
  toastQueue: Toast[];
  /** Id of the session finished most recently, so the day panel can celebrate it inline. */
  lastFinishedId: string | null;
}

interface AppActions {
  startWorkout: (templateId: string | null, dayKey?: string) => void;
  discardWorkout: () => void;
  finishWorkout: () => void;
  addExercise: (exercise: ExerciseRef) => void;
  removeExercise: (exerciseIndex: number) => void;
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  updateSet: (exerciseIndex: number, setIndex: number, field: SetField, value: number) => void;
  completeSet: (exerciseIndex: number, setIndex: number) => void;
  uncompleteSet: (exerciseIndex: number, setIndex: number) => void;
  repeatLastSet: (exerciseIndex: number, setIndex: number) => void;
  setFocus: (pointer: SetPointer | null) => void;
  addRest: (seconds: number) => void;
  skipRest: () => void;
  setWeekday: (weekday: number, templateId: string | null) => void;
  moveSession: (fromKey: string, toKey: string) => void;
  skipDay: (dayKey: string) => void;
  createTemplate: () => string;
  renameTemplate: (templateId: string, name: string) => void;
  deleteTemplate: (templateId: string) => void;
  addTemplateExercise: (templateId: string, exercise: ExerciseRef) => void;
  removeTemplateExercise: (templateId: string, exerciseIndex: number) => void;
  updateTemplateExercise: (templateId: string, exerciseIndex: number, field: 'sets' | 'reps' | 'weight' | 'rest', value: number) => void;
  showToast: (message: string, undo?: () => void) => void;
  dismissToast: () => void;
  /** Replace all data fields from a Settings backup file. Returns false and
   *  changes nothing when the payload is not a usable backup. */
  importBackup: (data: unknown) => boolean;
}

export type DadbodStore = AppState & UiState & AppActions;

const freshSet = (reps = 10, weight = 0, rest = 90): WorkoutSet => ({
  reps, weight, rest, type: 'working', actualReps: reps, actualWeight: weight, completed: false,
});

const clamp = (value: number) => Math.max(0, Math.round((Number.isFinite(value) ? value : 0) * 10) / 10);
let toastId = 0;

// Carry existing users' data over from the legacy app before the store
// hydrates from its own key; a no-op once the redesign has saved anything.
migrateLegacyStorage(localStorage);

export const useAppStore = create<DadbodStore>()(
  persist(
    (set, get) => {
      /** Apply a change to a clone of the active workout. */
      const editWorkout = (change: (workout: Workout) => boolean | void) => set((state) => {
        if (!state.activeWorkout) return state;
        const workout = structuredClone(state.activeWorkout);
        return change(workout) === false ? state : { activeWorkout: workout };
      });
      // Undo is surgical, never a whole-state snapshot: each destructive
      // action captures exactly what it removed and its Undo re-applies
      // only that, so two queued Undos cannot clobber each other's work.

      return {
        workouts: [],
        activeWorkout: null,
        templates: defaultTemplates,
        weekPlan: defaultWeekPlan,
        planOverrides: {},
        planStart: todayKey(),
        restEndsAt: null,
        restDuration: 0,
        focus: null,
        toast: null,
        toastQueue: [],
        lastFinishedId: null,

        startWorkout: (templateId, dayKey = todayKey()) => {
          const { templates, workouts } = get();
          const template = templateId ? templates.find((item) => item.id === templateId) : undefined;
          const today = todayKey();
          // Past days are logged at local noon so they land on the right calendar day.
          const date = dayKey === today ? new Date() : new Date(fromKey(dayKey).setHours(12));
          set({
            activeWorkout: {
              id: createId(),
              templateId: template?.id ?? null,
              name: template?.name ?? 'Workout',
              date: date.toISOString(),
              startTime: Date.now(),
              exercises: (template?.exercises ?? []).map((exercise) => prefillExercise(structuredClone(exercise), workouts)),
            },
            focus: null, restEndsAt: null, lastFinishedId: null,
          });
        },
        discardWorkout: () => {
          const { activeWorkout, restEndsAt, restDuration, focus } = get();
          if (!activeWorkout) return;
          set({ activeWorkout: null, restEndsAt: null, focus: null });
          get().showToast('Workout discarded', () => {
            if (get().activeWorkout) return; // a newer session owns the slot now
            set({ activeWorkout, restEndsAt, restDuration, focus });
          });
        },
        finishWorkout: () => set((state) => {
          const active = state.activeWorkout;
          if (!active || !active.exercises.some((exercise) => exercise.sets.some((item) => item.completed))) return state;
          const now = Date.now();
          const finished: Workout = {
            ...active,
            // Drop untouched sets and exercises so history only holds what was lifted.
            exercises: active.exercises
              .map((exercise) => ({ ...exercise, sets: exercise.sets.filter((item) => item.completed) }))
              .filter((exercise) => exercise.sets.length > 0),
            endTime: now,
            // Cap at 12h like the legacy app: a session left open overnight
            // is a forgotten timer, not a 26-hour workout.
            duration: Math.min(now - active.startTime, 12 * 3600 * 1000),
          };
          return { workouts: [...state.workouts, finished], activeWorkout: null, restEndsAt: null, focus: null, lastFinishedId: finished.id };
        }),
        addExercise: (exercise) => {
          const { workouts } = get();
          editWorkout((workout) => {
            if (workout.exercises.some((item) => item.exerciseId === exercise.id)) return false;
            const planned: WorkoutExercise = {
              exerciseId: exercise.id, name: exercise.name, muscle: exercise.muscle,
              sets: [freshSet(), freshSet(), freshSet()],
            };
            workout.exercises.push(prefillExercise(planned, workouts));
          });
          const workout = get().activeWorkout;
          if (workout) set({ focus: { exerciseIndex: workout.exercises.length - 1, setIndex: 0 } });
        },
        removeExercise: (exerciseIndex) => {
          const workout = get().activeWorkout;
          const exercise = workout?.exercises[exerciseIndex];
          if (!workout || !exercise) return;
          const removed = structuredClone(exercise);
          const workoutId = workout.id;
          editWorkout((draft) => { draft.exercises.splice(exerciseIndex, 1); });
          set({ focus: null });
          get().showToast(`${exercise.name} removed`, () => {
            if (get().activeWorkout?.id !== workoutId) return;
            editWorkout((draft) => {
              if (draft.exercises.some((item) => item.exerciseId === removed.exerciseId)) return false;
              draft.exercises.splice(Math.min(exerciseIndex, draft.exercises.length), 0, structuredClone(removed));
            });
          });
        },
        addSet: (exerciseIndex) => {
          editWorkout((workout) => {
            const sets = workout.exercises[exerciseIndex]?.sets;
            if (!sets) return false;
            const previous = sets.at(-1);
            sets.push(previous ? { ...previous, completed: false } : freshSet());
          });
          const sets = get().activeWorkout?.exercises[exerciseIndex]?.sets;
          if (sets) set({ focus: { exerciseIndex, setIndex: sets.length - 1 } });
        },
        removeSet: (exerciseIndex, setIndex) => {
          const workout = get().activeWorkout;
          const sets = workout?.exercises[exerciseIndex]?.sets;
          const target = sets?.[setIndex];
          if (!workout || !sets || !target || sets.length <= 1) return;
          const removed = structuredClone(target);
          const workoutId = workout.id;
          editWorkout((draft) => { draft.exercises[exerciseIndex].sets.splice(setIndex, 1); });
          set({ focus: null });
          get().showToast(`Set ${setIndex + 1} removed`, () => {
            if (get().activeWorkout?.id !== workoutId) return;
            editWorkout((draft) => {
              const list = draft.exercises[exerciseIndex]?.sets;
              if (!list) return false;
              list.splice(Math.min(setIndex, list.length), 0, structuredClone(removed));
            });
          });
        },
        updateSet: (exerciseIndex, setIndex, field, value) => editWorkout((workout) => {
          const target = workout.exercises[exerciseIndex]?.sets[setIndex];
          if (!target) return false;
          target[field] = clamp(value);
        }),
        completeSet: (exerciseIndex, setIndex) => {
          let rest = 0;
          let changed = false;
          editWorkout((workout) => {
            const target = workout.exercises[exerciseIndex]?.sets[setIndex];
            if (!target || target.completed) return false;
            target.completed = true;
            rest = target.rest;
            changed = true;
          });
          if (!changed) return;
          const workout = get().activeWorkout;
          if (!workout) return;
          const next = nextIncomplete(workout, { exerciseIndex, setIndex });
          set({ focus: next, ...(rest > 0 && next ? { restEndsAt: Date.now() + rest * 1000, restDuration: rest } : { restEndsAt: null }) });
        },
        uncompleteSet: (exerciseIndex, setIndex) => {
          editWorkout((workout) => {
            const target = workout.exercises[exerciseIndex]?.sets[setIndex];
            if (!target) return false;
            target.completed = false;
          });
          set({ focus: { exerciseIndex, setIndex }, restEndsAt: null });
        },
        repeatLastSet: (exerciseIndex, setIndex) => editWorkout((workout) => {
          const sets = workout.exercises[exerciseIndex]?.sets;
          const source = sets?.slice(0, setIndex).reverse().find((item) => item.completed) ?? sets?.filter((item) => item.completed).at(-1);
          if (!sets?.[setIndex] || !source) return false;
          sets[setIndex].actualReps = source.actualReps;
          sets[setIndex].actualWeight = source.actualWeight;
        }),
        setFocus: (focus) => set({ focus }),
        addRest: (seconds) => set((state) => state.restEndsAt
          ? { restEndsAt: state.restEndsAt + seconds * 1000, restDuration: state.restDuration + seconds }
          : state),
        skipRest: () => set({ restEndsAt: null }),

        setWeekday: (weekday, templateId) => set((state) => ({ weekPlan: { ...state.weekPlan, [weekday]: templateId } })),
        moveSession: (fromKey, toKey) => set((state) => {
          const id = Object.prototype.hasOwnProperty.call(state.planOverrides, fromKey)
            ? state.planOverrides[fromKey]
            : state.weekPlan[fromKey ? fromKeyDay(fromKey) : 0];
          return { planOverrides: { ...state.planOverrides, [fromKey]: null, [toKey]: id ?? null } };
        }),
        skipDay: (dayKey) => {
          const overrides = get().planOverrides;
          const had = Object.prototype.hasOwnProperty.call(overrides, dayKey);
          const previous = overrides[dayKey];
          set((state) => ({ planOverrides: { ...state.planOverrides, [dayKey]: null } }));
          get().showToast('Session skipped', () => set((state) => {
            const next = { ...state.planOverrides };
            if (had) next[dayKey] = previous; else delete next[dayKey];
            return { planOverrides: next };
          }));
        },

        createTemplate: () => {
          const id = createId();
          set((state) => ({ templates: [...state.templates, { id, name: 'New template', exercises: [] }] }));
          return id;
        },
        renameTemplate: (templateId, name) => set((state) => ({ templates: state.templates.map((template) => template.id === templateId ? { ...template, name } : template) })),
        deleteTemplate: (templateId) => {
          const state = get();
          const index = state.templates.findIndex((template) => template.id === templateId);
          if (index < 0) return;
          const removed = structuredClone(state.templates[index]);
          const planDays = Object.entries(state.weekPlan).filter(([, id]) => id === templateId).map(([day]) => day);
          const overrideDays = Object.entries(state.planOverrides).filter(([, id]) => id === templateId).map(([day]) => day);
          set((current) => ({
            templates: current.templates.filter((template) => template.id !== templateId),
            weekPlan: Object.fromEntries(Object.entries(current.weekPlan).map(([day, id]) => [day, id === templateId ? null : id])) as AppState['weekPlan'],
            planOverrides: Object.fromEntries(Object.entries(current.planOverrides).filter(([, id]) => id !== templateId)),
          }));
          get().showToast(`${removed.name} deleted`, () => set((current) => {
            if (current.templates.some((template) => template.id === templateId)) return current;
            const templates = [...current.templates];
            templates.splice(Math.min(index, templates.length), 0, removed);
            const weekPlan = { ...current.weekPlan };
            for (const day of planDays) {
              const key = Number(day) as keyof AppState['weekPlan'];
              if (weekPlan[key] === null) weekPlan[key] = templateId;
            }
            const planOverrides = { ...current.planOverrides };
            for (const day of overrideDays) {
              if (!Object.prototype.hasOwnProperty.call(planOverrides, day)) planOverrides[day] = templateId;
            }
            return { templates, weekPlan, planOverrides };
          }));
        },
        addTemplateExercise: (templateId, exercise) => set((state) => ({
          templates: state.templates.map((template) => {
            if (template.id !== templateId || template.exercises.some((item) => item.exerciseId === exercise.id)) return template;
            return { ...template, exercises: [...template.exercises, { exerciseId: exercise.id, name: exercise.name, muscle: exercise.muscle, sets: [freshSet(), freshSet(), freshSet()] }] };
          }),
        })),
        removeTemplateExercise: (templateId, exerciseIndex) => {
          const template = get().templates.find((item) => item.id === templateId);
          const exercise = template?.exercises[exerciseIndex];
          if (!template || !exercise) return;
          const removed = structuredClone(exercise);
          set((state) => ({
            templates: state.templates.map((item) => item.id === templateId ? { ...item, exercises: item.exercises.filter((_, index) => index !== exerciseIndex) } : item),
          }));
          get().showToast(`${exercise.name} removed`, () => set((state) => ({
            templates: state.templates.map((item) => {
              if (item.id !== templateId || item.exercises.some((entry) => entry.exerciseId === removed.exerciseId)) return item;
              const exercises = [...item.exercises];
              exercises.splice(Math.min(exerciseIndex, exercises.length), 0, structuredClone(removed));
              return { ...item, exercises };
            }),
          })));
        },
        updateTemplateExercise: (templateId, exerciseIndex, field, value) => set((state) => ({
          templates: state.templates.map((template) => {
            if (template.id !== templateId) return template;
            const copy: Template = structuredClone(template);
            const exercise = copy.exercises[exerciseIndex];
            if (!exercise) return template;
            if (field === 'sets') {
              const count = Math.min(10, Math.max(1, Math.round(value)));
              const model = exercise.sets.at(-1) ?? freshSet();
              exercise.sets = Array.from({ length: count }, (_, index) => exercise.sets[index] ?? { ...model });
            } else {
              const next = clamp(value);
              exercise.sets = exercise.sets.map((item) => ({
                ...item,
                [field]: next,
                ...(field === 'reps' ? { actualReps: next } : {}),
                ...(field === 'weight' ? { actualWeight: next } : {}),
              }));
            }
            return copy;
          }),
        })),

        showToast: (message, undo) => set((state) => {
          const toast = { id: ++toastId, message, undo };
          return state.toast ? { toastQueue: [...state.toastQueue, toast] } : { toast };
        }),
        dismissToast: () => set((state) => ({ toast: state.toastQueue[0] ?? null, toastQueue: state.toastQueue.slice(1) })),
        importBackup: (data) => {
          if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
          const source = data as Record<string, unknown>;
          if (!Array.isArray(source.workouts) || !Array.isArray(source.templates)) return false;
          // Reuse the legacy converter as the normalizer: it validates every
          // record and repairs field-level damage instead of trusting the file.
          const converted = convertLegacyState(source);
          if (!converted) return false;
          const weekPlan: AppState['weekPlan'] = { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null };
          if (source.weekPlan && typeof source.weekPlan === 'object' && !Array.isArray(source.weekPlan)) {
            for (const [day, id] of Object.entries(source.weekPlan as Record<string, unknown>)) {
              const weekday = Number(day);
              if (Number.isInteger(weekday) && weekday >= 0 && weekday <= 6) {
                weekPlan[weekday as keyof AppState['weekPlan']] = typeof id === 'string' ? id : null;
              }
            }
          }
          const planOverrides: Record<string, string | null> = {};
          if (source.planOverrides && typeof source.planOverrides === 'object' && !Array.isArray(source.planOverrides)) {
            for (const [day, id] of Object.entries(source.planOverrides as Record<string, unknown>)) {
              if (isDayKey(day)) planOverrides[day] = typeof id === 'string' ? id : null;
            }
          }
          set({
            workouts: converted.workouts,
            templates: converted.templates,
            activeWorkout: converted.activeWorkout,
            weekPlan,
            planOverrides,
            planStart: typeof source.planStart === 'string' && isDayKey(source.planStart)
              ? source.planStart
              : converted.workouts.length ? converted.workouts.map((workout) => workoutDayKey(workout)).sort()[0] : todayKey(),
            restEndsAt: null,
            focus: null,
          });
          return true;
        },
      };
    },
    {
      // The redesign persists under its own key; lib/legacy.ts migrates the
      // legacy app's `liftTracker` save into it on first launch. The plan
      // fields are new in the redesign and fall back to defaults.
      name: 'liftTracker-v3',
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<AppState>;
        return {
          ...current,
          ...saved,
          templates: saved.templates?.length ? saved.templates : current.templates,
          weekPlan: { ...current.weekPlan, ...(saved.weekPlan ?? {}) },
          planOverrides: saved.planOverrides ?? {},
          // Older saves: count the plan from the first logged session, or from today for a new user.
          planStart: saved.planStart ?? earliestDay(saved.workouts) ?? current.planStart,
        };
      },
      partialize: (state) => ({
        workouts: state.workouts,
        activeWorkout: state.activeWorkout,
        templates: state.templates,
        weekPlan: state.weekPlan,
        planOverrides: state.planOverrides,
        planStart: state.planStart,
        restEndsAt: state.restEndsAt,
        restDuration: state.restDuration,
      }),
    },
  ),
);

function earliestDay(workouts: Workout[] | undefined): string | undefined {
  if (!workouts?.length) return undefined;
  return workouts.map((workout) => workoutDayKey(workout)).sort()[0];
}

function fromKeyDay(key: string): number {
  return fromKey(key).getDay();
}
