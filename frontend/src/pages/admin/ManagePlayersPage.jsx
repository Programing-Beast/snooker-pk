import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as playersApi from '../../api/players';
import PlayerCard from '../../components/ui/PlayerCard';
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

  async function toggleStatus(e, p) {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = p.status === 'active' ? 'inactive' : 'active';
    try {
      await playersApi.update(p.id, { status: newStatus });
      loadPlayers();
    } catch { /* ignore */ }
  }

  function handleEdit(e, p) {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin/players/${p.id}/edit`);
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

      {/* Player grid */}
      {loading ? (
        <div className="text-center py-12 text-muted">Loading...</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-2 gap-y-0">
          {filtered.map(p => (
            <div key={p.id} className={p.status === 'inactive' ? 'opacity-40' : ''}>
              <PlayerCard
                player={p}
                to={`/admin/players/${p.id}/edit`}
                overlay={
                  <>
                    <button
                      onClick={(e) => handleEdit(e, p)}
                      className="w-8 h-8 rounded-full bg-white text-ink-800 grid place-items-center hover:bg-ink-100 transition"
                      title="Edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => toggleStatus(e, p)}
                      className={`w-8 h-8 rounded-full grid place-items-center transition ${
                        p.status === 'active'
                          ? 'bg-bad text-white hover:bg-bad/80'
                          : 'bg-ok text-white hover:bg-ok/80'
                      }`}
                      title={p.status === 'active' ? 'Disable' : 'Enable'}
                    >
                      {p.status === 'active' ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" /><path d="M4.93 4.93l14.14 14.14" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </button>
                  </>
                }
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-muted">No players found.</div>
      )}
    </div>
  );
}
