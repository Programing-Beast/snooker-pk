import { Link } from 'react-router-dom';
import CountryFlagChip from './CountryFlagChip';
import PortraitCard from './PortraitCard';
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

/**
 * Match-style hero showing two players with frame scores.
 *
 * Props:
 *   player1    — { id, name, photo_path, country_code }  (winner / left side)
 *   player2    — { id, name, photo_path, country_code }  (runner-up / right side)
 *   p1Frames   — number | null
 *   p2Frames   — number | null
 *   winnerId   — id of winning player (gets gold border)
 *   label      — text below the score (e.g. "Frames", "Final")
 *   dark       — use dark theme colours (default true)
 */
export default function MatchResultHero({
  player1,
  player2,
  p1Frames,
  p2Frames,
  winnerId,
  label = 'Frames',
  dark = true,
  compact = false,
}) {
  const p1Name = splitName(player1?.name);
  const p2Name = splitName(player2?.name);
  const p1Photo = resolvePhoto(player1?.photo_path);
  const p2Photo = resolvePhoto(player2?.photo_path);
  const p1Won = String(player1?.id) === String(winnerId);
  const p2Won = String(player2?.id) === String(winnerId);

  const textPrimary = dark ? 'text-white' : 'text-heading';
  const textMuted = dark ? 'text-ink-400' : 'text-muted';

  const nameClass = compact
    ? `block text-[15px] sm:text-lg font-display font-extrabold uppercase leading-none hover:underline ${textPrimary}`
    : `block text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold uppercase leading-none hover:underline ${textPrimary}`;
  const firstNameClass = compact
    ? `text-[9px] ${textMuted} tracking-wide`
    : `text-xs sm:text-sm ${textMuted} tracking-wide`;
  const scoreClass = compact
    ? `text-2xl font-display font-extrabold tabular-nums ${textPrimary}`
    : `text-4xl sm:text-6xl font-display font-extrabold tabular-nums ${textPrimary}`;
  const labelClass = compact
    ? `text-[9px] ${textMuted} uppercase tracking-widest`
    : `text-xs ${textMuted} uppercase tracking-widest`;
  const gapClass = compact ? 'gap-2 sm:gap-3' : 'gap-4 sm:gap-6';
  const innerGap = compact ? 'gap-2 sm:gap-3' : 'gap-3 sm:gap-5';

  return (
    <div className={`grid grid-cols-[1fr_auto_1fr] items-center ${gapClass}`}>
      {/* Player 1 — right-aligned */}
      <div className={`flex items-center ${innerGap} justify-end`}>
        <div className="text-right uppercase">
          <p className={firstNameClass}>{p1Name.first}</p>
          <Link to={player1?.id ? `/players/${player1.id}` : '#'} className={nameClass}>
            {p1Name.last}
          </Link>
          <div className={compact ? 'mt-0.5' : 'mt-1'}>
            <CountryFlagChip code={player1?.country_code || 'PAK'} showLabel={false} size="sm" />
          </div>
        </div>
        <PortraitCard src={p1Photo} alt={player1?.name} won={p1Won} compact={compact} />
      </div>

      {/* Score center */}
      <div className="flex flex-col items-center gap-1">
        <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3 sm:gap-4'}`}>
          <span className={scoreClass}>{p1Frames ?? 0}</span>
          <span className={labelClass}>{label}</span>
          <span className={scoreClass}>{p2Frames ?? 0}</span>
        </div>
      </div>

      {/* Player 2 — left-aligned */}
      <div className={`flex items-center ${innerGap}`}>
        <PortraitCard src={p2Photo} alt={player2?.name} won={p2Won} compact={compact} />
        <div className="uppercase">
          <p className={firstNameClass}>{p2Name.first}</p>
          <Link to={player2?.id ? `/players/${player2.id}` : '#'} className={nameClass}>
            {p2Name.last}
          </Link>
          <div className={compact ? 'mt-0.5' : 'mt-1'}>
            <CountryFlagChip code={player2?.country_code || 'PAK'} showLabel={false} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
