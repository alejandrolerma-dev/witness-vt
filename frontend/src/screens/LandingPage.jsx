import WhiteCard from '../components/WhiteCard';
import ZeroPIIBadge from '../components/ZeroPIIBadge';
import ExitButton from '../components/ExitButton';

export default function LandingPage({ onStart, onExit, sessionStatus, sessionError }) {
  const isLoading = sessionStatus === 'loading';
  const isError = sessionStatus === 'error';
  const isReady = sessionStatus === 'ready';

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <ExitButton onExit={onExit} />

      <WhiteCard className="max-w-md w-full">
        <div className="flex flex-col items-center text-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Witness</h1>
            <p className="mt-1 text-gray-500 text-sm">
              Anonymous bias incident reporting for Virginia Tech students
            </p>
          </div>

          <ZeroPIIBadge />

          <p className="text-gray-600 text-sm leading-relaxed">
            Describe what happened in your own words. Three AI agents will structure your report,
            identify your rights, and generate a step-by-step reporting path — all without storing
            your identity.
          </p>

          {isLoading && (
            <p className="text-gray-400 text-sm">Establishing secure session...</p>
          )}

          {isError && (
            <p className="text-red-600 text-sm">{sessionError}</p>
          )}

          <button
            onClick={onStart}
            disabled={!isReady}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg w-full transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Report
          </button>
        </div>
      </WhiteCard>
    </div>
  );
}
