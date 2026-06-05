import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as tournamentsApi from '../../api/tournaments';
import * as entriesApi from '../../api/entries';
import { useAuth } from '../../context/AuthContext';
import Tabs from '../../components/ui/Tabs';
import StatusBadge from '../../components/ui/StatusBadge';
import MatchRow from '../../components/ui/MatchRow';
import PlayerAvatar from '../../components/ui/PlayerAvatar';
import CountryFlagChip from '../../components/ui/CountryFlagChip';
import PlayerListItem from '../../components/ui/PlayerListItem';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || '/storage';

const DETAIL_TABS = [
  { key: 'draw', label: 'Draw' },
  { key: 'overview', label: 'Overview' },
  { key: 'players', label: 'Players' },
  { key: 'prizes', label: 'Prizes' },
  { key: 'info', label: 'Info' },
];

export default function TournamentDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [drawData, setDrawData] = useState(null);
  const [playersData, setPlayersData] = useState(null);
  const [tab, setTab] = useState('draw');
  const [loading, setLoading] = useState(true);
  const [entryStatus, setEntryStatus] = useState(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    tournamentsApi.show(slug)
      .then(res => {
        const t = res.data.data ?? res.data;
        setTournament(t);
        return t;
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!tournament) return;
    tournamentsApi.draw(tournament.id).then(res => setDrawData(res.data.data ?? res.data)).catch(() => {});
    tournamentsApi.players(tournament.id).then(res => setPlayersData(res.data.data ?? res.data)).catch(() => {});
  }, [tournament]);

  useEffect(() => {
    if (!isAuthenticated) return;
    entriesApi.mine()
      .then(res => {
        const entries = res.data.data ?? res.data;
        const mine = Array.isArray(entries) ? entries.find(e => e.tournament_id === tournament?.id) : null;
        setEntryStatus(mine?.status || null);
      })
      .catch(() => {});
  }, [isAuthenticated, tournament]);

  async function requestEntry() {
    if (!tournament) return;
    setRequesting(true);
    try {
      await entriesApi.request({ tournament_id: tournament.id });
      setEntryStatus('pending');
    } catch { /* ignore */ }
    setRequesting(false);
  }

  if (loading) return <div className="max-w-[1200px] mx-auto px-6 py-16 text-center text-ink-400">Loading...</div>;
  if (!tournament) return <div className="max-w-[1200px] mx-auto px-6 py-16 text-center text-ink-400">Tournament not found.</div>;

  const t = tournament;
  const bannerUrl = t.banner_path ? `${STORAGE_URL}/${t.banner_path}` : null;

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Tournament header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-felt-400 to-felt-900">
        {bannerUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${bannerUrl})` }}
          />
        )}
        <div className="absolute inset-0 felt-grain opacity-30 mix-blend-overlay" />
        <div className="relative px-6 sm:px-9 py-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <StatusBadge status={t.status || 'upcoming'} />
            <h1 className="font-display font-extrabold text-white text-[28px] sm:text-[34px] uppercase leading-tight mt-3">{t.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-ink-200 text-[13px] mt-3">
              {t.venue && <span>⌂ {t.venue}{t.city ? `, ${t.city}` : ''}</span>}
              {t.start_date && <span>◷ {new Date(t.start_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })} – {t.end_date && new Date(t.end_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
              {t.max_players && <span>♟ {t.max_players}-player draw</span>}
            </div>
          </div>
          {/* Entry button */}
          <div className="shrink-0">
            {!isAuthenticated ? (
              <Button variant="brass" size="lg">Log in to enter</Button>
            ) : entryStatus === 'approved' ? (
              <StatusBadge status="approved">You're in</StatusBadge>
            ) : entryStatus === 'pending' ? (
              <StatusBadge status="pending">Entry pending</StatusBadge>
            ) : entryStatus === 'rejected' ? (
              <StatusBadge status="rejected">Entry rejected</StatusBadge>
            ) : t.entry_status === 'closed' ? (
              <span className="badge bg-ink-100 text-ink-600">Entries closed</span>
            ) : (
              <Button variant="brass" size="lg" onClick={requestEntry} disabled={requesting}>
                {requesting ? 'Requesting...' : 'Request Entry'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={DETAIL_TABS} active={tab} onChange={setTab} />

      {/* Tab content */}
      <div className="px-6 sm:px-9 py-8">
        {tab === 'draw' && <DrawTab data={drawData} />}
        {tab === 'overview' && <OverviewTab tournament={t} />}
        {tab === 'players' && <PlayersTab data={playersData} />}
        {tab === 'prizes' && <PrizesTab prizes={t.prizes} />}
        {tab === 'info' && <InfoTab tournament={t} />}
      </div>
    </div>
  );
}

function TournamentResult({ tournament: t }) {
  if (!t.winner) return null;
  return (
    <div className="card overflow-hidden mb-6">
      <div className="px-5 py-3 border-b border-hairline">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-felt">Tournament result</span>
      </div>
      <div className="p-5 grid sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#FFD700]/20 flex items-center justify-center text-[13px] font-bold text-[#B8860B] shrink-0">1</div>
          <PlayerAvatar name={t.winner.name} photo={t.winner.photo_path} tier={t.winner.tier} size="sm" />
          <div className="min-w-0">
            <div className="text-[11px] text-ink-400 uppercase tracking-wide font-semibold">Winner</div>
            <div className="flex items-center gap-1.5">
              <CountryFlagChip code={t.winner.country_code || 'PAK'} showLabel={false} size="sm" />
              <Link to={`/players/${t.winner.id}`} className="font-semibold text-[15px] hover:underline truncate">{t.winner.name}</Link>
            </div>
          </div>
        </div>
        {t.runner_up && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-ink-100 flex items-center justify-center text-[13px] font-bold text-ink-500 shrink-0">2</div>
            <PlayerAvatar name={t.runner_up.name} photo={t.runner_up.photo_path} tier={t.runner_up.tier} size="sm" />
            <div className="min-w-0">
              <div className="text-[11px] text-ink-400 uppercase tracking-wide font-semibold">Runner-up</div>
              <div className="flex items-center gap-1.5">
                <CountryFlagChip code={t.runner_up.country_code || 'PAK'} showLabel={false} size="sm" />
                <Link to={`/players/${t.runner_up.id}`} className="font-semibold text-[15px] hover:underline truncate">{t.runner_up.name}</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ tournament: t }) {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <TournamentResult tournament={t} />
        {t.description && (
          <div>
            <h3 className="font-display font-bold text-[1.25rem] mb-3">About</h3>
            <p className="text-ink-600 text-[15px] leading-relaxed">{t.description}</p>
          </div>
        )}
        {t.prizes?.filter(p => Number(p.amount) > 0).length > 0 && (
          <div>
            <h3 className="font-display font-bold text-[1.25rem] mb-3">Prize pool</h3>
            <div className="card overflow-hidden divide-y divide-hairline">
              {t.prizes.filter(p => Number(p.amount) > 0).map(p => (
                <div key={p.id} className={`flex items-center justify-between px-4 py-3 ${p.is_highlight ? 'bg-brass-tint' : ''}`}>
                  <span className="font-semibold text-[14px]">{p.position_label}</span>
                  <span className="font-display font-bold tabular-nums">PKR {Number(p.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="space-y-6">
        {t.organizers?.length > 0 && (
          <div>
            <h3 className="font-display font-bold text-[1.25rem] mb-3">Organizers</h3>
            <div className="card divide-y divide-hairline">
              {t.organizers.map(o => {
                const player = o.user?.player;
                const phone = player?.phones?.[0]?.phone;
                return (
                  <div key={o.id} className="flex items-center gap-3 px-4 py-3">
                    <PlayerAvatar name={player?.name || o.user?.name} photo={player?.photo_path} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-[14px]">{player?.name || o.user?.name}</div>
                      {o.role && <div className="text-[12px] text-ink-500">{o.role}</div>}
                      {phone && <div className="text-[13px] text-ink-600 mt-0.5">{phone}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div>
          <h3 className="font-display font-bold text-[1.25rem] mb-3">Details</h3>
          <div className="card p-4 space-y-2 text-[14px]">
            <div className="flex justify-between"><span className="text-ink-500">Format</span><span className="font-semibold">Knockout</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Draw size</span><span className="font-semibold">{t.max_players || '—'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DrawTab({ data }) {
  const rounds = Array.isArray(data) ? data : data?.rounds;
  if (!rounds?.length) {
    return <EmptyState title="No draw yet" message="The draw will appear here once it's generated." />;
  }
  return (
    <div className="space-y-6">
      {rounds.map(round => (
        <div key={round.id} className="card overflow-hidden">
          <div className="px-[18px] py-3 bg-night text-white font-display font-semibold text-[12px] tracking-[0.12em] uppercase flex items-center gap-3">
            {round.name}
            {round.sub_label && <span className="text-ink-400 font-medium normal-case tracking-normal">· {round.sub_label}</span>}
            <span className="ml-auto text-ink-400 font-medium normal-case tracking-normal">{round.matches?.length || 0} matches</span>
          </div>
          <div>
            {round.matches?.map((m, i) => <MatchRow key={m.id} match={m} index={i + 1} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function PlayersTab({ data }) {
  if (!data?.length) {
    return <EmptyState title="No players yet" message="Players will appear here once entries are approved." />;
  }
  return (
    <div className="card overflow-hidden divide-y divide-hairline">
      {data.map((entry, i) => (
        <div key={entry.id} className="px-4 py-3">
          <PlayerListItem player={entry.player} index={i + 1} to={entry.player?.id ? `/players/${entry.player.id}` : undefined}>
            {entry.seed && (
              <span className="badge bg-brass-tint text-brass-700">Seed {entry.seed}</span>
            )}
          </PlayerListItem>
        </div>
      ))}
    </div>
  );
}

function PrizesTab({ prizes }) {
  const visible = prizes?.filter(p => Number(p.amount) > 0);
  if (!visible?.length) {
    return <EmptyState title="No prize breakdown" message="Prize details will be added by the organizer." />;
  }
  return (
    <div className="card overflow-hidden divide-y divide-hairline max-w-lg">
      {visible.map(p => (
        <div key={p.id} className={`flex items-center justify-between px-5 py-4 ${p.is_highlight ? 'bg-brass-tint' : ''}`}>
          <div>
            <div className="font-semibold text-[15px]">{p.position_label}</div>
            {p.note && <div className="text-[12px] text-ink-500 mt-0.5">{p.note}</div>}
          </div>
          <div className="text-right">
            <div className="font-display font-bold text-[18px] tabular-nums">PKR {Number(p.amount).toLocaleString()}</div>
            {p.count > 1 && <div className="text-[12px] text-ink-500">× {p.count}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoTab({ tournament: t }) {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        {/* Venue */}
        <div>
          <h3 className="font-display font-bold text-[1.25rem] mb-3">Venue</h3>
          <div className="card overflow-hidden">
            <div className="h-40 bg-ink-200 grid place-items-center text-ink-400 text-[13px]">
              <div className="text-center">
                <svg className="mx-auto mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                Map coming soon
              </div>
            </div>
            <div className="p-4 space-y-1.5 text-[14px]">
              {t.venue && <div className="font-semibold">{t.venue}</div>}
              {t.city && <div className="text-ink-500">{t.city}, Pakistan</div>}
              {t.address && <div className="text-ink-500">{t.address}</div>}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div>
          <h3 className="font-display font-bold text-[1.25rem] mb-3">Schedule</h3>
          <div className="card p-4 space-y-2 text-[14px]">
            {t.start_date && (
              <div className="flex justify-between">
                <span className="text-ink-500">Start</span>
                <span className="font-semibold">{new Date(t.start_date).toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            )}
            {t.end_date && (
              <div className="flex justify-between">
                <span className="text-ink-500">End</span>
                <span className="font-semibold">{new Date(t.end_date).toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Contacts */}
        {t.organizers?.length > 0 && (
          <div>
            <h3 className="font-display font-bold text-[1.25rem] mb-3">Contacts</h3>
            <div className="card divide-y divide-hairline">
              {t.organizers.map(o => {
                const player = o.user?.player;
                const phone = player?.phones?.[0]?.phone;
                return (
                  <div key={o.id} className="flex items-center gap-3 px-4 py-3">
                    <PlayerAvatar name={player?.name || o.user?.name} photo={player?.photo_path} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-[14px]">{player?.name || o.user?.name}</div>
                      {o.role && <div className="text-[12px] text-ink-500">{o.role}</div>}
                    </div>
                    {phone && (
                      <a href={`tel:${phone}`} className="text-[13px] text-felt font-semibold">{phone}</a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tournament details */}
        <div>
          <h3 className="font-display font-bold text-[1.25rem] mb-3">Tournament details</h3>
          <div className="card p-4 space-y-2 text-[14px]">
            <div className="flex justify-between"><span className="text-ink-500">Format</span><span className="font-semibold">Knockout</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Draw size</span><span className="font-semibold">{t.max_players || '—'}</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Entry status</span><span className="font-semibold capitalize">{t.entry_status || 'Open'}</span></div>
            {t.rounds?.length > 0 && (
              <div className="flex justify-between"><span className="text-ink-500">Rounds</span><span className="font-semibold">{t.rounds.length}</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
