import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { completedSetCount, createId } from '../lib/workouts';
import { defaultTemplates } from '../data/templates';
import type { AppState, SetType, Template, Workout } from '../types/domain';

interface AppActions {
  startEmptyWorkout: () => void;
  startTemplateWorkout: (template: Template) => void;
  addExercise: (exercise: { id: string; name: string; muscle: string }) => void;
  addSet: (exerciseIndex: number, type?: SetType) => void;
  updateSet: (exerciseIndex: number, setIndex: number, field: 'actualReps' | 'actualWeight' | 'rest', value: number) => void;
  toggleSet: (exerciseIndex: number, setIndex: number) => void;
  finishWorkout: () => void;
  createTemplate: () => string;
  renameTemplate: (templateId: string, name: string) => void;
  deleteTemplate: (templateId: string) => void;
  addTemplateExercise: (templateId: string, exercise: { id: string; name: string; muscle: string }) => void;
  removeTemplateExercise: (templateId: string, exerciseIndex: number) => void;
  updateTemplateSet: (templateId: string, exerciseIndex: number, setIndex: number, field: 'reps' | 'weight' | 'rest', value: number) => void;
}

type LiftTrackerStore = AppState & AppActions;

export const useAppStore = create<LiftTrackerStore>()(
  persist(
    (set) => ({
      workouts: [],
      activeWorkout: null,
      templates: defaultTemplates,
      startEmptyWorkout: () => set({
        activeWorkout: {
          id: createId(),
          templateId: null,
          name: 'Workout',
          date: new Date().toISOString(),
          startTime: Date.now(),
          exercises: [],
        },
      }),
      startTemplateWorkout: (template) => set({
        activeWorkout: {
          id: createId(), templateId: template.id, name: template.name, date: new Date().toISOString(), startTime: Date.now(),
          exercises: structuredClone(template.exercises),
        },
      }),
      addExercise: (exercise) => set((state) => {
        if (!state.activeWorkout || state.activeWorkout.exercises.some((item) => item.exerciseId === exercise.id)) return state;
        const workout = structuredClone(state.activeWorkout);
        workout.exercises.push({
          exerciseId: exercise.id, name: exercise.name, muscle: exercise.muscle,
          sets: [{ reps: 10, weight: 0, rest: 60, type: 'working', actualReps: 10, actualWeight: 0, completed: false }],
        });
        return { activeWorkout: workout };
      }),
      addSet: (exerciseIndex, type = 'working') => set((state) => {
        if (!state.activeWorkout) return state;
        const workout = structuredClone(state.activeWorkout);
        const sets = workout.exercises[exerciseIndex]?.sets;
        if (!sets) return state;
        const previous = sets.at(-1);
        sets.push({ reps: previous?.reps ?? 10, weight: previous?.weight ?? 0, rest: previous?.rest ?? 60, type,
          actualReps: previous?.actualReps ?? 10, actualWeight: previous?.actualWeight ?? 0, completed: false });
        return { activeWorkout: workout };
      }),
      updateSet: (exerciseIndex, setIndex, field, value) => set((state) => {
        if (!state.activeWorkout) return state;
        const workout = structuredClone(state.activeWorkout);
        const workoutSet = workout.exercises[exerciseIndex]?.sets[setIndex];
        if (!workoutSet) return state;
        workoutSet[field] = Math.max(0, value || 0);
        return { activeWorkout: workout };
      }),
      toggleSet: (exerciseIndex, setIndex) => set((state) => {
        if (!state.activeWorkout) return state;
        const workout = structuredClone(state.activeWorkout);
        const workoutSet = workout.exercises[exerciseIndex]?.sets[setIndex];
        if (!workoutSet) return state;
        workoutSet.completed = !workoutSet.completed;
        return { activeWorkout: workout };
      }),
      finishWorkout: () => set((state) => {
        const active = state.activeWorkout;
        if (!active || completedSetCount(active) === 0) return state;
        const finished: Workout = { ...active, endTime: Date.now(), duration: Date.now() - active.startTime };
        return { workouts: [...state.workouts, finished], activeWorkout: null };
      }),
      createTemplate: () => {
        const id = createId();
        set((state) => ({ templates: [...state.templates, { id, name: 'New Template', exercises: [] }] }));
        return id;
      },
      renameTemplate: (templateId, name) => set((state) => ({ templates: state.templates.map((template) => template.id === templateId ? { ...template, name } : template) })),
      deleteTemplate: (templateId) => set((state) => ({ templates: state.templates.filter((template) => template.id !== templateId) })),
      addTemplateExercise: (templateId, exercise) => set((state) => ({
        templates: state.templates.map((template) => {
          if (template.id !== templateId || template.exercises.some((item) => item.exerciseId === exercise.id)) return template;
          return { ...template, exercises: [...template.exercises, { exerciseId: exercise.id, name: exercise.name, muscle: exercise.muscle, sets: [{ reps: 10, weight: 0, rest: 60, type: 'working', actualReps: 10, actualWeight: 0, completed: false }] }] };
        }),
      })),
      removeTemplateExercise: (templateId, exerciseIndex) => set((state) => ({
        templates: state.templates.map((template) => template.id === templateId ? { ...template, exercises: template.exercises.filter((_, index) => index !== exerciseIndex) } : template),
      })),
      updateTemplateSet: (templateId, exerciseIndex, setIndex, field, value) => set((state) => ({
        templates: state.templates.map((template) => {
          if (template.id !== templateId) return template;
          const copy = structuredClone(template);
          const templateSet = copy.exercises[exerciseIndex]?.sets[setIndex];
          if (templateSet) {
            templateSet[field] = Math.max(0, value || 0);
            if (field === 'reps') templateSet.actualReps = templateSet.reps;
            if (field === 'weight') templateSet.actualWeight = templateSet.weight;
          }
          return copy;
        }),
      })),
    }),
    {
      name: 'liftTracker-v3',
      merge: (persisted, current) => {
        const saved = persisted as Partial<AppState> | undefined;
        return {
          ...current,
          ...saved,
          templates: saved?.templates?.length ? saved.templates : current.templates,
        };
      },
      partialize: (state) => ({
        workouts: state.workouts,
        activeWorkout: state.activeWorkout,
        templates: state.templates,
      }),
    },
  ),
);
