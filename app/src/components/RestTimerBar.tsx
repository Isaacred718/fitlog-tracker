import { useEffect, useRef } from 'react';
import { useNow } from '../lib/hooks';
import { formatDuration } from '../lib/workouts';
import { useAppStore } from '../store/useAppStore';

/** Inline glass rest timer. The log stays visible; it buzzes at zero and clears itself. */
export function RestTimerBar({ nextLabel }: { nextLabel: string | null }) {
  const restEndsAt = useAppStore((state) => state.restEndsAt);
  const restDuration = useAppStore((state) => state.restDuration);
  const addRest = useAppStore((state) => state.addRest);
  const skipRest = useAppStore((state) => state.skipRest);
  const showToast = useAppStore((state) => state.showToast);
  const now = useNow(restEndsAt !== null, 250);
  const fired = useRef<number | null>(null);
  const remaining = restEndsAt === null ? 0 : restEndsAt - now;

  useEffect(() => {
    if (restEndsAt === null || remaining > 0 || fired.current === restEndsAt) return;
    fired.current = restEndsAt;
    // Only buzz when the timer actually ran out in front of the user, not when reopening the app later.
    if (remaining > -3000) {
      navigator.vibrate?.([180, 90, 180]);
      showToast(nextLabel ? `Rest's up. ${nextLabel}` : "Rest's up");
    }
    skipRest();
  }, [remaining, restEndsAt, skipRest, showToast, nextLabel]);

  if (restEndsAt === null) return null;
  const progress = restDuration > 0 ? Math.min(1, Math.max(0, remaining / (restDuration * 1000))) : 0;
  return (
    <section className="rest-bar" aria-label="Rest timer">
      <div className="rest-fill" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <div className="rest-copy" role="timer" aria-live="off">
        <span className="rest-time">{formatDuration(remaining + 999)}</span>
        <span className="rest-next">{nextLabel ? `Next · ${nextLabel}` : 'Resting'}</span>
      </div>
      <button type="button" className="glass-btn" onClick={() => addRest(15)} aria-label="Add 15 seconds of rest">+15s</button>
      <button type="button" className="glass-btn" onClick={skipRest}>Skip</button>
    </section>
  );
}
