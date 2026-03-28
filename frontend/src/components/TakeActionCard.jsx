/**
 * TakeActionCard — encourages the student to actually send their report.
 * Generates a mailto: link with the draft statement pre-filled so they just hit send.
 */
export default function TakeActionCard({ advice, navigation }) {
  const email = advice?.vt_contact?.email;
  const office = advice?.vt_contact?.office || 'the appropriate office';
  const policy = advice?.matched_policy || 'Virginia Tech Policy';
  const draft = navigation?.draft_statement || '';

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
            <path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/>
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-sm">You don't have to stay silent</p>
          <p className="text-white/50 text-xs">Your statement is ready — one click to send it</p>
        </div>
      </div>

      {/* Encouragement text */}
      <div className="bg-white/5 rounded-2xl px-4 py-3">
        <p className="text-white/60 text-xs leading-relaxed">
          Reporting matters. Even if you're unsure, your report helps the {office} identify
          patterns and protect other students. You are protected from retaliation under VT policy.
          You control the process — reporting does not automatically start an investigation.
        </p>
      </div>

      {/* Pre-filled email details */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs w-8">To:</span>
          <span className="text-white/70 text-xs font-medium">{email}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs w-8">Re:</span>
          <span className="text-white/70 text-xs font-medium">{subject}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs w-8">Body:</span>
          <span className="text-white/50 text-xs">Your draft statement (pre-filled)</span>
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

      <p className="text-white/25 text-xs text-center">
        Opens your email app with everything pre-filled — just hit send
      </p>
    </div>
  );
}
