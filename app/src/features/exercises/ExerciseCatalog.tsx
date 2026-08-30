import { useMemo, useState } from 'react';
import { exerciseOptions } from '../../data/exercises';

export function ExerciseCatalog() {
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState('All');
  const muscles = ['All', ...new Set(exerciseOptions.map((exercise) => exercise.muscle))];
  const results = useMemo(() => exerciseOptions.filter((exercise) =>
    (muscle === 'All' || exercise.muscle === muscle) && exercise.name.toLowerCase().includes(query.toLowerCase()),
  ), [muscle, query]);
  return <section>
    <p className="eyebrow">Exercise library</p><h1>Exercises</h1>
    <input className="search" aria-label="Search exercises" placeholder="Search exercises" value={query} onChange={(event) => setQuery(event.target.value)} />
    <div className="chips">{muscles.map((item) => <button className={muscle === item ? 'selected' : 'secondary'} onClick={() => setMuscle(item)} key={item}>{item}</button>)}</div>
    <div className="catalog-list">{results.map((exercise) => <article className="catalog-item" key={exercise.id}><strong>{exercise.name}</strong><span>{exercise.muscle}</span></article>)}</div>
  </section>;
}
