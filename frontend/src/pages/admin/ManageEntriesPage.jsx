import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as entriesApi from '../../api/entries';
import * as tournamentsApi from '../../api/tournaments';
import * as playersApi from '../../api/players';
import { PER_PAGE_ALL } from '../../api/pagination';
import PlayerListItem from '../../components/ui/PlayerListItem';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ManageEntriesPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [showAddSection, setShowAddSection] = useState(false);
  const [search, setSearch] = useState('');
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [adding, setAdding] = useState(false);

  function loadEntries() {
    return entriesApi.list(id, { per_page: PER_PAGE_ALL }).then(res => {
      setEntries(res.data.data ?? res.data ?? []);
    }).catch(() => {});
  }

  function loadPlayers() {
    return playersApi.list({ per_page: PER_PAGE_ALL }).then(res => {
      setPlayers(res.data.data || []);
    }).catch(() => {});
  }

  useEffect(() => {
    Promise.all([
      tournamentsApi.show(id).then(res => setTournament(res.data.data ?? res.data)).catch(() => {}),
      loadEntries(),
      loadPlayers(),
    ]).finally(() => setLoading(false));
  }, [id]);

  async function approve(entryId) {
    await entriesApi.approve(entryId);
    loadEntries();
  }

  async function reject(entryId) {
    await entriesApi.reject(entryId);
    loadEntries();
  }

  async function setSeed(entryId, seed) {
    await entriesApi.setSeed(entryId, { seed: seed || null });
    loadEntries();
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
      for (const playerId of ids) {
        await entriesApi.adminAdd({ tournament_id: id, player_id: playerId });
      }
      await loadEntries();
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="seclabel text-felt mb-1.5">Admin</div>
          <h1 className="font-display font-bold text-[1.5rem]">Manage entries</h1>
          {tournament && <p className="text-ink-500 text-[14px] mt-1">{tournament.name}</p>}
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
          <div className="max-h-72 overflow-y-auto divide-y divide-hairline border border-hairline rounded-lg">
            {filteredPlayers.length === 0 && (
              <div className="p-5 text-center text-ink-400 text-[14px]">No players available.</div>
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
            <Button size="sm" onClick={addSelected} disabled={adding || checkedIds.size === 0}>
              {adding ? 'Adding...' : `Add selected (${checkedIds.size})`}
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
          <div className="card divide-y divide-hairline overflow-hidden">
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
        <div className="card divide-y divide-hairline overflow-hidden">
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
          {approved.length === 0 && <div className="p-5 text-center text-ink-400 text-[14px]">No approved entries yet.</div>}
        </div>
      </div>

      {/* Rejected */}
      {rejected.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-[1.1rem] mb-3">Rejected ({rejected.length})</h2>
          <div className="card divide-y divide-hairline overflow-hidden">
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
