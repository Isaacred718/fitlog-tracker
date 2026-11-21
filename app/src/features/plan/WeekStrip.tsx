import { dayOfMonth, longWeekday, monthDay, shortWeekday } from '../../lib/dates';
import type { DayStatus } from '../../lib/plan';

export interface StripDay { key: string; status: DayStatus; session: string | null }

const statusText: Record<DayStatus, string> = { done: 'done', missed: 'missed', planned: 'planned', rest: 'rest day' };

function StatusMark({ status }: { status: DayStatus }) {
  if (status === 'done') return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" /></svg>;
  if (status === 'missed') return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3.5v5.5" /><circle cx="8" cy="12.5" r=".6" /></svg>;
  if (status === 'planned') return <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="2.6" className="fill" /></svg>;
  return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 8h6" /></svg>;
}

/** Sticky glass week strip: done ✓, missed !, planned •, rest – (shape and label, never colour alone). */
export function WeekStrip({ days, selected, today, onSelect }: { days: StripDay[]; selected: string; today: string; onSelect: (key: string) => void }) {
  return (
    <div className="week-strip glass" role="group" aria-label="Days this week">
      {days.map((day) => (
        <button key={day.key} type="button" className={`day-cell is-${day.status}`} aria-pressed={day.key === selected}
          aria-current={day.key === today ? 'date' : undefined}
          aria-label={`${longWeekday(day.key)} ${monthDay(day.key)}${day.key === today ? ', today' : ''}: ${day.session ?? 'rest day'}, ${statusText[day.status]}`}
          onClick={() => onSelect(day.key)}>
          <span className="day-name">{shortWeekday(day.key).slice(0, 3)}</span>
          <span className="day-num">{dayOfMonth(day.key)}</span>
          <span className="day-mark"><StatusMark status={day.status} /></span>
        </button>
      ))}
    </div>
  );
}
