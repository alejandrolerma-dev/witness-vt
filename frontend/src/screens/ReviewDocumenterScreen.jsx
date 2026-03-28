import BackButton from '../components/BackButton';
import ExitButton from '../components/ExitButton';
import WhiteCard from '../components/WhiteCard';
import ZeroPIIBadge from '../components/ZeroPIIBadge';

const FIELD_LABELS = {
  incident_type: 'Incident Type',
  date_context: 'Date',
  location_context: 'Location',
  bias_category: 'Bias Category',
  description_summary: 'Description Summary',
  severity_indicator: 'Severity',
};

const FIELD_ORDER = [
  'incident_type',
  'date_context',
  'location_context',
  'bias_category',
  'description_summary',
  'severity_indicator',
];

function FieldRow({ fieldKey, value }) {
  const label = FIELD_LABELS[fieldKey] ?? fieldKey;
  const isHighSeverity = fieldKey === 'severity_indicator' && value === 'high';

  return (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      {isHighSeverity ? (
        <p className="text-red-600 font-semibold">⚠️ {value}</p>
      ) : (
        <p className="text-gray-800">{value ?? '—'}</p>
      )}
    </div>
  );
}

export default function ReviewDocumenterScreen({ incidentRecord, onContinue, onBack, onExit }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10" style={{ backgroundColor: '#1a1f36' }}>
      <ExitButton onExit={onExit} />

      <WhiteCard className="max-w-lg w-full">
        <div className="flex flex-col gap-4">
          {/* Top nav */}
          <div className="flex items-center justify-between">
            <BackButton onBack={onBack} label="Edit Description" />
            <ZeroPIIBadge />
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Review your incident record</h1>
            <p className="text-sm text-gray-500 mt-1">
              This is how your report has been structured. Go back to edit if anything looks wrong.
            </p>
          </div>

          {/* Fields */}
          <div>
            {FIELD_ORDER.map((key) => (
              <FieldRow key={key} fieldKey={key} value={incidentRecord?.[key]} />
            ))}
          </div>

          {/* Continue button */}
          <button
            onClick={onContinue}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg w-full transition"
          >
            Looks right, continue
          </button>
        </div>
      </WhiteCard>
    </div>
  );
}
