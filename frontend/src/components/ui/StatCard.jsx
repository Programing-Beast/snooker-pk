export default function StatCard({ label, value, sub, progress, trend }) {
  return (
    <div className="card p-5">
      <div className="seclabel text-ink-400">{label}</div>
      <div className="font-display font-extrabold text-[40px] leading-none tabular-nums mt-2.5">
        {value}
      </div>
      {progress != null && (
        <div className="h-1.5 rounded-full bg-ink-200 mt-3 overflow-hidden">
          <span className="block h-full rounded-full bg-felt" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      )}
      {sub && <div className="text-[0.72rem] text-ink-500 mt-1.5">{sub}</div>}
      {trend && (
        <div className={`text-[0.72rem] font-semibold mt-2.5 ${trend.startsWith('▲') ? 'text-ok' : trend.startsWith('▼') ? 'text-bad' : 'text-ink-400'}`}>
          {trend}
        </div>
      )}
    </div>
  );
}
