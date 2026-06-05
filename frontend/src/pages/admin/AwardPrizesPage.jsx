import { useEffect, useState, useMemo } from 'react';
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
  const [playerCounts, setPlayerCounts] = useState({});
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

  function awardSortKey(a) {
    if (a.category === 'tournament_winner' || a.prize?.type === 'winner') return 0;
    if (a.category === 'tournament_runner_up' || a.prize?.type === 'runner_up') return 1;
    return 2;
  }
  const sortByCategory = (a, b) => awardSortKey(a) - awardSortKey(b);
  const totalAmount = awards.reduce((sum, a) => sum + Number(a.amount || 0), 0);

  // Group awards by player + prize into consolidated rows
  function groupAwards(list) {
    const map = new Map();
    for (const a of list) {
      const key = `${a.player_id}-${a.prize_id || a.category}`;
      if (map.has(key)) {
        const g = map.get(key);
        g.ids.push(a.id);
        g.count += 1;
        g.totalAmount += Number(a.amount || 0);
      } else {
        map.set(key, {
          ...a,
          ids: [a.id],
          count: 1,
          totalAmount: Number(a.amount || 0),
        });
      }
    }
    return [...map.values()].sort(sortByCategory);
  }

  const pendingGroups = groupAwards(awards.filter(a => a.status === 'pending'));
  const awardedGroups = groupAwards(awards.filter(a => a.status === 'awarded'));
  const selectedPrizeObj = prizes.find(p => String(p.id) === String(selectedPrize));
  const isMultiple = selectedPrizeObj?.multiple;

  // Filter prizes available in the dropdown:
  // - Exclude system prizes (winner/runner_up) — those are auto-awarded
  // - Exclude non-multiple prizes that already have a pending or awarded record
  const availablePrizes = useMemo(() => {
    return prizes.filter(p => {
      if (p.type === 'winner' || p.type === 'runner_up') return false;
      if (!p.multiple) {
        const hasAward = awards.some(a => a.prize_id === p.id);
        if (hasAward) return false;
      }
      return true;
    });
  }, [prizes, awards]);

  // Total selected count across all players
  const totalSelected = useMemo(() => {
    return Object.values(playerCounts).reduce((sum, c) => sum + c, 0);
  }, [playerCounts]);

  async function confirmAward(ids) {
    const key = ids.join('-');
    setConfirming(key);
    try {
      for (const awardId of ids) {
        await prizeAwardsApi.update(awardId, { status: 'awarded' });
      }
      await loadAwards();
    } catch { /* ignore */ }
    setConfirming(null);
  }

  async function bulkAward() {
    if (!selectedPrize || totalSelected === 0) return;
    setAwarding(true);
    try {
      // Build player_ids array with duplicates for multiple counts
      const playerIds = [];
      for (const [playerId, count] of Object.entries(playerCounts)) {
        for (let i = 0; i < count; i++) {
          playerIds.push(Number(playerId));
        }
      }
      await prizeAwardsApi.bulk({
        tournament_id: Number(id),
        prize_id: Number(selectedPrize),
        player_ids: playerIds,
      });
      await loadAwards();
      setPlayerCounts({});
      setSelectedPrize('');
    } catch { /* ignore */ }
    setAwarding(false);
  }

  function togglePlayer(playerId) {
    setPlayerCounts(prev => {
      const next = { ...prev };
      if (next[playerId]) {
        delete next[playerId];
      } else {
        next[playerId] = 1;
      }
      return next;
    });
  }

  function adjustCount(playerId, delta) {
    setPlayerCounts(prev => {
      const next = { ...prev };
      const current = next[playerId] || 0;
      const updated = current + delta;
      if (updated <= 0) {
        delete next[playerId];
      } else {
        next[playerId] = updated;
      }
      return next;
    });
  }

  function handlePrizeChange(value) {
    setSelectedPrize(value);
    setPlayerCounts({});
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
            {pendingGroups.length}
          </div>
          <div className="text-[11px] text-ink-500 mt-1.5">
            {pendingGroups.length > 0 ? 'Needs confirmation' : 'All clear'}
          </div>
        </div>
        <div className="card p-5">
          <div className="seclabel text-ink-400">Awarded count</div>
          <div className="font-display font-extrabold text-[28px] leading-none tabular-nums mt-2">
            {awardedGroups.length}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
        {/* Left column */}
        <div className="space-y-6">
          {/* Pending awards */}
          {pendingGroups.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-hairline">
                <span className="seclabel text-felt">Pending confirmation</span>
              </div>
              <div className="divide-y divide-hairline">
                {pendingGroups.map(group => {
                  const key = group.ids.join('-');
                  return (
                    <div key={key} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="flex-1 min-w-0">
                        <PlayerListItem
                          player={group.player}
                          to={group.player?.id ? `/players/${group.player.id}` : undefined}
                          showTier={false}
                        />
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[13px] font-semibold">
                          {group.prize?.position_label || group.reason}
                          {group.count > 1 && <span className="text-ink-400 ml-1">({group.count}x)</span>}
                        </div>
                        <div className="font-display font-bold text-[14px] tabular-nums">
                          PKR {group.totalAmount.toLocaleString()}
                        </div>
                      </div>
                      <StatusBadge status="pending" />
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => confirmAward(group.ids)}
                        disabled={confirming === key}
                      >
                        {confirming === key ? 'Confirming...' : 'Confirm'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Awarded */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-hairline">
              <span className="seclabel text-felt">Awarded</span>
            </div>
            {awardedGroups.length > 0 ? (
              <div className="divide-y divide-hairline">
                {awardedGroups.map(group => (
                  <div key={group.ids.join('-')} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <PlayerListItem
                        player={group.player}
                        to={group.player?.id ? `/players/${group.player.id}` : undefined}
                        showTier={false}
                      />
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-semibold">
                        {group.prize?.position_label || group.reason}
                        {group.count > 1 && <span className="text-ink-400 ml-1">({group.count}x)</span>}
                      </div>
                      <div className="font-display font-bold text-[14px] tabular-nums">
                        PKR {group.totalAmount.toLocaleString()}
                      </div>
                    </div>
                    <span className={`badge ${group.category === 'score_prize' ? 'bg-brass-tint text-brass-700' : group.category === 'round_elimination' ? 'bg-ok-tint text-[#0C6B3C]' : group.category === 'tournament_winner' ? 'bg-felt-50 text-felt' : group.category === 'tournament_runner_up' ? 'bg-felt-50 text-felt' : 'bg-ink-100 text-ink-600'}`}>
                      {group.category === 'tournament_winner' ? 'winner' : group.category === 'tournament_runner_up' ? 'runner-up' : group.category === 'round_elimination' ? 'elimination' : group.category === 'score_prize' ? 'score' : group.category || 'manual'}
                    </span>
                    {group.awarded_at && (
                      <span className="text-[11px] text-ink-400 shrink-0">
                        {new Date(group.awarded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
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
                onChange={e => handlePrizeChange(e.target.value)}
              >
                <option value="">Select a prize...</option>
                {availablePrizes.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.position_label} — PKR {Number(p.amount || 0).toLocaleString()}
                    {p.multiple ? ' (multiple)' : ''}
                  </option>
                ))}
              </select>
              {availablePrizes.length === 0 && prizes.length > 0 && (
                <p className="text-[12px] text-ink-400 mt-1.5">All eligible prizes have been awarded.</p>
              )}
            </div>

            {selectedPrizeObj && (
              <div className="bg-surface2 rounded-lg px-4 py-3 text-[13px]">
                <div className="font-semibold">{selectedPrizeObj.position_label}</div>
                <div className="text-ink-500 mt-0.5">
                  PKR {Number(selectedPrizeObj.amount || 0).toLocaleString()}
                  {isMultiple && ' · Can be awarded multiple times'}
                </div>
              </div>
            )}

            {selectedPrize && (
              <>
                <div>
                  <label className="text-[12px] font-semibold text-ink-500 uppercase tracking-wide mb-1.5 block">
                    Select players ({totalSelected} selected)
                  </label>
                  <div className="border border-hairline rounded-lg max-h-72 overflow-y-auto divide-y divide-hairline">
                    {eligible.length > 0 ? eligible.map(player => {
                      const count = playerCounts[player.id] || 0;
                      return (
                        <div key={player.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface2">
                          {isMultiple ? (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => adjustCount(player.id, -1)}
                                disabled={count <= 0}
                                className="w-6 h-6 rounded bg-ink-100 text-ink-600 grid place-items-center text-[14px] font-bold hover:bg-ink-200 disabled:opacity-30"
                              >
                                -
                              </button>
                              <span className="w-6 text-center text-[13px] font-semibold tabular-nums">{count}</span>
                              <button
                                type="button"
                                onClick={() => adjustCount(player.id, 1)}
                                className="w-6 h-6 rounded bg-felt text-white grid place-items-center text-[14px] font-bold hover:bg-felt/80"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <input
                              type="checkbox"
                              checked={count > 0}
                              onChange={() => togglePlayer(player.id)}
                              className="rounded border-ink-300 cursor-pointer"
                            />
                          )}
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !isMultiple && togglePlayer(player.id)}>
                            <PlayerListItem player={player} showTier={false} size="sm" />
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="p-4 text-center text-ink-400 text-[13px]">No eligible players found.</div>
                    )}
                  </div>
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={bulkAward}
                  disabled={awarding || totalSelected === 0}
                >
                  {awarding ? 'Awarding...' : `Award to ${totalSelected} player(s)`}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
