import { ACTIONS } from '../../engine/snookerEngine';

export default function FrameEndOverlay({ state, dispatch }) {
  const w = state.frameWinner;
  const winner = state.players[w];
  const loser = state.players[1 - w];
  const nextBreaker = 1 - state.activePlayerIndex;

  return (
    <div className="absolute inset-0 z-20 bg-night/88 backdrop-blur-sm grid place-items-center p-8">
      <div className="bg-panel rounded-2xl border border-brass/40 shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-felt-900 to-panel2 border-b border-hairline-d flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-display font-semibold uppercase px-2.5 py-1 rounded-full leading-none tracking-[0.08em] text-[11.5px] bg-brass text-[#3a2c08]">
            Frame {state.frameNo}
          </span>
          <span className="text-white font-display font-bold text-[16px]">Frame complete</span>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <div className="font-display font-semibold uppercase tracking-[0.18em] text-ink-400 text-[11.5px]">Winner</div>
          <div className="font-display font-extrabold text-white text-[30px] leading-none mt-1">{winner.name}</div>
          <div className="font-display font-extrabold text-brass tabular-nums mt-3" style={{ fontSize: 54, lineHeight: 1 }}>
            {winner.points} <span className="text-ink-500">–</span> {loser.points}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-[13px]">
            <div>
              <span className="text-ink-400">High break </span>
              <b className="text-white">{winner.frameHighBreak}</b>
              <span className="text-ink-500"> ({winner.name})</span>
            </div>
            <div>
              <span className="text-ink-400">Frames </span>
              <b className="text-white tabular-nums">{state.players[0].frames}–{state.players[1].frames}</b>
            </div>
          </div>

          {/* Next breaker */}
          <div className="mt-6 pt-5 border-t border-hairline-d">
            <div className="text-ink-300 text-[13px] mb-3">
              Who breaks off next frame? <span className="text-ink-500">(default: alternate)</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 max-w-sm mx-auto">
              <button
                onClick={() => dispatch({ type: ACTIONS.START_NEXT_FRAME, breakerIndex: nextBreaker })}
                className="inline-flex items-center justify-center gap-2 font-display font-semibold rounded-md px-5 py-3 text-sm leading-none transition active:translate-y-px bg-felt text-white hover:bg-felt-700"
              >
                {state.players[nextBreaker].name} ▸
              </button>
              <button
                onClick={() => dispatch({ type: ACTIONS.START_NEXT_FRAME, breakerIndex: state.activePlayerIndex })}
                className="inline-flex items-center justify-center gap-2 font-display font-semibold rounded-md px-5 py-3 text-sm leading-none transition active:translate-y-px bg-panel2 border border-hairline-d text-white hover:bg-panel"
              >
                {state.players[state.activePlayerIndex].name}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
