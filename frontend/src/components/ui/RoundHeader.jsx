export default function RoundHeader({ name, subtitle, detail, round }) {
  // When a round prop is provided, auto-build name + rich metadata subtitle
  if (round) {
    const metaParts = [];
    const matchCount = round.matches?.length || 0;
    if (matchCount > 0) metaParts.push(`Last ${matchCount * 2}`);
    if (round.frames_to_win) metaParts.push(`Best of ${round.frames_to_win * 2 - 1}`);
    if (round.reds_count && round.reds_count !== 15) metaParts.push(`${round.reds_count} reds`);
    if (round.elimination_prize && Number(round.elimination_prize) > 0) {
      metaParts.push(`Losers receive PKR ${Number(round.elimination_prize).toLocaleString()}`);
    }
    const metaSubtitle = metaParts.length > 0 ? metaParts.join('; ') : null;

    return (
      <div className="dark-ctx px-[18px] py-3 bg-night text-white font-display font-semibold text-[12px] tracking-[0.12em] uppercase flex flex-col items-center text-center">
        <span>{round.name}</span>
        {metaSubtitle && (
          <span className="text-muted font-medium normal-case tracking-normal text-[11px] mt-0.5">
            ({metaSubtitle})
          </span>
        )}
      </div>
    );
  }

  // Fallback: legacy props (name, subtitle, detail)
  return (
    <div className="dark-ctx px-[18px] py-3 bg-night text-white font-display font-semibold text-[12px] tracking-[0.12em] uppercase flex items-center gap-3">
      {name}
      {subtitle && <span className="text-muted font-medium normal-case tracking-normal">· {subtitle}</span>}
      {detail && <span className="ml-auto text-muted font-medium normal-case tracking-normal">{detail}</span>}
    </div>
  );
}
