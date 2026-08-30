import { useState } from 'react';
import { exerciseOptions } from '../../data/exercises';
import { useAppStore } from '../../store/useAppStore';

export function TemplateEditor() {
  const templates = useAppStore((state) => state.templates);
  const createTemplate = useAppStore((state) => state.createTemplate);
  const renameTemplate = useAppStore((state) => state.renameTemplate);
  const deleteTemplate = useAppStore((state) => state.deleteTemplate);
  const addTemplateExercise = useAppStore((state) => state.addTemplateExercise);
  const removeTemplateExercise = useAppStore((state) => state.removeTemplateExercise);
  const updateTemplateSet = useAppStore((state) => state.updateTemplateSet);
  const startTemplateWorkout = useAppStore((state) => state.startTemplateWorkout);
  const [selectedId, setSelectedId] = useState<string | null>(templates[0]?.id ?? null);
  const selected = templates.find((template) => template.id === selectedId) ?? null;

  const create = () => setSelectedId(createTemplate());
  if (!selected) return <section><p className="eyebrow">Routines</p><h1>Templates</h1><button onClick={create}>Create template</button></section>;
  return <section>
    <div className="templates-header"><div><p className="eyebrow">Routines</p><h1>Templates</h1></div><button onClick={create}>+ New</button></div>
    <div className="template-tabs">{templates.map((template) => <button key={template.id} className={template.id === selected.id ? 'selected' : 'secondary'} onClick={() => setSelectedId(template.id)}>{template.name}</button>)}</div>
    <article className="template-editor">
      <label>Template name<input value={selected.name} onChange={(event) => renameTemplate(selected.id, event.target.value)} /></label>
      {selected.exercises.map((exercise, exerciseIndex) => <div className="template-exercise" key={exercise.exerciseId}>
        <div><strong>{exercise.name}</strong><span>{exercise.muscle}</span></div><button className="danger small" onClick={() => removeTemplateExercise(selected.id, exerciseIndex)}>Remove</button>
        {exercise.sets.map((workoutSet, setIndex) => <div className="planned-set" key={setIndex}><span>Set {setIndex + 1}</span>
          <input aria-label={`${exercise.name} set ${setIndex + 1} reps`} type="number" value={workoutSet.reps} onChange={(event) => updateTemplateSet(selected.id, exerciseIndex, setIndex, 'reps', Number(event.target.value))} />
          <input aria-label={`${exercise.name} set ${setIndex + 1} weight`} type="number" value={workoutSet.weight} onChange={(event) => updateTemplateSet(selected.id, exerciseIndex, setIndex, 'weight', Number(event.target.value))} />
          <input aria-label={`${exercise.name} set ${setIndex + 1} rest`} type="number" value={workoutSet.rest} onChange={(event) => updateTemplateSet(selected.id, exerciseIndex, setIndex, 'rest', Number(event.target.value))} />
        </div>)}</div>)}
      <label className="exercise-picker">Add exercise<select defaultValue="" onChange={(event) => { const option = exerciseOptions.find((item) => item.id === event.target.value); if (option) addTemplateExercise(selected.id, option); event.currentTarget.value = ''; }}><option value="" disabled>Select an exercise</option>{exerciseOptions.map((option) => <option key={option.id} value={option.id}>{option.name} · {option.muscle}</option>)}</select></label>
      <div className="template-actions"><button onClick={() => startTemplateWorkout(selected)}>Start this workout</button><button className="danger" onClick={() => { deleteTemplate(selected.id); setSelectedId(templates.find((template) => template.id !== selected.id)?.id ?? null); }}>Delete template</button></div>
    </article>
  </section>;
}
