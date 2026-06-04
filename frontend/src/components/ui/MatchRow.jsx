import { useState } from 'react';
import CountryFlagChip from './CountryFlagChip';
import StatusBadge from './StatusBadge';

const MatchNumber = ({ index }) => index != null ? (
  <span className="w-6 text-center text-[12px] text-ink-400 tabular-nums shrink-0">{index}</span>
) : null;

export default function MatchRow({ match, index }) {
  const [expanded, setExpanded] = useState(false);
  const m = match;
  const isBye = m.is_bye || m.status === 'bye';
  const isWalkover = m.is_walkover || m.status === 'walkover';
  const isLive = m.status === 'live';
  const isScheduled = m.status === 'scheduled';
  const p1Won = m.player1_frames > m.player2_frames && !isScheduled;

  if (isBye) {
    return (
      <div className="flex items-center gap-3.5 px-[18px] py-3.5 border-b border-hairline">
        <MatchNumber index={index} />
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3.5 flex-1 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <CountryFlagChip code={m.player1?.country_code || 'PAK'} showLabel={false} />
            <span className="text-[14.5px] font-bold truncate">{m.player1?.name || 'TBD'}</span>
          </div>
          <span className="badge bg-ink-100 text-ink-500 tracking-[0.1em]">Bye</span>
          <div className="flex items-center gap-2.5 justify-end text-right min-w-0">
            <span className="text-[14.5px] text-ink-300 italic truncate">— advances —</span>
          </div>
        </div>
      </div>
    );
  }

  if (isWalkover) {
    return (
      <div className="flex items-center gap-3.5 px-[18px] py-3.5 border-b border-hairline">
        <MatchNumber index={index} />
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3.5 flex-1 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <CountryFlagChip code={m.player1?.country_code || 'PAK'} showLabel={false} />
            <span className="text-[14.5px] font-bold truncate">{m.player1?.name || 'TBD'}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display font-bold text-[15px] text-ink-700">w/o</span>
            <span className="text-[10px] text-ink-400 uppercase tracking-wide">walkover</span>
          </div>
          <div className="flex items-center gap-2.5 justify-end text-right min-w-0">
            <span className="text-[14.5px] text-ink-400 line-through truncate">{m.player2?.name || 'TBD'}</span>
            <CountryFlagChip code={m.player2?.country_code || 'PAK'} showLabel={false} />
          </div>
        </div>
      </div>
    );
  }

  const bgClass = isLive ? 'bg-gradient-to-r from-live-tint to-transparent' : 'hover:bg-surface2 transition';

  return (
    <>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full text-left flex items-center gap-3.5 px-[18px] py-3.5 border-b border-hairline ${bgClass}`}
      >
        <MatchNumber index={index} />
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3.5 flex-1 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <CountryFlagChip code={m.player1?.country_code || 'PAK'} showLabel={false} />
          <span className={`text-[14.5px] truncate ${p1Won ? 'font-bold' : 'text-ink-500'}`}>
            {m.player1?.name || 'TBD'}
          </span>
        </div>
        <div className="font-display font-bold text-[20px] tabular-nums flex items-center gap-2.5">
          {isScheduled ? (
            <span className="font-display font-semibold text-[13px] text-ink-500 tabular-nums">
              {m.scheduled_time || 'vs'}
            </span>
          ) : (
            <>
              <span className={p1Won ? '' : 'text-ink-400'}>{m.player1_frames ?? 0}</span>
              <span className="text-ink-300 font-medium">–</span>
              <span className={!p1Won ? '' : 'text-ink-400'}>{m.player2_frames ?? 0}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2.5 justify-end text-right min-w-0">
          <span className={`text-[14.5px] truncate ${!p1Won && !isScheduled ? 'font-bold' : 'text-ink-500'}`}>
            {m.player2?.name || 'TBD'}
          </span>
          <CountryFlagChip code={m.player2?.country_code || 'PAK'} showLabel={false} />
        </div>
        </div>
      </button>
      {isLive && (
        <div className="flex items-center gap-2 px-[18px] py-2 text-[0.72rem] text-ink-500 border-b border-hairline">
          In play
          <StatusBadge status="live" pulse>Live · Frame {m.current_frame || '?'}</StatusBadge>
        </div>
      )}
      {expanded && m.frames?.length > 0 && (
        <div className="bg-surface2 px-[18px] py-3 border-b border-hairline">
          <div className={`grid gap-1.5 text-center`} style={{ gridTemplateColumns: `repeat(${m.frames.length}, 1fr)` }}>
            <div className={`text-[0.72rem] text-ink-400 font-semibold mb-1`} style={{ gridColumn: `1 / -1` }}>Frame scores</div>
            {m.frames.map((f, i) => (
              <div key={i} className="rounded bg-white border border-hairline py-1.5 text-[12px] font-mono">
                <span className={f.player1_score > f.player2_score ? 'font-bold' : 'text-ink-400'}>{f.player1_score}</span>
                <br />
                <span className={f.player2_score > f.player1_score ? 'font-bold' : 'text-ink-400'}>{f.player2_score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
