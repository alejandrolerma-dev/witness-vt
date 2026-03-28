export default function BackButton({ onBack, label = 'Back' }) {
  return (
    <button
      onClick={onBack}
      className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition"
    >
      ← {label}
    </button>
  );
}
