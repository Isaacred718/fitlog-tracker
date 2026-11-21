import { Icon } from '../../components/Icon';
import { WEEKDAY_NAMES, WEEK_ORDER } from '../../lib/dates';
import { useAppStore } from '../../store/useAppStore';

export function SettingsScreen() {
  const templates = useAppStore((state) => state.templates);
  const weekPlan = useAppStore((state) => state.weekPlan);
  const setWeekday = useAppStore((state) => state.setWeekday);
  const workouts = useAppStore((state) => state.workouts);
  const showToast = useAppStore((state) => state.showToast);

  const exportData = () => {
    const { workouts: w, templates: t, weekPlan: p, planOverrides } = useAppStore.getState();
    const blob = new Blob([JSON.stringify({ app: 'Dadbod Fitness', exportedAt: new Date().toISOString(), workouts: w, templates: t, weekPlan: p, planOverrides }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), { href: url, download: `dadbod-fitness-${new Date().toISOString().slice(0, 10)}.json` });
    link.click();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded');
  };

  return (
    <div className="screen">
      <header className="screen-head">
        <a className="icon-btn" href="#/progress" aria-label="Back to Progress"><Icon name="chevronLeft" /></a>
        <h1>Settings</h1>
        <span className="icon-btn-spacer" aria-hidden="true" />
      </header>

      <section className="panel" aria-labelledby="plan-title">
        <h2 id="plan-title">Weekly plan</h2>
        <p className="panel-sub">Each day repeats every week and fills your Plan calendar.</p>
        <ul className="plan-rows">
          {WEEK_ORDER.map((day) => (
            <li key={day}>
              <label className="select-row">
                <span>{WEEKDAY_NAMES[day]}</span>
                <select value={weekPlan[day] ?? ''} onChange={(event) => setWeekday(day, event.target.value || null)}>
                  <option value="">Rest</option>
                  {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                </select>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel" aria-labelledby="data-title">
        <h2 id="data-title">Your data</h2>
        <p className="panel-sub">{workouts.length} sessions and {templates.length} templates, stored on this device.</p>
        <button type="button" className="glass-btn wide" onClick={exportData}><Icon name="download" size={22} /> Download backup (JSON)</button>
      </section>

      <p className="quiet-note center">Dadbod Fitness · React preview build</p>
    </div>
  );
}
