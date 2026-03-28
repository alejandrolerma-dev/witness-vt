import ExitButton from '../components/ExitButton';
import { useI18n } from '../i18n';

const agents = [
  { label: 'Documenter', descKey: 'agent_documenter' },
  { label: 'Advisor', descKey: 'agent_advisor' },
  { label: 'Navigator', descKey: 'agent_navigator' },
];

export default function ProcessingScreen({ onExit }) {
  const { t } = useI18n();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: 'linear-gradient(160deg, #1a1f36 0%, #1e2444 60%, #1a1f36 100%)' }}
    >
      <ExitButton onExit={onExit} />

      <div className="flex flex-col items-center gap-8 w-full max-w-sm">

        {/* Animated orb */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full opacity-20 animate-ping"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
          <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-glow"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">{t('analyzing')}</h2>
          <p className="text-white/40 text-sm">{t('analyzing_desc')}</p>
        </div>

        {/* Agent progress */}
        <div className="w-full bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          {agents.map(({ label, descKey }, i) => (
            <div key={label} className={`flex items-center gap-3.5 px-5 py-4 ${i < agents.length - 1 ? 'border-b border-white/5' : ''}`}>
              <div className="w-7 h-7 rounded-full border-2 border-brand/40 border-t-brand animate-spin flex-shrink-0"
                style={{ animationDelay: `${i * 0.3}s`, animationDuration: '1.2s' }} />
              <div>
                <p className="text-white/80 text-xs font-semibold">{label}</p>
                <p className="text-white/30 text-xs">{t(descKey)}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-white/20 text-xs text-center">
          {t('identity_protected')}
        </p>
      </div>
    </div>
  );
}
