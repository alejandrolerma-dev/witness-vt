import ExitButton from '../components/ExitButton';
import ZeroPIIBadge from '../components/ZeroPIIBadge';

export default function ProcessingScreen({ onExit }) {
  return (
    <div className="min-h-screen bg-[#1a1f36] flex flex-col items-center justify-center px-4">
      <ExitButton onExit={onExit} />

      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />

        <p className="text-white text-lg font-medium">Analyzing your report...</p>
        <p className="text-white/60 text-sm">This usually takes 10–20 seconds.</p>

        <ZeroPIIBadge />
      </div>
    </div>
  );
}
