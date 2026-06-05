import { useNavigate } from 'react-router-dom';
import CountryFlagChip from './CountryFlagChip';
import StatusBadge from './StatusBadge';
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

function PlayerImage({ player, align = 'left' }) {
  const src = resolvePhoto(player?.photo_path || player?.photo);
  return (
    <div className={`shrink-0 w-16 h-20 rounded-lg border border-hairline overflow-hidden bg-ink-100 flex items-end ${
      align === 'right' ? 'justify-start' : 'justify-end'
    }`}>
      <img
        src={src}
        alt={player?.name || 'Player'}
        className="h-full w-auto object-cover object-top"
      />
    </div>
  );
}

function MatchInfo({ index, date, tableNo }) {
  const d = date ? new Date(date) : null;
  return (
    <div className="shrink-0 flex flex-col items-center lg:items-start">
      {d && (
        <>
          <h4 className="text-xl font-bold font-display text-ink-900 leading-5 tabular-nums">
            {d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </h4>
          <p className="text-xs text-ink-400 mt-0.5">
            {d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
        </>
      )}
      {index != null && (
        <p className="text-sm font-bold text-ink-700 mt-0.5">Match {index}</p>
      )}
      {tableNo && (
        <p className="text-xs text-ink-400 mt-0.5">Table {tableNo}</p>
      )}
    </div>
  );
}

function ActionIcons({ matchId, onEdit, navigate }) {
  return (
    <div className="shrink-0 hidden md:flex items-center gap-1.5">
      {/* Match Centre */}
      <button className="w-8 h-8 rounded-full bg-felt text-white grid place-items-center hover:bg-felt-700 transition" title="Match Centre" onClick={(e) => { e.stopPropagation(); navigate('/matches/' + matchId); }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M14.33 2.38c-1.04-1.84-3.62-1.84-4.66 0L.36 18.88C-.67 20.71.62 23 2.69 23h18.62c2.07 0 3.36-2.29 2.33-4.13L14.33 2.38ZM14.75 6.75a2.75 2.75 0 11-5.5 0 2.75 2.75 0 015.5 0ZM8.75 15.5a2.75 2.75 0 100-5.5 2.75 2.75 0 000 5.5ZM5.25 21.5a2.75 2.75 0 100-5.5 2.75 2.75 0 000 5.5Zm6.5 0a2.75 2.75 0 100-5.5 2.75 2.75 0 000 5.5Zm9.25-2.75a2.75 2.75 0 11-5.5 0 2.75 2.75 0 015.5 0Zm-3-3.25a2.75 2.75 0 100-5.5 2.75 2.75 0 000 5.5Z" />
        </svg>
      </button>
      {/* YouTube */}
      <button className="w-8 h-8 rounded-full bg-[#FF0000]/10 text-[#CC0000] grid place-items-center hover:bg-[#FF0000]/20 transition" title="Watch on YouTube">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81ZM10 15V9l5.2 3L10 15Z" />
        </svg>
      </button>
      {/* Facebook */}
      <button className="w-8 h-8 rounded-full bg-[#1877F2]/10 text-[#1877F2] grid place-items-center hover:bg-[#1877F2]/20 transition" title="Watch on Facebook">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
        </svg>
      </button>
      {/* Edit (admin only) */}
      {onEdit && (
        <button className="w-8 h-8 rounded-full bg-ink-100 text-ink-600 grid place-items-center hover:bg-ink-200 transition" title="Edit match" onClick={onEdit}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function MatchRow({ match, index, onEdit, adminActions }) {
  const navigate = useNavigate();
  const m = match;

  function playerClick(player) {
    if (!player?.id) return {};
    return {
      onClick: (e) => { e.stopPropagation(); navigate(`/players/${player.id}`); },
      className: 'cursor-pointer hover:underline',
      role: 'link',
    };
  }

  const isBye = m.is_bye || m.status === 'bye';
  const isWalkover = m.is_walkover || m.status === 'walkover';
  const isLive = m.status === 'live';
  const isScheduled = m.status === 'scheduled';
  const p1Won = m.player1_frames > m.player2_frames && !isScheduled;
  const p2Won = m.player2_frames > m.player1_frames && !isScheduled;
  const resultDate = m.scheduled_at || m.updated_at || m.created_at;
  const matchIndex = index ?? m.position;
  const p1Name = splitName(m.player1?.name);
  const p2Name = splitName(m.player2?.name);

  /* ── Bye ─────────────────────────────────────────────── */
  if (isBye) {
    return (
      <div className="flex items-center gap-6 px-6 py-5 border-b border-hairline">
        <MatchInfo index={matchIndex} date={resultDate} tableNo={m.table_no} />
        <div className="flex items-center gap-4 flex-1 min-w-0 justify-center">
          {/* Player 1 */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-right min-w-0 uppercase">
              <p className="text-[10px] text-ink-400 leading-tight">{p1Name.first}</p>
              <p className="text-[15px] font-bold text-ink-900 leading-snug" {...playerClick(m.player1)}>{p1Name.last}</p>
              <CountryFlagChip code={m.player1?.country_code || 'PAK'} showLabel={false} size="sm" />
            </div>
            <PlayerImage player={m.player1} align="left" />
          </div>
          <span className="badge bg-ink-100 text-ink-500 tracking-[0.1em] text-[10px] uppercase shrink-0">Bye</span>
          <div className="w-16 shrink-0" />
        </div>
        <ActionIcons matchId={m.id} onEdit={onEdit} navigate={navigate} />
      </div>
    );
  }

  /* ── Walkover ────────────────────────────────────────── */
  if (isWalkover) {
    return (
      <div className="flex items-center gap-6 px-6 py-5 border-b border-hairline">
        <MatchInfo index={matchIndex} date={resultDate} tableNo={m.table_no} />
        <div className="flex items-center gap-4 flex-1 min-w-0 justify-center">
          {/* Player 1 */}
          <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
            <div className="text-right min-w-0 uppercase">
              <p className="text-[10px] text-ink-400 leading-tight">{p1Name.first}</p>
              <p className="text-[15px] font-bold text-ink-900 leading-snug" {...playerClick(m.player1)}>{p1Name.last}</p>
              <CountryFlagChip code={m.player1?.country_code || 'PAK'} showLabel={false} size="sm" />
            </div>
            <PlayerImage player={m.player1} align="left" />
          </div>
          {/* Score */}
          <div className="flex items-center border border-hairline rounded-lg overflow-hidden shrink-0">
            <span className="w-8 py-2 text-center font-display font-bold text-[16px] text-ink-900">W</span>
            <span className="w-px self-stretch bg-hairline" />
            <span className="w-8 py-2 text-center font-display font-bold text-[16px] text-ink-400">O</span>
          </div>
          {/* Player 2 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <PlayerImage player={m.player2} align="right" />
            <div className="min-w-0 uppercase">
              <p className="text-[10px] text-ink-400 leading-tight">{p2Name.first}</p>
              <p className="text-[15px] text-ink-400 leading-snug line-through" {...playerClick(m.player2)}>{p2Name.last}</p>
              <CountryFlagChip code={m.player2?.country_code || 'PAK'} showLabel={false} size="sm" />
            </div>
          </div>
        </div>
        <ActionIcons matchId={m.id} onEdit={onEdit} navigate={navigate} />
      </div>
    );
  }

  /* ── Normal / Live / Scheduled ───────────────────────── */
  const rowBg = isLive ? 'bg-gradient-to-r from-live-tint to-transparent' : 'hover:bg-surface2/50 transition';

  return (
    <div className={`border-b border-hairline ${rowBg}`}>
      <div className="flex items-center gap-6 px-6 py-5">
        {/* Left — match info */}
        <MatchInfo index={matchIndex} date={resultDate} tableNo={m.table_no} />

        {/* Center — players + score */}
        <div className="flex items-center gap-4 flex-1 min-w-0 justify-center">
          {/* Player 1 — right-aligned name, then image */}
          <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
            <div className="text-right min-w-0 uppercase">
              <p className="text-[10px] text-ink-400 leading-tight">{p1Name.first}</p>
              <p className={`text-[15px] font-bold leading-snug ${p1Won ? 'text-ink-900' : 'text-ink-400'}`} {...playerClick(m.player1)}>
                {p1Name.last}
              </p>
              <CountryFlagChip code={m.player1?.country_code || 'PAK'} showLabel={false} size="sm" />
            </div>
            <PlayerImage player={m.player1} align="left" />
          </div>

          {/* Score */}
          {isScheduled ? (
            <span className="font-display font-semibold text-[14px] text-ink-400 px-3 shrink-0">vs</span>
          ) : (
            <div className="flex items-center border border-hairline rounded-lg overflow-hidden shrink-0">
              <span className={`w-8 py-2 text-center font-display font-bold text-[18px] tabular-nums ${p1Won ? 'text-ink-900' : 'text-ink-400'}`}>
                {m.player1_frames ?? 0}
              </span>
              <span className="w-px self-stretch bg-hairline" />
              <span className={`w-8 py-2 text-center font-display font-bold text-[18px] tabular-nums ${p2Won ? 'text-ink-900' : 'text-ink-400'}`}>
                {m.player2_frames ?? 0}
              </span>
            </div>
          )}

          {/* Player 2 — image, then left-aligned name */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <PlayerImage player={m.player2} align="right" />
            <div className="min-w-0 uppercase">
              <p className="text-[10px] text-ink-400 leading-tight">{p2Name.first}</p>
              <p className={`text-[15px] font-bold leading-snug ${p2Won ? 'text-ink-900' : 'text-ink-400'}`} {...playerClick(m.player2)}>
                {p2Name.last}
              </p>
              <CountryFlagChip code={m.player2?.country_code || 'PAK'} showLabel={false} size="sm" />
            </div>
          </div>
        </div>

        {/* Live badge */}
        {isLive && <StatusBadge status="live" pulse>Live</StatusBadge>}

        {/* Right — action icons */}
        <ActionIcons matchId={m.id} onEdit={onEdit} navigate={navigate} />
      </div>

      {/* Admin actions (below match row, no grey background) */}
      {adminActions && (
        <div className="flex items-center gap-2 px-6 pb-3">
          {adminActions}
        </div>
      )}
    </div>
  );
}
