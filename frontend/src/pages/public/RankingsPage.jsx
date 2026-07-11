import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGetRankingsQuery } from '../../store/api/rankingsApi';
import EmptyState from '../../components/ui/EmptyState';
import defaultPhoto from '../../assets/default-player.png';

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

/* WST-style rank badge colors — tiers at 1, 8, 16, 32, 64 */
function rankBadgeBg(rank) {
  if (rank === 1) return 'bg-[#111]';
  if (rank <= 8) return 'bg-[#ff80d0]';
  if (rank <= 16) return 'bg-[#3F51FF]';
  if (rank <= 32) return 'bg-[#9B553D]';
  if (rank <= 64) return 'bg-[#5C6B5C]';
  return 'bg-ink-500';
}

const PODIUM_COLORS = {
  1: { ring: 'ring-[#C2A14D]', ordinal: 'text-[#C2A14D]', accent: 'bg-[#C2A14D]' },
  2: { ring: 'ring-[#A8B5C0]', ordinal: 'text-[#A8B5C0]', accent: 'bg-[#A8B5C0]' },
  3: { ring: 'ring-[#B08D57]', ordinal: 'text-[#B08D57]', accent: 'bg-[#B08D57]' },
};

function ordinalSuffix(n) {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

function RankRow({ player, isFirst }) {
  const { first, last } = splitName(player.name);
  const photo = resolvePhoto(player.photo_path);
  const rowH = isFirst ? 'h-[80px]' : 'h-[56px]';

  return (
    <Link
      to={`/players/${player.id}`}
      className="block mb-1 no-underline text-heading"
    >
      <section className={`flex ${rowH} w-full items-center rounded-lg overflow-hidden bg-card border border-border-subtle hover:shadow-e2 transition-shadow`}>
        {/* Rank badge — full-height left strip */}
        <div className={`${rankBadgeBg(player.rank)} shrink-0 w-10 h-full flex items-center justify-center`}>
          <span
            className="font-bold text-white text-xs tabular-nums"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {player.rank}
          </span>
        </div>

        {/* Player photo */}
        <div className={`shrink-0 overflow-hidden ${isFirst ? 'w-[100px] h-[142%] self-end' : 'w-[70px] h-full self-start'}`}>
          <img
            src={photo}
            alt={player.name}
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Name */}
        <div className="min-w-0 flex-1 pl-2">
          <p className="text-[11px] font-bold text-muted leading-none truncate">
            {first || '\u00A0'}
          </p>
          <p
            className="text-sm font-bold tracking-wide uppercase leading-snug truncate"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {last}
          </p>
        </div>

        {/* Points */}
        <span className="shrink-0 pr-4 text-[13px] font-bold text-body tabular-nums">
          {Number(player.ranking_points || 0).toLocaleString()}
        </span>
      </section>
    </Link>
  );
}

function PodiumCard({ player, place }) {
  const colors = PODIUM_COLORS[place];
  const photo = resolvePhoto(player.photo_path);
  const tier = (player.tier || 'Amateur').toLowerCase();
  const tierLabel = tier === 'pro' || tier === 'professional' ? 'Pro' : 'Amateur';
  const isFirst = place === 1;

  const photoSize = isFirst
    ? 'w-20 h-20 sm:w-24 sm:h-24'
    : 'w-16 h-16 sm:w-20 sm:h-20';
  const ordinalSize = isFirst ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl';
  const nameSize = isFirst ? 'text-base sm:text-lg' : 'text-sm sm:text-base';

  return (
    <Link
      to={`/players/${player.id}`}
      className="group relative flex flex-col items-center text-center rounded-2xl bg-card border border-border-subtle p-4 sm:p-6 hover:shadow-e2 transition-shadow no-underline text-heading"
    >
      {/* Ordinal badge */}
      <span
        className={`absolute top-3 right-3 font-extrabold ${ordinalSize} ${colors.ordinal} opacity-30`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {place}<sup className="text-[0.5em]">{ordinalSuffix(place)}</sup>
      </span>

      {/* Photo */}
      <div className={`${photoSize} rounded-full ring-4 ${colors.ring} overflow-hidden mb-3`}>
        <img src={photo} alt={player.name} className="w-full h-full object-cover object-top" />
      </div>

      {/* Name */}
      <h3
        className={`${nameSize} font-extrabold uppercase tracking-wide leading-tight`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {player.name}
      </h3>

      {/* Tier badge */}
      <span className={`mt-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${tierLabel === 'Pro' ? 'bg-felt/10 text-felt' : 'bg-ink-100 text-ink-500'}`}>
        {tierLabel}
      </span>

      {/* Stats row */}
      <div className="flex items-center gap-2 mt-3 text-xs text-muted">
        <span className="font-bold tabular-nums">{Number(player.ranking_points || 0).toLocaleString()} pts</span>
        {player.city && (
          <>
            <span className="w-px h-3 bg-border-subtle" />
            <span className="truncate max-w-[100px]">{player.city}</span>
          </>
        )}
      </div>

      {/* Profile link */}
      <span className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted group-hover:text-felt transition-colors">
        Profile →
      </span>
    </Link>
  );
}

export default function RankingsPage() {
  const { data: rankings = [], isLoading } = useGetRankingsQuery({ per_page: 100 });
  const [tierFilter, setTierFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    // Only players with points, cap at top 64
    let data = rankings
      .filter(p => Number(p.ranking_points || 0) > 0)
      .slice(0, 64)
      .map((p, i) => ({ ...p, rank: i + 1 }));

    if (tierFilter) {
      data = data.filter(p => {
        const t = (p.tier || 'Amateur').toLowerCase();
        if (tierFilter === 'pro') return t === 'pro' || t === 'professional';
        return t === 'amateur' || t === 'am';
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.city || '').toLowerCase().includes(q)
      );
    }

    return data;
  }, [rankings, tierFilter, search]);

  // Podium: only when no filters/search and at least 3 players
  const showPodium = !tierFilter && !search.trim();
  const podiumPlayers = showPodium && filtered.length >= 3 ? filtered.slice(0, 3) : [];
  const listPlayers = podiumPlayers.length === 3 ? filtered.slice(3) : filtered;

  // Split into 3 columns for desktop
  const colSize = Math.ceil(listPlayers.length / 3);
  const col1 = listPlayers.slice(0, colSize);
  const col2 = listPlayers.slice(colSize, colSize * 2);
  const col3 = listPlayers.slice(colSize * 2);

  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-9 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="seclabel text-felt mb-1.5">Leaderboard</div>
        <h1
          className="font-extrabold uppercase text-[2rem] leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          National Rankings
        </h1>
        <p className="text-ink-500 text-[14px] mt-2">Official SnookerPK national player rankings.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
        <select className="input w-auto" defaultValue="">
          <option value="">2025–26 Season</option>
        </select>
        <select className="input w-auto" value={tierFilter} onChange={e => setTierFilter(e.target.value)}>
          <option value="">All players</option>
          <option value="pro">Pro only</option>
          <option value="amateur">Amateur only</option>
        </select>
        <input
          className="input w-64"
          placeholder="Search players..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted">Loading rankings...</div>
      ) : filtered.length > 0 ? (
        <>
          {/* Champions podium */}
          {podiumPlayers.length === 3 && (
            <div className="relative mb-10 overflow-hidden">
              {/* "Champions" watermark */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                aria-hidden="true"
              >
                <span
                  className="text-[4rem] sm:text-[6rem] lg:text-[8rem] font-extrabold uppercase tracking-tight text-heading opacity-[0.03]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Champions
                </span>
              </div>

              {/* Podium grid: 2nd — 1st — 3rd */}
              <div className="relative grid grid-cols-3 gap-3 sm:gap-5 items-end max-w-2xl mx-auto">
                <div className="pt-6 sm:pt-10">
                  <PodiumCard player={podiumPlayers[1]} place={2} />
                </div>
                <div>
                  <PodiumCard player={podiumPlayers[0]} place={1} />
                </div>
                <div className="pt-8 sm:pt-14">
                  <PodiumCard player={podiumPlayers[2]} place={3} />
                </div>
              </div>
            </div>
          )}

          {listPlayers.length > 0 && (
            <>
              {/* Mobile: single column */}
              <div className="lg:hidden">
                {listPlayers.map((p, i) => (
                  <RankRow key={p.id} player={p} isFirst={!showPodium && i === 0} />
                ))}
              </div>

              {/* Desktop: 3-column grid */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-x-4">
                <div>{col1.map((p, i) => <RankRow key={p.id} player={p} isFirst={!showPodium && i === 0} />)}</div>
                <div>{col2.map(p => <RankRow key={p.id} player={p} />)}</div>
                <div>{col3.map(p => <RankRow key={p.id} player={p} />)}</div>
              </div>
            </>
          )}
        </>
      ) : (
        <EmptyState title="No rankings yet" message="Rankings will be populated once tournaments conclude." />
      )}
    </div>
  );
}
