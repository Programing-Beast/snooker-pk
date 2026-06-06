import { useParams, Link } from 'react-router-dom';
import { useGetTournamentQuery, useGetTournamentDrawQuery } from '../../store/api/tournamentsApi';
import { useGetEntriesQuery } from '../../store/api/entriesApi';
import { useGetRoundsQuery } from '../../store/api/roundsApi';
import TournamentSubNav from '../../components/admin/TournamentSubNav';
import MatchResultHero from '../../components/ui/MatchResultHero';
import StatusBadge from '../../components/ui/StatusBadge';

export default function AdminTournamentPage() {
  const { id } = useParams();
  const { data: tournament, isLoading: tLoading } = useGetTournamentQuery(id);
  const { data: entries = [] } = useGetEntriesQuery({ tournamentId: id, params: { per_page: 200 } });
  const { data: rounds = [] } = useGetRoundsQuery(id);
  const { data: drawData = [] } = useGetTournamentDrawQuery(id);

  const loading = tLoading;
  const approved = entries.filter(e => e.status === 'approved');
  const pending = entries.filter(e => e.status === 'pending');
  const sortedRounds = [...rounds].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const drawRounds = Array.isArray(drawData) ? drawData : drawData?.rounds || [];
  const totalMatches = drawRounds.reduce((sum, r) => sum + (r.matches?.length || 0), 0);
  const liveMatches = drawRounds.reduce(
    (sum, r) => sum + (r.matches?.filter(m => m.status === 'live' || m.status === 'in_progress').length || 0),
    0,
  );

  const startDate = tournament?.start_date
    ? new Date(tournament.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const endDate = tournament?.end_date
    ? new Date(tournament.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  if (loading) {
    return (
      <div>
        <TournamentSubNav tournament={{ id, name: 'Loading...' }} />
        <div className="text-center py-12 text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <TournamentSubNav tournament={tournament} />

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-5">
          <div className="seclabel text-muted">Approved entries</div>
          <div className="font-display font-extrabold text-[32px] leading-none tabular-nums mt-2">{approved.length}</div>
          <div className="text-[11px] text-ink-500 mt-1.5">of {tournament?.max_players || '∞'} max</div>
        </div>
        <div className="card p-5">
          <div className="seclabel text-muted">Pending entries</div>
          <div className="font-display font-extrabold text-[32px] leading-none tabular-nums mt-2">{pending.length}</div>
          <div className="text-[11px] text-ink-500 mt-1.5">{pending.length > 0 ? 'Needs review' : 'All clear'}</div>
        </div>
        <div className="card p-5">
          <div className="seclabel text-muted">Rounds</div>
          <div className="font-display font-extrabold text-[32px] leading-none tabular-nums mt-2">{rounds.length}</div>
          <div className="text-[11px] text-ink-500 mt-1.5">{rounds.filter(r => r.generated_at).length} drawn</div>
        </div>
        <div className="card p-5">
          <div className="seclabel text-muted">Total matches</div>
          <div className="font-display font-extrabold text-[32px] leading-none tabular-nums mt-2">{totalMatches}</div>
          <div className="text-[11px] text-ink-500 mt-1.5">{liveMatches > 0 ? `${liveMatches} live now` : 'None live'}</div>
        </div>
      </div>

      {/* Winner & Runner-up */}
      {tournament?.winner && (() => {
        const wId = tournament.winner_id ?? tournament.winner?.id;
        const finalRound = drawRounds[drawRounds.length - 1];
        const finalMatch = finalRound?.matches?.find(m =>
            String(m.winner?.id ?? m.winner_id) === String(wId)
          ) || finalRound?.matches?.[0] || null;
        const p1IsWinner = finalMatch && String(finalMatch.player1?.id ?? finalMatch.player1_id) === String(wId);
        const winnerFrames = finalMatch ? (p1IsWinner ? finalMatch.score1 : finalMatch.score2) : null;
        const runnerFrames = finalMatch ? (p1IsWinner ? finalMatch.score2 : finalMatch.score1) : null;

        return (
          <div className="mb-6 py-4">
            <MatchResultHero
              player1={tournament.winner}
              player2={tournament.runner_up}
              p1Frames={winnerFrames}
              p2Frames={runnerFrames}
              winnerId={wId}
              label="Final"
              dark={false}
            />
          </div>
        );
      })()}

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
        {/* Left column */}
        <div className="space-y-6">
          {/* Info card */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-divider flex items-center justify-between">
              <span className="seclabel text-felt">Tournament info</span>
              <Link to={`/admin/tournaments/${id}/edit`} className="text-[12.5px] font-semibold text-felt">Edit →</Link>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-ink-500">Status</span>
                <StatusBadge status={tournament?.status || 'upcoming'} />
              </div>
              {tournament?.city && (
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-ink-500">City</span>
                  <span className="text-[13px] font-semibold">{tournament.city}</span>
                </div>
              )}
              {tournament?.venue && (
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-ink-500">Venue</span>
                  <span className="text-[13px] font-semibold">{tournament.venue}</span>
                </div>
              )}
              {(startDate || endDate) && (
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-ink-500">Dates</span>
                  <span className="text-[13px] font-semibold">
                    {startDate}{endDate && startDate !== endDate ? ` – ${endDate}` : ''}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-ink-500">Max players</span>
                <span className="text-[13px] font-semibold">{tournament?.max_players || '∞'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-ink-500">Entry status</span>
                <span className="text-[13px] font-semibold capitalize">{tournament?.entry_status || 'closed'}</span>
              </div>
            </div>
          </div>

          {/* Round progression */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-divider">
              <span className="seclabel text-felt">Round progression</span>
            </div>
            {sortedRounds.length > 0 ? (
              <div className="divide-y divide-divider">
                {sortedRounds.map(round => {
                  const roundDraw = drawRounds.find(r => r.id === round.id);
                  const matches = roundDraw?.matches || [];
                  const matchCount = matches.length;
                  const completedCount = matches.filter(m => m.status === 'completed' || m.status === 'walkover').length;
                  const hasPlayers = matches.some(m => m.player1_id || m.player2_id);

                  let statusBadge;
                  if (matchCount > 0 && completedCount === matchCount) {
                    statusBadge = <span className="badge bg-ink-100 text-ink-600">Completed</span>;
                  } else if (completedCount > 0) {
                    statusBadge = <span className="badge bg-ok-tint text-[#0C6B3C]">{completedCount}/{matchCount}</span>;
                  } else if (hasPlayers) {
                    statusBadge = <span className="badge bg-ok-tint text-[#0C6B3C]">In progress</span>;
                  } else if (round.generated_at) {
                    statusBadge = <span className="badge bg-ok-tint text-[#0C6B3C]">Draw ready</span>;
                  } else {
                    statusBadge = <span className="badge bg-ink-100 text-ink-400">Pending</span>;
                  }

                  return (
                    <div key={round.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-[14px]">{round.name}</div>
                        <div className="text-[11px] text-muted">
                          {round.frames_to_win ? `Best of ${round.frames_to_win * 2 - 1}` : '—'}
                          {matchCount > 0 && ` · ${matchCount} matches`}
                        </div>
                      </div>
                      {statusBadge}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-5 text-center text-muted text-[13px]">No rounds configured yet.</div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div>
            <div className="seclabel text-felt mb-3">Quick actions</div>
            <div className="grid gap-2.5">
              <Link to={`/admin/tournaments/${id}/entries`} className="btn btn-primary w-full justify-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="8" r="3.5" /><path d="M3 21c0-3.5 3-5.5 6-5.5s6 2 6 5.5" /><path d="M17 8a3 3 0 010 6" />
                </svg>
                Manage entries
                {pending.length > 0 && (
                  <span className="ml-auto badge bg-warn-tint text-[#9A5B12] !text-[9px]">{pending.length} pending</span>
                )}
              </Link>
              <Link to={`/admin/tournaments/${id}/draw`} className="btn btn-outline w-full justify-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 4v16" />
                </svg>
                Generate draw
              </Link>
              <Link to={`/admin/tournaments/${id}/matches`} className="btn btn-outline w-full justify-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" />
                </svg>
                Manage matches
              </Link>
              <Link to={`/admin/tournaments/${id}/awards`} className="btn btn-outline w-full justify-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="6" /><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
                </svg>
                Award prizes
              </Link>
              <Link to={`/admin/tournaments/${id}/edit`} className="btn btn-ghost w-full justify-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit tournament
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
