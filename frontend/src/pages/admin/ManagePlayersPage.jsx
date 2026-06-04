import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as playersApi from '../../api/players';
import PlayerListItem from '../../components/ui/PlayerListItem';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';

export default function ManagePlayersPage() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  function loadPlayers() {
    const params = { per_page: 100 };
    if (statusFilter) params.status = statusFilter;
    playersApi.list(params)
      .then(res => setPlayers(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadPlayers(); }, [statusFilter]);

  async function toggleStatus(p) {
    const newStatus = p.status === 'active' ? 'inactive' : 'active';
    try {
      await playersApi.update(p.id, { status: newStatus });
      loadPlayers();
    } catch { /* ignore */ }
  }

  const filtered = search
    ? players.filter(p => {
        const q = search.toLowerCase();
        const phoneMatch = (p.phones || []).some(ph => ph.phone?.toLowerCase().includes(q));
        return (p.name + ' ' + (p.city || '')).toLowerCase().includes(q) || phoneMatch;
      })
    : players;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="seclabel text-felt mb-1.5">Admin</div>
          <h1 className="font-display font-bold text-[1.5rem]">Manage players</h1>
        </div>
        <Button onClick={() => navigate('/admin/players/new')}>+ New player</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative max-w-[260px] flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input className="input pl-10" placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Disabled</option>
        </Select>
      </div>

      {/* Player list */}
      {loading ? (
        <div className="text-center py-12 text-ink-400">Loading...</div>
      ) : (
        <div className="card divide-y divide-hairline overflow-hidden">
          {filtered.map(p => (
            <div key={p.id} className={`flex items-center gap-4 px-4 py-3 hover:bg-surface2 transition ${p.status === 'inactive' ? 'opacity-50' : ''}`}>
              <PlayerListItem player={p} showTier={false}>
                {p.status === 'inactive' && (
                  <span className="text-[11px] font-medium text-bad bg-bad-tint px-1.5 py-0.5 rounded">Disabled</span>
                )}
                {p.phones?.length > 0 && (
                  <span className="text-[12px] text-ink-400 hidden sm:inline">{p.phones[0].phone}</span>
                )}
                <StatusBadge status={p.tier?.toLowerCase() === 'pro' ? 'pro' : 'amateur'}>
                  {p.tier || 'Amateur'}
                </StatusBadge>
                <Button variant="ghost" size="sm" onClick={() => toggleStatus(p)}>
                  {p.status === 'active' ? 'Disable' : 'Enable'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/players/${p.id}/edit`)}>Edit</Button>
              </PlayerListItem>
            </div>
          ))}
          {filtered.length === 0 && <div className="p-8 text-center text-ink-400">No players found.</div>}
        </div>
      )}
    </div>
  );
}
