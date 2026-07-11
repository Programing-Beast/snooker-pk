import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGetTournamentsQuery } from '../../store/api/tournamentsApi';
import StatusBadge from '../../components/ui/StatusBadge';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const SORT_OPTIONS = [
  { value: 'start_date:desc', label: 'Date (newest)' },
  { value: 'start_date:asc', label: 'Date (oldest)' },
  { value: 'name:asc', label: 'Name (A-Z)' },
  { value: 'name:desc', label: 'Name (Z-A)' },
  { value: 'created_at:desc', label: 'Created (newest)' },
  { value: 'created_at:asc', label: 'Created (oldest)' },
];

const PER_PAGE = 15;

export default function AdminTournamentsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('start_date:desc');
  const [page, setPage] = useState(1);
  const searchDebounce = useRef(null);

  const [sort_by, sort_dir] = sort.split(':');
  const queryParams = {
    per_page: PER_PAGE,
    page,
    sort_by,
    sort_dir,
  };
  if (debouncedSearch.trim()) queryParams.search = debouncedSearch.trim();
  if (statusFilter) queryParams.status = statusFilter;

  const { data: result, isLoading } = useGetTournamentsQuery(queryParams);

  // Handle the response - could be array or { data, meta } from Laravel pagination
  const tournaments = Array.isArray(result) ? result : (result?.data || result || []);
  const meta = Array.isArray(result) ? null : (result?.meta || null);

  function handleSearch(value) {
    setSearch(value);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(value);
    }, 350);
  }

  function handleStatusChange(value) {
    setStatusFilter(value);
    setPage(1);
  }

  function handleSortChange(value) {
    setSort(value);
    setPage(1);
  }

  const lastPage = meta?.last_page || 1;
  const from = meta?.from || 0;
  const to = meta?.to || 0;
  const total = meta?.total || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="seclabel text-felt mb-1.5">Admin</div>
          <h1 className="font-display font-bold text-[1.5rem]">Tournaments</h1>
        </div>
        <Link to="/admin/tournaments/new">
          <Button>+ New tournament</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input className="input max-w-[280px] flex-1" placeholder="Search tournaments..." value={search} onChange={e => handleSearch(e.target.value)} />
        <Select value={statusFilter} onChange={e => handleStatusChange(e.target.value)}>
          <option value="">All statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="awaiting">Awaiting</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
          <option value="postponed">Postponed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Select value={sort} onChange={e => handleSortChange(e.target.value)}>
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </div>

      {/* Tournament list */}
      {isLoading ? (
        <div className="text-center py-12 text-muted">Loading...</div>
      ) : tournaments.length > 0 ? (
        <>
          <div className="card overflow-hidden">
            {tournaments.map(t => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-divider last:border-0 hover:bg-card-alt transition">
                <Link to={`/admin/tournaments/${t.id}`} className="min-w-0 flex-1">
                  <div className="font-semibold text-[14px] truncate hover:text-felt transition">{t.name}</div>
                  <div className="text-[11px] text-muted">
                    {t.city || '—'}
                    {t.start_date && <> · {new Date(t.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</>}
                    {' '}· {t.max_players || '—'} players
                  </div>
                </Link>
                {t.has_qualifiers && <span className="badge bg-felt text-white text-[10px]">Has Qualifiers</span>}
                <StatusBadge status={t.status || 'upcoming'} />
                <div className="flex gap-1.5 shrink-0">
                  <Link to={`/admin/tournaments/${t.id}/entries`} className="btn btn-ghost btn-sm text-[11px]">Entries</Link>
                  <Link to={`/admin/tournaments/${t.id}/draw`} className="btn btn-ghost btn-sm text-[11px]">Draw</Link>
                  <Link to={`/admin/tournaments/${t.id}/matches`} className="btn btn-ghost btn-sm text-[11px]">Matches</Link>
                  <Link to={`/admin/tournaments/${t.id}/edit`} className="btn btn-ghost btn-sm text-[11px]">Edit</Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-[12px] text-muted">
                Showing {from}–{to} of {total}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn btn-ghost btn-sm text-[12px] disabled:opacity-30"
                >
                  ← Prev
                </button>
                {Array.from({ length: lastPage }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`dot-${idx}`} className="px-1 text-muted text-[12px] self-center">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`btn btn-sm text-[12px] min-w-[32px] ${p === page ? 'btn-primary' : 'btn-ghost'}`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                  disabled={page >= lastPage}
                  className="btn btn-ghost btn-sm text-[12px] disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center text-muted">
          {search || statusFilter ? 'No tournaments match your search.' : (
            <>No tournaments yet. <Link to="/admin/tournaments/new" className="text-felt font-semibold">Create one</Link></>
          )}
        </div>
      )}
    </div>
  );
}
