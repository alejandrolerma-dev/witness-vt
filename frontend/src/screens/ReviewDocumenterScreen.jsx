import ScreenLayout from '../components/ScreenLayout';
import BackButton from '../components/BackButton';
import ZeroPIIBadge from '../components/ZeroPIIBadge';

const FIELDS = [
  { key: 'incident_type', label: 'Type of incident', icon: '📌' },
  { key: 'date_context', label: 'When it happened', icon: '📅' },
  { key: 'location_context', label: 'Where it happened', icon: '📍' },
  { key: 'bias_category', label: 'Bias category', icon: '🏷️' },
  { key: 'description_summary', label: 'Summary', icon: '📝' },
  { key: 'severity_indicator', label: 'Severity', icon: '⚡' },
];

export default function ReviewDocumenterScreen({ incidentRecord, onContinue, onBack, onExit }) {
  const isHigh = incidentRecord?.severity_indicator === 'high';

  return (
    <ScreenLayout onExit={onExit} step={1}>
      <div className="w-full max-w-lg flex flex-col gap-5">

        {/* Header */}
        <div>
          <BackButton onBack={onBack} label="Edit my description" />
          <div className="flex items-start justify-between mt-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span className="text-violet-400 text-xs font-semibold uppercase tracking-wide">Step 1 · Documenter</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Your incident record</h1>
              <p className="text-white/40 text-sm mt-1">Review what was captured — go back to edit if needed</p>
            </div>
            <ZeroPIIBadge />
          </div>
        </div>

        {/* Fields card */}
        <div className="bg-white rounded-3xl shadow-card overflow-hidden">
          {FIELDS.map(({ key, label, icon }, i) => {
            const value = incidentRecord?.[key];
            const isSeverityHigh = key === 'severity_indicator' && isHigh;
            return (
              <div key={key} className={`px-5 py-4 ${i < FIELDS.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs">{icon}</span>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                </div>
                {isSeverityHigh ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-sm font-semibold px-2.5 py-1 rounded-full border border-red-100">
                      ⚠️ High severity
                    </span>
                    <p className="text-xs text-slate-400">This incident may qualify for urgent review</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 leading-relaxed">{value ?? '—'}</p>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={onContinue}
          className="w-full py-4 rounded-2xl text-sm font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          This looks right — continue
        </button>
      </div>
    </ScreenLayout>
  );
}
