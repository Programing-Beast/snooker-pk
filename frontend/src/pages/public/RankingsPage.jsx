import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as rankingsApi from '../../api/rankings';
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

function RankRow({ player, isFirst }) {
  const { first, last } = splitName(player.name);
  const photo = resolvePhoto(player.photo_path);
  const rowH = isFirst ? 'h-[80px]' : 'h-[56px]';

  return (
    <Link
      to={`/players/${player.id}`}
      className="block mb-1 no-underline text-ink-900"
    >
      <section className={`flex ${rowH} w-full items-center rounded-lg overflow-hidden bg-white border border-hairline hover:shadow-e2 transition-shadow`}>
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
          <p className="text-[11px] font-bold text-ink-400 leading-none truncate">
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
        <span className="shrink-0 pr-4 text-[13px] font-bold text-ink-800 tabular-nums">
          {Number(player.ranking_points || 0).toLocaleString()}
        </span>
      </section>
    </Link>
  );
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    rankingsApi.list({ per_page: 100 })
      .then(res => setRankings(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  // Split into 3 columns for desktop
  const colSize = Math.ceil(filtered.length / 3);
  const col1 = filtered.slice(0, colSize);
  const col2 = filtered.slice(colSize, colSize * 2);
  const col3 = filtered.slice(colSize * 2);

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
        <div className="relative w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            className="input pl-9"
            placeholder="Search players..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-ink-400">Loading rankings...</div>
      ) : filtered.length > 0 ? (
        <>
          {/* Mobile: single column */}
          <div className="lg:hidden">
            {filtered.map((p, i) => <RankRow key={p.id} player={p} isFirst={i === 0} />)}
          </div>

          {/* Desktop: 3-column grid */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-x-4">
            <div>{col1.map((p, i) => <RankRow key={p.id} player={p} isFirst={i === 0} />)}</div>
            <div>{col2.map(p => <RankRow key={p.id} player={p} />)}</div>
            <div>{col3.map(p => <RankRow key={p.id} player={p} />)}</div>
          </div>
        </>
      ) : (
        <EmptyState title="No rankings yet" message="Rankings will be populated once tournaments conclude." />
      )}
    </div>
  );
}
