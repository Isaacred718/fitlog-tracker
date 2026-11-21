import { useEffect, useRef, type CSSProperties, type PointerEvent } from 'react';
import { Icon } from './Icon';

interface StepperProps {
  label: string;
  value: number;
  step: number;
  min?: number;
  max?: number;
  unit?: string;
  decimal?: boolean;
  size?: 'large' | 'compact';
  onChange: (value: number) => void;
}

/** Hold-to-repeat button: one step on press, then repeats and speeds up while held. */
function RepeatButton({ label, icon, onStep }: { label: string; icon: 'plus' | 'minus'; onStep: () => void }) {
  const timer = useRef<number | null>(null);
  const pressed = useRef(false);
  const latest = useRef(onStep);
  latest.current = onStep;

  const stop = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);

  const start = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    pressed.current = true;
    latest.current();
    let delay = 420;
    const tick = () => {
      latest.current();
      delay = Math.max(60, delay * 0.78);
      timer.current = window.setTimeout(tick, delay);
    };
    timer.current = window.setTimeout(tick, delay);
  };

  return (
    <button type="button" className="step-btn" aria-label={label}
      onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
      onContextMenu={(event) => event.preventDefault()}
      onClick={(event) => {
        // Pointer presses already stepped; keyboard (Enter/Space) arrives as a click with detail 0.
        if (pressed.current && event.detail !== 0) { pressed.current = false; return; }
        pressed.current = false;
        latest.current();
      }}>
      <Icon name={icon} size={26} />
    </button>
  );
}

export function Stepper({ label, value, step, min = 0, max = 2000, unit, decimal, size = 'large', onChange }: StepperProps) {
  const set = (next: number) => onChange(Math.min(max, Math.max(min, Math.round(next * 10) / 10)));
  const valueRef = useRef(value);
  valueRef.current = value;
  return (
    <div className={`stepper stepper-${size}`} role="group" aria-label={label}>
      <RepeatButton label={`Decrease ${label}`} icon="minus" onStep={() => set(valueRef.current - step)} />
      <label className="stepper-value">
        <span className="visually-hidden">{label}</span>
        <input style={{ '--chars': `${Math.max(2, String(value).length) + 0.4}ch` } as CSSProperties} type="number" inputMode={decimal ? 'decimal' : 'numeric'} value={value} min={min} max={max} step={step}
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) => set(Number(event.target.value))} />
        {unit && <span className="stepper-unit" aria-hidden="true">{unit}</span>}
      </label>
      <RepeatButton label={`Increase ${label}`} icon="plus" onStep={() => set(valueRef.current + step)} />
    </div>
  );
}
