import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useI18n } from '../i18n';

export default function SaveConfirmScreen({ retrievalToken, onDone, onHome }) {
  const { t } = useI18n();
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
          <h1 className="text-2xl font-bold text-white mb-2">{t('report_saved')}</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Use this token to retrieve your report later.
          </p>
        </div>
        <div className="w-full bg-white rounded-3xl shadow-card p-5 flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('retrieval_token')}</p>
          <div className="bg-slate-50 rounded-2xl px-4 py-3 font-mono text-sm text-slate-700 break-all border border-slate-100">
            {retrievalToken}
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${copied ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {copied ? t('copied') : t('copy_token')}
          </button>

          {/* QR Code — encodes a full URL so scanning opens the app with the token */}
          <div className="flex flex-col items-center gap-2 pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400">{t('qr_screenshot')}</p>
            <div className="bg-white p-3 rounded-2xl border border-slate-100">
              <QRCodeSVG
                value={`${window.location.origin}?token=${encodeURIComponent(retrievalToken)}`}
                size={140}
                level="M"
                bgColor="#ffffff"
                fgColor="#1a1f36"
              />
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center">No personal information was stored.</p>
          <div className="flex items-start gap-2 bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" className="flex-shrink-0 mt-0.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4l3 3"/>
            </svg>
            <p className="text-xs text-amber-700">{t('auto_delete')}</p>
          </div>
        </div>
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onHome}
            className="w-full py-4 rounded-2xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {t('return_home')}
          </button>
          <button
            onClick={onDone}
            className="w-full py-3 rounded-2xl text-sm font-semibold text-white/50 hover:text-white/70 border border-white/10 hover:border-white/20 transition-all"
          >
            {t('exit')}
          </button>
        </div>
      </div>
    </div>
  );
}
