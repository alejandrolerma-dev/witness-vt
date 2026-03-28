import { useState } from 'react';
import ScreenLayout from '../components/ScreenLayout';
import ZeroPIIBadge from '../components/ZeroPIIBadge';

const SEVERITY_STYLES = {
  high:   { pill: 'bg-red-50 text-red-600 border-red-100',    label: '⚠️ High' },
  medium: { pill: 'bg-amber-50 text-amber-600 border-amber-100', label: '⚡ Medium' },
  low:    { pill: 'bg-green-50 text-green-700 border-green-100', label: '✓ Low' },
};

// Capitalize and humanize enum values from the AI (e.g. "national_origin" → "National Origin")
function formatValue(val) {
  if (!val || val === 'Not specified') return val ?? '—';
  return val
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const STATIC_FIELDS = [
  { key: 'incident_type',    label: 'Type of incident',   icon: '📌' },
  { key: 'date_context',     label: 'When it happened',   icon: '📅' },
  { key: 'location_context', label: 'Where it happened',  icon: '📍' },
  { key: 'bias_category',    label: 'Bias category',      icon: '🏷️' },
  { key: 'severity_indicator', label: 'Severity',         icon: '⚡' },
];

export default function ReviewDocumenterScreen({ incidentRecord, onContinue, onBack, onExit }) {
  const [summary, setSummary] = useState(incidentRecord?.description_summary ?? '');
  const [editingSummary, setEditingSummary] = useState(false);

  const severity = incidentRecord?.severity_indicator ?? 'medium';
  const severityStyle = SEVERITY_STYLES[severity] || SEVERITY_STYLES.medium;

  function handleContinue() {
    // Pass back the record with the (possibly edited) summary
    onContinue({ ...incidentRecord, description_summary: summary });
  }

  return (
    <ScreenLayout onExit={onExit} step={1}>
      <div className="w-full max-w-lg flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-start justify-between">
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
            <p className="text-white/40 text-sm mt-1">Review what was captured — edit the summary if needed</p>
          </div>
          <ZeroPIIBadge />
        </div>

        {/* Static fields */}
        <div className="bg-white rounded-3xl shadow-card overflow-hidden">
          {STATIC_FIELDS.map(({ key, label, icon }, i) => {
            const value = incidentRecord?.[key];
            const isSeverity = key === 'severity_indicator';
            return (
              <div key={key} className={`px-5 py-4 ${i < STATIC_FIELDS.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs">{icon}</span>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                </div>
                {isSeverity ? (
                  <span className={`inline-flex items-center text-sm font-semibold px-2.5 py-1 rounded-full border ${severityStyle.pill}`}>
                    {severityStyle.label}
                  </span>
                ) : (
                  <p className="text-sm text-slate-700 leading-relaxed">{formatValue(value)}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Editable summary */}
        <div className="bg-white rounded-3xl shadow-card overflow-hidden">
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">📝</span>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Summary</p>
              </div>
              <button
                onClick={() => setEditingSummary(e => !e)}
                className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
              >
                {editingSummary ? 'Done editing' : 'Edit'}
              </button>
            </div>
            {editingSummary ? (
              <textarea
                value={summary}
                onChange={e => setSummary(e.target.value)}
                rows={4}
                className="w-full text-sm text-slate-700 leading-relaxed border border-indigo-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed">{summary || '—'}</p>
            )}
            {editingSummary && (
              <p className="text-xs text-slate-400 mt-1.5">
                Edit to correct any inaccuracies. No names or identifying details.
              </p>
            )}
          </div>
        </div>

        {/* Nav buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 py-4 px-5 rounded-2xl text-sm font-semibold text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 py-4 rounded-2xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            This looks right — continue
          </button>
        </div>
      </div>
    </ScreenLayout>
  );
}
