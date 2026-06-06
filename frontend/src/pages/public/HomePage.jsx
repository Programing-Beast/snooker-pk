import { Link } from 'react-router-dom';
import { useGetTournamentsQuery } from '../../store/api/tournamentsApi';
import { useGetRankingsQuery } from '../../store/api/rankingsApi';
import { useGetStatsQuery } from '../../store/api/statsApi';
import { useAuth } from '../../context/AuthContext';
import TournamentCard from '../../components/ui/TournamentCard';
import RankingsRow from '../../components/ui/RankingsRow';
import FeltHero from '../../components/ui/FeltHero';
import StoreTeaser from '../../components/ui/StoreTeaser';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { data: tournaments = [], isLoading } = useGetTournamentsQuery({ per_page: 6 });
  const { data: rankings = [] } = useGetRankingsQuery({ per_page: 5 });
  const { data: stats } = useGetStatsQuery();

  const live = tournaments.filter(t => t.status === 'live');
  const upcoming = tournaments.filter(t => t.status === 'upcoming');

  return (
    <>
      {/* Hero */}
      <FeltHero gradient="800px 420px at 22% -10%, rgba(11,110,67,.55)" className="max-w-[1200px] mx-auto px-6 sm:px-9 pt-12 pb-10 grid lg:grid-cols-2 gap-9 items-center">
          <div>
            <div className="flex items-center gap-2.5 seclabel text-felt-400 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-live pulse" /> Pakistan's home of snooker
            </div>
            <h1 className="font-display font-extrabold uppercase text-white leading-[0.92] tracking-tight text-[42px] sm:text-[54px]">
              Every frame,<br /><span className="text-brass">one platform.</span>
            </h1>
            <p className="text-ink-200 text-[17px] mt-5 max-w-md">
              Follow live tournaments, browse the draw, request entry and track the national rankings — from your local club to the national stage.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link to="/tournaments" className="btn btn-lg btn-primary">Browse tournaments</Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn btn-lg bg-white/15 text-white border border-white/20 hover:bg-white/25">Create free account</Link>
              )}
            </div>
            <div className="flex gap-7 mt-8">
              <div><div className="font-display font-extrabold text-2xl text-white tabular-nums">{stats?.players?.toLocaleString() ?? '–'}</div><div className="seclabel text-ink-400 mt-0.5">Players</div></div>
              <div><div className="font-display font-extrabold text-2xl text-white tabular-nums">{stats?.tournaments?.toLocaleString() ?? '–'}</div><div className="seclabel text-ink-400 mt-0.5">Tournaments</div></div>
              <div><div className="font-display font-extrabold text-2xl text-white tabular-nums">{stats?.cities?.toLocaleString() ?? '–'}</div><div className="seclabel text-ink-400 mt-0.5">Cities</div></div>
            </div>
          </div>
          <div className="hidden lg:flex gap-3 justify-center opacity-80">
            {['#c0392b', '#f2c200', '#1e7a3d', '#7a4a1e', '#1f5fa8', '#e86a92', '#161616'].map(c => (
              <span key={c} className="ball w-10 h-10" style={{ background: c }} />
            ))}
          </div>
      </FeltHero>

      {/* Live now */}
      {live.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 sm:px-9 py-10">
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="seclabel text-felt mb-1.5 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-live pulse" />Live now</div>
              <h2 className="font-display font-bold text-2xl">Matches in play</h2>
            </div>
            <Link to="/tournaments" className="text-[13px] font-semibold text-felt hover:text-felt-700">View all →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {live.slice(0, 3).map(t => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        </section>
      )}

      {/* Upcoming */}
      <section className="max-w-[1200px] mx-auto px-6 sm:px-9 py-10 bg-card-alt">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="seclabel text-felt mb-1.5">Upcoming</div>
            <h2 className="font-display font-bold text-2xl">Tournaments to enter</h2>
          </div>
          <Link to="/tournaments" className="text-[13px] font-semibold text-felt hover:text-felt-700">All tournaments →</Link>
        </div>
        {isLoading ? (
          <div className="text-muted text-center py-12">Loading tournaments...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {upcoming.slice(0, 3).map(t => <TournamentCard key={t.id} tournament={t} />)}
            {upcoming.length === 0 && <p className="text-ink-500 col-span-3 text-center py-8">No upcoming tournaments right now.</p>}
          </div>
        )}
      </section>

      {/* Rankings preview + Store teaser */}
      <section className="max-w-[1200px] mx-auto px-6 sm:px-9 py-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-divider flex items-center justify-between">
            <div>
              <div className="seclabel text-felt mb-1">Rankings</div>
              <h2 className="font-display font-bold text-xl">National top 5</h2>
            </div>
            <span className="badge bg-brass-tint text-brass-700">Preview</span>
          </div>
          <div className="divide-y divide-divider">
            {rankings.slice(0, 5).map((p, i) => (
              <RankingsRow key={p.id} rank={i + 1} player={p} />
            ))}
          </div>
          <div className="px-5 py-3.5 bg-card-alt text-center">
            <Link to="/rankings" className="text-[13px] font-semibold text-felt">View full rankings →</Link>
          </div>
        </div>

        {/* Store teaser */}
        <StoreTeaser />
      </section>
    </>
  );
}
