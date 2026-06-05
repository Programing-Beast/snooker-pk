import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as tournamentsApi from '../../api/tournaments';
import * as entriesApi from '../../api/entries';
import * as prizeAwardsApi from '../../api/prizeAwards';
import { useAuth } from '../../context/AuthContext';
import Tabs from '../../components/ui/Tabs';
import StatusBadge from '../../components/ui/StatusBadge';
import MatchRow from '../../components/ui/MatchRow';
import MatchResultHero from '../../components/ui/MatchResultHero';
import PlayerAvatar from '../../components/ui/PlayerAvatar';
import CountryFlagChip from '../../components/ui/CountryFlagChip';
import PlayerListItem from '../../components/ui/PlayerListItem';
import PlayerCard from '../../components/ui/PlayerCard';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import PageBanner from '../../components/ui/PageBanner';


const DETAIL_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'draw', label: 'Draw' },
  { key: 'players', label: 'Players' },
];

export default function TournamentDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [drawData, setDrawData] = useState(null);
  const [playersData, setPlayersData] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [awards, setAwards] = useState([]);
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
    prizeAwardsApi.list(tournament.id).then(res => setAwards(res.data.data ?? res.data ?? [])).catch(() => {});
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

  if (loading) return <div className="max-w-[1200px] mx-auto px-6 py-16 text-center text-muted">Loading...</div>;
  if (!tournament) return <div className="max-w-[1200px] mx-auto px-6 py-16 text-center text-muted">Tournament not found.</div>;

  const t = tournament;

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Tournament header */}
      <PageBanner bannerPath={t.banner_path}>
        <div className="px-6 sm:px-9 py-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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
      </PageBanner>

      {/* Tabs */}
      <Tabs tabs={DETAIL_TABS} active={tab} onChange={setTab} />

      {/* Tab content */}
      <div className="px-6 sm:px-9 py-8">
        {tab === 'overview' && <OverviewTab tournament={t} drawData={drawData} awards={awards} />}
        {tab === 'draw' && <DrawTab data={drawData} />}
        {tab === 'players' && <PlayersTab data={playersData} />}
      </div>
    </div>
  );
}

function OverviewTab({ tournament: t, drawData, awards }) {
  const drawRounds = Array.isArray(drawData) ? drawData : drawData?.rounds || [];
  const awardedGroups = groupAwards(awards.filter(a => a.status === 'awarded'));
  const visiblePrizes = t.prizes?.filter(p => Number(p.amount) > 0);

  // Build MatchResultHero data for completed tournaments
  let heroProps = null;
  if (t.winner) {
    const wId = t.winner_id ?? t.winner?.id;
    const finalRound = drawRounds[drawRounds.length - 1];
    const finalMatch = finalRound?.matches?.find(m => String(m.winner_id) === String(wId))
      || finalRound?.matches?.[0] || null;
    const p1IsWinner = finalMatch && String(finalMatch.player1_id) === String(wId);
    heroProps = {
      player1: t.winner,
      player2: t.runner_up,
      p1Frames: finalMatch ? (p1IsWinner ? finalMatch.player1_frames : finalMatch.player2_frames) : null,
      p2Frames: finalMatch ? (p1IsWinner ? finalMatch.player2_frames : finalMatch.player1_frames) : null,
      winnerId: wId,
      label: 'Final',
    };
  }

  return (
    <div className="space-y-8">
      {/* Match Result Hero */}
      {heroProps && (
        <div className="py-4">
          <MatchResultHero {...heroProps} dark={false} />
        </div>
      )}

      {/* Prize Awards */}
      {awardedGroups.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-[1.25rem] mb-3">Prizes awarded</h3>
          <div className="card overflow-hidden divide-y divide-divider">
            {awardedGroups.map(group => (
              <div key={group.ids.join('-')} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <PlayerListItem
                    player={group.player}
                    to={group.player?.id ? `/players/${group.player.id}` : undefined}
                    showTier={false}
                  />
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[13px] font-semibold">
                    {group.prize?.position_label || group.reason}
                    {group.count > 1 && <span className="text-muted ml-1">({group.count}x)</span>}
                  </div>
                  <div className="font-display font-bold text-[14px] tabular-nums">
                    PKR {group.totalAmount.toLocaleString()}
                  </div>
                </div>
                <span className={`badge ${group.category === 'score_prize' ? 'bg-brass-tint text-brass-700' : group.category === 'round_elimination' ? 'bg-ok-tint text-[#0C6B3C]' : group.category === 'tournament_winner' ? 'bg-felt-50 text-felt' : group.category === 'tournament_runner_up' ? 'bg-felt-50 text-felt' : 'bg-ink-100 text-ink-600'}`}>
                  {group.category === 'tournament_winner' ? 'winner' : group.category === 'tournament_runner_up' ? 'runner-up' : group.category === 'round_elimination' ? 'elimination' : group.category === 'score_prize' ? 'score' : group.category || 'prize'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left column */}
        <div className="space-y-6">
          {/* About */}
          {t.description && (
            <div>
              <h3 className="font-display font-bold text-[1.25rem] mb-3">About</h3>
              <p className="text-ink-600 text-[15px] leading-relaxed">{t.description}</p>
            </div>
          )}

          {/* Prize pool */}
          {visiblePrizes?.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-[1.25rem] mb-3">Prize pool</h3>
              <div className="card overflow-hidden divide-y divide-divider">
                {visiblePrizes.map(p => (
                  <div key={p.id} className={`flex items-center justify-between px-5 py-4 ${p.is_highlight ? 'bg-brass-tint' : ''}`}>
                    <div>
                      <div className="font-semibold text-[15px]">{p.position_label}</div>
                      {p.note && <div className="text-[12px] text-ink-500 mt-0.5">{p.note}</div>}
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-[18px] tabular-nums">PKR {Number(p.amount).toLocaleString()}</div>
                      {p.count > 1 && <div className="text-[12px] text-ink-500">&times; {p.count}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Venue */}
          {(t.venue || t.city) && (
            <div>
              <h3 className="font-display font-bold text-[1.25rem] mb-3">Venue</h3>
              <div className="card p-4 space-y-1.5 text-[14px]">
                {t.venue && <div className="font-semibold">{t.venue}</div>}
                {t.city && <div className="text-ink-500">{t.city}, Pakistan</div>}
                {t.address && <div className="text-ink-500">{t.address}</div>}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Schedule */}
          {(t.start_date || t.end_date) && (
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

          {/* Organizers / Contacts */}
          {t.organizers?.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-[1.25rem] mb-3">Contacts</h3>
              <div className="card divide-y divide-divider">
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
        </div>
      </div>
    </div>
  );
}

function groupAwards(list) {
  const map = new Map();
  for (const a of list) {
    const key = `${a.player_id}-${a.prize_id || a.category}`;
    if (map.has(key)) {
      const g = map.get(key);
      g.ids.push(a.id);
      g.count += 1;
      g.totalAmount += Number(a.amount || 0);
    } else {
      map.set(key, { ...a, ids: [a.id], count: 1, totalAmount: Number(a.amount || 0) });
    }
  }
  const order = (a) => {
    if (a.category === 'tournament_winner') return 0;
    if (a.category === 'tournament_runner_up') return 1;
    return 2;
  };
  return [...map.values()].sort((a, b) => order(a) - order(b));
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
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-2 gap-y-0">
      {data.map((entry) => (
        <PlayerCard
          key={entry.id}
          player={entry.player}
          seed={entry.seed}
        />
      ))}
    </div>
  );
}

