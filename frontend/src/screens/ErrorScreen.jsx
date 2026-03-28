import WhiteCard from '../components/WhiteCard';

const PARTIAL_LABELS = {
  incident_record: 'Incident record',
  advice: 'Rights & advice',
  navigation: 'Next steps',
};

export default function ErrorScreen({ error, partial, onRetry, onExit }) {
  const hasPartial = partial && Object.values(partial).some((v) => v !== null && v !== undefined);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-10"
      style={{ backgroundColor: '#1a1f36' }}
    >
      <WhiteCard className="max-w-lg w-full">
        <div className="flex flex-col gap-5">
          {/* Heading */}
          <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>

          {/* Error message */}
          <p className="text-gray-600 text-sm leading-relaxed">{error}</p>

          {/* Partial results */}
          {hasPartial && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-gray-800">Partial results</p>
              {Object.entries(PARTIAL_LABELS).map(([key, label]) => {
                const done = partial[key] !== null && partial[key] !== undefined;
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{label}</span>
                    {done ? (
                      <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        ✓ Completed
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        ✗ Not completed
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <button
            onClick={onRetry}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg w-full transition"
          >
            Try Again
          </button>
          <button
            onClick={onExit}
            className="text-gray-500 hover:text-gray-700 text-sm w-full text-center py-2 transition"
          >
            Exit
          </button>
        </div>
      </WhiteCard>
    </div>
  );
}
