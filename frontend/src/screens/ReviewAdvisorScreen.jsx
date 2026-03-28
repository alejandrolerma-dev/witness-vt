import ScreenLayout from '../components/ScreenLayout';
import BackButton from '../components/BackButton';
import ZeroPIIBadge from '../components/ZeroPIIBadge';
import SupportResources from '../components/SupportResources';
import { useI18n } from '../i18n';

export default function ReviewAdvisorScreen({ advice, supportResources, onContinue, onBack, onExit }) {
  const { t } = useI18n();
  const { matched_policy, policy_ambiguous, rights_summary, vt_contact } = advice;

  return (
    <ScreenLayout onExit={onExit} step={2}>
      <div className="w-full max-w-lg flex flex-col gap-5">

        {/* Header */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span className="text-blue-400 text-xs font-semibold uppercase tracking-wide">Step 2 · Advisor</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Your rights</h1>
              <p className="text-white/40 text-sm mt-1">Based on VT policy that applies to your situation</p>
            </div>
            <ZeroPIIBadge />
          </div>
        </div>

        {/* Policy match */}
        <div className="bg-white rounded-3xl shadow-card p-5 flex flex-col gap-4">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4l3 3"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Applicable policy</p>
              <p className="text-base font-bold text-slate-800">{matched_policy}</p>
            </div>
          </div>

          {policy_ambiguous && (
            <div className="flex items-start gap-2 bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
              <span className="text-amber-500 text-sm mt-0.5">ℹ️</span>
              <p className="text-xs text-amber-700">Policy match is approximate — defaulting to Bias Response Team.</p>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">What this means for you</p>
            <p className="text-sm text-slate-600 leading-relaxed">{rights_summary}</p>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Who to contact</p>
            <p className="text-sm font-semibold text-slate-800 mb-1">{vt_contact.office}</p>
            <a
              href={vt_contact.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-brand text-sm hover:underline"
            >
              {vt_contact.url}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Support resources */}
        <SupportResources resources={supportResources} />

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 py-4 px-5 rounded-2xl text-sm font-semibold text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            {t('back')}
          </button>
          <button
            onClick={onContinue}
            className="flex-1 py-4 rounded-2xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {t('see_reporting_path')}
          </button>
        </div>
      </div>
    </ScreenLayout>
  );
}
