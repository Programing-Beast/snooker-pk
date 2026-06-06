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

export default function PlayerCard({ player, to, overlay, seed }) {
  if (!player) return null;

  const { first, last } = splitName(player.name);
  const photo = resolvePhoto(player.photo_path || player.photo);
  const href = to ?? (player.id ? `/players/${player.id}` : undefined);

  const card = (
    <div className="group flex flex-col items-center text-center w-full">
      {/* Photo + frame wrapper */}
      <div className="relative w-full pt-[15%]">
        {/* Dog-ear background frame — wider than photo, behind it */}
        <div className="player-card-frame absolute left-1/2 -translate-x-1/2 bottom-0 w-[95%] h-[80%]" />

        {/* Player photo — sits inside the frame, top extends above */}
        <div className="relative z-[1] mx-auto w-[72%]">
          <img
            src={photo}
            alt={player.name || 'Player'}
            className="w-full aspect-[3/4] object-cover object-top pointer-events-none select-none"
          />
          {/* Admin hover actions — buttons at bottom, no dark overlay */}
          {overlay && (
            <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <div className="bg-gradient-to-t from-night/80 to-transparent pt-6 pb-2 flex items-center justify-center gap-2">
                {overlay}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Text */}
      <div className="mt-2 lg:mt-3">
        <p className="text-[10px] lg:text-xs uppercase text-ink-500 font-normal leading-snug tracking-wide">
          {first || '\u00A0'}
        </p>
        <p
          className="text-base lg:text-xl font-bold uppercase leading-tight"
          style={{ fontFamily: 'var(--font-slab)' }}
        >
          {last}
        </p>
        {seed && (
          <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide text-brass-700 bg-brass-tint px-1.5 py-0.5 rounded">
            Seed {seed}
          </span>
        )}
        <div className="flex justify-center mt-1">
          <CountryFlagChip code={player.country_code || 'PAK'} showLabel={false} size="sm" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="mt-8 flex flex-col items-center no-underline text-heading hover:text-heading">
        {card}
      </Link>
    );
  }

  return <div className="mt-8 flex flex-col items-center">{card}</div>;
}
