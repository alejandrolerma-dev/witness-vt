export default function ExitScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: 'linear-gradient(160deg, #1a1f36 0%, #1e2444 60%, #1a1f36 100%)' }}
    >
      <div className="flex flex-col items-center gap-5 text-center max-w-xs">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10" strokeWidth="2.2"/>
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">You've left safely</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            All session data has been cleared from this device. Nothing was stored.
          </p>
        </div>
        <p className="text-white/25 text-xs">You can close this tab.</p>
      </div>
    </div>
  );
}
