import { Link } from 'react-router-dom';
import CountryFlagChip from './CountryFlagChip';
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
}) {
  const p1Name = splitName(player1?.name);
  const p2Name = splitName(player2?.name);
  const p1Photo = resolvePhoto(player1?.photo_path);
  const p2Photo = resolvePhoto(player2?.photo_path);
  const p1Won = String(player1?.id) === String(winnerId);
  const p2Won = String(player2?.id) === String(winnerId);

  const textPrimary = dark ? 'text-white' : 'text-ink-900';
  const textMuted = 'text-ink-400';
  const photoWin = 'bg-[#F2C31A] border-2 border-[#F2C31A] shadow-[0_0_30px_rgba(242,195,26,0.4)]';
  const photoLose = dark ? 'border-2 border-ink-700' : 'border-2 border-ink-200';

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-6">
      {/* Player 1 — right-aligned */}
      <div className="flex items-center gap-3 sm:gap-5 justify-end">
        <div className="text-right uppercase">
          <p className={`text-xs sm:text-sm ${textMuted} tracking-wide`}>{p1Name.first}</p>
          <Link
            to={player1?.id ? `/players/${player1.id}` : '#'}
            className={`block text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold uppercase leading-none hover:underline ${textPrimary}`}
          >
            {p1Name.last}
          </Link>
          <div className="mt-1">
            <CountryFlagChip code={player1?.country_code || 'PAK'} showLabel={false} size="sm" />
          </div>
        </div>
        <div className={`shrink-0 w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden ${p1Won ? photoWin + ' p-1' : photoLose}`}>
          <img src={p1Photo} alt={player1?.name} className={`h-full w-full object-cover object-top ${p1Won ? 'rounded-lg' : ''}`} />
        </div>
      </div>

      {/* Score center */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className={`text-4xl sm:text-6xl font-display font-extrabold tabular-nums ${textPrimary}`}>
            {p1Frames ?? 0}
          </span>
          <span className={`text-xs ${textMuted} uppercase tracking-widest`}>{label}</span>
          <span className={`text-4xl sm:text-6xl font-display font-extrabold tabular-nums ${textPrimary}`}>
            {p2Frames ?? 0}
          </span>
        </div>
      </div>

      {/* Player 2 — left-aligned */}
      <div className="flex items-center gap-3 sm:gap-5">
        <div className={`shrink-0 w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden ${p2Won ? photoWin + ' p-1' : photoLose}`}>
          <img src={p2Photo} alt={player2?.name} className={`h-full w-full object-cover object-top ${p2Won ? 'rounded-lg' : ''}`} />
        </div>
        <div className="uppercase">
          <p className={`text-xs sm:text-sm ${textMuted} tracking-wide`}>{p2Name.first}</p>
          <Link
            to={player2?.id ? `/players/${player2.id}` : '#'}
            className={`block text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold uppercase leading-none hover:underline ${textPrimary}`}
          >
            {p2Name.last}
          </Link>
          <div className="mt-1">
            <CountryFlagChip code={player2?.country_code || 'PAK'} showLabel={false} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
