const TYPE_STYLES = {
  counseling: { bg: 'bg-blue-50', border: 'border-blue-100', icon: '#3b82f6' },
  advocacy:   { bg: 'bg-purple-50', border: 'border-purple-100', icon: '#8b5cf6' },
  support:    { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: '#10b981' },
  crisis:     { bg: 'bg-red-50', border: 'border-red-100', icon: '#ef4444' },
  safety:     { bg: 'bg-amber-50', border: 'border-amber-100', icon: '#f59e0b' },
};

export default function SupportResources({ resources }) {
  if (!resources || resources.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Support resources for you</p>
      </div>
      <div className="flex flex-col gap-2.5">
        {resources.map((r) => {
          const style = TYPE_STYLES[r.type] || TYPE_STYLES.support;
          return (
            <div key={r.name} className={`flex items-start gap-3 p-3 rounded-2xl border ${style.bg} ${style.border}`}>
              <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={style.icon} strokeWidth="2" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                <p className="text-xs font-bold text-slate-700 mt-1">{r.contact}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
