import { BALLS, breakTotal } from '../../engine/snookerEngine';

export default function BreakStrip({ currentBreak }) {
  const total = breakTotal(currentBreak);

  return (
    <div className="rounded-xl bg-panel2 border border-hairline-d px-4 py-3 flex items-center gap-3">
      <span className="font-display font-semibold uppercase tracking-[0.18em] text-ink-400 text-[9px] shrink-0">
        This visit
      </span>
      <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">
        {currentBreak.length > 0 ? (
          currentBreak.map((v, i) => {
            const ball = BALLS[v];
            return (
              <span key={i} className="contents">
                {i > 0 && <span className="text-ink-500 mx-0.5">·</span>}
                <span
                  className="grid place-items-center rounded-full font-display font-bold text-[11px] dropin"
                  style={{
                    width: 26, height: 26,
                    background: ball.color, color: ball.textColor,
                    boxShadow: 'inset -2px -2px 4px rgba(0,0,0,.5)',
                  }}
                >
                  {v}
                </span>
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
