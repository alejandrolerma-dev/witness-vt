import { useState } from 'react';
import WhiteCard from '../components/WhiteCard';

export default function SaveConfirmScreen({ retrievalToken, onDone }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(retrievalToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-10"
      style={{ backgroundColor: '#1a1f36' }}
    >
      <WhiteCard className="max-w-md w-full">
        <div className="flex flex-col items-center gap-5 text-center">
          {/* Checkmark icon */}
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 text-2xl font-bold">✓</span>
          </div>

          {/* Heading */}
          <h1 className="text-xl font-semibold text-gray-900">Report saved</h1>

          {/* Subtext */}
          <p className="text-gray-600 text-sm leading-relaxed">
            Use this token to retrieve your report later. It's the only way to access it.
          </p>

          {/* Token display */}
          <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800 break-all text-center w-full">
            {retrievalToken}
          </div>

          {/* Copy button */}
          <button onClick={handleCopy} className="text-indigo-600 text-sm hover:underline">
            {copied ? 'Copied!' : 'Copy token'}
          </button>

          {/* Privacy note */}
          <p className="text-gray-400 text-xs">
            No personal information was stored. This token is anonymous.
          </p>

          {/* Done button */}
          <button
            onClick={onDone}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg w-full transition"
          >
            Done
          </button>
        </div>
      </WhiteCard>
    </div>
  );
}
