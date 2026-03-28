export default function ExitButton({ onExit }) {
  return (
    <button
      onClick={onExit}
      className="fixed top-4 right-4 z-50 bg-white text-gray-700 text-sm font-medium px-3 py-2 rounded-lg shadow hover:bg-gray-100 transition"
    >
      ✕ Exit
    </button>
  );
}
