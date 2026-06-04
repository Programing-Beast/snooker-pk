const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || '/storage';

function resolvePhoto(photo) {
  if (!photo) return null;
  if (photo.startsWith('http') || photo.startsWith('/')) return photo;
  return `${STORAGE_URL}/${photo}`;
}

export default function PlayerAvatar({ name, photo, tier, size = 'md', className = '' }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  const isPro = tier?.toLowerCase() === 'pro' || tier?.toLowerCase() === 'professional';
  const dim = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 sm:w-28 sm:h-28 text-2xl sm:text-3xl',
  }[size] || 'w-12 h-12 text-sm';
  const shape = size === 'xl' ? 'rounded-xl' : 'rounded-full';
  const ring = isPro ? 'ring-2 ring-brass' : '';
  const url = resolvePhoto(photo);

  if (url) {
    return (
      <div
        className={`${dim} ${shape} bg-cover bg-center ${ring} shrink-0 ${className}`}
        style={{ backgroundImage: `url(${url})` }}
      />
    );
  }

  return (
    <div className={`${dim} ${shape} grid place-items-center font-display font-bold ${ring} shrink-0 ${isPro ? 'bg-felt text-white' : 'bg-ink-200 text-ink-600'} ${className}`}>
      {initials}
    </div>
  );
}
