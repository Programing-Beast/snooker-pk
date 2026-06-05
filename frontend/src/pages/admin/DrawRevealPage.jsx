import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import * as drawsApi from '../../api/draws';
import * as matchesApi from '../../api/matches';
import * as roundsApi from '../../api/rounds';
import * as tournamentsApi from '../../api/tournaments';
import * as entriesApi from '../../api/entries';
import PlayerAvatar from '../../components/ui/PlayerAvatar';
import CountryFlagChip from '../../components/ui/CountryFlagChip';
import Button from '../../components/ui/Button';
import TournamentSubNav from '../../components/admin/TournamentSubNav';

const PHASE_NOTES = {
  idle: 'Ready. Press "Draw next match" to spin for a random pairing.',
  spinning: 'Spinning through the remaining pool\u2026',
  settled: 'A pair has been drawn. Confirm to lock it in, or re-roll.',
  done: 'All matches drawn. Publish to push the bracket live.',
};

const STATE_STEPS = [
  ['idle', 'Idle'],
  ['spinning', 'Spinning'],
  ['settled', 'Settled'],
  ['confirmed', 'Confirmed'],
];

function StateLegend({ phase }) {
  const cur = phase === 'done' ? 'confirmed' : phase;
  return (
    <div className="flex items-center gap-1.5">
      {STATE_STEPS.map(([key, label], i) => (
        <div key={key} className="flex items-center gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-[10.5px] font-display font-bold uppercase tracking-wide ${
              key === cur ? 'bg-felt text-white' : 'bg-card-alt text-muted'
            }`}
          >
            {label}
          </span>
          {i < 3 && <span className="text-ink-300 text-[10px]">&rarr;</span>}
        </div>
      ))}
    </div>
  );
}

function Slot({ player, phase, slotPlayer }) {
  const isSpinning = phase === 'spinning';
  const isSettled = phase === 'settled';
  const display = isSpinning ? slotPlayer : player;

  return (
    <div
      className={`flex-1 rounded-xl border-2 p-5 text-center min-h-[150px] grid place-items-center transition-all ${
        isSettled && player
          ? 'border-felt bg-felt-50'
          : isSpinning
          ? 'border-ink-300 bg-white'
          : 'border-dashed border-ink-300 bg-surface2'
      }`}
    >
      <div>
        {display ? (
          <div className={isSpinning ? 'animate-pulse' : ''}>
            <PlayerAvatar
              name={display.name}
              photo={display.photo}
              tier={display.tier}
              size="lg"
              className={`mx-auto mb-2 ${display.seed === 1 ? 'ring-2 ring-brass' : ''}`}
            />
            <div className="font-display font-bold text-[17px]">{display.name}</div>
            <div className="flex items-center justify-center gap-1.5 text-[12px] text-ink-500 mt-1">
              <CountryFlagChip code={display.country_code || 'PAK'} size="sm" />
              <span>seed {display.seed || '—'}</span>
            </div>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 mx-auto rounded-full bg-ink-200 grid place-items-center text-ink-400 mb-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </div>
            <div className="font-display font-bold text-[15px] text-ink-300">&mdash;</div>
          </>
        )}
      </div>
    </div>
  );
}

export default function DrawRevealPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roundParam = searchParams.get('round');
  const [tournament, setTournament] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [pool, setPool] = useState([]);
  const [drawn, setDrawn] = useState([]);
  const [phase, setPhase] = useState('idle'); // idle | spinning | settled | done
  const [pair, setPair] = useState([null, null]);
  const [slotA, setSlotA] = useState(null);
  const [slotB, setSlotB] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [poolLoaded, setPoolLoaded] = useState(false);
  const spinTimer = useRef(null);

  // Load tournament + rounds
  useEffect(() => {
    tournamentsApi.show(id).then(res => setTournament(res.data.data ?? res.data)).catch(() => {});
    roundsApi.list(id).then(res => setRounds(res.data.data ?? res.data ?? [])).catch(() => {});
  }, [id]);

  // Determine the active round from query param or first random round
  const activeRound = roundParam
    ? rounds.find(r => String(r.id) === roundParam)
    : rounds.find(r => r.draw_mode === 'random') || rounds[0];
  const activeRoundId = activeRound?.id;
  const roundName = activeRound?.name || 'Round 1';
  const bestOf = activeRound?.frames_to_win ? activeRound.frames_to_win * 2 - 1 : 7;

  // Load the pool once we know which round we're revealing
  useEffect(() => {
    if (!activeRound || rounds.length === 0) return;

    const sortedRounds = [...rounds].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const isFirstRound = sortedRounds[0]?.id === activeRound.id;

    if (isFirstRound) {
      // First round: pool = approved entries
      entriesApi.list(id, { status: 'approved', per_page: 100 }).then(res => {
        const entries = res.data.data ?? res.data ?? [];
        const players = entries.map(e => ({
          id: e.player?.id || e.player_id,
          name: e.player?.name,
          photo: e.player?.photo_path,
          tier: e.player?.tier,
          country_code: e.player?.country_code || 'PAK',
          seed: e.seed,
        })).filter(p => p.name);
        setPool(players);
        setPoolLoaded(true);
      }).catch(() => setPoolLoaded(true));
    } else {
      // Later rounds: pool = winners of previous round
      const prevRoundIdx = sortedRounds.findIndex(r => r.id === activeRound.id) - 1;
      const prevRound = prevRoundIdx >= 0 ? sortedRounds[prevRoundIdx] : null;

      if (!prevRound) {
        setPoolLoaded(true);
        return;
      }

      // Load draw data to get previous round's matches + winners
      tournamentsApi.draw(id).then(res => {
        const allRounds = res.data.data ?? res.data ?? [];
        const prev = allRounds.find(r => r.id === prevRound.id);
        const prevMatches = prev?.matches || [];
        const winners = prevMatches
          .filter(m => m.winner)
          .map(m => ({
            id: m.winner.id,
            name: m.winner.name,
            photo: m.winner.photo_path,
            tier: m.winner.tier,
            country_code: m.winner.country_code || 'PAK',
            seed: null,
          }));
        setPool(winners);
        setPoolLoaded(true);
      }).catch(() => setPoolLoaded(true));
    }
  }, [id, activeRound?.id, rounds.length]);
  const totalMatches = Math.floor((pool.length + drawn.length * 2) / 2) || Math.max(Math.floor(pool.length / 2), 0);
  const isDone = phase === 'done' || (drawn.length > 0 && pool.length < 2);

  const drawNext = useCallback(() => {
    if (pool.length < 2) return;
    setPhase('spinning');

    // Spin animation: rapidly cycle random names
    spinTimer.current = setInterval(() => {
      const ra = pool[Math.floor(Math.random() * pool.length)];
      const rb = pool[Math.floor(Math.random() * pool.length)];
      setSlotA(ra);
      setSlotB(rb);
    }, 90);

    // After 1.8s, settle on a random distinct pair
    setTimeout(() => {
      clearInterval(spinTimer.current);
      spinTimer.current = null;

      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const picked = [shuffled[0], shuffled[1]];
      setPair(picked);
      setSlotA(picked[0]);
      setSlotB(picked[1]);
      setPhase('settled');
    }, 1800);
  }, [pool]);

  function confirmPair() {
    setDrawn(prev => [...prev, [pair[0], pair[1]]]);
    setPool(prev => prev.filter(p => p.id !== pair[0].id && p.id !== pair[1].id));
    setPair([null, null]);
    setSlotA(null);
    setSlotB(null);

    const remainingPool = pool.filter(p => p.id !== pair[0].id && p.id !== pair[1].id);
    setPhase(remainingPool.length < 2 ? 'done' : 'idle');
  }

  function rerollPair() {
    setPair([null, null]);
    setSlotA(null);
    setSlotB(null);
    setPhase('idle');
    // Immediately trigger a new spin
    setTimeout(() => drawNext(), 50);
  }

  async function publishDraw() {
    if (!activeRoundId || drawn.length === 0) return;
    setConfirming(true);
    setPublishError(null);
    try {
      // Send the client-side confirmed pairings to the backend
      const pairings = drawn.map(([p1, p2]) => ({
        player1_id: p1.id,
        player2_id: p2.id,
      }));
      await drawsApi.generate({
        tournament_id: Number(id),
        round_id: activeRoundId,
        pairings,
      });
      await drawsApi.confirm({ tournament_id: Number(id), round_id: activeRoundId });
      navigate(`/admin/tournaments/${id}/matches`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors || 'Failed to publish draw';
      console.error('Publish draw failed:', err?.response?.data || err);
      setPublishError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
    setConfirming(false);
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (spinTimer.current) clearInterval(spinTimer.current);
    };
  }, []);

  const currentPhase = isDone ? 'done' : phase;
  const matchNumber = Math.min(drawn.length + (isDone ? 0 : 1), totalMatches);

  return (
    <div>
      <TournamentSubNav tournament={tournament} />
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
        <div>
          <h1 className="font-display font-extrabold uppercase text-[28px] leading-none">Live draw reveal</h1>
          <p className="text-ink-500 text-[14px] mt-1.5">
            {roundName} &middot; random mode &middot; best of {bestOf}
          </p>
        </div>
        <div className="text-right">
          <div className="seclabel text-muted !text-[10px]">Progress</div>
          <div className="font-display font-extrabold text-[22px] tabular-nums">
            Match {matchNumber} <span className="text-muted">of {totalMatches}</span>
          </div>
        </div>
      </div>

      {/* State legend */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="seclabel text-muted !text-[10px]">State</span>
        <StateLegend phase={currentPhase} />
        <span className="text-[12px] text-ink-500 ml-1">{PHASE_NOTES[currentPhase]}</span>
      </div>

      {!poolLoaded ? (
        <div className="card grid place-items-center text-center py-20">
          <div className="text-muted text-[14px]">Loading pool&hellip;</div>
        </div>
      ) : pool.length === 0 && drawn.length === 0 ? (
        <div className="card grid place-items-center text-center py-20">
          <div>
            <div className="w-14 h-14 rounded-full bg-card-alt grid place-items-center mb-3 text-ink-300 mx-auto">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
              </svg>
            </div>
            <div className="font-display font-bold text-ink-700">No players in pool</div>
            <p className="text-muted text-[13px] mt-1">
              {(() => {
                const sorted = [...rounds].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
                const isFirst = sorted[0]?.id === activeRound?.id;
                return isFirst
                  ? 'Approve entries first, then come back to reveal the draw.'
                  : 'The previous round has no completed matches yet. Play those matches first.';
              })()}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* Left column */}
          <div className="space-y-5">
            {/* Stage card */}
            <div className="card p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-night felt-grain opacity-[0.03]" />
              <div className="relative flex items-center gap-4">
                <Slot player={pair[0]} phase={currentPhase} slotPlayer={slotA} />
                <div className="font-display font-extrabold text-ink-300 text-2xl shrink-0">VS</div>
                <Slot player={pair[1]} phase={currentPhase} slotPlayer={slotB} />
              </div>

              {/* Controls */}
              <div className="relative mt-6">
                {isDone ? (
                  <>
                    <div className="flex items-center gap-2 bg-ok-tint border border-ok/30 rounded-md px-4 py-3">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-ok shrink-0">
                        <path d="M5 12l5 5L20 6" />
                      </svg>
                      <b className="text-[#0C6B3C] text-[14px]">Draw complete &mdash; {drawn.length} matches.</b>
                      <Button
                        size="sm"
                        className="ml-auto"
                        onClick={publishDraw}
                        disabled={confirming}
                      >
                        {confirming ? 'Publishing\u2026' : 'Publish draw'}
                      </Button>
                    </div>
                    {publishError && (
                      <div className="mt-2 rounded-md bg-bad-tint border border-bad/30 px-4 py-2 text-[13px] text-bad">
                        {publishError}
                      </div>
                    )}
                  </>
                ) : currentPhase === 'settled' ? (
                  <div className="flex items-center gap-3">
                    <span className="badge bg-warn-tint text-[#9A5B12]">
                      <span className="dot pulse" />Awaiting approval
                    </span>
                    <div className="ml-auto flex gap-2.5">
                      <Button variant="ghost" onClick={rerollPair}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                          <path d="M3 12a9 9 0 1015-6.7L21 8" /><path d="M21 3v5h-5" />
                        </svg>
                        Re-roll
                      </Button>
                      <Button onClick={confirmPair}>Confirm matchup</Button>
                    </div>
                  </div>
                ) : currentPhase === 'spinning' ? (
                  <Button variant="brass" size="lg" className="w-full" disabled>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin shrink-0">
                      <path d="M21 12a9 9 0 11-6.2-8.5" />
                    </svg>
                    Spinning&hellip;
                  </Button>
                ) : (
                  <Button variant="brass" size="lg" className="w-full" onClick={drawNext}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                    </svg>
                    Draw next match
                  </Button>
                )}
              </div>
            </div>

            {/* Confirmed matches list */}
            <div>
              <div className="seclabel text-felt mb-3">Confirmed matches</div>
              <div className="card overflow-hidden">
                <div className="dark-ctx px-4 py-2.5 bg-night text-white flex items-center">
                  <span className="font-display font-bold uppercase tracking-[0.1em] text-[12px]">{roundName}</span>
                  <span className="ml-auto text-[11px] text-muted">{drawn.length} of {totalMatches}</span>
                </div>
                {drawn.length > 0 ? (
                  drawn.map((m, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-2.5 px-4 py-2.5 border-b border-divider last:border-0 dropin"
                    >
                      <span className="font-display font-semibold text-ink-300 tabular-nums w-4 text-center text-[12px]">{i + 1}</span>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[13px] font-semibold truncate">{m[0].name}</span>
                        <CountryFlagChip code={m[0].country_code || 'PAK'} size="sm" />
                      </div>
                      <span className="font-display font-bold text-ink-300 text-[12px]">v</span>
                      <div className="flex items-center gap-2 justify-end text-right min-w-0">
                        <CountryFlagChip code={m[1].country_code || 'PAK'} size="sm" />
                        <span className="text-[13px] font-semibold truncate">{m[1].name}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-muted text-[13px]">No matches confirmed yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right column — Remaining pool */}
          <div className="card overflow-hidden sticky top-[76px]">
            <div className="px-4 py-3 bg-card-alt flex items-center justify-between">
              <span className="seclabel text-ink-500">Remaining pool</span>
              <span className="badge bg-felt text-white !text-[9px] tabular-nums">{pool.length}</span>
            </div>
            <div className="p-3 space-y-1.5 max-h-[420px] overflow-y-auto">
              {pool.length > 0 ? pool.map(p => (
                <div
                  key={p.id}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-card-alt transition-all ${
                    pair.includes(p) && currentPhase === 'settled' ? 'ring-2 ring-felt' : ''
                  }`}
                >
                  <PlayerAvatar name={p.name} photo={p.photo} tier={p.tier} size="sm" className="!w-6 !h-6 !text-[10px]" />
                  <span className="text-[12.5px] font-semibold truncate">{p.name}</span>
                  <span className="text-[10px] text-muted ml-auto tabular-nums">{p.seed || '—'}</span>
                </div>
              )) : (
                <div className="py-6 text-center text-muted text-[13px]">Pool empty</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
