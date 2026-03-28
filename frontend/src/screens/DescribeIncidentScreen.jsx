import { useState } from 'react';
import ScreenLayout from '../components/ScreenLayout';
import BackButton from '../components/BackButton';
import ZeroPIIBadge from '../components/ZeroPIIBadge';
import { useI18n } from '../i18n';

const MAX_CHARS = 5000;
const WARN_CHARS = 4800;

export default function DescribeIncidentScreen({ onSubmit, onBack, onExit, initialText = '', initialFields = {} }) {
  const { t } = useI18n();
  const [text, setText] = useState(initialText);
  const [when, setWhen] = useState(initialFields.when || '');
  const [where, setWhere] = useState(initialFields.where || '');
  const [witnesses, setWitnesses] = useState(initialFields.witnesses ?? null); // null = not answered
  const [error, setError] = useState('');

  const count = text.length;
  const isOverLimit = count > MAX_CHARS;
  const isEmpty = text.trim().length === 0;

  function handleSubmit() {
    if (isEmpty) { setError('Please describe the incident before continuing.'); return; }
    if (isOverLimit) { setError('Please shorten your description to under 5000 characters.'); return; }
    setError('');
    onSubmit(text, { when: when.trim() || null, where: where.trim() || null, witnesses });
  }

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent";

  return (
    <ScreenLayout onExit={onExit} step={0}>
      <div className="w-full max-w-lg flex flex-col gap-5">

        {/* Header */}
        <div>
          <BackButton onBack={onBack} label={t('back')} />
          <div className="flex items-start justify-between mt-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{t('what_happened')}</h1>
              <p className="text-white/50 text-sm mt-1">{t('write_own_words')}</p>
            </div>
            <ZeroPIIBadge />
          </div>
        </div>

        {/* Main textarea */}
        <div className="bg-white rounded-3xl shadow-card overflow-hidden">
          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setError(''); }}
            maxLength={MAX_CHARS}
            placeholder={t('describe_placeholder')}
            className={`w-full p-5 text-sm text-slate-700 placeholder-slate-300 resize-none h-44 focus:outline-none leading-relaxed ${isOverLimit ? 'bg-red-50' : 'bg-white'}`}
          />
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              {t('text_never_stored')}
            </div>
            <span className={`text-xs font-medium ${count > WARN_CHARS ? 'text-red-500' : 'text-slate-400'}`}>
              {count.toLocaleString()} / 5,000
            </span>
          </div>
        </div>

        {/* Optional structured fields */}
        <div className="bg-white rounded-3xl shadow-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-700">{t('additional_details')}</p>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{t('optional')}</span>
          </div>

          {/* When */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {t('when_happened')}
            </label>
            <input
              type="text"
              value={when}
              onChange={e => setWhen(e.target.value)}
              placeholder="e.g. Last Tuesday, October 15, around 3pm"
              className={inputClass}
            />
          </div>

          {/* Where */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {t('where_happened')}
            </label>
            <input
              type="text"
              value={where}
              onChange={e => setWhere(e.target.value)}
              placeholder="e.g. Torgersen Hall, online, dining hall"
              className={inputClass}
            />
          </div>

          {/* Witnesses */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {t('witnesses')}
            </label>
            <div className="flex gap-2">
              {[
                { value: true, label: t('yes') },
                { value: false, label: t('no') },
                { value: null, label: t('not_sure') },
              ].map(({ value, label }) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => setWitnesses(value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    witnesses === value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-red-300 text-xs">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isEmpty || isOverLimit}
          className="w-full py-4 rounded-2xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: (!isEmpty && !isOverLimit) ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#94a3b8' }}
        >
          {t('analyze_report')}
        </button>

        <p className="text-center text-white/30 text-xs">
          Three AI agents will review this — nothing is saved without your permission
        </p>
      </div>
    </ScreenLayout>
  );
}
