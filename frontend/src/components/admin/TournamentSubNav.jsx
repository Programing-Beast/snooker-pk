import { Link, useLocation } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';

const TABS = [
  { to: '', label: 'Overview', matchSuffixes: [''] },
  { to: '/entries', label: 'Entries', matchSuffixes: ['/entries'] },
  { to: '/draw', label: 'Draw', matchSuffixes: ['/draw', '/reveal'] },
  { to: '/matches', label: 'Matches', matchSuffixes: ['/matches'] },
  { to: '/awards', label: 'Awards', matchSuffixes: ['/awards'] },
];

export default function TournamentSubNav({ tournament }) {
  const { pathname } = useLocation();

  if (!tournament) return null;

  const base = `/admin/tournaments/${tournament.id}`;

  return (
    <div className="mb-6">
      {/* Tournament header */}
      <div className="flex items-center gap-3 mb-3">
        <Link to="/admin" className="text-ink-400 hover:text-ink-600 transition shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-display font-extrabold text-[22px] leading-none truncate">
          {tournament.name}
        </h1>
        <StatusBadge status={tournament.status || 'upcoming'} />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-hairline">
        {TABS.map(tab => {
          const to = base + tab.to;
          const isActive = tab.matchSuffixes.some(suffix =>
            suffix === '' ? pathname === base : pathname.startsWith(base + suffix)
          );
          return (
            <Link
              key={tab.label}
              to={to}
              className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 transition -mb-px ${
                isActive
                  ? 'border-felt text-felt'
                  : 'border-transparent text-ink-400 hover:text-ink-700'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
