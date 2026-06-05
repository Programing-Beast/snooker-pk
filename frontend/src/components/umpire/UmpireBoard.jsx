import { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ACTIONS,
  ALL_BALL_VALUES,
  framesToWin,
  formatTime,
} from '../../engine/snookerEngine';
import useSnookerEngine from '../../hooks/useSnookerEngine';
import PlayerPanel from './PlayerPanel';
import BallButton from './BallButton';
import ExpectedBallIndicator from './ExpectedBallIndicator';
import BreakStrip from './BreakStrip';
import FrameHistory from './FrameHistory';
import FoulOverlay from './FoulOverlay';
import FrameEndOverlay from './FrameEndOverlay';
import MatchEndOverlay from './MatchEndOverlay';

const DEMO_CONFIG = {
  players: [
    { id: 1, name: 'M. Asif', countryCode: 'PAK', tier: 'Pro', seed: 1 },
    { id: 2, name: 'S. Khan', countryCode: 'PAK', tier: 'Pro', seed: 2 },
  ],
  bestOf: 9,
  tournament: 'Karachi National Open \'26',
  round: 'Quarter-final',
};

export default function UmpireBoard({ config = DEMO_CONFIG, onEndTurn, onFrameEnd, onMatchEnd }) {
  const { state, dispatch, undo } = useSnookerEngine(config);
  const need = framesToWin(state.bestOf);
  const disabled = state.frameOver || state.matchOver;

  // Refs keep callbacks and state current without re-creating handleDispatch
  const stateRef = useRef(state);
  stateRef.current = state;
  const cbRef = useRef({ onEndTurn, onFrameEnd, onMatchEnd });
  cbRef.current = { onEndTurn, onFrameEnd, onMatchEnd };

  // Wrapped dispatch that fires API persistence callbacks for turn-level actions
  const handleDispatch = useCallback((action) => {
    const s = stateRef.current;
    const cbs = cbRef.current;

    if (action.type === ACTIONS.END_TURN && cbs.onEndTurn) {
      cbs.onEndTurn({
        currentBreak: [...s.currentBreak],
        activePlayerIndex: s.activePlayerIndex,
      });
    }
    if (action.type === ACTIONS.FOUL_APPLY && cbs.onEndTurn) {
      cbs.onEndTurn({
        currentBreak: [...s.currentBreak],
        activePlayerIndex: s.activePlayerIndex,
        isFoul: true,
        foulPoints: s.foulValue || 4,
      });
    }
    dispatch(action);
  }, [dispatch]);

  // Fire onFrameEnd when frameOver transitions to true.
  // Covers BOTH natural endings (potting black) and manual "End frame" button.
  const prevFrameOverRef = useRef(false);
  useEffect(() => {
    if (state.frameOver && !prevFrameOverRef.current) {
      // Save any unsaved current break (umpire clicked "End frame" without "End turn")
      if (state.currentBreak.length > 0 && cbRef.current.onEndTurn) {
        cbRef.current.onEndTurn({
          currentBreak: [...state.currentBreak],
          activePlayerIndex: state.activePlayerIndex,
        });
      }

      const winner = state.frameWinner ?? (state.players[0].points >= state.players[1].points ? 0 : 1);
      cbRef.current.onFrameEnd?.({
        frameNo: state.frameNo,
        winner,
        p1Score: state.players[0].points,
        p2Score: state.players[1].points,
        matchOver: state.matchOver,
      });
    }
    prevFrameOverRef.current = state.frameOver;
  }, [state.frameOver, state.frameNo, state.frameWinner, state.players]);

  return (
    <div className="relative h-full flex flex-col bg-night felt-grain">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 h-[60px] bg-night border-b border-hairline-d shrink-0">
        <Link to="/umpire/dashboard" className="text-ink-400 hover:text-white transition" title="Back to dashboard">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <span className="font-display font-extrabold text-white uppercase tracking-tight text-[15px]">
          Snooker<span className="text-live">PK</span>
        </span>
        <span className="inline-flex items-center gap-1.5 font-display font-semibold uppercase px-2.5 py-1 rounded-full leading-none tracking-[0.08em] text-[9px] bg-brass/20 text-brass">
          Umpire
        </span>
        <div className="text-[12.5px] text-ink-400 hidden sm:block">
          {state.tournament} · <b className="text-ink-200">{state.round}</b> · best of {state.bestOf}
        </div>

        {/* Center scoreline */}
        <div className="mx-auto flex items-center gap-3">
          <span className="font-display font-bold text-white text-[15px]">{state.players[0].name}</span>
          <span className="font-display font-extrabold text-white tabular-nums text-[22px] px-3 py-0.5 rounded-md bg-panel2">
            {state.players[0].frames} <span className="text-ink-500">—</span> {state.players[1].frames}
          </span>
          <span className="font-display font-bold text-white text-[15px]">{state.players[1].name}</span>
        </div>

        {/* Frame + timer */}
        <div className="ml-auto flex items-center gap-4">
          <div className="text-right">
            <div className="font-display font-semibold uppercase tracking-[0.18em] text-ink-500 text-[9px]">Frame</div>
            <div className="font-display font-bold text-white text-[14px] leading-none">
              {state.frameNo} <span className="text-ink-500 font-medium">of {state.bestOf}</span>{' '}
              <span className="text-ink-600">· first to {need}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-ink-300">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
            </svg>
            <span className="font-display font-bold tabular-nums text-[15px] text-white">
              {formatTime(state.timer)}
            </span>
          </div>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="flex-1 grid grid-cols-[300px_1fr_300px] gap-4 p-4 min-h-0">
        <PlayerPanel state={state} playerIndex={0} />

        {/* Center column */}
        <div className="flex flex-col gap-3.5 min-w-0">
          <ExpectedBallIndicator state={state} />

          <div className="flex items-center justify-center gap-3 flex-wrap py-1">
            {ALL_BALL_VALUES.map((v) => (
              <BallButton
                key={v}
                state={state}
                value={v}
                onPot={(val) => handleDispatch({ type: ACTIONS.POT_BALL, value: val })}
              />
            ))}
          </div>

          <BreakStrip currentBreak={state.currentBreak} />

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-3 mt-auto">
            <button
              onClick={() => handleDispatch({ type: ACTIONS.END_TURN })}
              disabled={disabled}
              className="inline-flex items-center justify-center gap-2 font-display font-semibold rounded-md px-5 py-4 text-[15px] leading-none transition active:translate-y-px bg-panel2 border border-hairline-d text-white hover:bg-panel disabled:opacity-30"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4" />
              </svg>
              End turn
            </button>
            <button
              onClick={() => handleDispatch({ type: ACTIONS.FOUL_OPEN })}
              disabled={disabled}
              className="inline-flex items-center justify-center gap-2 font-display font-semibold rounded-md px-5 py-4 text-[15px] leading-none transition active:translate-y-px bg-bad/90 text-white hover:bg-bad disabled:opacity-30"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v4M12 17h.01" />
                <path d="M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z" />
              </svg>
              Foul
            </button>
            <button
              onClick={undo}
              className="inline-flex items-center justify-center gap-2 font-display font-semibold rounded-md px-5 py-4 text-[15px] leading-none transition active:translate-y-px bg-panel2 border border-hairline-d text-white hover:bg-panel"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1015-6.7L21 8" /><path d="M21 3v5h-5" />
              </svg>
              Undo
            </button>
          </div>

          <button
            onClick={() => handleDispatch({ type: ACTIONS.END_FRAME })}
            disabled={disabled}
            className="inline-flex items-center justify-center gap-2 font-display font-semibold rounded-md w-full px-5 py-3.5 text-[15px] leading-none transition active:translate-y-px bg-brass text-[#3a2c08] hover:brightness-105 disabled:opacity-30"
          >
            End frame ▸ record winner &amp; high break
          </button>
        </div>

        <PlayerPanel state={state} playerIndex={1} />
      </div>

      {/* Bottom history rail */}
      <div className="px-4 py-3 border-t border-hairline-d bg-night/60">
        <FrameHistory frameHistory={state.frameHistory} />
      </div>

      {/* Overlays */}
      {state.matchOver && <MatchEndOverlay state={state} />}
      {!state.matchOver && state.frameOver && <FrameEndOverlay state={state} dispatch={handleDispatch} />}
      {!state.matchOver && !state.frameOver && state.foulOpen && <FoulOverlay state={state} dispatch={handleDispatch} />}
    </div>
  );
}
