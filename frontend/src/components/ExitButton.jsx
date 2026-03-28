export default function ExitButton({ onExit }) {
  return (
    <button
      onClick={onExit}
      className="fixed top-4 right-4 z-50 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/70 hover:text-white text-xs font-medium px-3 py-2 rounded-full border border-white/10 transition-all"
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
      Leave safely
    </button>
  );
}
