import BackButton from '../components/BackButton';
import ExitButton from '../components/ExitButton';
import WhiteCard from '../components/WhiteCard';
import ZeroPIIBadge from '../components/ZeroPIIBadge';

export default function ReviewAdvisorScreen({ advice, onContinue, onBack, onExit }) {
  const { matched_policy, policy_ambiguous, rights_summary, vt_contact } = advice;

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10" style={{ backgroundColor: '#1a1f36' }}>
      <ExitButton onExit={onExit} />

      <WhiteCard className="max-w-lg w-full">
        <div className="flex flex-col gap-5">
          {/* Top row: back + badge */}
          <div className="flex items-center justify-between">
            <BackButton onBack={onBack} label="Back to Record" />
            <ZeroPIIBadge />
          </div>

          {/* Heading */}
          <h1 className="text-xl font-semibold text-gray-900">
            Your rights under VT policy
          </h1>

          {/* Policy badge */}
          <div className="flex flex-col gap-1">
            <span className="bg-indigo-100 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full self-start">
              {matched_policy}
            </span>
            {policy_ambiguous && (
              <p className="text-gray-500 text-xs italic">
                Policy match is approximate — Bias Response Team is the default.
              </p>
            )}
          </div>

          {/* Rights section */}
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-gray-800">Your rights:</p>
            <p className="text-gray-700 text-sm leading-relaxed">{rights_summary}</p>
          </div>

          {/* VT Contact section */}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Contact office:
            </p>
            <p className="text-gray-900 text-sm font-medium">{vt_contact.office}</p>
            <a
              href={vt_contact.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline text-sm"
            >
              {vt_contact.url}
            </a>
          </div>

          {/* Continue button */}
          <button
            onClick={onContinue}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg w-full transition"
          >
            Continue
          </button>
        </div>
      </WhiteCard>
    </div>
  );
}
