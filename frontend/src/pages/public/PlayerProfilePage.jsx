import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as playersApi from '../../api/players';
import PlayerAvatar from '../../components/ui/PlayerAvatar';
import CountryFlagChip from '../../components/ui/CountryFlagChip';
import MatchRow from '../../components/ui/MatchRow';
import EmptyState from '../../components/ui/EmptyState';
import FeltHero from '../../components/ui/FeltHero';

const RESCHIP = {
  win: 'bg-felt text-white',
  live: 'bg-live-fill text-white',
  default: 'bg-ink-100 text-ink-500',
};

export default function PlayerProfilePage() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [history, setHistory] = useState([]);
  const [upcomingMatches, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      playersApi.show(id),
      playersApi.history(id),
      playersApi.upcoming(id),
    ]).then(([p, h, u]) => {
      if (p.status === 'fulfilled') setPlayer(p.value.data.data ?? p.value.data);
      if (h.status === 'fulfilled') setHistory(h.value.data.data ?? h.value.data ?? []);
      if (u.status === 'fulfilled') setUpcoming(u.value.data.data ?? u.value.data ?? []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="max-w-[1200px] mx-auto px-6 py-16 text-center text-muted">Loading...</div>;
  if (!player) return <div className="max-w-[1200px] mx-auto px-6 py-16 text-center text-muted">Player not found.</div>;

  const isPro = player.tier?.toLowerCase() === 'pro' || player.tier?.toLowerCase() === 'professional';

  const stats = [
    { k: 'Ranking points', v: player.ranking_points ? Number(player.ranking_points).toLocaleString() : '—' },
    { k: 'Titles', v: player.titles_count || '—' },
    { k: 'Highest break', v: player.high_break || '—', highlight: true },
    { k: 'Win rate', v: player.win_rate ? `${player.win_rate}%` : '—' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Felt header */}
      <FeltHero gradient="640px 320px at 16% -20%, rgba(11,110,67,.6)" onFelt className="px-4 pt-5 pb-5 sm:px-7 sm:pt-8 sm:pb-7 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
          <div className="flex items-end gap-4">
            <PlayerAvatar name={player.name} photo={player.photo_path} tier={player.tier} size="xl" className="shadow-e3" />
            <div className="pb-0 sm:pb-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`badge ${isPro ? 'bg-felt text-white' : 'bg-white text-ink-800 border border-ink-300'}`}>
                  {player.tier || 'Amateur'}
                </span>
                {player.ranking_position && (
                  <span className="badge bg-brass-tint text-brass-700">Rank #{player.ranking_position}</span>
                )}
              </div>
              <h1 className="font-display font-extrabold uppercase text-heading leading-none tracking-tight text-[24px] sm:text-[38px]">
                {player.name}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-body text-[13px]">
                <CountryFlagChip code={player.country_code || 'PAK'} showLabel={false} />
                <span>{player.city || 'Pakistan'}, {player.country_code || 'PAK'}</span>
              </div>
            </div>
          </div>
      </FeltHero>

      {/* Body */}
      <div className="px-4 py-4 sm:px-7 sm:py-7 grid sm:grid-cols-[1.5fr_1fr] gap-7 items-start">
        {/* Left column */}
        <div className="space-y-6">
          {/* Bio */}
          {player.bio && (
            <div className="card p-6">
              <div className="seclabel text-felt mb-2">Biography</div>
              <p className="text-[15px] text-ink-700 leading-relaxed">{player.bio}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.k} className="card p-4 sm:p-5">
                <div className="seclabel text-muted">{s.k}</div>
                <div className={`font-display font-extrabold text-2xl sm:text-[34px] leading-none tabular-nums mt-1.5 ${s.highlight ? 'text-felt' : ''}`}>
                  {s.v}
                </div>
              </div>
            ))}
          </div>

          {/* Tournament history */}
          <div>
            <div className="seclabel text-felt mb-3">Tournament history</div>
            {history.length > 0 ? (
              <div className="card overflow-hidden">
                {history.slice(0, 8).map(m => (
                  <HistoryRow key={m.id} match={m} playerId={player.id} />
                ))}
              </div>
            ) : (
              <EmptyState title="No match history" message="Past matches will appear here." />
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Upcoming events */}
          <div>
            <div className="seclabel text-felt mb-3">Upcoming events</div>
            {upcomingMatches.length > 0 ? (
              <div className="space-y-3">
                {upcomingMatches.map(m => (
                  <UpcomingEvent key={m.id} match={m} />
                ))}
              </div>
            ) : (
              <EmptyState title="No upcoming matches" message="Matches will appear here when scheduled." />
            )}
          </div>

          {/* Head-to-head - uses match history to compute */}
          {history.length > 0 && <H2HSection history={history} playerId={player.id} />}
        </div>
      </div>
    </div>
  );
}

function HistoryRow({ match: m, playerId }) {
  const isPlayer1 = m.player1?.id === playerId;
  const won = isPlayer1 ? (m.player1_frames > m.player2_frames) : (m.player2_frames > m.player1_frames);
  const eventName = m.tournament?.name || m.round?.tournament?.name || 'Tournament';
  const roundName = m.round?.name || '';
  const isLive = m.status === 'live';
  const chipClass = isLive ? RESCHIP.live : won ? RESCHIP.win : RESCHIP.default;
  const resLabel = isLive ? 'In progress' : won ? 'Won' : roundName || 'Played';

  return (
    <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-divider last:border-0">
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-[14px] truncate">{eventName}</div>
        <div className="text-[11px] text-muted">{roundName}</div>
      </div>
      <span className={`badge ${chipClass}`}>
        {isLive && <span className="dot pulse" />}
        {resLabel}
      </span>
    </div>
  );
}

function UpcomingEvent({ match: m }) {
  const eventName = m.tournament?.name || m.round?.tournament?.name || 'Tournament';
  const venue = m.tournament?.venue || '';
  const slug = m.tournament?.slug || '';
  const dateStr = m.scheduled_at
    ? new Date(m.scheduled_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  const roundName = m.round?.name || '';

  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="w-12 h-12 rounded-md bg-gradient-to-br from-felt-400 to-felt-900 felt-grain shrink-0 grid place-items-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 4v16" /></svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-[14px] truncate">{eventName}</div>
        <div className="text-[11px] text-muted truncate">{[roundName, venue].filter(Boolean).join(' · ') || 'Upcoming'}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[11px] text-ink-500">{dateStr}</div>
        {slug && (
          <Link to={`/tournaments/${slug}`} className="text-[12px] font-semibold text-felt">
            Details →
          </Link>
        )}
      </div>
    </div>
  );
}

function H2HSection({ history, playerId }) {
  // Compute H2H from match history
  const opponents = {};
  history.forEach(m => {
    const isP1 = m.player1?.id === playerId;
    const opp = isP1 ? m.player2 : m.player1;
    if (!opp?.id) return;
    if (!opponents[opp.id]) {
      opponents[opp.id] = { name: opp.name, cc: opp.country_code || 'PAK', w: 0, l: 0 };
    }
    const won = isP1 ? (m.player1_frames > m.player2_frames) : (m.player2_frames > m.player1_frames);
    if (won) opponents[opp.id].w++;
    else opponents[opp.id].l++;
  });

  const h2h = Object.values(opponents).filter(o => (o.w + o.l) > 0).sort((a, b) => (b.w + b.l) - (a.w + a.l)).slice(0, 5);
  if (h2h.length === 0) return null;

  return (
    <div>
      <div className="seclabel text-felt mb-3">Head-to-head</div>
      <div className="card overflow-hidden">
        {h2h.map((o, i) => {
          const total = o.w + o.l;
          const pct = Math.round(o.w / total * 100);
          const lead = o.w > o.l;
          return (
            <div key={i} className="px-4 sm:px-5 py-3 border-b border-divider last:border-0">
              <div className="flex items-center gap-2.5 mb-2">
                <CountryFlagChip code={o.cc} showLabel={false} size="sm" />
                <span className="font-semibold text-[14px]">{o.name}</span>
                <span className={`ml-auto font-display font-bold tabular-nums ${lead ? 'text-felt' : 'text-ink-500'}`}>
                  {o.w}<span className="text-ink-300">–</span>{o.l}
                </span>
              </div>
              <div className="h-2 rounded-full bg-bad-tint overflow-hidden flex">
                <span className="h-full bg-felt" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
