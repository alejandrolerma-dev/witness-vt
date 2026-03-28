import ScreenLayout from '../components/ScreenLayout';
import BackButton from '../components/BackButton';
import ZeroPIIBadge from '../components/ZeroPIIBadge';

export default function ReviewNavigatorScreen({ navigation, onSave, onExitWithoutSaving, onBack, onExit }) {
  const { reporting_steps = [], draft_statement = '' } = navigation;

  return (
    <ScreenLayout onExit={onExit} step={3}>
      <div className="w-full max-w-lg flex flex-col gap-5">

        {/* Header */}
        <div>
          <BackButton onBack={onBack} label="Back to rights" />
          <div className="flex items-start justify-between mt-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wide">Step 3 · Navigator</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Your next steps</h1>
              <p className="text-white/40 text-sm mt-1">A clear path forward, ready when you are</p>
            </div>
            <ZeroPIIBadge />
          </div>
        </div>

        {/* Reporting steps */}
        <div className="bg-white rounded-3xl shadow-card p-5 flex flex-col gap-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Reporting steps</p>
          <div className="flex flex-col gap-3">
            {reporting_steps.map((step, i) => (
              <div key={step.step_number} className="flex items-start gap-3.5">
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {step.step_number}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm text-slate-700 leading-snug">{step.action}</p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                    </svg>
                    {step.estimated_timeline}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Draft statement */}
        <div className="bg-white rounded-3xl shadow-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Draft statement</p>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-100">Ready to file</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{draft_statement}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <p className="text-white/50 text-xs">Saving only stores your anonymous session ID — no personal info</p>
          </div>

          <button
            onClick={onSave}
            className="w-full py-4 rounded-2xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            Save my report
          </button>

          <button
            onClick={onExitWithoutSaving}
            className="w-full py-3 rounded-2xl text-sm font-medium text-white/40 hover:text-white/60 transition-colors text-center"
          >
            Exit without saving
          </button>
        </div>
      </div>
    </ScreenLayout>
  );
}
