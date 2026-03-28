import { useState, useEffect } from 'react';
import { getAnalytics } from '../api';

// --- SVG Bar Chart ---
function BarChart({ data, labelKey, valueKey, color = '#6366f1', maxBarWidth = 200 }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="flex flex-col gap-2">
      {data.map((d) => {
        const pct = (d[valueKey] / max) * 100;
        const label = (d[labelKey] || '').replace(/_/g, ' ');
        return (
          <div key={d[labelKey]} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-28 text-right truncate capitalize">{label}</span>
            <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden" style={{ maxWidth: maxBarWidth }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700 w-8">{d[valueKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

// --- Donut Chart ---
function DonutChart({ data, labelKey, valueKey, colors }) {
  const total = data.reduce((sum, d) => sum + d[valueKey], 0);
  let cumulative = 0;
  const size = 140;
  const center = size / 2;
  const radius = 54;
  const strokeWidth = 20;

  const segments = data.map((d, i) => {
    const pct = d[valueKey] / total;
    const circumference = 2 * Math.PI * radius;
    const dashLength = pct * circumference;
    const dashOffset = -cumulative * circumference;
    cumulative += pct;
    return (
      <circle
        key={d[labelKey]}
        cx={center} cy={center} r={radius}
        fill="none"
        stroke={colors[i % colors.length]}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dashLength} ${circumference - dashLength}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    );
  });

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        {segments}
        <text x={center} y={center - 6} textAnchor="middle" className="fill-slate-800 text-lg font-bold">{total}</text>
        <text x={center} y={center + 10} textAnchor="middle" className="fill-slate-400 text-xs">total</text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {data.map((d, i) => (
          <div key={d[labelKey]} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: colors[i % colors.length] }} />
            <span className="text-xs text-slate-600 capitalize">{(d[labelKey] || '').replace(/_/g, ' ')}</span>
            <span className="text-xs font-bold text-slate-800">{d[valueKey]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Trend Line Chart ---
function TrendChart({ data, labelKey, valueKey, color = '#6366f1' }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  const width = 320;
  const height = 100;
  const padding = { top: 10, right: 10, bottom: 20, left: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + chartH - (d[valueKey] / max) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = linePath + ` L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxWidth: width }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p) => (
        <circle key={p[labelKey]} cx={p.x} cy={p.y} r="3.5" fill="white" stroke={color} strokeWidth="2" />
      ))}
      {points.map((p) => (
        <text key={p[labelKey] + '_label'} x={p.x} y={padding.top + chartH + 14} textAnchor="middle" className="fill-slate-400" style={{ fontSize: 8 }}>
          {p[labelKey].replace(/\s?\d{4}$/, '').slice(0, 3)}
        </text>
      ))}
    </svg>
  );
}

// --- Campus Heatmap with VT campus map ---

// VT campus buildings — positioned on the SVG map
const CAMPUS_BUILDINGS = [
  { name: 'Burruss', x: 125, y: 115, w: 28, h: 16 },
  { name: 'Torgersen', x: 150, y: 68, w: 30, h: 14 },
  { name: 'Newman Library', x: 210, y: 82, w: 34, h: 16 },
  { name: 'Goodwin', x: 235, y: 120, w: 26, h: 14 },
  { name: 'McBryde', x: 80, y: 95, w: 28, h: 14 },
  { name: 'Squires', x: 160, y: 158, w: 28, h: 14 },
  { name: 'War Memorial', x: 135, y: 48, w: 30, h: 12 },
  { name: 'Norris', x: 90, y: 135, w: 24, h: 12 },
  { name: 'Dietrick', x: 200, y: 160, w: 26, h: 12 },
  { name: 'Owens', x: 240, y: 155, w: 22, h: 12 },
  { name: 'Residence Halls', x: 260, y: 55, w: 36, h: 14 },
];

// Map building names to SVG positions for heatmap overlay
const LOCATION_TO_POS = {
  'torgersen hall':         { x: 165, y: 72 },
  'torgersen':              { x: 165, y: 72 },
  'newman library':         { x: 227, y: 88 },
  'newman':                 { x: 227, y: 88 },
  'squires student center': { x: 174, y: 163 },
  'squires':                { x: 174, y: 163 },
  'goodwin hall':           { x: 248, y: 125 },
  'goodwin':                { x: 248, y: 125 },
  'mcbryde hall':           { x: 94, y: 100 },
  'mcbryde':                { x: 94, y: 100 },
  'drill field':            { x: 160, y: 115 },
  'dietrick':               { x: 213, y: 164 },
  'd2':                     { x: 213, y: 164 },
  'owens':                  { x: 251, y: 159 },
  'burruss':                { x: 139, y: 121 },
  'norris':                 { x: 102, y: 139 },
  'residence halls':        { x: 278, y: 60 },
  'war memorial':           { x: 150, y: 52 },
};

function matchPosition(locStr) {
  if (!locStr) return null;
  const lower = locStr.toLowerCase();
  for (const [name, pos] of Object.entries(LOCATION_TO_POS)) {
    if (lower.includes(name)) return pos;
  }
  return null;
}

function CampusHeatmap({ locations }) {
  const mapped = locations
    .map(l => ({ ...l, pos: matchPosition(l.location) }))
    .filter(l => l.pos);

  if (mapped.length === 0) return null;

  const maxCount = Math.max(...mapped.map(l => l.count), 1);

  return (
    <div className="flex flex-col gap-3">
      <svg viewBox="0 0 320 220" className="w-full rounded-2xl overflow-hidden" style={{ background: '#e8f0e4' }}>
        {/* Roads */}
        <line x1="0" y1="110" x2="320" y2="110" stroke="#d4d4d4" strokeWidth="4" opacity="0.6" />
        <line x1="160" y1="0" x2="160" y2="220" stroke="#d4d4d4" strokeWidth="3" opacity="0.5" />
        <line x1="60" y1="0" x2="100" y2="220" stroke="#d4d4d4" strokeWidth="2.5" opacity="0.4" />
        <line x1="260" y1="0" x2="240" y2="220" stroke="#d4d4d4" strokeWidth="2.5" opacity="0.4" />
        <line x1="0" y1="55" x2="320" y2="55" stroke="#d4d4d4" strokeWidth="2" opacity="0.3" />
        <line x1="0" y1="165" x2="320" y2="165" stroke="#d4d4d4" strokeWidth="2" opacity="0.3" />

        {/* Drill Field — large oval green space */}
        <ellipse cx="160" cy="115" rx="50" ry="30" fill="#c8dcc0" stroke="#a3c49a" strokeWidth="1.5" />
        <text x="160" y="118" textAnchor="middle" style={{ fontSize: 7, fontWeight: 600, fill: '#6b8f63' }}>
          Drill Field
        </text>

        {/* Buildings */}
        {CAMPUS_BUILDINGS.map(b => (
          <g key={b.name}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="2" fill="#c4b5a0" stroke="#a89880" strokeWidth="0.8" opacity="0.7" />
            <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 3} textAnchor="middle" style={{ fontSize: 5, fontWeight: 600, fill: '#5c4f3d' }}>
              {b.name}
            </text>
          </g>
        ))}

        {/* Campus label */}
        <text x="160" y="14" textAnchor="middle" style={{ fontSize: 9, fontWeight: 700, fill: '#64748b', letterSpacing: '1px' }}>
          VIRGINIA TECH CAMPUS
        </text>

        {/* Heatmap dots */}
        {mapped.map((loc) => {
          const intensity = loc.count / maxCount;
          const r = 10 + intensity * 22;
          const opacity = 0.2 + intensity * 0.35;
          return (
            <g key={loc.location}>
              <circle cx={loc.pos.x} cy={loc.pos.y} r={r} fill="#ef4444" opacity={opacity} />
              <circle cx={loc.pos.x} cy={loc.pos.y} r={4.5} fill="#ef4444" opacity={0.85} stroke="white" strokeWidth="1" />
              <text x={loc.pos.x} y={loc.pos.y - r - 3} textAnchor="middle" style={{ fontSize: 7, fontWeight: 700, fill: '#1e293b' }}>
                {loc.location}
              </text>
              <text x={loc.pos.x} y={loc.pos.y + 3} textAnchor="middle" style={{ fontSize: 6, fontWeight: 700, fill: 'white' }}>
                {loc.count}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-xs text-slate-400 text-center">Larger circles indicate higher incident concentration</p>
    </div>
  );
}

// --- Color palettes ---
const SEVERITY_COLORS = ['#ef4444', '#f59e0b', '#22c55e'];
const CATEGORY_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316', '#94a3b8'];
const POLICY_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981'];

export default function AnalyticsDashboard({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center px-5 py-8"
      style={{ background: 'linear-gradient(160deg, #0f1225 0%, #1a1f36 45%, #1e1b3a 100%)' }}
    >
      <div className="w-full max-w-lg flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs font-medium mb-3 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back to home
            </button>
            <h1 className="text-2xl font-bold text-white">Campus Trends</h1>
            <p className="text-white/40 text-sm mt-1">Anonymous, aggregated data — no individual reports shown</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-brand animate-spin" />
          </div>
        ) : data && data.total_reports > 0 ? (
          <>
            {/* Report count */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <span className="text-white text-sm font-bold">{data.total_reports}</span>
              </div>
              <p className="text-white/60 text-xs">
                {data.total_reports === 1 ? 'report filed' : 'reports filed'} through this system.
                Trends update in real time as more students report.
              </p>
            </div>

            {/* Severity distribution */}
            {data.by_severity.length > 0 && (
              <div className="bg-white rounded-3xl shadow-card p-5 flex flex-col gap-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Severity distribution</p>
                <DonutChart data={data.by_severity} labelKey="severity" valueKey="count" colors={SEVERITY_COLORS} />
              </div>
            )}

            {/* By category */}
            {data.by_category.length > 0 && (
              <div className="bg-white rounded-3xl shadow-card p-5 flex flex-col gap-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Incidents by bias category</p>
                <BarChart data={data.by_category} labelKey="category" valueKey="count" color="#6366f1" />
              </div>
            )}

            {/* By type */}
            {data.by_type.length > 0 && (
              <div className="bg-white rounded-3xl shadow-card p-5 flex flex-col gap-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Incidents by type</p>
                <BarChart data={data.by_type} labelKey="type" valueKey="count" color="#8b5cf6" />
              </div>
            )}

            {/* Policy routing */}
            {data.by_policy?.length > 0 && (
              <div className="bg-white rounded-3xl shadow-card p-5 flex flex-col gap-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Reports by policy</p>
                <DonutChart data={data.by_policy} labelKey="policy" valueKey="count" colors={POLICY_COLORS} />
              </div>
            )}

            {/* Campus heatmap */}
            {data.by_location.some(l => l.lat) && (
              <div className="bg-white rounded-3xl shadow-card p-5 flex flex-col gap-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Campus hotspots</p>
                <CampusHeatmap locations={data.by_location} />
              </div>
            )}

            {/* Trend over time */}
            {data.by_month.length > 1 && (
              <div className="bg-white rounded-3xl shadow-card p-5 flex flex-col gap-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Monthly trend</p>
                <TrendChart data={data.by_month} labelKey="month" valueKey="count" />
              </div>
            )}

            {/* Privacy notice */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <p className="text-white/50 text-xs">All data is anonymous and aggregated. No individual reports are identifiable.</p>
            </div>
          </>
        ) : (
          /* Empty state — no reports yet */
          <div className="flex flex-col items-center gap-5 py-10">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-white mb-2">No reports yet</h2>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">
                As students file anonymous reports, this dashboard will show real-time campus trends — bias categories, severity, locations, and more.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 w-full max-w-xs">
              <p className="text-white/50 text-xs text-center leading-relaxed">
                Every report is anonymous. No PII is ever stored. Trends are computed from aggregate data only.
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-2xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              File a report to get started
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
