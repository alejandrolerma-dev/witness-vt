import ExitButton from './ExitButton';

// step: 0-based current step (0=describe, 1=documenter, 2=advisor, 3=navigator)
// totalSteps: 4
export default function ScreenLayout({ children, onExit, step = null, totalSteps = 4 }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #1a1f36 0%, #1e2444 60%, #1a1f36 100%)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="12" r="5" fill="white" fillOpacity="0.9"/>
              <circle cx="16" cy="12" r="2" fill="#818cf8"/>
            </svg>
          </div>
          <span className="text-white/50 text-xs font-medium tracking-wide">WITNESS</span>
        </div>
        <ExitButton onExit={onExit} />
      </div>

      {/* Progress bar */}
      {step !== null && (
        <div className="px-5 pb-4">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i < step ? 'bg-brand' : i === step ? 'bg-brand/60' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <p className="text-white/30 text-xs mt-1.5">Step {step + 1} of {totalSteps}</p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        {children}
      </div>
    </div>
  );
}
