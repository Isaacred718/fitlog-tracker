import { useMemo } from 'react';
import { ExercisePicker } from '../../components/ExercisePicker';
import { Icon } from '../../components/Icon';
import { useChromeHeight } from '../../lib/hooks';
import {
  addDays, longWeekday, monthDay, todayKey, weekDays, weekStart, workoutDayKey,
} from '../../lib/dates';
import { dayStatus, plannedTemplate, streakWeeks, workoutsByDay } from '../../lib/plan';
import { closeSheet, navigate, planPath } from '../../lib/router';
import {
  formatDuration, lastPerformance, prefillExercise, sortedHistory, summarizeSets, totalSetCount,
  workoutPRs, workoutVolume,
  averageRpe, formatRpe, ratedSetCount, workoutRpe,
} from '../../lib/workouts';
import { useAppStore } from '../../store/useAppStore';
import type { Template, Workout } from '../../types/domain';
import { ActiveWorkout } from './ActiveWorkout';
import { SetDock } from './SetDock';
import { WeekStrip, type StripDay } from './WeekStrip';

function dayLabel(key: string, today: string) {
  if (key === today) return `Today · ${monthDay(key)}`;
  if (key === addDays(today, -1)) return `Yesterday · ${monthDay(key)}`;
  if (key === addDays(today, 1)) return `Tomorrow · ${monthDay(key)}`;
  return `${longWeekday(key)} · ${monthDay(key)}`;
}

/** Bottom-anchored primary action, in glass, sitting just above the tab bar. */
function BottomCta({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label?: string }) {
  const ref = useChromeHeight<HTMLDivElement>('--dock-h');
  return (
    <div className="dock-stack" ref={ref}>
      <button type="button" className="cta cta-xl" onClick={onClick} aria-label={label}>{children}</button>
    </div>
  );
}

function SessionPreview({ template, workouts }: { template: Template; workouts: Workout[] }) {
  return (
    <ol className="preview-list">
      {template.exercises.map((exercise) => {
        const last = lastPerformance(workouts, exercise.exerciseId);
        const filled = prefillExercise(exercise, workouts);
        return (
          <li key={exercise.exerciseId} className="preview-item">
            <span className="ex-title">{exercise.name}</span>
            <span className="ex-sub">{summarizeSets(filled.sets)}{filled.sets[0]?.actualWeight ? ' lb' : ''}{last ? ' · from last time' : ` · ${exercise.muscle}`}</span>
          </li>
        );
      })}
    </ol>
  );
}

function SessionSummary({ workout, workouts, highlight }: { workout: Workout; workouts: Workout[]; highlight: boolean }) {
  const volume = workoutVolume(workout);
  const prs = workoutPRs(workout, workouts);
  const previous = sortedHistory(workouts).find((item) => item.id !== workout.id && item.startTime < workout.startTime
    && (workout.templateId ? item.templateId === workout.templateId : item.name === workout.name));
  const delta = previous ? volume - workoutVolume(previous) : null;
  const effort = workoutRpe(workout);
  const rated = ratedSetCount(workout);
  return (
    <article className={`summary-card${highlight ? ' is-fresh' : ''}`} aria-label={`${workout.name} summary`}>
      <header>
        <h2>{highlight ? 'Session logged' : workout.name}</h2>
        {highlight && <p className="summary-lede">{workout.name} is in the books.</p>}
      </header>
      <dl className="summary-stats">
        <div><dt>Time</dt><dd>{formatDuration(workout.duration ?? 0)}</dd></div>
        <div><dt>Sets</dt><dd>{totalSetCount(workout)}</dd></div>
        <div><dt>Volume</dt><dd>{volume.toLocaleString()}<small> lb</small></dd></div>
      </dl>
      {effort !== null && (
        <p className="summary-note">Average effort <strong>RPE {formatRpe(effort)}</strong> across {rated} rated set{rated === 1 ? '' : 's'}.</p>
      )}
      {(delta !== null || prs.length > 0) && (
        <p className="summary-note">
          {delta !== null && <span>{delta >= 0 ? '+' : '−'}{Math.abs(delta).toLocaleString()} lb vs last {workout.name}. </span>}
          {prs.length > 0 && <span className="pr-line"><Icon name="trophy" size={16} /> New best: {prs.join(', ')}</span>}
        </p>
      )}
      <ul className="summary-lines">
        {workout.exercises.map((exercise) => {
          const exRpe = averageRpe(exercise.sets);
          return (
            <li key={exercise.exerciseId}><span>{exercise.name}</span><span>{summarizeSets(exercise.sets)}{exRpe !== null ? ` · RPE ${formatRpe(exRpe)}` : ''}</span></li>
          );
        })}
      </ul>
    </article>
  );
}

export function PlanScreen({ day, sheet }: { day?: string; sheet?: 'add' }) {
  const workouts = useAppStore((state) => state.workouts);
  const templates = useAppStore((state) => state.templates);
  const weekPlan = useAppStore((state) => state.weekPlan);
  const overrides = useAppStore((state) => state.planOverrides);
  const planStart = useAppStore((state) => state.planStart);
  const active = useAppStore((state) => state.activeWorkout);
  const lastFinishedId = useAppStore((state) => state.lastFinishedId);
  const startWorkout = useAppStore((state) => state.startWorkout);
  const finishWorkout = useAppStore((state) => state.finishWorkout);
  const addExercise = useAppStore((state) => state.addExercise);
  const moveSession = useAppStore((state) => state.moveSession);
  const skipDay = useAppStore((state) => state.skipDay);

  const today = todayKey();
  const activeDay = active ? workoutDayKey(active) : null;
  const selected = day ?? activeDay ?? today;
  const byDay = useMemo(() => workoutsByDay(workouts), [workouts]);
  const thisWeek = weekDays(today);
  const days: StripDay[] = weekDays(selected).map((key) => {
    const planned = plannedTemplate(key, weekPlan, overrides, templates);
    const status = dayStatus(key, today, byDay, planned, planStart);
    return { key, status, session: byDay.get(key)?.[0]?.name ?? planned?.name ?? null };
  });
  const weekStats = thisWeek.map((key) => dayStatus(key, today, byDay, plannedTemplate(key, weekPlan, overrides, templates), planStart));
  const doneCount = weekStats.filter((status) => status === 'done').length;
  const goal = weekStats.filter((status) => status !== 'rest').length;
  const streak = streakWeeks(workouts, today);
  const missed = active ? undefined : [...thisWeek].reverse().find((key, index) => key < today && weekStats[6 - index] === 'missed');
  const missedTemplate = missed ? plannedTemplate(missed, weekPlan, overrides, templates) : null;
  // Moving a missed session onto a day that already has a logged workout
  // would bury it (the day reads as done and the session never surfaces),
  // so fall forward to tomorrow when today is already trained.
  const moveTarget = byDay.get(today)?.length ? addDays(today, 1) : today;

  const planned = plannedTemplate(selected, weekPlan, overrides, templates);
  const finished = byDay.get(selected) ?? [];
  const isActiveHere = !!active && activeDay === selected;
  const canStart = selected <= today && !active;
  const select = (key: string) => navigate(planPath(key === today ? undefined : key), { replace: true });
  const finish = () => finishWorkout();

  return (
    <div className="screen plan-screen">
      <header className={`plan-top${weekStart(selected) !== weekStart(today) ? ' is-away' : ''}`}>
        <div className="brand" aria-label="Dadbod Fitness"><span className="brand-mark" aria-hidden="true" /><span className="brand-text">Dadbod <span>Fitness</span></span></div>
        <div className="week-nav">
          {weekStart(selected) !== weekStart(today) && (
            <button type="button" className="glass-btn today-chip" onClick={() => select(today)}>Today</button>
          )}
          <button type="button" className="icon-btn" aria-label="Previous week" onClick={() => select(addDays(selected, -7))}><Icon name="chevronLeft" /></button>
          <button type="button" className="icon-btn" aria-label="Next week" onClick={() => select(addDays(selected, 7))}><Icon name="chevronRight" /></button>
        </div>
      </header>
      <p className="streak-line">
        <strong>Week of {monthDay(weekStart(selected))}</strong> · <span className="streak">{streak > 0 ? `${streak}-week streak` : 'Start a streak'}</span>
        {(goal > 0 || doneCount > 0) && ` · ${doneCount} of ${Math.max(goal, doneCount)} done`}
      </p>

      <WeekStrip days={days} selected={selected} today={today} onSelect={select} />

      {missed && missedTemplate && (
        <aside className="missed-banner" aria-label="Missed session">
          <p><strong>Missed {longWeekday(missed)}</strong> · {missedTemplate.name}</p>
          <div className="chip-row">
            <button type="button" className="chip chip-lg chip-accent" onClick={() => { moveSession(missed, moveTarget); select(moveTarget); }}>{moveTarget === today ? 'Move to today' : 'Move to tomorrow'}</button>
            <button type="button" className="chip chip-lg" onClick={() => skipDay(missed)}>Skip</button>
          </div>
        </aside>
      )}

      {active && !isActiveHere && (
        <button type="button" className="resume-banner glass" onClick={() => activeDay && navigate(planPath(activeDay === today ? undefined : activeDay))}>
          <span><strong>{active.name} in progress</strong><small>Tap to keep logging</small></span><Icon name="chevronRight" />
        </button>
      )}

      {isActiveHere && active ? (
        <>
          <ActiveWorkout workout={active} dayKey={selected} onFinish={finish} />
          <SetDock workout={active} onFinish={finish} />
        </>
      ) : (
        <section className="day-panel" aria-labelledby="day-title">
          {finished.length > 0 ? (
            <>
              <p className="day-meta">{dayLabel(selected, today)}</p>
              <h1 id="day-title" className="visually-hidden">{dayLabel(selected, today)}</h1>
              {sortedHistory(finished).map((workout) => (
                <SessionSummary key={workout.id} workout={workout} workouts={workouts} highlight={workout.id === lastFinishedId} />
              ))}
            </>
          ) : planned ? (
            <>
              <header className="day-head">
                <div>
                  <h1 id="day-title">{planned.name}</h1>
                  <p className="day-meta">{dayLabel(selected, today)} · {planned.exercises.length} exercises · {totalSetCount(planned)} sets</p>
                </div>
              </header>
              {planned.nutrition && <p className="fuel-note">{planned.nutrition.summary}</p>}
              <SessionPreview template={planned} workouts={workouts} />
              {selected > today && <p className="quiet-note">Planned for {longWeekday(selected)}. It opens here on the day.</p>}
              {canStart && (
                <BottomCta onClick={() => startWorkout(planned.id, selected)}>
                  <Icon name="play" size={26} /> {selected === today ? `Start ${planned.name}` : `Log ${planned.name}`}
                </BottomCta>
              )}
            </>
          ) : (
            <>
              <header className="day-head">
                <div>
                  <h1 id="day-title">Rest day</h1>
                  <p className="day-meta">{dayLabel(selected, today)}</p>
                </div>
              </header>
              <p className="rest-copy-lg">Nothing planned. Recover, walk, eat well. Or, if you’re itching, pick a session.</p>
            </>
          )}

          {canStart && !planned && finished.length === 0 && (
            <div className="chip-row wrap start-anyway">
              {templates.map((template) => (
                <button type="button" key={template.id} className="chip chip-lg" onClick={() => startWorkout(template.id, selected)}>{template.name}</button>
              ))}
              <button type="button" className="chip chip-lg" onClick={() => startWorkout(null, selected)}>Empty workout</button>
            </div>
          )}
          {canStart && finished.length > 0 && (
            <button type="button" className="ghost-btn wide" onClick={() => startWorkout(planned?.id ?? null, selected)}><Icon name="plus" size={20} /> Log another session</button>
          )}
        </section>
      )}

      {sheet === 'add' && active && (
        <ExercisePicker exclude={active.exercises.map((item) => item.exerciseId)}
          onPick={(exercise) => { addExercise(exercise); closeSheet(selected === today ? undefined : selected); }}
          onClose={() => closeSheet(selected === today ? undefined : selected)} />
      )}
    </div>
  );
}

