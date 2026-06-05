import { Link } from 'react-router-dom';
import { useGetUmpireMatchesQuery } from '../../store/api/matchesApi';
import EmptyState from '../../components/ui/EmptyState';

const STATUS_CHIP = {
  live: 'bg-live-fill text-white',
  scheduled: 'bg-brass-tint text-brass-700',
  completed: 'bg-ok-tint text-[#0C6B3C]',
  walkover: 'bg-ink-100 text-ink-500',
};

export default function UmpireDashboardPage() {
  const { data: matches = [], isLoading } = useGetUmpireMatchesQuery();

  const active = matches.filter(m => m.status === 'live' || m.status === 'scheduled');
  const completed = matches.filter(m => m.status === 'completed' || m.status === 'walkover');

  if (isLoading) {
    return <div className="max-w-[1200px] mx-auto px-6 py-16 text-center text-muted">Loading...</div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-[1.5rem]">My Matches</h1>
        <p className="text-sm text-muted mt-1">Matches assigned to you for scoring.</p>
      </div>

      {matches.length === 0 ? (
        <EmptyState title="No matches assigned" message="You have no matches assigned for scoring yet." />
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <div>
              <div className="seclabel text-felt mb-3">Active</div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.map(m => (
                  <MatchCard key={m.id} match={m} showScore />
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <div className="seclabel text-muted mb-3">Completed</div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map(m => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MatchCard({ match: m, showScore }) {
  const chipClass = STATUS_CHIP[m.status] || STATUS_CHIP.scheduled;
  const statusLabel = m.status?.charAt(0).toUpperCase() + m.status?.slice(1);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="min-w-0">
          <div className="seclabel text-muted !text-[10px] truncate">{m.tournament?.name}</div>
          <div className="font-display font-bold text-[15px]">{m.round?.name || 'Match'}</div>
        </div>
        <span className={`badge ${chipClass} !text-[10px]`}>
          {m.status === 'live' && <span className="dot pulse" />}
          {statusLabel}
        </span>
      </div>

      <div className="text-sm mb-1 font-semibold">{m.player1?.name || 'TBD'}</div>
      <div className="text-xs text-muted mb-3">vs {m.player2?.name || 'TBD'}</div>

      {m.winner && (
        <div className="text-xs text-muted mb-3">Winner: <span className="text-felt font-semibold">{m.winner.name}</span></div>
      )}

      {showScore && m.status !== 'completed' && m.status !== 'walkover' && (
        <Link to={`/umpire/${m.id}`} className="btn btn-primary btn-sm w-full text-center">
          Score Match
        </Link>
      )}
    </div>
  );
}
