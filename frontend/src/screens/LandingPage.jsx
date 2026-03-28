import ExitButton from '../components/ExitButton';

export default function LandingPage({ onStart, onExit, sessionStatus, sessionError }) {
  const isLoading = sessionStatus === 'loading';
  const isError = sessionStatus === 'error';
  const isReady = sessionStatus === 'ready';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1a1f36' }}>
      <ExitButton onExit={onExit} />

      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400" />

      {/* Main content — vertically centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">

        {/* Logo mark */}
        <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-900/50">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="12" r="5" fill="white" fillOpacity="0.9" />
            <path d="M6 26c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.4" />
            <circle cx="16" cy="12" r="2" fill="#818cf8" />
          </svg>
        </div>

        {/* Wordmark */}
        <h1 className="text-4xl font-bold tracking-tight text-white mb-1">Witness</h1>
        <p className="text-indigo-300 text-sm font-medium mb-8">Virginia Tech · Anonymous Reporting</p>

        {/* Card */}
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Trust strip */}
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="text-green-500">●</span> Secure anonymous session
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              No data stored
            </div>
          </div>

          {/* Body */}
          <div className="px-6 pt-6 pb-7 flex flex-col gap-5">

            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-1">Report a bias incident</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Describe what happened in your own words. Three AI agents will structure your report, identify your rights under VT policy, and draft a formal statement — all without storing your identity.
              </p>
            </div>

            {/* How it works */}
            <div className="flex flex-col gap-2.5">
              {[
                { icon: '📋', label: 'Documenter', desc: 'Structures your incident into a formal record' },
                { icon: '⚖️', label: 'Advisor', desc: 'Matches your case to the right VT policy' },
                { icon: '🗺️', label: 'Navigator', desc: 'Generates your reporting path & draft statement' },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-base mt-0.5">{icon}</span>
                  <div>
                    <span className="text-xs font-semibold text-slate-700">{label}</span>
                    <span className="text-xs text-slate-400"> — {desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Status / CTA */}
            <div className="flex flex-col gap-2 pt-1">
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-3 h-3 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin inline-block" />
                  Establishing secure session...
                </div>
              )}
              {isError && (
                <p className="text-xs text-red-500">{sessionError}</p>
              )}
              <button
                onClick={onStart}
                disabled={!isReady}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isLoading ? 'Preparing...' : 'Start Report'}
              </button>
              <p className="text-center text-xs text-slate-400">
                Your identity is never recorded
              </p>
            </div>
          </div>
        </div>

        {/* Bottom trust badges */}
        <div className="mt-8 flex items-center gap-6 text-xs text-indigo-300/60">
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            End-to-end encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            Auto-deleted after 90 days
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Zero PII collected
          </span>
        </div>
      </div>
    </div>
  );
}
