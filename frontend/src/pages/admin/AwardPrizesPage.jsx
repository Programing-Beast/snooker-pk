import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as tournamentsApi from '../../api/tournaments';
import * as prizesApi from '../../api/prizes';
import * as prizeAwardsApi from '../../api/prizeAwards';
import TournamentSubNav from '../../components/admin/TournamentSubNav';
import PlayerListItem from '../../components/ui/PlayerListItem';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';

export default function AwardPrizesPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [awards, setAwards] = useState([]);
  const [eligible, setEligible] = useState([]);
  const [loading, setLoading] = useState(true);

  // Award form state
  const [selectedPrize, setSelectedPrize] = useState('');
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [awarding, setAwarding] = useState(false);
  const [confirming, setConfirming] = useState(null);

  function loadAwards() {
    return prizeAwardsApi.list(id).then(res => {
      setAwards(res.data.data ?? res.data ?? []);
    }).catch(() => {});
  }

  useEffect(() => {
    Promise.all([
      tournamentsApi.show(id).then(res => setTournament(res.data.data ?? res.data)).catch(() => {}),
      prizesApi.list(id).then(res => setPrizes(res.data.data ?? res.data ?? [])).catch(() => {}),
      loadAwards(),
      prizeAwardsApi.eligiblePlayers(id).then(res => setEligible(res.data.data ?? res.data ?? [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [id]);

  const pendingAwards = awards.filter(a => a.status === 'pending');
  const awardedAwards = awards.filter(a => a.status === 'awarded');
  const totalAmount = awards.reduce((sum, a) => sum + Number(a.amount || 0), 0);
  const selectedPrizeObj = prizes.find(p => String(p.id) === String(selectedPrize));

  async function confirmAward(awardId) {
    setConfirming(awardId);
    try {
      await prizeAwardsApi.update(awardId, { status: 'awarded' });
      await loadAwards();
    } catch { /* ignore */ }
    setConfirming(null);
  }

  async function bulkAward() {
    if (!selectedPrize || checkedIds.size === 0) return;
    setAwarding(true);
    try {
      await prizeAwardsApi.bulk({
        tournament_id: Number(id),
        prize_id: Number(selectedPrize),
        player_ids: [...checkedIds],
      });
      await loadAwards();
      setCheckedIds(new Set());
      setSelectedPrize('');
    } catch { /* ignore */ }
    setAwarding(false);
  }

  function togglePlayer(playerId) {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  }

  if (loading) {
    return (
      <div>
        <TournamentSubNav tournament={{ id, name: 'Loading...' }} />
        <div className="text-center py-12 text-ink-400">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <TournamentSubNav tournament={tournament} />

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <div className="seclabel text-ink-400">Total awarded</div>
          <div className="font-display font-extrabold text-[28px] leading-none tabular-nums mt-2">
            PKR {totalAmount.toLocaleString()}
          </div>
        </div>
        <div className="card p-5">
          <div className="seclabel text-ink-400">Pending</div>
          <div className="font-display font-extrabold text-[28px] leading-none tabular-nums mt-2">
            {pendingAwards.length}
          </div>
          <div className="text-[11px] text-ink-500 mt-1.5">
            {pendingAwards.length > 0 ? 'Needs confirmation' : 'All clear'}
          </div>
        </div>
        <div className="card p-5">
          <div className="seclabel text-ink-400">Awarded count</div>
          <div className="font-display font-extrabold text-[28px] leading-none tabular-nums mt-2">
            {awardedAwards.length}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
        {/* Left column */}
        <div className="space-y-6">
          {/* Pending awards */}
          {pendingAwards.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-hairline">
                <span className="seclabel text-felt">Pending confirmation</span>
              </div>
              <div className="divide-y divide-hairline">
                {pendingAwards.map(award => (
                  <div key={award.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <PlayerListItem
                        player={award.player}
                        to={award.player?.id ? `/players/${award.player.id}` : undefined}
                        showTier={false}
                      />
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-semibold">{award.prize?.position_label || award.reason}</div>
                      <div className="font-display font-bold text-[14px] tabular-nums">
                        PKR {Number(award.amount || 0).toLocaleString()}
                      </div>
                    </div>
                    <StatusBadge status="pending" />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => confirmAward(award.id)}
                      disabled={confirming === award.id}
                    >
                      {confirming === award.id ? 'Confirming...' : 'Confirm'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awarded */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-hairline">
              <span className="seclabel text-felt">Awarded</span>
            </div>
            {awardedAwards.length > 0 ? (
              <div className="divide-y divide-hairline">
                {awardedAwards.map(award => (
                  <div key={award.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <PlayerListItem
                        player={award.player}
                        to={award.player?.id ? `/players/${award.player.id}` : undefined}
                        showTier={false}
                      />
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-semibold">{award.prize?.position_label || award.reason}</div>
                      <div className="font-display font-bold text-[14px] tabular-nums">
                        PKR {Number(award.amount || 0).toLocaleString()}
                      </div>
                    </div>
                    <span className={`badge ${award.category === 'score' ? 'bg-brass-tint text-brass-700' : award.category === 'elimination' ? 'bg-ok-tint text-[#0C6B3C]' : 'bg-ink-100 text-ink-600'}`}>
                      {award.category || 'manual'}
                    </span>
                    {award.awarded_at && (
                      <span className="text-[11px] text-ink-400 shrink-0">
                        {new Date(award.awarded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 text-center text-ink-400 text-[13px]">No prizes awarded yet.</div>
            )}
          </div>
        </div>

        {/* Right column — Award form */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-hairline">
            <span className="seclabel text-felt">Award a prize</span>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-[12px] font-semibold text-ink-500 uppercase tracking-wide mb-1.5 block">
                Choose prize
              </label>
              <select
                className="input w-full"
                value={selectedPrize}
                onChange={e => { setSelectedPrize(e.target.value); setCheckedIds(new Set()); }}
              >
                <option value="">Select a prize...</option>
                {prizes.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.position_label} — PKR {Number(p.amount || 0).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {selectedPrizeObj && (
              <div className="bg-surface2 rounded-lg px-4 py-3 text-[13px]">
                <div className="font-semibold">{selectedPrizeObj.position_label}</div>
                <div className="text-ink-500 mt-0.5">
                  PKR {Number(selectedPrizeObj.amount || 0).toLocaleString()}
                  {selectedPrizeObj.prize_type && ` · ${selectedPrizeObj.prize_type}`}
                </div>
              </div>
            )}

            {selectedPrize && (
              <>
                <div>
                  <label className="text-[12px] font-semibold text-ink-500 uppercase tracking-wide mb-1.5 block">
                    Select players ({checkedIds.size} selected)
                  </label>
                  <div className="border border-hairline rounded-lg max-h-72 overflow-y-auto divide-y divide-hairline">
                    {eligible.length > 0 ? eligible.map(player => (
                      <label key={player.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checkedIds.has(player.id)}
                          onChange={() => togglePlayer(player.id)}
                          className="rounded border-ink-300"
                        />
                        <PlayerListItem player={player} showTier={false} size="sm" />
                      </label>
                    )) : (
                      <div className="p-4 text-center text-ink-400 text-[13px]">No eligible players found.</div>
                    )}
                  </div>
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={bulkAward}
                  disabled={awarding || checkedIds.size === 0}
                >
                  {awarding ? 'Awarding...' : `Award to ${checkedIds.size} player(s)`}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
