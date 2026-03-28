export default function WhiteCard({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-3xl shadow-card ${className}`}>
      {children}
    </div>
  );
}
