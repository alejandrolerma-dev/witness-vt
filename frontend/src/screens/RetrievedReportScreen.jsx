export default function RetrievedReportScreen({ report, onBack }) {
  const { incident_record, advice, navigation, saved_at } = report;

  const savedDate = saved_at ? new Date(saved_at) : null;
  const expiresDate = savedDate ? new Date(savedDate.getTime() + 90 * 24 * 60 * 60 * 1000) : null;

  return (
    <div
      className="min-h-screen flex flex-col items-center px-5 py-10"
      style={{ background: 'linear-gradient(160deg, #0f1225 0%, #1a1f36 45%, #1e1b3a 100%)' }}
    >
      <div className="w-full max-w-lg flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Your saved report</h1>
            <p className="text-white/40 text-sm mt-1">
              {savedDate && `Saved on ${savedDate.toLocaleDateString()}`}
            </p>
          </div>
        </div>

        {/* Auto-delete notice */}
        {expiresDate && (
          <div className="flex items-start gap-2 bg-amber-500/10 rounded-2xl px-4 py-3 border border-amber-500/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" className="flex-shrink-0 mt-0.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4l3 3"/>
            </svg>
            <p className="text-xs text-amber-200/80">
              This report auto-deletes on <strong>{expiresDate.toLocaleDateString()}</strong> (90 days). Save a copy if you need it longer.
            </p>
          </div>
        )}

        {/* Incident record */}
        <div className="bg-white rounded-3xl shadow-card p-5 flex flex-col gap-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Incident record</p>

          <div className="grid grid-cols-2 gap-3">
            {incident_record?.incident_type && (
              <div>
                <p className="text-xs text-slate-400">Type</p>
                <p className="text-sm font-semibold text-slate-800 capitalize">{incident_record.incident_type.replace('_', ' ')}</p>
              </div>
            )}
            {incident_record?.bias_category && (
              <div>
                <p className="text-xs text-slate-400">Bias category</p>
                <p className="text-sm font-semibold text-slate-800 capitalize">{incident_record.bias_category.replace('_', ' ')}</p>
              </div>
            )}
            {incident_record?.severity_indicator && (
              <div>
                <p className="text-xs text-slate-400">Severity</p>
                <p className={`text-sm font-semibold capitalize ${
                  incident_record.severity_indicator === 'high' ? 'text-red-600' :
                  incident_record.severity_indicator === 'medium' ? 'text-amber-600' : 'text-slate-800'
                }`}>{incident_record.severity_indicator}</p>
              </div>
            )}
            {incident_record?.date_context && incident_record.date_context !== 'Not specified' && (
              <div>
                <p className="text-xs text-slate-400">When</p>
                <p className="text-sm font-semibold text-slate-800">{incident_record.date_context}</p>
              </div>
            )}
            {incident_record?.location_context && incident_record.location_context !== 'Not specified' && (
              <div className="col-span-2">
                <p className="text-xs text-slate-400">Where</p>
                <p className="text-sm font-semibold text-slate-800">{incident_record.location_context}</p>
              </div>
            )}
          </div>

          {incident_record?.description_summary && (
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Summary</p>
              <p className="text-sm text-slate-600 leading-relaxed">{incident_record.description_summary}</p>
            </div>
          )}
        </div>

        {/* Rights & policy */}
        {advice && (
          <div className="bg-white rounded-3xl shadow-card p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Your rights</p>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-400">Applicable policy</p>
                <p className="text-base font-bold text-slate-800">{advice.matched_policy}</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">{advice.rights_summary}</p>

            {advice.vt_contact && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Who to contact</p>
                <p className="text-sm font-semibold text-slate-800 mb-1">{advice.vt_contact.office}</p>
                <a
                  href={advice.vt_contact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm hover:underline"
                  style={{ color: '#6366f1' }}
                >
                  {advice.vt_contact.url}
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Reporting steps */}
        {navigation?.reporting_steps && (
          <div className="bg-white rounded-3xl shadow-card p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Reporting steps</p>
            <div className="flex flex-col gap-3">
              {navigation.reporting_steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-indigo-600">{step.step_number}</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-700">{step.action}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{step.estimated_timeline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Draft statement */}
        {navigation?.draft_statement && (
          <div className="bg-white rounded-3xl shadow-card p-5 flex flex-col gap-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Draft statement</p>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-sm text-slate-600 leading-relaxed">{navigation.draft_statement}</p>
            </div>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={onBack}
          className="w-full py-4 rounded-2xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          Back to home
        </button>

        {/* Zero PII reminder */}
        <p className="text-center text-xs text-white/30">
          No personal information is stored. Report auto-deletes after 90 days.
        </p>
      </div>
    </div>
  );
}
