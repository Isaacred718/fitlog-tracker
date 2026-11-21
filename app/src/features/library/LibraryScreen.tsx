import { useMemo, useState } from 'react';
import { Icon } from '../../components/Icon';
import { VideoGuideIconButton } from '../../components/VideoGuide';
import { exerciseOptions } from '../../data/exercises';
import { WEEKDAY_NAMES, WEEK_ORDER } from '../../lib/dates';
import { navigate } from '../../lib/router';
import { bestSet, formatWeight, totalSetCount } from '../../lib/workouts';
import { useAppStore } from '../../store/useAppStore';
import { TemplateEditor } from './TemplateEditor';

function Segments({ sub }: { sub: 'exercises' | 'templates' }) {
  return (
    <nav className="segments glass" aria-label="Library sections">
      <a href="#/library" aria-current={sub === 'exercises' ? 'page' : undefined}>Exercises</a>
      <a href="#/library/templates" aria-current={sub === 'templates' ? 'page' : undefined}>Templates</a>
    </nav>
  );
}

function Exercises() {
  const workouts = useAppStore((state) => state.workouts);
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState('All');
  const muscles = useMemo(() => ['All', ...new Set(exerciseOptions.map((item) => item.muscle))], []);
  const results = exerciseOptions.filter((item) =>
    (muscle === 'All' || item.muscle === muscle) && item.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <>
      <label className="search-field">
        <Icon name="search" size={20} />
        <span className="visually-hidden">Search exercises</span>
        <input type="search" placeholder="Search exercises" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <div className="chip-row" role="group" aria-label="Filter by muscle">
        {muscles.map((item) => <button type="button" key={item} className="chip" aria-pressed={muscle === item} onClick={() => setMuscle(item)}>{item}</button>)}
      </div>
      <ul className="catalog">
        {results.map((item) => {
          const best = bestSet(workouts, item.id);
          return (
            <li key={item.id} className="catalog-item">
              <span><strong>{item.name}</strong><small>{item.muscle}</small></span>
              <span className="catalog-right">
                {best && best.weight > 0 ? <span className="catalog-best">{formatWeight(best.weight)}<small> lb best</small></span> : <span className="catalog-best is-empty">Not logged yet</span>}
                <VideoGuideIconButton name={item.name} />
              </span>
            </li>
          );
        })}
        {!results.length && <li className="empty-line">Nothing matches “{query}”.</li>}
      </ul>
    </>
  );
}

function Templates() {
  const templates = useAppStore((state) => state.templates);
  const weekPlan = useAppStore((state) => state.weekPlan);
  const createTemplate = useAppStore((state) => state.createTemplate);
  return (
    <>
      <ul className="template-cards">
        {templates.map((template) => {
          const days = WEEK_ORDER.filter((day) => weekPlan[day] === template.id).map((day) => WEEKDAY_NAMES[day].slice(0, 3));
          return (
            <li key={template.id}>
              <a className="template-card" href={`#/library/templates/${encodeURIComponent(template.id)}`}>
                <span>
                  <strong>{template.name}</strong>
                  <small>{template.exercises.length} exercises · {totalSetCount(template)} sets{days.length ? ` · ${days.join(', ')}` : ''}</small>
                </span>
                <Icon name="chevronRight" />
              </a>
            </li>
          );
        })}
      </ul>
      <button type="button" className="glass-btn wide" onClick={() => navigate(`/library/templates/${encodeURIComponent(createTemplate())}`)}>
        <Icon name="plus" size={22} /> New template
      </button>
    </>
  );
}

export function LibraryScreen({ sub, id }: { sub: 'exercises' | 'templates'; id?: string }) {
  if (sub === 'templates' && id) return <TemplateEditor templateId={id} />;
  return (
    <div className="screen">
      <header className="screen-head"><h1>Library</h1></header>
      <Segments sub={sub} />
      {sub === 'templates' ? <Templates /> : <Exercises />}
    </div>
  );
}
