import { useState } from 'react';
import ExitButton from '../components/ExitButton';
import BackButton from '../components/BackButton';
import WhiteCard from '../components/WhiteCard';
import ZeroPIIBadge from '../components/ZeroPIIBadge';

const MAX_CHARS = 5000;
const WARN_CHARS = 4800;

export default function DescribeIncidentScreen({ onSubmit, onBack, onExit, initialText = '' }) {
  const [text, setText] = useState(initialText);
  const [error, setError] = useState('');

  const count = text.length;
  const isOverLimit = count > MAX_CHARS;
  const isEmpty = text.trim().length === 0;

  function handleSubmit() {
    if (isEmpty) {
      setError('Please describe the incident before continuing.');
      return;
    }
    if (isOverLimit) {
      setError('Please shorten your description to under 5000 characters.');
      return;
    }
    setError('');
    onSubmit(text);
  }

  const textareaBorder = (isOverLimit || (error && isEmpty))
    ? 'border-red-400'
    : 'border-gray-200';

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10" style={{ backgroundColor: '#1a1f36' }}>
      <ExitButton onExit={onExit} />

      <WhiteCard className="max-w-lg w-full">
        <div className="mb-4">
          <BackButton onBack={onBack} label="Back to Home" />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Describe what happened</h1>
          <ZeroPIIBadge />
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Write in your own words. You don't need to include names or identifying details.
        </p>

        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setError(''); }}
          maxLength={MAX_CHARS}
          placeholder="Describe the incident here..."
          className={`w-full border ${textareaBorder} rounded-lg p-3 text-sm text-gray-800 resize-none h-48 focus:outline-none focus:ring-2 focus:ring-indigo-300`}
        />

        <div className={`text-xs mt-1 text-right ${count > WARN_CHARS ? 'text-red-500' : 'text-gray-400'}`}>
          {count}/5000
        </div>

        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isEmpty || isOverLimit}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg w-full transition disabled:opacity-50"
        >
          Analyze Incident
        </button>
      </WhiteCard>
    </div>
  );
}
