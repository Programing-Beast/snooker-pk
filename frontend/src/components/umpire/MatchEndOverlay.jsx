import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { playerInitials, maxBreak } from '../../engine/snookerEngine';

export default function MatchEndOverlay({ state }) {
  const w = state.players[0].frames > state.players[1].frames ? 0 : 1;
  const winner = state.players[w];
  const loser = state.players[1 - w];

  const max = maxBreak(state.redCount);
  const hasMaxBreak = state.players.some(p => p.highBreak >= max);
  const maxBreakPlayer = state.players.find(p => p.highBreak >= max);

  // Fire confetti on mount (winner celebration)
  const firedRef = useRef(false);
  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    const snookerColors = ['#c0392b', '#f2c200', '#1e7a3d', '#7a4a1e', '#1f5fa8', '#e86a92', '#161616'];
    confetti({ particleCount: 120, spread: 70, colors: snookerColors, origin: { y: 0.6 } });
    if (hasMaxBreak) {
      // Extra sustained burst for max break
      const fire = (delay) => setTimeout(() => confetti({ particleCount: 80, spread: 100, colors: snookerColors, origin: { y: 0.5 } }), delay);
      fire(400);
      fire(800);
      fire(1200);
    }
  }, [hasMaxBreak]);

  return (
    <div className="absolute inset-0 z-20 bg-night/92 backdrop-blur-sm grid place-items-center p-8">
      <div className="bg-panel rounded-2xl border border-brass/50 shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-felt to-felt-900 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-display font-semibold uppercase px-2.5 py-1 rounded-full leading-none tracking-[0.08em] text-[11.5px] bg-brass text-[#3a2c08]">
            Match complete
          </span>
          <span className="text-white/80 font-display font-semibold text-[13px]">
            {state.round} · best of {state.bestOf}
          </span>
        </div>

        {/* Body */}
        <div className="p-6 grid md:grid-cols-[1fr_220px] gap-6">
          <div className="text-center md:text-left">
            <div className="font-display font-semibold uppercase tracking-[0.18em] text-ink-400 text-[11.5px]">Winner</div>
            <div className="flex items-center gap-3 mt-2 justify-center md:justify-start">
              <div className="w-14 h-14 rounded-full bg-felt grid place-items-center font-display font-extrabold text-white text-xl ring-2 ring-brass">
                {playerInitials(winner.name)}
              </div>
              <div>
                <div className="font-display font-extrabold text-white text-[26px] leading-none">{winner.name}</div>
                <div className="flex items-center gap-1.5 text-[12px] text-ink-400 mt-1.5">
                  {winner.countryCode} · {winner.tier}
                </div>
              </div>
            </div>
            <div className="font-display font-extrabold text-brass tabular-nums mt-4" style={{ fontSize: 60, lineHeight: 1 }}>
              {winner.frames}<span className="text-ink-500"> – </span>{loser.frames}
            </div>
            <div className="text-ink-400 text-[13px] mt-1">def. {loser.name}</div>
            {hasMaxBreak && (
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-brass/20 text-brass font-display font-bold text-[13px] uppercase tracking-wide">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Maximum break {max}! — {maxBreakPlayer?.name}
              </div>
            )}
            <Link
              to="/umpire/dashboard"
              className="inline-flex items-center justify-center gap-2 font-display font-semibold rounded-md px-5 py-2.5 text-sm leading-none transition active:translate-y-px bg-felt text-white hover:bg-felt-700 mt-5"
            >
              Done — back to dashboard
            </Link>
          </div>

          {/* Frame history */}
          <div className="rounded-xl bg-black/30 p-3">
            <div className="font-display font-semibold uppercase tracking-[0.18em] text-ink-400 text-[11.5px] mb-2 px-1">
              Frame history
            </div>
            <div className="space-y-0.5">
              {state.frameHistory.map((h, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-3 py-1.5 rounded ${i % 2 ? 'bg-white/5' : ''}`}
                >
                  <span className="text-ink-400 text-[12px] font-display font-semibold">F{i + 1}</span>
                  <span className="font-display font-bold text-white tabular-nums text-[13px]">
                    {h.p1Score}–{h.p2Score}
                  </span>
                  <span className="text-brass text-[11px] tabular-nums">
                    {h.topBreak ? `(${h.topBreak})` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
