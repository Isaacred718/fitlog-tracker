import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createId, nextIncomplete, prefillExercise, type SetPointer } from '../lib/workouts';
import { defaultTemplates } from '../data/templates';
import { defaultWeekPlan } from '../lib/plan';
import { fromKey, todayKey, workoutDayKey } from '../lib/dates';
import type { AppState, Template, Workout, WorkoutExercise, WorkoutSet } from '../types/domain';

type ExerciseRef = { id: string; name: string; muscle: string };
type SetField = 'actualReps' | 'actualWeight';

export interface Toast { id: number; message: string; undo?: () => void }

interface UiState {
  /** The set the bottom dock is editing. Not persisted. */
  focus: SetPointer | null;
  toast: Toast | null;
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
}

export type DadbodStore = AppState & UiState & AppActions;

const freshSet = (reps = 10, weight = 0, rest = 90): WorkoutSet => ({
  reps, weight, rest, type: 'working', actualReps: reps, actualWeight: weight, completed: false,
});

const clamp = (value: number) => Math.max(0, Math.round((Number.isFinite(value) ? value : 0) * 10) / 10);
let toastId = 0;

export const useAppStore = create<DadbodStore>()(
  persist(
    (set, get) => {
      /** Apply a change to a clone of the active workout. */
      const editWorkout = (change: (workout: Workout) => boolean | void) => set((state) => {
        if (!state.activeWorkout) return state;
        const workout = structuredClone(state.activeWorkout);
        return change(workout) === false ? state : { activeWorkout: workout };
      });
      /** Destructive change with an Undo toast that restores the previous snapshot. */
      const withUndo = (message: string, keys: (keyof AppState)[], change: () => void) => {
        const state = get();
        const snapshot = Object.fromEntries(keys.map((key) => [key, state[key]])) as Partial<AppState>;
        change();
        get().showToast(message, () => set(snapshot));
      };

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
        discardWorkout: () => withUndo('Workout discarded', ['activeWorkout'], () => set({ activeWorkout: null, restEndsAt: null, focus: null })),
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
            duration: now - active.startTime,
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
          const name = get().activeWorkout?.exercises[exerciseIndex]?.name ?? 'Exercise';
          withUndo(`${name} removed`, ['activeWorkout'], () => {
            editWorkout((workout) => { workout.exercises.splice(exerciseIndex, 1); });
            set({ focus: null });
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
        removeSet: (exerciseIndex, setIndex) => withUndo(`Set ${setIndex + 1} removed`, ['activeWorkout'], () => {
          editWorkout((workout) => {
            const sets = workout.exercises[exerciseIndex]?.sets;
            if (!sets || sets.length <= 1) return false;
            sets.splice(setIndex, 1);
          });
          set({ focus: null });
        }),
        updateSet: (exerciseIndex, setIndex, field, value) => editWorkout((workout) => {
          const target = workout.exercises[exerciseIndex]?.sets[setIndex];
          if (!target) return false;
          target[field] = clamp(value);
        }),
        completeSet: (exerciseIndex, setIndex) => {
          let rest = 0;
          editWorkout((workout) => {
            const target = workout.exercises[exerciseIndex]?.sets[setIndex];
            if (!target) return false;
            target.completed = true;
            rest = target.rest;
          });
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
          set({ focus: { exerciseIndex, setIndex } });
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
        skipDay: (dayKey) => withUndo('Session skipped', ['planOverrides'], () => set((state) => ({ planOverrides: { ...state.planOverrides, [dayKey]: null } }))),

        createTemplate: () => {
          const id = createId();
          set((state) => ({ templates: [...state.templates, { id, name: 'New template', exercises: [] }] }));
          return id;
        },
        renameTemplate: (templateId, name) => set((state) => ({ templates: state.templates.map((template) => template.id === templateId ? { ...template, name } : template) })),
        deleteTemplate: (templateId) => {
          const name = get().templates.find((template) => template.id === templateId)?.name ?? 'Template';
          withUndo(`${name} deleted`, ['templates'], () => set((state) => ({ templates: state.templates.filter((template) => template.id !== templateId) })));
        },
        addTemplateExercise: (templateId, exercise) => set((state) => ({
          templates: state.templates.map((template) => {
            if (template.id !== templateId || template.exercises.some((item) => item.exerciseId === exercise.id)) return template;
            return { ...template, exercises: [...template.exercises, { exerciseId: exercise.id, name: exercise.name, muscle: exercise.muscle, sets: [freshSet(), freshSet(), freshSet()] }] };
          }),
        })),
        removeTemplateExercise: (templateId, exerciseIndex) => {
          const name = get().templates.find((template) => template.id === templateId)?.exercises[exerciseIndex]?.name ?? 'Exercise';
          withUndo(`${name} removed`, ['templates'], () => set((state) => ({
            templates: state.templates.map((template) => template.id === templateId ? { ...template, exercises: template.exercises.filter((_, index) => index !== exerciseIndex) } : template),
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

        showToast: (message, undo) => set({ toast: { id: ++toastId, message, undo } }),
        dismissToast: () => set({ toast: null }),
      };
    },
    {
      // Same storage key and shape as before the redesign: existing workouts, templates and an
      // in-progress session load untouched; the new plan fields fall back to defaults.
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
