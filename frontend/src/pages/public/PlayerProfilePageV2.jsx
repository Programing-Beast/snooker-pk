import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as playersApi from '../../api/players';
import CountryFlagChip from '../../components/ui/CountryFlagChip';
import EmptyState from '../../components/ui/EmptyState';
import defaultPhoto from '../../assets/default-player.png';
import playerHeroBg from '../../assets/player-hero-bg.png';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || '/storage';

function resolvePhoto(photo) {
  if (!photo) return defaultPhoto;
  if (photo.startsWith('http') || photo.startsWith('/')) return photo;
  return `${STORAGE_URL}/${photo}`;
}

function splitName(name) {
  if (!name) return { first: '', last: 'TBD' };
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { first: '', last: parts[0] };
  return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
}

function StatItem({ label, value }) {
  return (
    <div>
      <div className="text-xs text-ink-400 uppercase font-semibold tracking-wide mb-1">{label}</div>
      <div
        className="text-3xl font-extrabold tabular-nums"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {value}
      </div>
    </div>
  );
}

function WinRateDonut({ winRate, wins, matchesPlayed }) {
  const rate = Number(winRate) || 0;
  const circumference = Math.PI * 2 * 15.9155;
  const dashArray = `${(rate / 100) * circumference} ${circumference}`;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 36 36" className="w-40 h-40 sm:w-48 sm:h-48">
        {/* Background circle */}
        <circle
          cx="18" cy="18" r="15.9155"
          fill="none"
          stroke="currentColor"
          className="text-ink-200"
          strokeWidth="2.5"
        />
        {/* Colored arc */}
        <circle
          cx="18" cy="18" r="15.9155"
          fill="none"
          className="stroke-felt"
          strokeWidth="2.5"
          strokeDasharray={dashArray}
          strokeDashoffset="0"
          strokeLinecap="round"
          transform="rotate(-90 18 18)"
        />
        {/* Center text */}
        <text
          x="18" y="16.5"
          textAnchor="middle"
          className="fill-ink-900 text-[6px] font-extrabold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {rate}%
        </text>
        <text
          x="18" y="20"
          textAnchor="middle"
          className="fill-ink-400 text-[2.5px] font-semibold uppercase"
        >
          Wins / Matches
        </text>
        <text
          x="18" y="23"
          textAnchor="middle"
          className="fill-ink-600 text-[3px] font-bold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {wins ?? '–'} / {matchesPlayed ?? '–'}
        </text>
      </svg>
    </div>
  );
}

export default function PlayerProfilePageV2() {
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

  if (loading) {
    return <div className="max-w-[1200px] mx-auto px-6 py-16 text-center text-ink-400">Loading...</div>;
  }
  if (!player) {
    return <div className="max-w-[1200px] mx-auto px-6 py-16 text-center text-ink-400">Player not found.</div>;
  }

  const { first, last } = splitName(player.name);
  const photo = resolvePhoto(player.photo_path);
  const isPro = player.tier?.toLowerCase() === 'pro' || player.tier?.toLowerCase() === 'professional';
  const turnedProYear = player.date_turned_pro
    ? new Date(player.date_turned_pro).getFullYear()
    : null;

  return (
    <div>
      {/* ─── Section 1: Hero Banner ─── */}
      <section
        className="bg-night relative overflow-hidden"
        style={{ backgroundImage: `url(${playerHeroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="max-w-[1200px] mx-auto px-6 sm:px-9 py-12 sm:py-16 flex justify-center relative z-10">
          <div className="w-48 h-60 sm:w-64 sm:h-80 rounded-2xl overflow-hidden shadow-e3">
            <img
              src={photo}
              alt={player.name || 'Player'}
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* ─── Section 2: Player Name + Info Card ─── */}
      <section className="bg-page">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-9 py-10 sm:py-12">
          {/* Name block */}
          <div className="text-center mb-8">
            <p className="text-sm uppercase text-ink-400 font-bold tracking-wide">
              {first || '\u00A0'}
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase leading-none"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {last}
            </h1>
            <div className="mt-2 flex justify-center">
              <span className={`badge ${isPro ? 'bg-felt text-white' : 'bg-white text-ink-800 border border-ink-300'}`}>
                {player.tier || 'Amateur'}
              </span>
            </div>
          </div>

          {/* Info card */}
          <div className="border border-hairline rounded-xl bg-white p-6 sm:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {/* Nationality */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-400">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span className="text-xs text-ink-400 uppercase font-semibold tracking-wide">Nationality</span>
                </div>
                <div className="text-sm font-bold">
                  <CountryFlagChip code={player.country_code || 'PAK'} />
                </div>
              </div>

              {/* City */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-400">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-xs text-ink-400 uppercase font-semibold tracking-wide">City</span>
                </div>
                <div className="text-sm font-bold">{player.city || '–'}</div>
              </div>

              {/* Turned Pro */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-400">
                    <path d="M6 9l6-6 6 6M6 9l6 6 6-6" />
                    <path d="M6 15v4h12v-4" />
                  </svg>
                  <span className="text-xs text-ink-400 uppercase font-semibold tracking-wide">Turned Pro</span>
                </div>
                <div className="text-sm font-bold">{turnedProYear || '–'}</div>
              </div>

              {/* Current Ranking */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-400">
                    <path d="M18 20V10M12 20V4M6 20v-6" />
                  </svg>
                  <span className="text-xs text-ink-400 uppercase font-semibold tracking-wide">Current Ranking</span>
                </div>
                <div className="text-sm font-bold">
                  {player.ranking_points ? Number(player.ranking_points).toLocaleString() + ' pts' : '–'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 3: Career Stats ─── */}
      <section className="border-t border-hairline">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-9 py-10 sm:py-12">
          <h2
            className="text-2xl sm:text-3xl font-extrabold uppercase mb-8"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Career Stats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <StatItem label="Titles" value={player.titles_count || '–'} />
            <StatItem label="Matches Played" value={player.matches_played || '–'} />
            <StatItem label="Win Rate" value={player.win_rate ? player.win_rate + '%' : '–'} />
            <StatItem label="Highest Break" value={player.high_break || '–'} />
          </div>
        </div>
      </section>

      {/* ─── Section 4: Season Stats ─── */}
      <section className="border-t border-hairline">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-9 py-10 sm:py-12">
          <h2
            className="text-2xl sm:text-3xl font-extrabold uppercase mb-8"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Season Stats
          </h2>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            {/* Donut chart */}
            <div className="shrink-0 mx-auto lg:mx-0">
              <WinRateDonut
                winRate={player.win_rate}
                wins={player.wins}
                matchesPlayed={player.matches_played}
              />
            </div>

            {/* Stats grid */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 mb-8">
                <StatItem label="Matches Played" value={player.matches_played || '–'} />
                <StatItem label="Wins" value={player.wins || '–'} />
                <StatItem label="Points Scored" value="–" />
                <StatItem label="Breaks 50+" value="–" />
                <StatItem label="Breaks 100+" value="–" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
                <StatItem label="Highest Break" value={player.high_break || '–'} />
                <StatItem label="147s" value="–" />
                <StatItem label="Average Break" value="–" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 5: Tournament History ─── */}
      <section className="border-t border-hairline">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-9 py-10 sm:py-12">
          <h2
            className="text-2xl sm:text-3xl font-extrabold uppercase mb-8"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Tournament History
          </h2>
          {history.length > 0 ? (
            <div className="border border-hairline rounded-xl bg-white overflow-hidden">
              {history.slice(0, 8).map(m => {
                const isPlayer1 = m.player1?.id === player.id;
                const won = isPlayer1 ? (m.player1_frames > m.player2_frames) : (m.player2_frames > m.player1_frames);
                const eventName = m.tournament?.name || m.round?.tournament?.name || 'Tournament';
                const roundName = m.round?.name || '';
                const isLive = m.status === 'live';

                return (
                  <div key={m.id} className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-hairline last:border-0">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-[14px] truncate">{eventName}</div>
                      <div className="text-[11px] text-ink-400">{roundName}</div>
                    </div>
                    <span className={`badge ${isLive ? 'bg-live-fill text-white' : won ? 'bg-felt text-white' : 'bg-ink-100 text-ink-500'}`}>
                      {isLive && <span className="dot pulse" />}
                      {isLive ? 'In progress' : won ? 'Won' : roundName || 'Played'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No match history" message="Past matches will appear here." />
          )}
        </div>
      </section>

      {/* ─── Section 6: Upcoming Events ─── */}
      <section className="border-t border-hairline">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-9 py-10 sm:py-12">
          <h2
            className="text-2xl sm:text-3xl font-extrabold uppercase mb-8"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Upcoming Events
          </h2>
          {upcomingMatches.length > 0 ? (
            <div className="space-y-3">
              {upcomingMatches.map(m => {
                const eventName = m.tournament?.name || m.round?.tournament?.name || 'Tournament';
                const venue = m.tournament?.venue || '';
                const slug = m.tournament?.slug || '';
                const dateStr = m.scheduled_at
                  ? new Date(m.scheduled_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '';
                const roundName = m.round?.name || '';

                return (
                  <div key={m.id} className="border border-hairline rounded-xl bg-white p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-gradient-to-br from-felt-400 to-felt-900 felt-grain shrink-0 grid place-items-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 4v16" /></svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-[14px] truncate">{eventName}</div>
                      <div className="text-[11px] text-ink-400 truncate">{[roundName, venue].filter(Boolean).join(' · ') || 'Upcoming'}</div>
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
              })}
            </div>
          ) : (
            <EmptyState title="No upcoming matches" message="Matches will appear here when scheduled." />
          )}
        </div>
      </section>

      {/* ─── Section 7: Head-to-Head ─── */}
      {(() => {
        const opponents = {};
        history.forEach(m => {
          const isP1 = m.player1?.id === player.id;
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
          <section className="border-t border-hairline">
            <div className="max-w-[1200px] mx-auto px-6 sm:px-9 py-10 sm:py-12">
              <h2
                className="text-2xl sm:text-3xl font-extrabold uppercase mb-8"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Head To Head
              </h2>
              <div className="border border-hairline rounded-xl bg-white overflow-hidden">
                {h2h.map((o, i) => {
                  const total = o.w + o.l;
                  const pct = Math.round(o.w / total * 100);
                  const lead = o.w > o.l;
                  return (
                    <div key={i} className="px-4 sm:px-5 py-3 border-b border-hairline last:border-0">
                      <div className="flex items-center gap-2.5 mb-2">
                        <CountryFlagChip code={o.cc} showLabel={false} size="sm" />
                        <span className="font-semibold text-[14px]">{o.name}</span>
                        <span className={`ml-auto font-bold tabular-nums ${lead ? 'text-felt' : 'text-ink-500'}`} style={{ fontFamily: 'var(--font-display)' }}>
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
          </section>
        );
      })()}

      {/* ─── Section 8: Bio ─── */}
      <section className="bg-night">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-9 py-10 sm:py-12">
          <h2
            className="text-2xl sm:text-3xl font-extrabold uppercase text-white mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Bio
          </h2>
          <p className="text-ink-300 leading-relaxed">
            {player.bio || 'No bio available.'}
          </p>
        </div>
      </section>
    </div>
  );
}
