import { useMemo } from 'react';
import { Icon } from '../../components/Icon';
import { addDays, monthDay, todayKey, weekStart, workoutDayKey } from '../../lib/dates';
import { streakWeeks } from '../../lib/plan';
import { navigate, planPath } from '../../lib/router';
import { bestSet, formatDuration, formatWeight, sortedHistory, summarizeSets, totalSetCount, workoutVolume } from '../../lib/workouts';
import { useAppStore } from '../../store/useAppStore';

function compact(value: number) {
  return value >= 10000 ? `${Math.round(value / 1000)}k` : value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);
}

export function ProgressScreen() {
  const workouts = useAppStore((state) => state.workouts);
  const today = todayKey();
  const history = useMemo(() => sortedHistory(workouts), [workouts]);

  const weeks = useMemo(() => {
    const current = weekStart(today);
    return Array.from({ length: 8 }, (_, index) => {
      const start = addDays(current, (index - 7) * 7);
      const volume = workouts.filter((workout) => weekStart(workoutDayKey(workout)) === start).reduce((sum, workout) => sum + workoutVolume(workout), 0);
      return { start, volume };
    });
  }, [workouts, today]);
  const peak = Math.max(1, ...weeks.map((week) => week.volume));
  const thisWeek = weeks[7].volume;
  const lastWeek = weeks[6].volume;

  const bests = useMemo(() => {
    const ids = new Map<string, string>();
    workouts.forEach((workout) => workout.exercises.forEach((exercise) => ids.set(exercise.exerciseId, exercise.name)));
    return [...ids].map(([id, name]) => ({ id, name, best: bestSet(workouts, id) }))
      .filter((item) => item.best && item.best.weight > 0)
      .sort((a, b) => (b.best?.weight ?? 0) - (a.best?.weight ?? 0))
      .slice(0, 5);
  }, [workouts]);

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Progress</h1>
        <a className="icon-btn" href="#/progress/settings" aria-label="Settings"><Icon name="gear" /></a>
      </header>

      {history.length === 0 ? (
        <section className="empty-state">
          <h2>Your first session lands here</h2>
          <p>Log a workout from Plan and you’ll see weekly volume, best lifts and every session you’ve finished.</p>
          <button type="button" className="cta" onClick={() => navigate(planPath())}><Icon name="plan" /> Go to Plan</button>
        </section>
      ) : (
        <>
          <section className="panel" aria-labelledby="vol-title">
            <div className="panel-head">
              <h2 id="vol-title">Weekly volume</h2>
              <p className="panel-figure">{thisWeek.toLocaleString()}<small> lb this week</small></p>
              <p className="panel-sub">{lastWeek > 0 ? `${thisWeek >= lastWeek ? 'Up' : 'Down'} ${Math.abs(Math.round(((thisWeek - lastWeek) / lastWeek) * 100))}% on last week` : 'Last 8 weeks'}</p>
            </div>
            <ol className="bars" aria-label="Volume per week, last 8 weeks">
              {weeks.map((week, index) => (
                <li key={week.start} className={index === 7 ? 'is-now' : ''} aria-label={`Week of ${monthDay(week.start)}: ${week.volume.toLocaleString()} pounds`}>
                  <span className="bar-value" aria-hidden="true">{week.volume ? compact(week.volume) : ''}</span>
                  <span className="bar" style={{ height: `${Math.max(4, (week.volume / peak) * 100)}%` }} aria-hidden="true" />
                  <span className="bar-label" aria-hidden="true">{week.start.slice(5).replace('-', '/').replace(/^0/, '').replace('/0', '/')}</span>
                </li>
              ))}
            </ol>
            <p className="panel-foot">{streakWeeks(workouts, today)}-week streak · {workouts.length} sessions logged</p>
          </section>

          {bests.length > 0 && (
            <section className="panel" aria-labelledby="best-title">
              <h2 id="best-title">Best lifts</h2>
              <ul className="best-list">
                {bests.map((item) => (
                  <li key={item.id}><span>{item.name}</span><strong>{formatWeight(item.best!.weight)}<small> lb × {item.best!.reps}</small></strong></li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="hist-title">
            <h2 id="hist-title" className="section-title">History</h2>
            <ul className="history-list">
              {history.map((workout) => {
                const key = workoutDayKey(workout);
                return (
                  <li key={workout.id}>
                    <a className="history-item" href={`#${planPath(key === today ? undefined : key)}`}>
                      <span className="history-date"><strong>{monthDay(key).split(' ')[1]}</strong><small>{monthDay(key).split(' ')[0]}</small></span>
                      <span className="history-body">
                        <strong>{workout.name}</strong>
                        <small>{totalSetCount(workout)} sets · {workoutVolume(workout).toLocaleString()} lb · {formatDuration(workout.duration ?? 0)}</small>
                        <small className="history-lines">{workout.exercises.slice(0, 3).map((exercise) => `${exercise.name} ${summarizeSets(exercise.sets)}`).join(' · ')}</small>
                      </span>
                      <Icon name="chevronRight" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
