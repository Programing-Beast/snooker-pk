import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import CountryFlagChip from './CountryFlagChip';

export default function TournamentCard({ tournament }) {
  const t = tournament;
  const status = t.status || 'upcoming';

  return (
    <Link to={`/tournaments/${t.slug}`} className="card overflow-hidden flex flex-col hover:shadow-e3 transition-shadow">
      <div className="relative h-28 p-3.5 flex items-start justify-between bg-gradient-to-br from-felt-400 to-felt-900">
        <div className="absolute inset-0 felt-grain opacity-30 mix-blend-overlay" />
        <span className="relative font-display font-extrabold text-white text-[12px] tracking-[0.14em] uppercase max-w-[60%]">
          {t.name}
        </span>
        <span className="relative"><StatusBadge status={status} /></span>
        <div className="absolute bottom-3.5 right-3.5 flex gap-1.5">
          {['#c0392b', '#f2c200', '#e86a92', '#161616'].map(c => (
            <span key={c} className="ball w-3.5 h-3.5" style={{ background: c }} />
          ))}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-bold text-[18px] leading-tight">{t.name}</h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.72rem] text-ink-500 mt-2">
          <span className="flex items-center gap-1.5">
            <CountryFlagChip code={t.country_code || 'PAK'} size="sm" showLabel={false} />
            {t.venue}{t.city ? `, ${t.city}` : ''}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2.5 text-[0.72rem]">
          <span className="text-ink-500">
            {t.start_date && `${new Date(t.start_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}`}
            {t.end_date && ` – ${new Date(t.end_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}`}
          </span>
          {t.prize_pool && <span className="font-display font-bold text-felt">PKR {Number(t.prize_pool).toLocaleString()}</span>}
        </div>
        <div className="flex items-center gap-2.5 pt-3.5 mt-auto border-t border-divider">
          {t.organizer_initials && (
            <span className="w-8 h-8 rounded-md bg-card-alt border border-border-subtle grid place-items-center font-display font-bold text-[12px] text-felt">
              {t.organizer_initials}
            </span>
          )}
          <div className="leading-tight min-w-0 flex-1">
            <div className="seclabel text-muted text-[9px]">Organized by</div>
            <div className="text-[12.5px] font-semibold text-body truncate">{t.organizer || '—'}</div>
          </div>
          <span className={`btn btn-sm ${status === 'live' ? 'btn-live' : 'btn-brass'}`}>
            {status === 'live' ? 'Watch' : 'View'}
          </span>
        </div>
      </div>
    </Link>
  );
}
