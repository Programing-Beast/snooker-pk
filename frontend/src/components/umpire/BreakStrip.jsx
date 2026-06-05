import { BALLS, ALL_BALL_VALUES, breakTotal } from '../../engine/snookerEngine';

export default function BreakStrip({ currentBreak }) {
  const total = breakTotal(currentBreak);

  // Group by ball value, preserving pot order (first appearance)
  const groups = [];
  const seen = new Map();
  for (const v of currentBreak) {
    if (seen.has(v)) {
      seen.get(v).count += 1;
    } else {
      const entry = { value: v, count: 1 };
      seen.set(v, entry);
      groups.push(entry);
    }
  }

  return (
    <div className="rounded-xl bg-panel2 border border-hairline-d px-4 py-3 flex items-center gap-3">
      <span className="font-display font-semibold uppercase tracking-[0.18em] text-ink-400 text-[9px] shrink-0">
        This visit
      </span>
      <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto">
        {groups.length > 0 ? (
          groups.map(({ value, count }) => {
            const ball = BALLS[value];
            return (
              <span
                key={value}
                className="grid place-items-center rounded-full font-display font-bold text-[11px] text-white dropin"
                style={{
                  width: 28, height: 28,
                  background: ball.color,
                  boxShadow: 'inset -2px -2px 4px rgba(0,0,0,.5)',
                }}
              >
                {count > 1 ? count : ''}
              </span>
            );
          })
        ) : (
          <span className="text-ink-500 text-[13px]">No balls potted this visit</span>
        )}
      </div>
      <div className="text-right shrink-0">
        <div className="font-display font-semibold uppercase tracking-[0.18em] text-ink-500 text-[9px]">Break</div>
        <div className="font-display font-extrabold text-live text-[26px] leading-none tabular-nums">{total}</div>
      </div>
    </div>
  );
}
