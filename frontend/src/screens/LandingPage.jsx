import { useState, useEffect } from 'react';
import ExitButton from '../components/ExitButton';
import { getStats } from '../api';
import { useI18n } from '../i18n';

/* ─── Keyframe styles injected once ─────────────────────────────────── */
const STYLES = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes shieldPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.0), 0 0 32px rgba(99,102,241,0.35); }
    50%       { box-shadow: 0 0 0 18px rgba(139,92,246,0.0), 0 0 56px rgba(139,92,246,0.55); }
  }
  @keyframes titleFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-18px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes btnPulse {
    0%, 90%, 100% { box-shadow: 0 4px 24px rgba(99,102,241,0.45); transform: scale(1); }
    95%           { box-shadow: 0 4px 36px rgba(139,92,246,0.7);  transform: scale(1.025); }
  }
  @keyframes orbFloat1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50%      { transform: translate(40px, -30px) scale(1.08); }
  }
  @keyframes orbFloat2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50%      { transform: translate(-30px, 40px) scale(1.06); }
  }
  @keyframes orbFloat3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50%      { transform: translate(20px, 25px) scale(1.05); }
  }
  @keyframes cardGlow {
    0%, 100% { box-shadow: 0 0 0 1px rgba(139,92,246,0.15), 0 8px 40px rgba(0,0,0,0.35); }
    50%      { box-shadow: 0 0 0 1.5px rgba(139,92,246,0.35), 0 8px 48px rgba(99,102,241,0.2); }
  }
  .anim-fade-up   { animation: fadeUp 0.5s ease-out both; }
  .anim-title     { animation: titleFadeUp 0.6s ease-out 0.1s both; }
  .anim-subtitle  { animation: fadeIn 0.6s ease-out 0.25s both; }
  .anim-card      { animation: fadeUp 0.5s ease-out 0.15s both, cardGlow 4s ease-in-out 1s infinite; }
  .anim-step-0    { animation: slideInLeft 0.45s ease-out 0.35s both; }
  .anim-step-1    { animation: slideInLeft 0.45s ease-out 0.55s both; }
  .anim-step-2    { animation: slideInLeft 0.45s ease-out 0.75s both; }
  .anim-badges    { animation: fadeIn 0.6s ease-out 1.1s both; }
  .anim-shield    { animation: shieldPulse 3.5s ease-in-out infinite; }
  .anim-btn       { animation: btnPulse 3s ease-in-out 2s infinite; }
  .step-hover     { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .step-hover:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,0.18); }
`;

const stepIcons = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    titleKey: 'step_document',
    descKey: 'step_document_desc',
    animClass: 'anim-step-0',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    titleKey: 'step_understand',
    descKey: 'step_understand_desc',
    animClass: 'anim-step-1',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
      </svg>
    ),
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    titleKey: 'step_act',
    descKey: 'step_act_desc',
    animClass: 'anim-step-2',
  },
];

export default function LandingPage({ onStart, onExit, onRetrieve, onDashboard, sessionStatus, sessionError }) {
  const { t } = useI18n();
  const isLoading = sessionStatus === 'loading';
  const isError   = sessionStatus === 'error';
  const isReady   = sessionStatus === 'ready';

  const [showRetrieve, setShowRetrieve] = useState(false);
  const [token, setToken] = useState('');
  const [retrieveError, setRetrieveError] = useState('');
  const [retrieving, setRetrieving] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
  }, []);

  async function handleRetrieve(e) {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) return;
    setRetrieveError('');
    setRetrieving(true);
    try {
      await onRetrieve(trimmed);
    } catch (err) {
      setRetrieveError(err.message || 'Report not found. Check your token and try again.');
    } finally {
      setRetrieving(false);
    }
  }

  return (
    <>
      <style>{STYLES}</style>

      <div className="min-h-screen flex flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0f1225 0%, #1a1f36 45%, #1e1b3a 100%)' }}>

        {/* ── Background orbs ── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div style={{
            position: 'absolute', top: '8%', left: '15%',
            width: 420, height: 420, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
            animation: 'orbFloat1 18s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', right: '10%',
            width: 360, height: 360, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
            animation: 'orbFloat2 22s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', top: '50%', right: '25%',
            width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,70,229,0.05) 0%, transparent 70%)',
            animation: 'orbFloat3 26s ease-in-out infinite',
          }} />
        </div>

        {/* ── (no top bar on landing) ── */}

        {/* ── Main content ── */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-16">

          {/* Shield */}
          <div className="anim-fade-up mb-5">
            <div
              className="anim-shield w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
            >
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10" strokeWidth="2.2"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1
            className="anim-title text-5xl font-extrabold tracking-tight mb-2 text-center"
            style={{
              background: 'linear-gradient(135deg, #ffffff 30%, #c4b5fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('app_title')}
          </h1>

          {/* Subtitle */}
          <p className="anim-subtitle text-white/60 text-base font-medium mb-10 text-center">
            {t('app_subtitle')}
          </p>

          {/* Card */}
          <div
            className="anim-card w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ background: '#ffffff' }}
          >
            {/* Anonymous banner */}
            <div className="flex items-center gap-2.5 px-5 py-3.5 bg-emerald-50 border-b border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <p className="text-emerald-800 text-xs font-semibold">
                {t('anonymous_banner')}
              </p>
            </div>

            <div className="p-6 flex flex-col gap-6">

              {/* Impact counter / Dashboard link */}
              {stats && (
                <div className="flex items-center justify-between bg-indigo-50 rounded-2xl px-4 py-3 border border-indigo-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" aria-hidden="true">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    </div>
                    <div>
                      {stats.total_reports > 0 ? (
                        <>
                          <p className="text-indigo-900 text-sm font-bold">{stats.total_reports.toLocaleString()}</p>
                          <p className="text-indigo-500 text-xs">{t('reports_filed')}</p>
                        </>
                      ) : (
                        <p className="text-indigo-600 text-xs font-medium">Your reports power anonymous campus insights</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onDashboard}
                    className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors flex-shrink-0"
                  >
                    {stats.total_reports > 0 ? t('view_trends') : 'Campus trends →'}
                  </button>
                </div>
              )}

              {/* Steps */}
              <div className="flex flex-col gap-2">
                {stepIcons.map(({ icon, iconBg, iconColor, titleKey, descKey, animClass }) => (
                  <div
                    key={titleKey}
                    className={`${animClass} step-hover flex items-center gap-3.5 p-3 rounded-2xl cursor-default`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
                      {icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{t(titleKey)}</p>
                      <p className="text-xs text-slate-400 leading-snug">{t(descKey)}</p>
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
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
                    <span className="text-xs text-slate-400">Setting up your secure session…</span>
                  </div>
                )}
                {isError && (
                  <div className="flex items-center gap-2 bg-red-50 rounded-xl px-3 py-2.5 border border-red-100">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p className="text-xs text-red-600">{sessionError}</p>
                  </div>
                )}

                <button
                  onClick={onStart}
                  disabled={!isReady}
                  className={`anim-btn w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:animation-none`}
                  style={{
                    background: isReady
                      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                      : '#94a3b8',
                  }}
                >
                  {isLoading ? t('preparing') : t('start_report')}
                </button>

                <p className="text-center text-xs text-slate-400">
                  {t('identity_never_stored')}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Retrieve report */}
              <div className="flex flex-col gap-3">
                {!showRetrieve ? (
                  <button
                    onClick={() => setShowRetrieve(true)}
                    className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors py-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    {t('have_token')}
                  </button>
                ) : (
                  <form onSubmit={handleRetrieve} className="flex flex-col gap-2.5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Retrieve a saved report</p>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => { setToken(e.target.value); setRetrieveError(''); }}
                      placeholder="Paste your retrieval token"
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                      autoFocus
                    />
                    {retrieveError && (
                      <p className="text-xs text-red-500">{retrieveError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setShowRetrieve(false); setToken(''); setRetrieveError(''); }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600 border border-slate-200 hover:border-slate-300 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!token.trim() || retrieving || !isReady}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                      >
                        {retrieving ? 'Retrieving...' : 'Retrieve report'}
                      </button>
                    </div>
                    <p className="text-center text-xs text-slate-400">
                      Reports auto-delete after 90 days
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="anim-badges mt-8 flex items-center justify-center gap-5 flex-wrap">
            {[
              {
                icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
                label: 'Encrypted',
              },
              {
                icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
                label: 'Auto-deleted in 90 days',
              },
              {
                icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
                label: 'Zero PII',
              },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(196,181,253,0.7)',
                }}
              >
                {icon}
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
