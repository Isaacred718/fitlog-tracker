import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

/** Bottom toast with Undo, so deleting is never instant or irreversible. */
export function Toast() {
  const toast = useAppStore((state) => state.toast);
  const dismiss = useAppStore((state) => state.dismissToast);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(dismiss, toast.undo ? 6000 : 3500);
    return () => window.clearTimeout(id);
  }, [toast, dismiss]);
  if (!toast) return null;
  return (
    <div className="toast glass" role="status" aria-live="polite" key={toast.id}>
      <span>{toast.message}</span>
      {toast.undo && <button type="button" className="toast-undo" onClick={() => { toast.undo?.(); dismiss(); }}>Undo</button>}
    </div>
  );
}
