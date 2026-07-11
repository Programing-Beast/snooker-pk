export default function FrameHistory({ frameHistory }) {
  return (
    <div className="flex items-center gap-2 sm:gap-2.5">
      <span className="font-display font-semibold uppercase tracking-[0.18em] text-ink-400 text-[9px] shrink-0">
        History
      </span>
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto flex-1">
        {frameHistory.length > 0 ? (
          frameHistory.map((h, i) => (
            <div
              key={i}
              className="shrink-0 rounded-lg bg-panel2 border border-hairline-d px-2.5 sm:px-3 py-1.5 sm:py-2 min-w-[80px] sm:min-w-[104px]"
            >
              <div className="font-display font-semibold uppercase tracking-[0.18em] text-ink-500 text-[9px]">
                Frame {i + 1}
              </div>
              <div className="font-display font-bold text-white tabular-nums text-[13px] sm:text-[15px] mt-0.5">
                {h.p1Score}<span className="text-ink-500">–</span>{h.p2Score}
              </div>
              {h.topBreak ? (
                <div className="text-brass text-[10.5px] tabular-nums">break {h.topBreak}</div>
              ) : (
                <div className="text-ink-500 text-[10.5px]">&nbsp;</div>
              )}
            </div>
          ))
        ) : (
          <span className="text-ink-500 text-[12px] py-2">No completed frames yet</span>
        )}
      </div>
    </div>
  );
}
