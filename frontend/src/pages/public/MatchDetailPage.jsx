import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetMatchQuery } from '../../store/api/matchesApi';
import CountryFlagChip from '../../components/ui/CountryFlagChip';
import MatchResultHero from '../../components/ui/MatchResultHero';
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

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function statusLabel(status) {
  if (status === 'completed') return 'Match Complete';
  if (status === 'live') return 'Live';
  if (status === 'scheduled') return 'Scheduled';
  return status?.charAt(0).toUpperCase() + status?.slice(1);
}

/* ── Compute match stats ── */
function computeStats(match) {
  const m = match;
  const frames = m.frames || [];
  const p1Id = m.player1?.id;
  const p2Id = m.player2?.id;

  const allBreaks = frames.flatMap(f => f.breaks || []);
  const p1Breaks = allBreaks.filter(b => b.player_id === p1Id && !b.is_foul_turn);
  const p2Breaks = allBreaks.filter(b => b.player_id === p2Id && !b.is_foul_turn);

  const totalP1 = frames.reduce((s, f) => s + (f.score1 || 0), 0);
  const totalP2 = frames.reduce((s, f) => s + (f.score2 || 0), 0);

  const breaks50p1 = p1Breaks.filter(b => b.points >= 50).length;
  const breaks50p2 = p2Breaks.filter(b => b.points >= 50).length;
  const breaks100p1 = p1Breaks.filter(b => b.points >= 100).length;
  const breaks100p2 = p2Breaks.filter(b => b.points >= 100).length;

  const highP1 = p1Breaks.length ? Math.max(...p1Breaks.map(b => b.points)) : 0;
  const highP2 = p2Breaks.length ? Math.max(...p2Breaks.map(b => b.points)) : 0;

  const posP1 = p1Breaks.filter(b => b.points > 0);
  const posP2 = p2Breaks.filter(b => b.points > 0);
  const avgP1 = posP1.length ? Math.round(posP1.reduce((s, b) => s + b.points, 0) / posP1.length) : null;
  const avgP2 = posP2.length ? Math.round(posP2.reduce((s, b) => s + b.points, 0) / posP2.length) : null;

  return [
    { label: 'Total Match Points', p1: totalP1, p2: totalP2 },
    { label: '50+ Breaks', p1: breaks50p1, p2: breaks50p2 },
    { label: '100+ Breaks', p1: breaks100p1, p2: breaks100p2 },
    { label: 'Highest Break', p1: highP1 || '–', p2: highP2 || '–' },
    { label: 'Average Break', p1: avgP1 ?? '–', p2: avgP2 ?? '–' },
    { label: 'Average Shot Time', p1: '–', p2: '–' },
    { label: 'Pot Rate', p1: '–', p2: '–' },
    { label: 'Shots Taken', p1: '–', p2: '–' },
    { label: 'Time On Table', p1: '–', p2: '–' },
  ];
}

/* ── Small player photo for tab sections ── */
function SmallPhoto({ player, isWinner }) {
  const src = resolvePhoto(player?.photo_path);
  const border = isWinner
    ? 'border-2 border-brass shadow-[0_0_20px_rgba(194,161,77,0.3)]'
    : 'border-2 border-ink-700';
  return (
    <div className={`w-16 h-20 rounded-xl overflow-hidden bg-panel ${border}`}>
      <img src={src} alt={player?.name || 'Player'} className="h-full w-full object-cover object-top" />
    </div>
  );
}

/* ── Player photos row (used in both tabs) ── */
function PlayerPhotosRow({ match }) {
  const winnerId = match.winner?.id;
  return (
    <div className="flex items-center justify-center gap-8 py-6">
      <SmallPhoto player={match.player1} isWinner={match.player1?.id === winnerId} />
      <SmallPhoto player={match.player2} isWinner={match.player2?.id === winnerId} />
    </div>
  );
}

/* ── Frames tab content ── */
function FramesTab({ match }) {
  const m = match;
  const frames = m.frames || [];
  const p1Id = m.player1?.id;
  const p2Id = m.player2?.id;

  function getBreaks50(frame, playerId) {
    const hits = (frame.breaks || []).filter(
      b => b.player_id === playerId && b.points >= 50 && !b.is_foul_turn
    );
    return hits.length ? hits.map(b => b.points).join(', ') : '–';
  }

  return (
    <div>
      <PlayerPhotosRow match={m} />

      {/* Frame table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-ink-400 uppercase tracking-wide">
              <th className="py-2 px-3 text-right font-medium">Break 50+</th>
              <th className="py-2 px-3 text-right font-medium">Points</th>
              <th className="py-2 px-3 text-center font-medium">Frame</th>
              <th className="py-2 px-3 text-left font-medium">Points</th>
              <th className="py-2 px-3 text-left font-medium">Break 50+</th>
            </tr>
          </thead>
          <tbody>
            {frames.map(frame => {
              const p1Won = frame.winner_id === p1Id;
              const p2Won = frame.winner_id === p2Id;
              return (
                <tr key={frame.id} className="border-b border-hairline-d">
                  <td className="py-3 px-3 text-right text-sm text-ink-400 tabular-nums">
                    {getBreaks50(frame, p1Id)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`inline-block tabular-nums text-sm font-bold ${
                      p1Won ? 'bg-brass/20 text-brass rounded px-2 py-1' : 'text-white'
                    }`}>
                      {frame.score1 ?? 0}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-sm text-ink-400 tabular-nums">
                    {frame.frame_no}
                  </td>
                  <td className="py-3 px-3 text-left">
                    <span className={`inline-block tabular-nums text-sm font-bold ${
                      p2Won ? 'bg-brass/20 text-brass rounded px-2 py-1' : 'text-white'
                    }`}>
                      {frame.score2 ?? 0}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-left text-sm text-ink-400 tabular-nums">
                    {getBreaks50(frame, p2Id)}
                  </td>
                </tr>
              );
            })}
            {frames.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-ink-400">
                  No frame data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Match tab content ── */
function MatchTab({ match }) {
  const stats = computeStats(match);

  return (
    <div>
      <PlayerPhotosRow match={match} />

      <div>
        {stats.map((row, i) => (
          <div key={i} className="flex items-center py-3 border-b border-hairline-d">
            <span className="w-1/4 text-right text-lg font-display font-bold text-white tabular-nums">
              {row.p1}
            </span>
            <span className="flex-1 text-sm text-ink-400 text-center">
              {row.label}
            </span>
            <span className="w-1/4 text-left text-lg font-display font-bold text-white tabular-nums">
              {row.p2}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function MatchDetailPage() {
  const { id } = useParams();
  const { data: match, isLoading } = useGetMatchQuery(id);
  const [tab, setTab] = useState('frames');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-night flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-felt border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-night flex items-center justify-center">
        <p className="text-ink-400">Match not found.</p>
      </div>
    );
  }

  const m = match;
  const winnerId = m.winner?.id;
  const p1Name = splitName(m.player1?.name);
  const p2Name = splitName(m.player2?.name);
  const p1Photo = resolvePhoto(m.player1?.photo_path);
  const p2Photo = resolvePhoto(m.player2?.photo_path);
  const p1Won = m.player1?.id === winnerId;
  const p2Won = m.player2?.id === winnerId;

  const dateStr = formatDate(m.scheduled_at);
  const timeStr = formatTime(m.scheduled_at);
  const venue = [m.tournament?.venue, m.tournament?.city].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-night text-white">
      {/* Meta bar */}
      <div className="bg-panel">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between text-xs text-ink-400">
          <span>{[dateStr, timeStr].filter(Boolean).join(' \u00b7 ')}</span>
          <span>{[venue, m.round?.name].filter(Boolean).join(' \u00b7 ')}</span>
          <span>{m.position ? `Match No: ${m.position}` : ''}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tournament name */}
        <div className="text-center mb-6">
          <p className="text-felt text-xs uppercase tracking-wide font-semibold mb-1">SnookerPK</p>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white uppercase">
            {m.tournament?.name || 'Match Details'}
          </h1>
        </div>

        {/* Match status badge */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <span className="border border-ink-400 text-ink-300 text-xs uppercase tracking-widest px-4 py-1 rounded-full font-display font-semibold">
            {statusLabel(m.status)}
          </span>
          {(m.youtube_url || m.facebook_url) && (
            <div className="flex items-center gap-2">
              {m.youtube_url && (
                <a href={m.youtube_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF0000]/10 text-[#FF4444] hover:bg-[#FF0000]/20 transition text-xs font-semibold">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81ZM10 15V9l5.2 3L10 15Z" />
                  </svg>
                  YouTube
                </a>
              )}
              {m.facebook_url && (
                <a href={m.facebook_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1877F2]/10 text-[#5B9CF6] hover:bg-[#1877F2]/20 transition text-xs font-semibold">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
                  </svg>
                  Facebook
                </a>
              )}
            </div>
          )}
        </div>

        {/* Hero — Players + Score */}
        <div className="mb-10">
          <MatchResultHero
            player1={m.player1}
            player2={m.player2}
            p1Frames={m.player1_frames}
            p2Frames={m.player2_frames}
            winnerId={winnerId}
            dark
          />
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex border border-ink-700 rounded-full p-1">
            <button
              onClick={() => setTab('frames')}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold transition ${
                tab === 'frames' ? 'bg-felt text-white' : 'text-ink-400 hover:text-white'
              }`}
            >
              Frames
            </button>
            <button
              onClick={() => setTab('match')}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold transition ${
                tab === 'match' ? 'bg-felt text-white' : 'text-ink-400 hover:text-white'
              }`}
            >
              Match
            </button>
          </div>
        </div>

        {/* Tab content */}
        {tab === 'frames' ? <FramesTab match={m} /> : <MatchTab match={m} />}
      </div>
    </div>
  );
}
