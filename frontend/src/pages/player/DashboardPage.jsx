import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as entriesApi from '../../api/entries';
import * as playersApi from '../../api/players';
import PlayerAvatar from '../../components/ui/PlayerAvatar';
import CountryFlagChip from '../../components/ui/CountryFlagChip';
import EmptyState from '../../components/ui/EmptyState';

const REQCHIP = {
  approved: 'bg-ok-tint text-[#0C6B3C]',
  pending: 'bg-warn-tint text-[#9A5B12]',
  rejected: 'bg-bad-tint text-[#9A2820]',
};

const SEEDCHIP = {
  live: 'bg-live-fill text-white',
  approved: 'bg-ok-tint text-[#0C6B3C]',
  pending: 'bg-warn-tint text-[#9A5B12]',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [upcomingMatches, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const playerId = user?.player?.id;
    Promise.allSettled([
      entriesApi.mine(),
      playerId ? playersApi.upcoming(playerId) : Promise.resolve({ data: { data: [] } }),
      playerId ? playersApi.history(playerId) : Promise.resolve({ data: { data: [] } }),
    ]).then(([e, u, h]) => {
      if (e.status === 'fulfilled') setEntries(e.value.data.data ?? e.value.data ?? []);
      if (u.status === 'fulfilled') setUpcoming(u.value.data.data ?? u.value.data ?? []);
      if (h.status === 'fulfilled') setHistory(h.value.data.data ?? h.value.data ?? []);
      setLoading(false);
    });
  }, [user]);

  const player = user?.player;
  const seedings = entries.filter(e => e.seed && e.status === 'approved');
  const requests = entries;

  if (loading) {
    return <div className="max-w-[1200px] mx-auto px-6 py-16 text-center text-ink-400">Loading...</div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Greeting hero */}
      <header className="relative overflow-hidden bg-night felt-grain on-felt">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(600px 300px at 14% -30%, rgba(11,110,67,.6), transparent 60%)' }} />
        <div className="relative px-4 py-5 sm:px-7 sm:py-7 flex items-center gap-4">
          <PlayerAvatar name={user?.name} photo={player?.photo_path} tier={player?.tier} size="lg" />
          <div>
            <div className="seclabel text-ink-400">Welcome back</div>
            <h1 className="font-display font-extrabold uppercase text-white leading-none tracking-tight text-[24px] sm:text-[32px]">
              {user?.name || 'Player'}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-[12.5px] text-ink-300">
              <CountryFlagChip code={player?.country_code || 'PAK'} showLabel={false} size="sm" />
              {player?.tier && (
                <span className="badge bg-felt text-white !text-[9px]">{player.tier}</span>
              )}
              {player?.ranking_position && (
                <span className="badge bg-brass-tint text-brass-700 !text-[9px]">Rank #{player.ranking_position}</span>
              )}
            </div>
          </div>
          <div className="ml-auto hidden sm:flex gap-2.5">
            <Link to="/profile/edit" className="btn btn-onfelt">Edit profile</Link>
            <Link to="/tournaments" className="btn btn-brass">Find tournaments</Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="px-4 py-4 sm:px-7 sm:py-7 grid sm:grid-cols-[1.4fr_1fr] gap-7 items-start">
        {/* Left column */}
        <div className="space-y-6">
          {/* Upcoming matches */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="seclabel text-felt">My upcoming matches</div>
              <span className="text-caption text-ink-400">{upcomingMatches.length}</span>
            </div>
            {upcomingMatches.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {upcomingMatches.slice(0, 4).map((m, i) => (
                  <UpcomingCard key={m.id} match={m} isNext={i === 0} playerId={player?.id} />
                ))}
              </div>
            ) : (
              <div className="card p-5 text-center text-ink-500 text-[14px]">No upcoming matches.</div>
            )}
          </div>

          {/* Recent results */}
          <div>
            <div className="seclabel text-felt mb-3">Recent results</div>
            {history.length > 0 ? (
              <div className="card overflow-hidden">
                {history.slice(0, 5).map(m => (
                  <RecentRow key={m.id} match={m} playerId={player?.id} />
                ))}
              </div>
            ) : (
              <EmptyState title="No match history" message="Your match results will appear here." />
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Current seedings */}
          <div>
            <div className="seclabel text-felt mb-3">My current seedings</div>
            {seedings.length > 0 ? (
              <div className="card overflow-hidden">
                {seedings.map(entry => (
                  <SeedRow key={entry.id} entry={entry} />
                ))}
              </div>
            ) : (
              <div className="card p-5 text-center text-ink-500 text-[14px]">No current seedings.</div>
            )}
          </div>

          {/* Entry requests */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="seclabel text-felt">My entry requests</div>
              <Link to="/tournaments" className="text-[12px] font-semibold text-felt">All →</Link>
            </div>
            {requests.length > 0 ? (
              <div className="card overflow-hidden">
                {requests.map(entry => (
                  <RequestRow key={entry.id} entry={entry} />
                ))}
              </div>
            ) : (
              <EmptyState title="No entries yet" message="Browse tournaments and request entry." action={<Link to="/tournaments" className="btn btn-primary btn-sm">Browse tournaments</Link>} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UpcomingCard({ match: m, isNext, playerId }) {
  const isPlayer1 = m.player1?.id === playerId;
  const opponent = isPlayer1 ? m.player2 : m.player1;
  const eventName = m.tournament?.name || m.round?.tournament?.name || '';
  const roundName = m.round?.name || '';
  const when = m.scheduled_at
    ? new Date(m.scheduled_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) + ' · ' + new Date(m.scheduled_at).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
    : '';
  const table = m.table_no ? `Table ${m.table_no}` : '';

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="min-w-0">
          <div className="seclabel text-ink-400 !text-[10px] truncate">{eventName}</div>
          <div className="font-display font-bold text-[15px]">{roundName || 'Match'}</div>
        </div>
        {isNext ? (
          <span className="badge bg-live-fill text-white"><span className="dot pulse" />Up next</span>
        ) : (
          <span className="badge bg-brass-tint text-brass-700"><span className="dot" />Scheduled</span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-1">
        <div className="flex items-center gap-2">
          <PlayerAvatar name={isPlayer1 ? m.player1?.name : m.player2?.name} photo={isPlayer1 ? m.player1?.photo_path : m.player2?.photo_path} size="sm" />
          <span className="font-bold text-[14px]">{isPlayer1 ? m.player1?.name : (m.player2?.name || 'You')}</span>
          <span className="badge bg-felt text-white !text-[9px]">You</span>
        </div>
        <span className="ml-auto text-ink-300 font-display font-bold text-sm">vs</span>
      </div>
      <div className="flex items-center gap-2 mb-3 pl-10">
        {opponent ? (
          <>
            <CountryFlagChip code={opponent.country_code || 'PAK'} showLabel={false} size="sm" />
            <span className="text-[14px] text-ink-700">{opponent.name}</span>
          </>
        ) : (
          <span className="text-[14px] text-ink-300 italic">TBD</span>
        )}
      </div>
      {(when || table) && (
        <div className="flex items-center justify-between pt-3 border-t border-hairline text-[11px] text-ink-500">
          <span>{[when, table].filter(Boolean).join(' · ')}</span>
          <Link to={`/tournaments/${m.tournament?.slug || ''}`} className="text-[12px] font-semibold text-felt">View draw →</Link>
        </div>
      )}
    </div>
  );
}

function RecentRow({ match: m, playerId }) {
  const isPlayer1 = m.player1?.id === playerId;
  const won = isPlayer1 ? (m.player1_frames > m.player2_frames) : (m.player2_frames > m.player1_frames);
  const opponent = isPlayer1 ? m.player2 : m.player1;
  const myFrames = isPlayer1 ? m.player1_frames : m.player2_frames;
  const oppFrames = isPlayer1 ? m.player2_frames : m.player1_frames;
  const eventName = m.tournament?.name || m.round?.tournament?.name || '';
  const roundName = m.round?.name || '';

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-hairline last:border-0">
      <span className={`w-9 h-9 rounded-full grid place-items-center font-display font-bold text-xs shrink-0 ${won ? 'bg-ok-tint text-[#0C6B3C]' : 'bg-bad-tint text-[#9A2820]'}`}>
        {won ? 'W' : 'L'}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-semibold">vs {opponent?.name || 'Unknown'}</span>
          {opponent?.country_code && <CountryFlagChip code={opponent.country_code} showLabel={false} size="sm" />}
        </div>
        <div className="text-[11px] text-ink-400">{[eventName, roundName].filter(Boolean).join(' · ')}</div>
      </div>
      <div className={`font-display font-bold tabular-nums text-[16px] ${won ? 'text-felt' : 'text-ink-500'}`}>
        {myFrames ?? 0}<span className="text-ink-300 font-medium">–</span>{oppFrames ?? 0}
      </div>
    </div>
  );
}

function SeedRow({ entry }) {
  const tournamentName = entry.tournament?.name || 'Tournament';
  const tournamentStatus = entry.tournament?.status;
  const chipKey = tournamentStatus === 'live' ? 'live' : entry.status;
  const chipClass = SEEDCHIP[chipKey] || SEEDCHIP.approved;
  const stateLabel = tournamentStatus === 'live' ? 'In progress' : 'Entry approved';

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-hairline last:border-0">
      <span className="w-9 h-9 rounded-md bg-night grid place-items-center font-display font-extrabold text-white text-sm shrink-0">
        {entry.seed}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold truncate">{tournamentName}</div>
        <div className="text-[11px] text-ink-400">Seed {entry.seed}</div>
      </div>
      <span className={`badge ${chipClass} !text-[10px]`}>
        {tournamentStatus === 'live' && <span className="dot pulse" />}
        {stateLabel}
      </span>
    </div>
  );
}

function RequestRow({ entry }) {
  const tournamentName = entry.tournament?.name || 'Tournament';
  const chipClass = REQCHIP[entry.status] || REQCHIP.pending;
  const dateStr = entry.created_at
    ? 'Requested ' + new Date(entry.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })
    : '';

  return (
    <div className="px-4 py-3 border-b border-hairline last:border-0">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold truncate">{tournamentName}</div>
          <div className="text-[11px] text-ink-400">{dateStr}</div>
        </div>
        <span className={`badge ${chipClass}`}>
          <span className={`dot ${entry.status === 'pending' ? 'pulse' : ''}`} />
          {entry.status?.charAt(0).toUpperCase() + entry.status?.slice(1)}
        </span>
      </div>
      {entry.status === 'rejected' && entry.rejection_reason && (
        <div className="text-[11px] text-bad mt-1.5">{entry.rejection_reason}</div>
      )}
    </div>
  );
}
