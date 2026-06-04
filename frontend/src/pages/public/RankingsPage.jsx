import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as rankingsApi from '../../api/rankings';
import PlayerAvatar from '../../components/ui/PlayerAvatar';
import CountryFlagChip from '../../components/ui/CountryFlagChip';
import EmptyState from '../../components/ui/EmptyState';

function FormPills({ form }) {
  if (!form?.length) return null;
  return (
    <div className="flex gap-1">
      {form.map((f, i) => (
        <span
          key={i}
          className={`w-5 h-5 rounded-[5px] grid place-items-center text-[10px] font-display font-bold ${
            f === 'W' ? 'bg-ok-tint text-[#0C6B3C]' : 'bg-bad-tint text-[#9A2820]'
          }`}
        >
          {f}
        </span>
      ))}
    </div>
  );
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState('rank');
  const [sortDir, setSortDir] = useState(1);
  const [tierFilter, setTierFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    rankingsApi.list({ per_page: 100 })
      .then(res => setRankings(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d * -1);
    } else {
      setSortKey(key);
      setSortDir(key === 'rank' ? 1 : -1);
    }
  }

  function arrow(key) {
    if (sortKey === key) return <span className="text-felt">{sortDir > 0 ? '▲' : '▼'}</span>;
    return <span className="text-ink-300">↕</span>;
  }

  const filtered = useMemo(() => {
    let data = rankings.map((p, i) => ({ ...p, rank: i + 1 }));

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

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va, vb;
      switch (sortKey) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '') * sortDir;
        case 'played':
          va = a.matches_played || 0;
          vb = b.matches_played || 0;
          return (va - vb) * sortDir;
        case 'points':
          va = Number(a.points || 0);
          vb = Number(b.points || 0);
          return (va - vb) * sortDir;
        case 'form':
          va = (a.recent_form || []).filter(f => f === 'W').length;
          vb = (b.recent_form || []).filter(f => f === 'W').length;
          return (va - vb) * sortDir;
        default: // rank
          return (a.rank - b.rank) * sortDir;
      }
    });
  }, [filtered, sortKey, sortDir]);

  const isDefaultSort = sortKey === 'rank' && sortDir === 1;

  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-9 py-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="seclabel text-felt mb-1.5">Leaderboard</div>
          <h1 className="font-display font-extrabold uppercase text-[2.125rem] leading-none">National Rankings</h1>
          <p className="text-ink-500 text-[14px] mt-2">Official SnookerPK national player rankings.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2.5 mb-5">
        <select className="input w-auto" defaultValue="">
          <option value="">2025–26 Season</option>
        </select>
        <select className="input w-auto" value={tierFilter} onChange={e => setTierFilter(e.target.value)}>
          <option value="">All players</option>
          <option value="pro">Pro only</option>
          <option value="amateur">Amateur only</option>
        </select>
        <div className="relative ml-auto w-64 hidden sm:block">
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
      ) : sorted.length > 0 ? (
        <div className="card overflow-hidden">
          {/* Sortable table */}
          <table className="w-full text-[14px]">
            <thead>
              <tr className="bg-surface2 text-left">
                <th className="px-5 py-3 cursor-pointer select-none seclabel text-ink-500 !text-[10px] w-16" onClick={() => handleSort('rank')}>
                  Rank {arrow('rank')}
                </th>
                <th className="px-5 py-3 cursor-pointer select-none seclabel text-ink-500 !text-[10px]" onClick={() => handleSort('name')}>
                  Player {arrow('name')}
                </th>
                <th className="px-5 py-3 cursor-pointer select-none seclabel text-ink-500 !text-[10px] text-right hidden sm:table-cell" onClick={() => handleSort('played')}>
                  Played {arrow('played')}
                </th>
                <th className="px-5 py-3 cursor-pointer select-none seclabel text-ink-500 !text-[10px] text-right" onClick={() => handleSort('points')}>
                  Points {arrow('points')}
                </th>
                <th className="px-5 py-3 cursor-pointer select-none seclabel text-ink-500 !text-[10px] text-right w-40 hidden md:table-cell" onClick={() => handleSort('form')}>
                  Recent form {arrow('form')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(p => {
                const isTop3 = isDefaultSort && p.rank <= 3;
                const isPro = (p.tier || '').toLowerCase() === 'pro' || (p.tier || '').toLowerCase() === 'professional';
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-hairline last:border-0 hover:bg-surface2 transition ${isTop3 ? 'bg-brass-tint/30' : ''}`}
                  >
                    <td className="px-5 py-3">
                      <span className={`font-display font-extrabold tabular-nums ${
                        p.rank === 1 ? 'text-brass-700' : p.rank <= 3 ? 'text-felt' : 'text-ink-500'
                      }`}>
                        {p.rank}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Link to={`/players/${p.id}`} className="flex items-center gap-2.5">
                        <PlayerAvatar name={p.name} photo={p.photo_path} tier={p.tier} size="sm" />
                        <CountryFlagChip code={p.country_code || 'PAK'} showLabel={false} size="sm" />
                        <span className="font-bold">{p.name}</span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${isPro ? 'bg-felt text-white' : 'bg-ink-100 text-ink-600'}`}>
                          {isPro ? 'Pro' : 'Am'}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-ink-600 hidden sm:table-cell">
                      {p.matches_played || '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="font-display font-bold tabular-nums text-[15px]">
                        {Number(p.points || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <div className="flex justify-end">
                        <FormPills form={p.recent_form} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No rankings yet" message="Rankings will be populated once tournaments conclude." />
      )}
    </div>
  );
}
