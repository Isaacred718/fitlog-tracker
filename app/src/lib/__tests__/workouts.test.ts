import { describe, expect, it } from 'vitest';
import type { Workout, WorkoutSet } from '../../types/domain';
import { nextIncomplete, prefillSets, summarizeSets, workoutPRs } from '../workouts';
import { dayStatus, plannedTemplateId, streakWeeks, workoutsByDay } from '../plan';
import { addDays, weekStart } from '../dates';
import { parseRoute } from '../router';

const set = (reps: number, weight: number, completed = true): WorkoutSet => ({
  reps, weight, rest: 60, type: 'working', actualReps: reps, actualWeight: weight, completed,
});
const workout = (id: string, date: string, sets: WorkoutSet[], exerciseId = 'barbell-bench-press'): Workout => ({
  id, templateId: 'push-day', name: 'Push Day', date: new Date(`${date}T18:00:00`).toISOString(),
  startTime: new Date(`${date}T18:00:00`).getTime(), exercises: [{ exerciseId, name: 'Bench', muscle: 'Chest', sets }],
});

describe('summarizeSets', () => {
  it('collapses uniform sets to N×reps @ weight', () => {
    expect(summarizeSets([set(8, 130), set(8, 130), set(8, 130)])).toBe('3×8 @ 130');
  });
  it('shows the top set when sets differ', () => {
    expect(summarizeSets([set(8, 130), set(6, 140)])).toBe('2 sets · top 140×6');
  });
  it('omits weight for bodyweight work', () => {
    expect(summarizeSets([set(10, 0), set(10, 0)])).toBe('2×10');
  });
});

describe('prefillSets', () => {
  it('carries last session numbers forward and resets completion', () => {
    const planned = [set(8, 0, false), set(8, 0, false), set(8, 0, false)];
    const filled = prefillSets(planned, [set(8, 135), set(7, 135)]);
    expect(filled.map((item) => [item.actualReps, item.actualWeight, item.completed])).toEqual([[8, 135, false], [7, 135, false], [7, 135, false]]);
  });
  it('keeps the plan when there is no history', () => {
    expect(prefillSets([set(10, 45, false)], null)[0].actualWeight).toBe(45);
  });
});

describe('nextIncomplete', () => {
  it('finds the next open set after the pointer, wrapping around', () => {
    const w = workout('a', '2026-11-16', [set(8, 100, false), set(8, 100, true), set(8, 100, false)]);
    expect(nextIncomplete(w, { exerciseIndex: 0, setIndex: 1 })).toEqual({ exerciseIndex: 0, setIndex: 2 });
    w.exercises[0].sets[2].completed = true;
    expect(nextIncomplete(w, { exerciseIndex: 0, setIndex: 2 })).toEqual({ exerciseIndex: 0, setIndex: 0 });
  });
});

describe('workoutPRs', () => {
  it('flags exercises that beat every earlier session', () => {
    const before = workout('a', '2026-11-09', [set(8, 130)]);
    const now = workout('b', '2026-11-16', [set(8, 135)]);
    expect(workoutPRs(now, [before, now])).toEqual(['Bench']);
    expect(workoutPRs(before, [before, now])).toEqual([]);
  });
});

describe('plan', () => {
  const weekPlan = { 0: null, 1: 'push-day', 2: null, 3: 'pull-day', 4: null, 5: 'leg-day', 6: null };
  it('uses overrides before the weekly plan', () => {
    expect(plannedTemplateId('2026-11-18', weekPlan, {})).toBe('pull-day');
    expect(plannedTemplateId('2026-11-18', weekPlan, { '2026-11-18': null })).toBeNull();
    expect(plannedTemplateId('2026-11-21', weekPlan, { '2026-11-21': 'pull-day' })).toBe('pull-day');
  });
  it('marks past planned days without a session as missed', () => {
    const byDay = workoutsByDay([workout('a', '2026-11-16', [set(8, 100)])]);
    const t = { id: 'x', name: 'X', exercises: [] };
    expect(dayStatus('2026-11-16', '2026-11-21', byDay, t)).toBe('done');
    expect(dayStatus('2026-11-18', '2026-11-21', byDay, t)).toBe('missed');
    expect(dayStatus('2026-11-23', '2026-11-21', byDay, t)).toBe('planned');
    expect(dayStatus('2026-11-17', '2026-11-21', byDay, null)).toBe('rest');
    expect(dayStatus('2026-11-18', '2026-11-21', byDay, t, '2026-11-21')).toBe('rest');
  });
  it('counts consecutive training weeks', () => {
    const today = '2026-11-21';
    const ws = [0, 1, 2].map((n) => workout(String(n), addDays(weekStart(today), -7 * n), [set(5, 100)]));
    expect(streakWeeks(ws, today)).toBe(3);
    expect(streakWeeks(ws.slice(1), today)).toBe(2);
    expect(streakWeeks([], today)).toBe(0);
  });
  it('starts weeks on Monday', () => {
    expect(weekStart('2026-11-21')).toBe('2026-11-16');
    expect(weekStart('2026-11-22')).toBe('2026-11-16');
  });
});

describe('parseRoute', () => {
  it('parses each tab', () => {
    expect(parseRoute('')).toEqual({ tab: 'plan', sheet: undefined });
    expect(parseRoute('#/plan/2026-11-18/add')).toEqual({ tab: 'plan', day: '2026-11-18', sheet: 'add' });
    expect(parseRoute('#/progress/settings')).toEqual({ tab: 'progress', sub: 'settings' });
    expect(parseRoute('#/library/templates/push-day')).toEqual({ tab: 'library', sub: 'templates', id: 'push-day' });
    expect(parseRoute('#/nope')).toEqual({ tab: 'plan', sheet: undefined });
  });
});
