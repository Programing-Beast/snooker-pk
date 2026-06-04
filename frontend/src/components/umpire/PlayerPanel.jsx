import { breakTotal, playerInitials } from '../../engine/snookerEngine';

export default function PlayerPanel({ state, playerIndex }) {
  const player = state.players[playerIndex];
  const active = state.activePlayerIndex === playerIndex && !state.frameOver && !state.matchOver;
  const side = playerIndex === 0 ? 'left' : 'right';
  const currentBreakTotal = active ? breakTotal(state.currentBreak) : 0;

  return (
    <div
      className={`relative rounded-2xl p-5 transition ${
        active
          ? 'bg-felt-900 activeglow'
          : 'bg-panel2 border border-hairline-d'
      }`}
    >
      {/* Active badge */}
      {active && (
        <span
          className={`absolute top-4 ${side === 'left' ? 'right-4' : 'left-4'} inline-flex items-center gap-1.5 font-display font-semibold uppercase px-2.5 py-1 rounded-full leading-none tracking-[0.08em] text-[11.5px] bg-felt text-white`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current pulse" />
          At table
        </span>
      )}

      {/* Player info */}
      <div className={`flex items-center gap-3 ${side === 'right' ? 'flex-row-reverse text-right' : ''}`}>
        <div
          className={`w-12 h-12 rounded-full grid place-items-center font-display font-extrabold text-white text-lg ring-2 shrink-0 ${
            playerIndex === 0 ? 'bg-felt ring-brass' : 'bg-panel ring-white/15'
          }`}
        >
          {playerInitials(player.name)}
        </div>
        <div className={`flex flex-col ${side === 'right' ? 'items-end' : ''}`}>
          <div className="font-display font-bold text-white text-[19px] leading-none">
            {player.name}
          </div>
          <div className={`flex items-center gap-1.5 text-[12px] text-ink-400 mt-1.5 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
            <span>{player.countryCode} · {player.tier}{player.seed ? ` · seed ${player.seed}` : ''}</span>
          </div>
        </div>
      </div>

      {/* Frame points */}
      <div className="rounded-xl bg-black/35 mt-4 py-4 text-center">
        <div className="font-display font-semibold uppercase tracking-[0.18em] text-ink-500 text-[9px]">
          Frame points
        </div>
        <div
          className={`font-display font-extrabold leading-none tabular-nums ${
            active ? 'text-brass' : 'text-white'
          }`}
          style={{ fontSize: '76px' }}
        >
          {player.points}
        </div>
      </div>

      {/* Break + High break */}
      <div className="grid grid-cols-2 gap-2.5 mt-3">
        <div className="rounded-lg bg-black/25 px-3 py-2.5 text-center">
          <div className="font-display font-semibold uppercase tracking-[0.18em] text-ink-500 text-[9px]">Break</div>
          <div
            className={`font-display font-bold tabular-nums leading-none mt-1 ${
              active && currentBreakTotal > 0 ? 'text-live' : 'text-white'
            }`}
            style={{ fontSize: '24px' }}
          >
            {currentBreakTotal}
          </div>
        </div>
        <div className="rounded-lg bg-black/25 px-3 py-2.5 text-center">
          <div className="font-display font-semibold uppercase tracking-[0.18em] text-ink-500 text-[9px]">High this frame</div>
          <div className="font-display font-bold tabular-nums leading-none mt-1 text-brass" style={{ fontSize: '24px' }}>
            {player.frameHighBreak || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
