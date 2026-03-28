const PARTIAL_LABELS = {
  incident_record: 'Incident record',
  advice: 'Rights & advice',
  navigation: 'Next steps',
};

export default function ErrorScreen({ error, partial, onRetry, onExit }) {
  const hasPartial = partial && Object.values(partial).some(v => v !== null && v !== undefined);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: 'linear-gradient(160deg, #1a1f36 0%, #1e2444 60%, #1a1f36 100%)' }}
    >
      <div className="w-full max-w-sm flex flex-col gap-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-white/50 text-sm leading-relaxed">{error}</p>
        </div>

        {hasPartial && (
          <div className="bg-white rounded-3xl shadow-card p-5 flex flex-col gap-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Progress so far</p>
            {Object.entries(PARTIAL_LABELS).map(([key, label]) => {
              const done = partial[key] !== null && partial[key] !== undefined;
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{label}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${done ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                    {done ? '✓ Done' : '○ Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={onRetry}
          className="w-full py-4 rounded-2xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          Try again
        </button>
        <button
          onClick={onExit}
          className="w-full py-3 text-sm text-white/40 hover:text-white/60 transition-colors text-center"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
