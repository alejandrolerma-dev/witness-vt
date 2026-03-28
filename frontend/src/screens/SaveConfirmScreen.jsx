import { useState } from 'react';

export default function SaveConfirmScreen({ retrievalToken, onDone }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(retrievalToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: 'linear-gradient(160deg, #1a1f36 0%, #1e2444 60%, #1a1f36 100%)' }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Report saved</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Use this token to retrieve your report later.
          </p>
        </div>
        <div className="w-full bg-white rounded-3xl shadow-card p-5 flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Your retrieval token</p>
          <div className="bg-slate-50 rounded-2xl px-4 py-3 font-mono text-sm text-slate-700 break-all border border-slate-100">
            {retrievalToken}
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${copied ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {copied ? '✓ Copied!' : 'Copy token'}
          </button>
          <p className="text-xs text-slate-400 text-center">No personal information was stored.</p>
        </div>
        <button
          onClick={onDone}
          className="w-full py-4 rounded-2xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
