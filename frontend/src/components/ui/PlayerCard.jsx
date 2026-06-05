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
    <div className="group flex flex-col items-center text-center">
      {/* Image container */}
      <div className="relative w-[104px] h-[130px] lg:w-[156px] lg:h-[195px] rounded-2xl border border-border-subtle bg-ink-100 hover:bg-card-alt transition-colors duration-300 overflow-hidden">
        <img
          src={photo}
          alt={player.name || 'Player'}
          className="w-full h-full object-cover object-top pointer-events-none select-none"
        />
        {/* Hover overlay for admin actions */}
        {overlay && (
          <div className="absolute inset-0 rounded-2xl bg-night/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 z-10">
            {overlay}
          </div>
        )}
      </div>

      {/* Text */}
      <div className="mt-2 lg:mt-3">
        <p className="text-xs uppercase text-ink-500 font-normal leading-snug">
          {first || '\u00A0'}
        </p>
        <p
          className="text-xl lg:text-3xl font-extrabold uppercase leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {last}
        </p>
        {seed && (
          <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide text-brass-700 bg-brass-tint px-1.5 py-0.5 rounded">
            Seed {seed}
          </span>
        )}
        <div className="flex justify-center mt-1.5">
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
