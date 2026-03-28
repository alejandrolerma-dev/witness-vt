import ExitButton from '../components/ExitButton';

const steps = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    color: 'bg-violet-100 text-violet-600',
    title: 'Document',
    desc: 'Your words, structured into a clear record',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
    color: 'bg-blue-100 text-blue-600',
    title: 'Understand',
    desc: 'Know your rights under VT policy',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
      </svg>
    ),
    color: 'bg-emerald-100 text-emerald-600',
    title: 'Act',
    desc: 'Get a step-by-step path and draft statement',
  },
];

export default function LandingPage({ onStart, onExit, sessionStatus, sessionError }) {
  const isLoading = sessionStatus === 'loading';
  const isError = sessionStatus === 'error';
  const isReady = sessionStatus === 'ready';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #1a1f36 0%, #1e2444 60%, #1a1f36 100%)' }}
    >
      <ExitButton onExit={onExit} />

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-16">

        {/* Hero */}
        <div className="text-center mb-10">
          {/* Shield icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 shadow-glow"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10" strokeWidth="2"/>
            </svg>
          </div>

          <h1 className="text-5xl font-bold text-white tracking-tight mb-3">Witness</h1>
          <p className="text-white/50 text-base max-w-xs mx-auto leading-relaxed">
            A safe, anonymous space to report bias incidents at Virginia Tech
          </p>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-card overflow-hidden">

            {/* Anonymous banner */}
            <div className="flex items-center gap-2.5 px-5 py-3.5 bg-emerald-50 border-b border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-emerald-800 text-xs font-semibold">
                100% anonymous · No account needed · No data stored
              </p>
            </div>

            <div className="p-6 flex flex-col gap-6">

              {/* Steps */}
              <div className="flex flex-col gap-3">
                {steps.map(({ icon, color, title, desc }) => (
                  <div key={title} className="flex items-center gap-3.5">
                    <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                      {icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{title}</p>
                      <p className="text-xs text-slate-400 leading-snug">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* CTA */}
              <div className="flex flex-col gap-3">
                {isLoading && (
                  <div className="flex items-center justify-center gap-2 py-1">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-brand animate-spin" />
                    <span className="text-xs text-slate-400">Setting up your secure session…</span>
                  </div>
                )}
                {isError && (
                  <div className="flex items-center gap-2 bg-red-50 rounded-xl px-3 py-2.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p className="text-xs text-red-600">{sessionError}</p>
                  </div>
                )}

                <button
                  onClick={onStart}
                  disabled={!isReady}
                  className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: isReady ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#94a3b8' }}
                >
                  {isLoading ? 'Preparing…' : 'Start my report'}
                </button>

                <p className="text-center text-xs text-slate-400">
                  Your identity is never recorded or stored
                </p>
              </div>
            </div>
          </div>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-5 mt-6 text-white/30 text-xs">
            <span className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Encrypted
            </span>
            <span className="text-white/10">·</span>
            <span className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              Auto-deleted in 90 days
            </span>
            <span className="text-white/10">·</span>
            <span className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Zero PII
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
