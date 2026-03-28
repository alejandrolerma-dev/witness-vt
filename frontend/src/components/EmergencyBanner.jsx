export default function EmergencyBanner({ emergency }) {
  if (!emergency?.detected) return null;

  return (
    <div className="w-full bg-red-600 rounded-3xl overflow-hidden shadow-card">
      <div className="px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-sm">Immediate help is available</p>
          <p className="text-white/80 text-xs mt-0.5">If you or someone else is in danger, please reach out now</p>
        </div>
      </div>
      <div className="bg-red-700/50 px-5 py-3 flex flex-col gap-2.5">
        {emergency.resources.map((r) => (
          <div key={r.name} className="flex items-center justify-between">
            <div>
              <p className="text-white text-xs font-semibold">{r.name}</p>
              <p className="text-white/60 text-xs">{r.description}</p>
            </div>
            <span className="text-white font-bold text-sm bg-white/15 px-3 py-1.5 rounded-xl flex-shrink-0 ml-3">
              {r.contact}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
