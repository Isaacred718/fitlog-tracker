import { useMemo, useState } from 'react';
import { exerciseOptions, type ExerciseOption } from '../data/exercises';
import { Icon } from './Icon';
import { Sheet } from './Sheet';

interface Props {
  title?: string;
  exclude: string[];
  onPick: (exercise: ExerciseOption) => void;
  onClose: () => void;
}

/** Picker sheet: filter by muscle, optional search (not auto-focused, so the keyboard stays down). */
export function ExercisePicker({ title = 'Add exercise', exclude, onPick, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState('All');
  const muscles = useMemo(() => ['All', ...new Set(exerciseOptions.map((item) => item.muscle))], []);
  const results = exerciseOptions.filter((item) =>
    (muscle === 'All' || item.muscle === muscle) && item.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Sheet title={title} onClose={onClose}>
      <label className="search-field">
        <Icon name="search" size={20} />
        <span className="visually-hidden">Search exercises</span>
        <input type="search" placeholder="Search exercises" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <div className="chip-row" role="group" aria-label="Filter by muscle">
        {muscles.map((item) => (
          <button type="button" key={item} className="chip" aria-pressed={muscle === item} onClick={() => setMuscle(item)}>{item}</button>
        ))}
      </div>
      <ul className="pick-list">
        {results.map((item) => {
          const added = exclude.includes(item.id);
          return (
            <li key={item.id}>
              <button type="button" className="pick-item" disabled={added} onClick={() => onPick(item)}>
                <span><strong>{item.name}</strong><small>{item.muscle}</small></span>
                <span className="pick-add" aria-hidden="true">{added ? <Icon name="check" /> : <Icon name="plus" />}</span>
                <span className="visually-hidden">{added ? 'Already added' : 'Add'}</span>
              </button>
            </li>
          );
        })}
        {!results.length && <li className="empty-line">Nothing matches “{query}”.</li>}
      </ul>
    </Sheet>
  );
}
