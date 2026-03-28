export default function ExitScreen() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4"
      style={{ backgroundColor: '#1a1f36' }}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Lock icon */}
        <span className="text-5xl">🔒</span>

        {/* Heading */}
        <h1 className="text-2xl font-semibold text-white">You've exited safely</h1>

        {/* Subtext */}
        <p className="text-white/60 text-sm">
          All session data has been cleared. Nothing was stored.
        </p>

        {/* Note */}
        <p className="text-white/40 text-xs">You can close this tab.</p>
      </div>
    </div>
  );
}
