import type { Template, WeekPlan, Workout } from '../types/domain';
import { addDays, weekday, weekStart, workoutDayKey } from './dates';

export type DayStatus = 'done' | 'missed' | 'planned' | 'rest';

export const defaultWeekPlan: WeekPlan = { 0: null, 1: 'push-day', 2: null, 3: 'pull-day', 4: null, 5: 'leg-day', 6: null };

export function plannedTemplateId(key: string, weekPlan: WeekPlan, overrides: Record<string, string | null>): string | null {
  if (Object.prototype.hasOwnProperty.call(overrides, key)) return overrides[key] ?? null;
  return weekPlan[weekday(key)] ?? null;
}

export function plannedTemplate(
  key: string, weekPlan: WeekPlan, overrides: Record<string, string | null>, templates: Template[],
): Template | null {
  const id = plannedTemplateId(key, weekPlan, overrides);
  return id ? templates.find((template) => template.id === id) ?? null : null;
}

export function workoutsByDay(workouts: Workout[]): Map<string, Workout[]> {
  const map = new Map<string, Workout[]>();
  for (const workout of workouts) {
    const key = workoutDayKey(workout);
    map.set(key, [...(map.get(key) ?? []), workout]);
  }
  return map;
}

export function dayStatus(
  key: string, today: string, byDay: Map<string, Workout[]>, planned: Template | null, planStart = '',
): DayStatus {
  if (byDay.get(key)?.length) return 'done';
  // Days before the plan began (e.g. earlier this week on first install) are not missed.
  if (!planned || key < planStart) return 'rest';
  return key < today ? 'missed' : 'planned';
}

/** Consecutive weeks (ending this week, or last week if this one is still empty) with at least one session. */
export function streakWeeks(workouts: Workout[], today: string): number {
  const weeks = new Set(workouts.map((workout) => weekStart(workoutDayKey(workout))));
  let cursor = weekStart(today);
  if (!weeks.has(cursor)) cursor = addDays(cursor, -7);
  let streak = 0;
  while (weeks.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -7);
  }
  return streak;
}
