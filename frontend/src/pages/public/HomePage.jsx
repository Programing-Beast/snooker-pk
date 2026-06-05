import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as tournamentsApi from '../../api/tournaments';
import * as rankingsApi from '../../api/rankings';
import TournamentCard from '../../components/ui/TournamentCard';
import RankingsRow from '../../components/ui/RankingsRow';

export default function HomePage() {
  const [tournaments, setTournaments] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      tournamentsApi.list({ per_page: 6 }),
      rankingsApi.list({ per_page: 5 }),
    ]).then(([t, r]) => {
      if (t.status === 'fulfilled') setTournaments(t.value.data.data || []);
      if (r.status === 'fulfilled') setRankings(r.value.data.data || []);
      setLoading(false);
    });
  }, []);

  const live = tournaments.filter(t => t.status === 'live');
  const upcoming = tournaments.filter(t => t.status === 'upcoming');

  return (
    <>
      {/* Hero */}
      <header className="relative overflow-hidden bg-night felt-grain">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(800px 420px at 22% -10%, rgba(11,110,67,.55), transparent 60%)' }} />
        <div className="relative max-w-[1200px] mx-auto px-6 sm:px-9 pt-12 pb-10 grid lg:grid-cols-2 gap-9 items-center">
          <div>
            <div className="flex items-center gap-2.5 seclabel text-felt-400 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-live pulse" /> Pakistan's home of snooker
            </div>
            <h1 className="font-display font-extrabold uppercase text-white leading-[0.92] tracking-tight text-[42px] sm:text-[54px]">
              Every frame,<br /><span className="text-brass">one platform.</span>
            </h1>
            <p className="text-ink-300 text-[17px] mt-5 max-w-md">
              Follow live tournaments, browse the draw, request entry and track the national rankings — from your local club to the national stage.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link to="/tournaments" className="btn btn-lg btn-primary">Browse tournaments</Link>
              <Link to="/register" className="btn btn-lg bg-white/10 text-white border border-white/20 hover:bg-white/20">Create free account</Link>
            </div>
            <div className="flex gap-7 mt-8">
              <div><div className="font-display font-extrabold text-2xl text-white tabular-nums">1,240+</div><div className="seclabel text-ink-400 mt-0.5">Players</div></div>
              <div><div className="font-display font-extrabold text-2xl text-white tabular-nums">86</div><div className="seclabel text-ink-400 mt-0.5">Tournaments</div></div>
              <div><div className="font-display font-extrabold text-2xl text-white tabular-nums">12</div><div className="seclabel text-ink-400 mt-0.5">Cities</div></div>
            </div>
          </div>
          <div className="hidden lg:flex gap-3 justify-center opacity-80">
            {['#c0392b', '#f2c200', '#1e7a3d', '#7a4a1e', '#1f5fa8', '#e86a92', '#161616'].map(c => (
              <span key={c} className="ball w-10 h-10" style={{ background: c }} />
            ))}
          </div>
        </div>
      </header>

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
        {loading ? (
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
        <div className="rounded-lg overflow-hidden relative bg-night felt-grain border border-hairline-d flex flex-col justify-between p-7">
          <div className="relative">
            <span className="badge bg-brass-tint text-brass-700 mb-4"><span className="dot" />Store · coming soon</span>
            <h2 className="font-display font-bold text-2xl text-white leading-tight">
              Cues, chalk & cases —<br />built for the break.
            </h2>
            <p className="text-ink-300 text-[14.5px] mt-3 max-w-xs">
              The SnookerPK store launches soon with pro equipment from trusted Pakistani retailers.
            </p>
          </div>
          <div className="relative flex gap-2.5 mt-6">
            <input className="input !bg-white/10 !border-white/20 !text-white placeholder:!text-ink-400" placeholder="Email me at launch" />
            <button className="btn btn-brass whitespace-nowrap">Notify me</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-night px-6 sm:px-9 py-8">
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-display font-extrabold text-white uppercase tracking-tight">Snooker<span className="text-live">PK</span></span>
            <p className="text-ink-400 text-[12.5px] mt-1.5">Pakistan's first dedicated snooker platform.</p>
          </div>
          <div className="flex gap-7 text-[13px] text-ink-300">
            <Link to="/tournaments" className="hover:text-white">Tournaments</Link>
            <Link to="/rankings" className="hover:text-white">Rankings</Link>
            <Link to="/store" className="hover:text-white">Store</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
