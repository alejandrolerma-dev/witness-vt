import BackButton from '../components/BackButton';
import ExitButton from '../components/ExitButton';
import WhiteCard from '../components/WhiteCard';
import ZeroPIIBadge from '../components/ZeroPIIBadge';

export default function ReviewNavigatorScreen({ navigation, onSave, onExitWithoutSaving, onBack, onExit }) {
  const { reporting_steps = [], draft_statement = '' } = navigation;

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10" style={{ backgroundColor: '#1a1f36' }}>
      <ExitButton onExit={onExit} />

      <WhiteCard className="max-w-lg w-full">
        <div className="flex flex-col gap-5">
          {/* Top row: back + badge */}
          <div className="flex items-center justify-between">
            <BackButton onBack={onBack} label="Back to Rights" />
            <ZeroPIIBadge />
          </div>

          {/* Heading */}
          <h1 className="text-xl font-semibold text-gray-900">Your reporting path</h1>

          {/* Section 1 — Reporting steps */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-800">Reporting steps:</p>
            <ol className="flex flex-col gap-4">
              {reporting_steps.map((step) => (
                <li key={step.step_number} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    {step.step_number}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-gray-900">{step.action}</span>
                    <span className="text-xs text-gray-400 italic">{step.estimated_timeline}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Section 2 — Draft statement */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-gray-800">Draft statement:</p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {draft_statement}
            </div>
          </div>

          {/* Privacy note + buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <p className="text-xs text-gray-400 text-center">
              Saving stores only your anonymous session ID — no personal information.
            </p>
            <button
              onClick={onSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg w-full transition"
            >
              Save Report
            </button>
            <button
              onClick={onExitWithoutSaving}
              className="text-gray-500 hover:text-gray-700 text-sm w-full text-center py-2 transition"
            >
              Exit Without Saving
            </button>
          </div>
        </div>
      </WhiteCard>
    </div>
  );
}
