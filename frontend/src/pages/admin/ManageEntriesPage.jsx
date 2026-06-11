import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetTournamentQuery } from '../../store/api/tournamentsApi';
import { useGetEntriesQuery, useApproveEntryMutation, useRejectEntryMutation, useBulkAddEntriesMutation, useSetEntrySeedMutation } from '../../store/api/entriesApi';
import { useGetPlayersQuery } from '../../store/api/playersApi';
import { PER_PAGE_ALL } from '../../api/pagination';
import PlayerListItem from '../../components/ui/PlayerListItem';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import TournamentSubNav from '../../components/admin/TournamentSubNav';

export default function ManageEntriesPage() {
  const { id } = useParams();
  const [showAddSection, setShowAddSection] = useState(false);
  const [search, setSearch] = useState('');
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [adding, setAdding] = useState(false);

  const { data: tournament } = useGetTournamentQuery(id);
  const { data: entries = [], isLoading } = useGetEntriesQuery({ tournamentId: id, params: { per_page: PER_PAGE_ALL } });
  const { data: players = [] } = useGetPlayersQuery({ per_page: PER_PAGE_ALL });
  const [approveEntry] = useApproveEntryMutation();
  const [rejectEntry] = useRejectEntryMutation();
  const [bulkAddEntries] = useBulkAddEntriesMutation();
  const [setEntrySeed] = useSetEntrySeedMutation();

  async function approve(entryId) {
    await approveEntry(entryId).unwrap();
  }

  async function reject(entryId) {
    await rejectEntry(entryId).unwrap();
  }

  async function setSeed(entryId, seed) {
    await setEntrySeed({ id: entryId, data: { seed: seed || null }, tournamentId: id }).unwrap();
  }

  const enteredPlayerIds = new Set(
    entries.map(e => e.player_id ?? e.player?.id).filter(Boolean)
  );

  const availablePlayers = players.filter(p => !enteredPlayerIds.has(p.id));

  const filteredPlayers = availablePlayers.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.phone && p.phone.toLowerCase().includes(q)) ||
      (p.city && p.city.toLowerCase().includes(q))
    );
  });

  function toggleCheck(playerId) {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  }

  async function addSelected() {
    const ids = [...checkedIds];
    if (ids.length === 0) return;
    setAdding(true);
    try {
      await bulkAddEntries({ tournamentId: Number(id), playerIds: ids }).unwrap();
      setCheckedIds(new Set());
      setSearch('');
    } catch { /* ignore */ }
    setAdding(false);
  }

  const approved = entries.filter(e => e.status === 'approved');
  const pending = entries.filter(e => e.status === 'pending');
  const rejected = entries.filter(e => e.status === 'rejected');
  const capacity = tournament?.max_players || 0;
  const fillPct = capacity ? Math.round((approved.length / capacity) * 100) : 0;
  const isFull = capacity > 0 && approved.length >= capacity;
  const slotsRemaining = capacity > 0 ? capacity - approved.length : Infinity;

  // Quick-select presets: show powers of 2 and the exact remaining count
  const quickSelectOptions = (() => {
    if (filteredPlayers.length === 0 || slotsRemaining <= 0) return [];
    const options = new Set();
    // Add exact remaining slots if capacity-bound
    if (slotsRemaining !== Infinity && slotsRemaining < filteredPlayers.length) {
      options.add(slotsRemaining);
    }
    // Common tournament sizes
    for (const n of [8, 16, 32, 64]) {
      if (n < filteredPlayers.length && n <= slotsRemaining) options.add(n);
    }
    return [...options].sort((a, b) => a - b);
  })();

  function selectTopN(n) {
    const toSelect = filteredPlayers.slice(0, n);
    setCheckedIds(prev => {
      const next = new Set(prev);
      // Clear any previously checked filtered players first
      filteredPlayers.forEach(p => next.delete(p.id));
      toSelect.forEach(p => next.add(p.id));
      return next;
    });
  }

  // "Select all" should cap at remaining slots
  const selectAllCount = Math.min(filteredPlayers.length, slotsRemaining);
  const allSelected = selectAllCount > 0 && filteredPlayers.slice(0, selectAllCount).every(p => checkedIds.has(p.id));

  return (
    <div>
      <TournamentSubNav tournament={tournament} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[1.5rem]">Manage entries</h1>
        </div>
        <Button onClick={() => setShowAddSection(v => !v)}>
          {showAddSection ? 'Close' : '+ Add players'}
        </Button>
      </div>

      {/* Add players section */}
      {showAddSection && (
        <div className="card p-5 mb-6">
          <h2 className="font-display font-bold text-[1.1rem] mb-3">Add players</h2>
          <Input
            placeholder="Search by name, phone, city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-3"
          />
          {filteredPlayers.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer hover:bg-ink-50 transition-colors rounded px-1.5 py-1">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => {
                    if (allSelected) {
                      setCheckedIds(prev => {
                        const next = new Set(prev);
                        filteredPlayers.forEach(p => next.delete(p.id));
                        return next;
                      });
                    } else {
                      selectTopN(selectAllCount);
                    }
                  }}
                  className="accent-felt w-4 h-4 shrink-0"
                />
                <span className="text-[13px] font-semibold text-ink-600">
                  {selectAllCount < filteredPlayers.length
                    ? `Select top ${selectAllCount}`
                    : `Select all (${filteredPlayers.length})`}
                </span>
              </label>
              {quickSelectOptions.length > 0 && (
                <>
                  <span className="text-ink-300 text-[12px]">or</span>
                  {quickSelectOptions.map(n => (
                    <button
                      key={n}
                      onClick={() => selectTopN(n)}
                      className="text-[12px] font-semibold px-2.5 py-1 rounded-md bg-card-alt text-ink-600 hover:bg-felt hover:text-white transition"
                    >
                      Top {n}
                    </button>
                  ))}
                </>
              )}
              {slotsRemaining !== Infinity && slotsRemaining < filteredPlayers.length && (
                <span className="text-[11px] text-ink-400 ml-auto">
                  {slotsRemaining} slot{slotsRemaining !== 1 ? 's' : ''} remaining
                </span>
              )}
            </div>
          )}
          <div className="max-h-72 overflow-y-auto divide-y divide-divider border border-border-subtle rounded-lg">
            {filteredPlayers.length === 0 && (
              <EmptyState title="No players available" message="All players have already been added." />
            )}
            {filteredPlayers.map(p => (
              <label
                key={p.id}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-ink-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checkedIds.has(p.id)}
                  onChange={() => toggleCheck(p.id)}
                  className="accent-felt w-4 h-4 shrink-0"
                />
                <PlayerListItem player={p} />
              </label>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4">
            <Button variant="ghost" size="sm" onClick={() => { setShowAddSection(false); setCheckedIds(new Set()); setSearch(''); }}>
              Cancel
            </Button>
            <Button size="sm" onClick={addSelected} disabled={adding || checkedIds.size === 0 || isFull}>
              {isFull ? 'Tournament full' : adding ? 'Adding...' : checkedIds.size > slotsRemaining
                ? `Add selected (${checkedIds.size}) — only ${slotsRemaining} will be added`
                : `Add selected (${checkedIds.size})`}
            </Button>
          </div>
        </div>
      )}

      {/* Capacity bar */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="seclabel">Capacity</span>
          <span className="font-display font-bold tabular-nums">{approved.length} / {capacity || '∞'}</span>
        </div>
        {capacity > 0 && (
          <div className="h-2 rounded-full bg-ink-200 overflow-hidden">
            <div className="h-full rounded-full bg-felt transition-all" style={{ width: `${fillPct}%` }} />
          </div>
        )}
      </div>

      {/* Pending entries */}
      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="font-display font-bold text-[1.1rem] mb-3">Pending ({pending.length})</h2>
          <div className="card divide-y divide-divider overflow-hidden">
            {pending.map(entry => (
              <div key={entry.id} className="flex items-center gap-4 px-4 py-3">
                <PlayerListItem player={entry.player}>
                  <StatusBadge status="pending" />
                  <Button size="sm" onClick={() => approve(entry.id)}>Approve</Button>
                  <Button variant="danger" size="sm" onClick={() => reject(entry.id)}>Reject</Button>
                </PlayerListItem>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved entries */}
      <div className="mb-6">
        <h2 className="font-display font-bold text-[1.1rem] mb-3">Approved ({approved.length})</h2>
        <div className="card divide-y divide-divider overflow-hidden">
          {approved.map((entry, i) => (
            <div key={entry.id} className="flex items-center gap-4 px-4 py-3">
              <PlayerListItem player={entry.player} index={i + 1}>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-ink-500">Seed:</span>
                  <input
                    type="number"
                    className="input w-16 text-center !py-1"
                    value={entry.seed || ''}
                    onChange={e => setSeed(entry.id, e.target.value)}
                    min="1"
                    placeholder="—"
                  />
                </div>
                <StatusBadge status="approved" />
              </PlayerListItem>
            </div>
          ))}
          {approved.length === 0 && <EmptyState title="No approved entries yet" message="Approve pending entries to see them here." />}
        </div>
      </div>

      {/* Rejected */}
      {rejected.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-[1.1rem] mb-3">Rejected ({rejected.length})</h2>
          <div className="card divide-y divide-divider overflow-hidden">
            {rejected.map(entry => (
              <div key={entry.id} className="flex items-center gap-4 px-4 py-3">
                <PlayerListItem player={entry.player}>
                  <StatusBadge status="rejected" />
                  <Button variant="ghost" size="sm" onClick={() => approve(entry.id)}>Re-approve</Button>
                </PlayerListItem>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
