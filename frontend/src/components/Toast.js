'use client';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const styles = {
    info: 'bg-blue-600',
    success: 'bg-emerald-600',
    error: 'bg-rose-600'
  };

  return (
    <div className={`fixed right-4 top-4 z-50 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${styles[type] || styles.info}`}>
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button onClick={onClose} className="rounded bg-white/20 px-2 py-0.5 text-xs">Close</button>
      </div>
    </div>
  );
}
