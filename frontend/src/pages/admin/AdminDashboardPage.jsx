import { Link } from 'react-router-dom';
import { useGetTournamentsQuery } from '../../store/api/tournamentsApi';
import { useGetStatsQuery } from '../../store/api/statsApi';
import { useGetEntriesQuery } from '../../store/api/entriesApi';
import { useApproveEntryMutation, useRejectEntryMutation } from '../../store/api/entriesApi';
import StatusBadge from '../../components/ui/StatusBadge';
import PlayerAvatar from '../../components/ui/PlayerAvatar';
import CountryFlagChip from '../../components/ui/CountryFlagChip';

const STONE = {
  felt: 'bg-felt-50 text-felt',
  ink: 'bg-ink-100 text-ink-600',
  warn: 'bg-warn-tint text-[#9A5B12]',
  live: 'bg-live-tint text-live-fill',
};

export default function AdminDashboardPage() {
  const { data: tournaments = [], isLoading } = useGetTournamentsQuery({ per_page: 50 });
  const { data: platformStats } = useGetStatsQuery();

  // Find first active tournament to load its pending entries
  const activeTournaments = tournaments.filter(t => t.status === 'live' || t.status === 'upcoming');
  const firstActiveId = activeTournaments[0]?.id;

  const { data: entriesData = [] } = useGetEntriesQuery(
    { tournamentId: firstActiveId, params: { per_page: 50 } },
    { skip: !firstActiveId }
  );
  const [approveEntry] = useApproveEntryMutation();
  const [rejectEntry] = useRejectEntryMutation();

  const pendingEntries = Array.isArray(entriesData) ? entriesData.filter(e => e.status === 'pending') : [];

  const playerCount = platformStats?.players ?? 0;

  const live = tournaments.filter(t => t.status === 'live');
  const upcoming = tournaments.filter(t => t.status === 'upcoming');
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const stats = [
    {
      k: 'Active tournaments',
      v: (live.length + upcoming.length).toString(),
      sub: `${live.length} live · ${upcoming.length} upcoming`,
      tone: 'felt',
      icon: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 4v16" /></>,
    },
    {
      k: 'Total players',
      v: playerCount.toLocaleString(),
      sub: 'Registered on platform',
      tone: 'ink',
      icon: <><circle cx="9" cy="8" r="3.5" /><path d="M3 21c0-3.5 3-5.5 6-5.5s6 2 6 5.5" /><path d="M17 8a3 3 0 010 6" /></>,
    },
    {
      k: 'Pending entries',
      v: pendingEntries.length.toString(),
      sub: pendingEntries.length > 0 ? 'Needs review' : 'All clear',
      tone: 'warn',
      icon: <><path d="M12 8v4l3 2" /><circle cx="12" cy="12" r="9" /></>,
    },
    {
      k: 'Live matches',
      v: live.length.toString(),
      sub: live.length > 0 ? `On ${live.length} tables now` : 'None right now',
      tone: 'live',
      icon: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></>,
    },
  ];

  async function handleApprove(entryId) {
    try { await approveEntry(entryId).unwrap(); } catch { /* ignore */ }
  }

  async function handleReject(entryId) {
    try { await rejectEntry(entryId).unwrap(); } catch { /* ignore */ }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display font-extrabold uppercase text-[30px] leading-none">Dashboard</h1>
          <p className="text-ink-500 text-[14px] mt-1.5">{today} · {live.length} tournament{live.length !== 1 ? 's' : ''} live now</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.k} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="seclabel text-muted">{s.k}</div>
              <span className={`w-9 h-9 rounded-md grid place-items-center ${STONE[s.tone]}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">{s.icon}</svg>
              </span>
            </div>
            <div className="font-display font-extrabold text-[38px] leading-none tabular-nums mt-3">{s.v}</div>
            <div className={`text-[11px] ${s.tone === 'warn' && pendingEntries.length > 0 ? 'text-[#9A5B12]' : 'text-ink-500'} mt-2`}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
        {/* Tournaments list */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-divider flex items-center justify-between">
            <span className="seclabel text-felt">Tournaments</span>
            <Link to="/admin/tournaments/new" className="text-[12.5px] font-semibold text-felt">Create new →</Link>
          </div>
          {isLoading ? (
            <div className="p-5 text-center text-muted">Loading...</div>
          ) : tournaments.length > 0 ? (
            tournaments.slice(0, 10).map(t => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-divider last:border-0 hover:bg-card-alt transition">
                <Link to={`/admin/tournaments/${t.id}`} className="min-w-0 flex-1">
                  <div className="font-semibold text-[14px] truncate hover:text-felt transition">{t.name}</div>
                  <div className="text-[11px] text-muted">{t.city || '—'} · {t.max_players || '—'} players</div>
                </Link>
                <StatusBadge status={t.status || 'upcoming'} />
                <div className="flex gap-1.5 shrink-0">
                  <Link to={`/admin/tournaments/${t.id}/entries`} className="btn btn-ghost btn-sm text-[11px]">Entries</Link>
                  <Link to={`/admin/tournaments/${t.id}/draw`} className="btn btn-ghost btn-sm text-[11px]">Draw</Link>
                  <Link to={`/admin/tournaments/${t.id}/matches`} className="btn btn-ghost btn-sm text-[11px]">Matches</Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-ink-500">
              No tournaments yet. <Link to="/admin/tournaments/new" className="text-felt font-semibold">Create one</Link>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div>
            <div className="seclabel text-felt mb-3">Quick actions</div>
            <div className="grid gap-2.5">
              <Link to="/admin/tournaments/new" className="btn btn-primary w-full justify-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                Create tournament
              </Link>
              <Link to="/admin/players" className="btn btn-outline w-full justify-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="3.5" /><path d="M3 21c0-3.5 3-5.5 6-5.5s6 2 6 5.5" /><path d="M17 8a3 3 0 010 6" /></svg>
                Manage players
              </Link>
            </div>
          </div>

          {/* Pending entries */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-divider flex items-center justify-between">
              <span className="seclabel text-felt">Pending entries</span>
              <span className="badge bg-warn-tint text-[#9A5B12] !text-[9px]">{pendingEntries.length} total</span>
            </div>
            {pendingEntries.length > 0 ? (
              <>
                {pendingEntries.slice(0, 5).map(entry => (
                  <div key={entry.id} className="flex items-center gap-3 px-4 py-3 border-b border-divider last:border-0">
                    <PlayerAvatar name={entry.player?.name} photo={entry.player?.photo_path} tier={entry.player?.tier} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[13.5px]">{entry.player?.name || 'Unknown'}</span>
                        <CountryFlagChip code={entry.player?.country_code || 'PAK'} showLabel={false} size="sm" />
                      </div>
                      <div className="text-[11px] text-muted truncate">{entry.tournament?.name || 'Tournament'}</div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleApprove(entry.id)}
                        className="w-8 h-8 rounded-md bg-ok-tint text-ok grid place-items-center hover:brightness-95"
                        title="Approve"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M5 12l5 5L20 6" /></svg>
                      </button>
                      <button
                        onClick={() => handleReject(entry.id)}
                        className="w-8 h-8 rounded-md bg-bad-tint text-bad grid place-items-center hover:brightness-95"
                        title="Reject"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M6 6l12 12M18 6L6 18" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
                {firstActiveId && (
                  <div className="px-4 py-3 bg-card-alt text-center">
                    <Link to={`/admin/tournaments/${firstActiveId}/entries`} className="text-[12.5px] font-semibold text-felt">
                      Open entry queue →
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="p-5 text-center text-muted text-[13px]">No pending entries.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
