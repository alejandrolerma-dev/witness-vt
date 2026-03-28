/**
 * TakeActionCard — encourages the student to actually send their report.
 * Shows a clear preview of the email that will open, then a one-click send button.
 */
import { useState } from 'react';

export default function TakeActionCard({ advice, navigation }) {
  const email = advice?.vt_contact?.email;
  const office = advice?.vt_contact?.office || 'the appropriate office';
  const policy = advice?.matched_policy || 'Virginia Tech Policy';
  const draft = navigation?.draft_statement || '';
  const [showPreview, setShowPreview] = useState(false);

  if (!email || !draft) return null;

  const subject = `Anonymous Bias Incident Report — ${policy}`;
  const body = `To the ${office},\n\n${draft}\n\nThis report was prepared with the assistance of Witness, an anonymous bias incident reporting tool for Virginia Tech students. No personal identifying information is attached to this submission.\n\nThank you for your attention to this matter.`;

  const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-3xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" aria-hidden="true">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-sm">Ready to send your report?</p>
          <p className="text-white/50 text-xs">We prepared an email for you — just hit send</p>
        </div>
      </div>

      {/* Email preview */}
      <div className="bg-white/5 rounded-2xl px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-xs font-medium w-12">To:</span>
          <span className="text-white/80 text-xs font-semibold">{email}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-xs font-medium w-12">Subject:</span>
          <span className="text-white/70 text-xs">{subject}</span>
        </div>
        <div className="border-t border-white/10 pt-2 mt-1">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-white/40 text-xs hover:text-white/60 transition-colors flex items-center gap-1"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
              style={{ transform: showPreview ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            {showPreview ? 'Hide email preview' : 'Preview email body'}
          </button>
          {showPreview && (
            <p className="text-white/50 text-xs leading-relaxed mt-2 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {body}
            </p>
          )}
        </div>
      </div>

      {/* Send button */}
      <a
        href={mailtoUrl}
        className="w-full py-4 rounded-2xl text-sm font-bold text-white text-center flex items-center justify-center gap-2 transition-all hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/>
        </svg>
        Send report to {policy}
      </a>

      <p className="text-white/30 text-xs text-center">
        Opens your email app with everything pre-filled. You are protected from retaliation under VT policy.
      </p>
    </div>
  );
}
