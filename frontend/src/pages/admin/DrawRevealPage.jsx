import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as drawsApi from '../../api/draws';
import * as tournamentsApi from '../../api/tournaments';
import PlayerAvatar from '../../components/ui/PlayerAvatar';
import CountryFlagChip from '../../components/ui/CountryFlagChip';
import Button from '../../components/ui/Button';

export default function DrawRevealPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [revealed, setRevealed] = useState(new Set());
  const [spinning, setSpinning] = useState(false);
  const [rerolling, setRerolling] = useState(false);

  useEffect(() => {
    tournamentsApi.show(id).then(res => setTournament(res.data.data ?? res.data)).catch(() => {});
    drawsApi.preview(id).then(res => setPreview(res.data.data ?? res.data)).catch(() => {});
  }, [id]);

  const matches = preview?.matches || [];

  const revealNext = useCallback(() => {
    if (currentMatch >= matches.length) return;
    setSpinning(true);
    setTimeout(() => {
      setRevealed(prev => new Set([...prev, currentMatch]));
      setSpinning(false);
      setCurrentMatch(prev => prev + 1);
    }, 1500);
  }, [currentMatch, matches.length]);

  async function reroll() {
    setRerolling(true);
    try {
      const res = await drawsApi.reroll({ tournament_id: Number(id), match_index: currentMatch - 1 });
      setPreview(res.data.data ?? res.data);
    } catch { /* ignore */ }
    setRerolling(false);
  }

  async function confirmAll() {
    await drawsApi.confirm({ tournament_id: Number(id) });
    setPreview(null);
  }

  return (
    <div className="min-h-[80vh] flex flex-col">
      <div className="mb-6">
        <div className="seclabel text-felt mb-1.5">Admin · Live reveal</div>
        <h1 className="font-display font-bold text-[1.5rem]">{tournament?.name || 'Draw reveal'}</h1>
      </div>

      {matches.length === 0 ? (
        <div className="flex-1 grid place-items-center text-ink-400">No draw to reveal. Generate a draw first.</div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {matches.map((m, i) => {
              const isRevealed = revealed.has(i);
              const isCurrent = i === currentMatch && spinning;

              return (
                <div
                  key={i}
                  className={`card overflow-hidden transition-all ${
                    isCurrent ? 'ring-2 ring-live shadow-e3' : isRevealed ? '' : 'opacity-50'
                  }`}
                >
                  <div className="px-4 py-2 bg-surface2 border-b border-hairline flex items-center justify-between">
                    <span className="seclabel">Match {i + 1}</span>
                    {isCurrent && <span className="badge bg-live-fill text-white"><span className="dot pulse" />Drawing...</span>}
                    {isRevealed && <span className="badge bg-ok-tint text-[#0C6B3C]">Revealed</span>}
                  </div>
                  <div className="p-4 space-y-3">
                    {/* Player 1 */}
                    <div className="flex items-center gap-3">
                      <PlayerAvatar name={m.player1?.name} tier={m.player1?.tier} size="sm" />
                      <div>
                        <div className="font-semibold text-[14px]">{isRevealed || isCurrent ? m.player1?.name : '???'}</div>
                        {(isRevealed || isCurrent) && <CountryFlagChip code={m.player1?.country_code || 'PAK'} size="sm" showLabel />}
                      </div>
                      {m.player1?.seed && <span className="ml-auto badge bg-brass-tint text-brass-700">#{m.player1.seed}</span>}
                    </div>
                    <div className="text-center text-ink-400 text-[12px] font-semibold">vs</div>
                    {/* Player 2 */}
                    <div className="flex items-center gap-3">
                      {isCurrent ? (
                        <div className="w-8 h-8 rounded-full bg-live/20 animate-pulse" />
                      ) : (
                        <PlayerAvatar name={m.player2?.name || '?'} tier={m.player2?.tier} size="sm" />
                      )}
                      <div>
                        <div className="font-semibold text-[14px]">{isRevealed ? m.player2?.name : isCurrent ? '...' : '???'}</div>
                        {isRevealed && <CountryFlagChip code={m.player2?.country_code || 'PAK'} size="sm" showLabel />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {currentMatch < matches.length ? (
              <Button variant="live" onClick={revealNext} disabled={spinning}>
                {spinning ? (
                  <><span className="w-2 h-2 rounded-full bg-white pulse" /> Drawing...</>
                ) : (
                  `Reveal match ${currentMatch + 1}`
                )}
              </Button>
            ) : (
              <Button onClick={confirmAll}>Confirm entire draw</Button>
            )}
            {currentMatch > 0 && currentMatch <= matches.length && (
              <Button variant="secondary" onClick={reroll} disabled={rerolling}>
                {rerolling ? 'Rerolling...' : 'Reroll last'}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
