import { useState, useRef, useCallback } from 'react';
import ScreenLayout from '../components/ScreenLayout';
import BackButton from '../components/BackButton';
import ZeroPIIBadge from '../components/ZeroPIIBadge';

const MAX_CHARS = 5000;
const WARN_CHARS = 4800;

const SpeechRecognition = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

export default function DescribeIncidentScreen({ onSubmit, onBack, onExit, initialText = '', initialFields = {} }) {
  const [text, setText] = useState(initialText);
  const [when, setWhen] = useState(initialFields.when || '');
  const [where, setWhere] = useState(initialFields.where || '');
  const [witnesses, setWitnesses] = useState(initialFields.witnesses ?? null); // null = not answered
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const toggleVoice = useCallback(() => {
    if (!SpeechRecognition) return;

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setText(prev => {
        // Append new speech after any existing text
        const base = prev.endsWith(' ') || prev === '' ? prev : prev + ' ';
        return (base + transcript).slice(0, MAX_CHARS);
      });
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening]);

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
          <BackButton onBack={onBack} label="Back" />
          <div className="flex items-start justify-between mt-4">
            <div>
              <h1 className="text-2xl font-bold text-white">What happened?</h1>
              <p className="text-white/50 text-sm mt-1">Write in your own words — no names needed</p>
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
            placeholder="Describe what happened and how it made you feel. You don't need to include anyone's name or personal details."
            className={`w-full p-5 text-sm text-slate-700 placeholder-slate-300 resize-none h-44 focus:outline-none leading-relaxed ${isOverLimit ? 'bg-red-50' : 'bg-white'}`}
          />
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Your text is never stored
              </div>
              {SpeechRecognition && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border transition-all ${
                    listening
                      ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                  }`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                  {listening ? 'Listening...' : 'Voice'}
                </button>
              )}
            </div>
            <span className={`text-xs font-medium ${count > WARN_CHARS ? 'text-red-500' : 'text-slate-400'}`}>
              {count.toLocaleString()} / 5,000
            </span>
          </div>
        </div>

        {/* Optional structured fields */}
        <div className="bg-white rounded-3xl shadow-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-700">Additional details</p>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">optional</span>
          </div>
          <p className="text-xs text-slate-400 -mt-2">
            These help us give you more accurate information. Leave blank if you prefer.
          </p>

          {/* When */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              When did this happen?
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
              Where did this happen?
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
              Were there witnesses?
            </label>
            <div className="flex gap-2">
              {[
                { value: true, label: 'Yes' },
                { value: false, label: 'No' },
                { value: null, label: 'Not sure' },
              ].map(({ value, label }) => (
                <button
                  key={label}
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
          Analyze my report
        </button>

        <p className="text-center text-white/30 text-xs">
          Three AI agents will review this — nothing is saved without your permission
        </p>
      </div>
    </ScreenLayout>
  );
}
