import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGetRankingsQuery, useAdjustRankingMutation } from '../../store/api/rankingsApi';
import Button from '../../components/ui/Button';
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

/* WST-style rank badge colors */
function rankBadgeBg(rank) {
  if (rank === 1) return 'bg-[#111]';
  if (rank <= 8) return 'bg-[#ff80d0]';
  if (rank <= 16) return 'bg-[#3F51FF]';
  if (rank <= 32) return 'bg-[#9B553D]';
  if (rank <= 64) return 'bg-ink-500';
  return 'bg-ink-400';
}

function RankRow({ player, onAdjust }) {
  const { first, last } = splitName(player.name);
  const photo = resolvePhoto(player.photo_path);
  const isFirst = player.rank === 1;
  const rowH = isFirst ? 'h-[80px]' : 'h-[56px]';

  return (
    <div className="mb-1">
      <section className={`flex ${rowH} w-full items-center rounded-lg overflow-hidden bg-card border border-border-subtle hover:shadow-e2 transition-shadow`}>
        <div className={`${rankBadgeBg(player.rank)} shrink-0 w-10 h-full flex items-center justify-center`}>
          <span
            className="font-bold text-white text-xs tabular-nums"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {player.rank}
          </span>
        </div>
        <div className={`shrink-0 overflow-hidden ${isFirst ? 'w-[100px] h-[142%] self-end' : 'w-[70px] h-full self-start'}`}>
          <img src={photo} alt={player.name} className="w-full h-full object-cover object-top" />
        </div>
        <Link to={`/admin/players/${player.id}/edit`} className="min-w-0 flex-1 pl-2 no-underline text-heading hover:text-felt transition-colors">
          <p className="text-[11px] font-bold text-muted leading-none truncate">
            {first || '\u00A0'}
          </p>
          <p
            className="text-sm font-bold tracking-wide uppercase leading-snug truncate"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {last}
          </p>
        </Link>
        <div className="shrink-0 flex items-center gap-2 pr-3">
          <span className="text-[13px] font-bold text-body tabular-nums">
            {Number(player.ranking_points || 0).toLocaleString()}
          </span>
          <button
            onClick={() => onAdjust(player)}
            className="w-7 h-7 rounded-md bg-ink-100 hover:bg-felt hover:text-white text-ink-500 grid place-items-center transition"
            title="Adjust points"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
}

function AdjustModal({ player, onClose, onSaved }) {
  const [adjustRanking] = useAdjustRankingMutation();
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const val = parseInt(points, 10);
    if (!val || !reason.trim()) {
      setError('Points and reason are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await adjustRanking({ player_id: player.id, points: val, reason: reason.trim() }).unwrap();
      onSaved();
    } catch (err) {
      setError(err.data?.message || 'Failed to adjust points.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-card rounded-xl shadow-xl w-full max-w-sm mx-4 p-6"
      >
        <h3 className="font-display font-bold text-lg mb-1">Adjust Ranking Points</h3>
        <p className="text-sm text-ink-500 mb-4">{player.name}</p>

        <label className="lbl">Points (+/−)</label>
        <input
          type="number"
          className="input mb-3"
          placeholder="e.g. 200 or -100"
          value={points}
          onChange={e => setPoints(e.target.value)}
          autoFocus
        />

        <label className="lbl">Reason</label>
        <input
          type="text"
          className="input mb-4"
          placeholder="e.g. Tournament win bonus"
          value={reason}
          onChange={e => setReason(e.target.value)}
          maxLength={500}
        />

        {error && <p className="text-[13px] text-bad mb-3">{error}</p>}

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? 'Saving...' : 'Apply'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ManageRankingsPage() {
  const { data: rankings = [], isLoading } = useGetRankingsQuery({ per_page: 100 });
  const [search, setSearch] = useState('');
  const [adjustPlayer, setAdjustPlayer] = useState(null);

  const filtered = useMemo(() => {
    let data = rankings
      .filter(p => Number(p.ranking_points || 0) > 0)
      .slice(0, 64)
      .map((p, i) => ({ ...p, rank: i + 1 }));

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.city || '').toLowerCase().includes(q)
      );
    }
    return data;
  }, [rankings, search]);

  const colSize = Math.ceil(filtered.length / 3);
  const col1 = filtered.slice(0, colSize);
  const col2 = filtered.slice(colSize, colSize * 2);
  const col3 = filtered.slice(colSize * 2);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="seclabel text-felt mb-1.5">Admin</div>
          <h1 className="font-display font-bold text-[1.5rem]">Rankings</h1>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input className="input max-w-[260px] flex-1" placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)} />
        <p className="text-[13px] text-muted">Click the edit icon to adjust a player's ranking points.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted">Loading...</div>
      ) : filtered.length > 0 ? (
        <>
          <div className="lg:hidden">
            {filtered.map(p => <RankRow key={p.id} player={p} onAdjust={setAdjustPlayer} />)}
          </div>
          <div className="hidden lg:grid lg:grid-cols-3 gap-x-4">
            <div>{col1.map(p => <RankRow key={p.id} player={p} onAdjust={setAdjustPlayer} />)}</div>
            <div>{col2.map(p => <RankRow key={p.id} player={p} onAdjust={setAdjustPlayer} />)}</div>
            <div>{col3.map(p => <RankRow key={p.id} player={p} onAdjust={setAdjustPlayer} />)}</div>
          </div>
        </>
      ) : (
        <div className="py-12 text-center text-muted">No players found.</div>
      )}

      {adjustPlayer && (
        <AdjustModal
          player={adjustPlayer}
          onClose={() => setAdjustPlayer(null)}
          onSaved={() => setAdjustPlayer(null)}
        />
      )}
    </div>
  );
}
