import { useState } from 'react';
import { useGetTournamentsQuery } from '../../store/api/tournamentsApi';
import TournamentCard from '../../components/ui/TournamentCard';
import EmptyState from '../../components/ui/EmptyState';

const TABS = ['all', 'upcoming', 'live', 'completed'];

export default function TournamentsPage() {
  const { data: tournaments = [], isLoading } = useGetTournamentsQuery({ per_page: 50 });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = tournaments.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (t.name + ' ' + (t.city || '') + ' ' + (t.organizer || '')).toLowerCase().includes(s);
    }
    return true;
  });

  const counts = {
    all: tournaments.length,
    upcoming: tournaments.filter(t => t.status === 'upcoming').length,
    live: tournaments.filter(t => t.status === 'live').length,
    completed: tournaments.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="px-6 sm:px-9 pt-9 pb-5">
        <div className="seclabel text-felt mb-1.5">Browse</div>
        <h1 className="font-display font-extrabold uppercase text-[2.125rem] leading-none">Tournaments</h1>
        <p className="text-ink-500 text-[15px] mt-2">Every event across Pakistan — live, upcoming and past results.</p>
      </div>

      {/* Filter bar */}
      <div className="px-6 sm:px-9 sticky top-16 z-10 bg-page/95 backdrop-blur py-3 border-y border-divider">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex bg-card-alt rounded-md p-1 gap-1">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-md text-[13px] font-display font-semibold flex items-center gap-1.5 ${
                  filter === tab ? 'bg-card text-felt shadow-e1' : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                {tab === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-live pulse" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="text-muted">{counts[tab]}</span>
              </button>
            ))}
          </div>
          <div className="relative ml-auto w-full sm:w-72">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              className="input pl-10"
              placeholder="Search by name, city or organizer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-6 sm:px-9 py-7">
        {isLoading ? (
          <div className="text-center py-16 text-muted">Loading tournaments...</div>
        ) : filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(t => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        ) : (
          <EmptyState
            title="No tournaments found"
            message="Try a different filter or search term."
            icon={
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
              </svg>
            }
          />
        )}
      </div>
    </div>
  );
}
