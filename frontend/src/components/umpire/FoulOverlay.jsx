import { ACTIONS } from '../../engine/snookerEngine';

function FoulOption({ value, label, selected, onPick }) {
  return (
    <button
      onClick={() => onPick(value)}
      className={`rounded-lg border-2 py-3 font-display font-bold text-[18px] transition ${
        selected
          ? 'border-bad bg-bad/15 text-white'
          : 'border-hairline-d text-ink-200 hover:border-ink-500'
      }`}
    >
      +{value}
      <span className="block text-[10px] font-sans font-medium text-ink-400 normal-case tracking-normal">
        {label}
      </span>
    </button>
  );
}

export default function FoulOverlay({ state, dispatch }) {
  const decided = state.foulValue != null;
  const opponent = state.players[1 - state.activePlayerIndex];
  const fouler = state.players[state.activePlayerIndex];

  return (
    <div className="absolute inset-0 z-20 bg-night/85 backdrop-blur-sm grid place-items-center p-8">
      <div className="bg-panel rounded-2xl border border-hairline-d shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-hairline-d flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-display font-semibold uppercase px-2.5 py-1 rounded-full leading-none tracking-[0.08em] text-[11.5px] bg-bad text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Foul
          </span>
          <span className="text-white font-display font-bold text-[17px]">
            Award points to {opponent.name}
          </span>
          <button
            onClick={() => dispatch({ type: ACTIONS.FOUL_CANCEL })}
            className="ml-auto w-8 h-8 rounded-md grid place-items-center text-ink-400 hover:bg-panel2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="font-display font-semibold uppercase tracking-[0.18em] text-ink-400 text-[11.5px] mb-2">
            Foul value
          </div>
          <div className="grid grid-cols-4 gap-2.5 mb-2">
            <FoulOption value={4} label="min / low" selected={state.foulValue === 4} onPick={(v) => dispatch({ type: ACTIONS.FOUL_PICK, value: v })} />
            <FoulOption value={5} label="blue" selected={state.foulValue === 5} onPick={(v) => dispatch({ type: ACTIONS.FOUL_PICK, value: v })} />
            <FoulOption value={6} label="pink" selected={state.foulValue === 6} onPick={(v) => dispatch({ type: ACTIONS.FOUL_PICK, value: v })} />
            <FoulOption value={7} label="black" selected={state.foulValue === 7} onPick={(v) => dispatch({ type: ACTIONS.FOUL_PICK, value: v })} />
          </div>

          {/* Give turn back */}
          <div className={`mt-5 pt-5 border-t border-hairline-d ${decided ? '' : 'opacity-40 pointer-events-none'}`}>
            <div className="text-white font-display font-bold text-[15px] mb-1">
              Give turn back to {fouler.name}?
            </div>
            <div className="text-ink-400 text-[12.5px] mb-3">
              The non-offender may ask the fouling player to play again.
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => dispatch({ type: ACTIONS.FOUL_APPLY, giveBack: true })}
                className="inline-flex items-center justify-center gap-2 font-display font-semibold rounded-md px-5 py-3 text-sm leading-none transition active:translate-y-px bg-felt text-white hover:bg-felt-700"
              >
                Yes — play again
              </button>
              <button
                onClick={() => dispatch({ type: ACTIONS.FOUL_APPLY, giveBack: false })}
                className="inline-flex items-center justify-center gap-2 font-display font-semibold rounded-md px-5 py-3 text-sm leading-none transition active:translate-y-px bg-panel2 border border-hairline-d text-white hover:bg-panel"
              >
                No — pass turn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
