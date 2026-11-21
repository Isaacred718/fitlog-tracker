import { useState } from 'react';
import { ExercisePicker } from '../../components/ExercisePicker';
import { Icon } from '../../components/Icon';
import { Stepper } from '../../components/Stepper';
import { navigate, planPath } from '../../lib/router';
import { useAppStore } from '../../store/useAppStore';

export function TemplateEditor({ templateId }: { templateId: string }) {
  const template = useAppStore((state) => state.templates.find((item) => item.id === templateId));
  const active = useAppStore((state) => state.activeWorkout);
  const renameTemplate = useAppStore((state) => state.renameTemplate);
  const deleteTemplate = useAppStore((state) => state.deleteTemplate);
  const addTemplateExercise = useAppStore((state) => state.addTemplateExercise);
  const removeTemplateExercise = useAppStore((state) => state.removeTemplateExercise);
  const updateTemplateExercise = useAppStore((state) => state.updateTemplateExercise);
  const startWorkout = useAppStore((state) => state.startWorkout);
  const [picking, setPicking] = useState(false);

  const header = (
    <header className="screen-head">
      <a className="icon-btn" href="#/library/templates" aria-label="Back to templates"><Icon name="chevronLeft" /></a>
      <h1 className="truncate">{template?.name || 'Template'}</h1>
      <span className="icon-btn-spacer" aria-hidden="true" />
    </header>
  );
  if (!template) {
    return <div className="screen">{header}<section className="empty-state"><h2>Template not found</h2><p>It may have been deleted.</p>
      <a className="glass-btn" href="#/library/templates">Back to templates</a></section></div>;
  }

  return (
    <div className="screen">
      {header}
      <label className="field">
        <span>Name</span>
        <input value={template.name} onChange={(event) => renameTemplate(template.id, event.target.value)} />
      </label>

      <ol className="editor-list">
        {template.exercises.map((exercise, index) => {
          const first = exercise.sets[0];
          return (
            <li key={exercise.exerciseId} className="editor-card">
              <div className="editor-card-head">
                <span><strong>{exercise.name}</strong><small>{exercise.muscle}</small></span>
                <button type="button" className="icon-btn ghost-danger" aria-label={`Remove ${exercise.name}`} onClick={() => removeTemplateExercise(template.id, index)}>
                  <Icon name="trash" size={22} />
                </button>
              </div>
              <div className="editor-grid">
                <div><span className="mini-label">Sets</span><Stepper size="compact" label={`${exercise.name} sets`} step={1} min={1} max={10} value={exercise.sets.length} onChange={(value) => updateTemplateExercise(template.id, index, 'sets', value)} /></div>
                <div><span className="mini-label">Reps</span><Stepper size="compact" label={`${exercise.name} reps`} step={1} max={100} value={first?.reps ?? 10} onChange={(value) => updateTemplateExercise(template.id, index, 'reps', value)} /></div>
                <div><span className="mini-label">Start weight (lb)</span><Stepper size="compact" decimal label={`${exercise.name} weight`} step={5} value={first?.weight ?? 0} onChange={(value) => updateTemplateExercise(template.id, index, 'weight', value)} /></div>
                <div><span className="mini-label">Rest (s)</span><Stepper size="compact" label={`${exercise.name} rest`} step={15} max={600} value={first?.rest ?? 90} onChange={(value) => updateTemplateExercise(template.id, index, 'rest', value)} /></div>
              </div>
            </li>
          );
        })}
      </ol>
      {!template.exercises.length && <p className="quiet-note">No exercises yet. Add a few and this becomes a one-tap session.</p>}
      <button type="button" className="glass-btn wide" onClick={() => setPicking(true)}><Icon name="plus" size={22} /> Add exercise</button>

      <div className="editor-footer">
        <button type="button" className="cta" disabled={!!active || !template.exercises.length}
          onClick={() => { startWorkout(template.id); navigate(planPath()); }}>
          <Icon name="play" /> {active ? 'Finish your current workout first' : 'Start today'}
        </button>
        <button type="button" className="ghost-btn ghost-danger wide" onClick={() => { deleteTemplate(template.id); navigate('/library/templates'); }}>
          <Icon name="trash" size={20} /> Delete template
        </button>
      </div>

      {picking && (
        <ExercisePicker exclude={template.exercises.map((item) => item.exerciseId)}
          onPick={(exercise) => { addTemplateExercise(template.id, exercise); setPicking(false); }}
          onClose={() => setPicking(false)} />
      )}
    </div>
  );
}
