import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as drawsApi from '../../api/draws';
import * as entriesApi from '../../api/entries';
import * as roundsApi from '../../api/rounds';
import * as tournamentsApi from '../../api/tournaments';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import PlayerChip from '../../components/ui/PlayerChip';
import DrawModeCard from '../../components/ui/DrawModeCard';
import TournamentSubNav from '../../components/admin/TournamentSubNav';

const BEST_OF_OPTIONS = [5, 7, 9, 11, 13, 17, 19, 35];
const BYE_MODES = [
  { value: 'seeds', label: 'Highest seeds (recommended)' },
  { value: 'random', label: 'Random' },
  { value: 'lowest', label: 'Lowest seeds (play-in)' },
];

function nextPow2(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function framesToWin(bestOf) {
  return Math.ceil(bestOf / 2);
}

function bestOfFromFrames(ftw) {
  return ftw * 2 - 1;
}

export default function DrawGeneratePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [drawData, setDrawData] = useState([]); // full draw rounds with matches
  const [entryCount, setEntryCount] = useState(0);
  const [selectedRoundId, setSelectedRoundId] = useState(null);
  const [drawMode, setDrawMode] = useState('fixed');
  const [bestOf, setBestOf] = useState(7);
  const [byeMode, setByeMode] = useState('seeds');
  const [generated, setGenerated] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load tournament, rounds, draw data, and entry count on mount
  useEffect(() => {
    tournamentsApi.show(id).then(res => {
      setTournament(res.data.data ?? res.data);
    }).catch(() => {});

    roundsApi.list(id).then(res => {
      const r = res.data.data ?? res.data ?? [];
      setRounds(r);
      if (r.length) {
        setSelectedRoundId(r[0].id);
        loadRoundSettings(r[0]);
      }
    }).catch(() => {});

    // Load full draw data (rounds with matches) to show existing matches
    tournamentsApi.draw(id).then(res => {
      setDrawData(res.data.data ?? res.data ?? []);
    }).catch(() => {});

    // Load approved entry count for pool size
    entriesApi.list(id, { status: 'approved', per_page: 200 }).then(res => {
      const entries = res.data.data ?? res.data ?? [];
      setEntryCount(res.data.meta?.total ?? entries.length);
    }).catch(() => {});
  }, [id]);

  function loadRoundSettings(round) {
    setDrawMode(round.draw_mode || 'fixed');
    if (round.frames_to_win) {
      setBestOf(bestOfFromFrames(round.frames_to_win));
    }
  }

  const selectedRound = rounds.find(r => r.id === selectedRoundId);
  const sortedRounds = [...rounds].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const isFirstRound = sortedRounds[0]?.id === selectedRoundId;
  const selectedRoundIdx = sortedRounds.findIndex(r => r.id === selectedRoundId);
  const prevRound = selectedRoundIdx > 0 ? sortedRounds[selectedRoundIdx - 1] : null;

  // Compute pool size: first round = approved entries, later rounds = prev round match count (= winners)
  const prevRoundDraw = prevRound ? drawData.find(r => r.id === prevRound.id) : null;
  const prevRoundMatchCount = prevRoundDraw?.matches?.length || 0;
  const poolSize = isFirstRound ? entryCount : prevRoundMatchCount;
  const poolSource = isFirstRound
    ? 'approved entrants'
    : `winners of ${prevRound?.name || 'previous round'}`;
  const byes = poolSize > 0 ? nextPow2(poolSize) - poolSize : 0;
  const matchCount = poolSize > 0 ? Math.floor(poolSize / 2) : 0;

  // Load existing matches for the selected round from draw data
  const existingRoundDraw = drawData.find(r => r.id === selectedRoundId);
  const existingMatches = existingRoundDraw?.matches?.filter(m => m.player1 || m.player2) || [];
  const existingByes = existingRoundDraw?.matches?.filter(m => m.is_bye) || [];
  const isAlreadyGenerated = selectedRound?.generated_at || existingMatches.length > 0;

  // Show existing matches OR freshly generated ones
  const displayMatches = generated
    ? (generated.matches || [])
    : existingMatches.filter(m => !m.is_bye);
  const displayByes = generated
    ? (generated.byes || [])
    : existingByes;
  const hasMatches = displayMatches.length > 0;

  function handleRoundChange(roundId) {
    setSelectedRoundId(roundId);
    setGenerated(null);
    const round = rounds.find(r => r.id === roundId);
    if (round) loadRoundSettings(round);
  }

  async function persistSetting(field, value) {
    if (!selectedRoundId) return;
    setSaving(true);
    try {
      await roundsApi.update(selectedRoundId, { [field]: value });
      setRounds(prev => prev.map(r =>
        r.id === selectedRoundId ? { ...r, [field]: value } : r
      ));
    } catch { /* ignore */ }
    setSaving(false);
  }

  function handleModeChange(mode) {
    setDrawMode(mode);
    setGenerated(null);
    persistSetting('draw_mode', mode);
  }

  function handleBestOfChange(e) {
    const bo = Number(e.target.value);
    setBestOf(bo);
    persistSetting('frames_to_win', framesToWin(bo));
  }

  async function handleGenerate() {
    if (drawMode === 'random') {
      // Save settings then navigate to reveal page
      await persistSetting('draw_mode', 'random');
      await persistSetting('frames_to_win', framesToWin(bestOf));
      navigate(`/admin/tournaments/${id}/reveal?round=${selectedRoundId}`);
      return;
    }

    setGenerating(true);
    setError('');
    try {
      if (selectedRoundId) {
        await persistSetting('draw_mode', drawMode);
        await persistSetting('frames_to_win', framesToWin(bestOf));
      }
      const payload = { tournament_id: Number(id), mode: drawMode };
      if (selectedRoundId) payload.round_id = selectedRoundId;
      const res = await drawsApi.generate(payload);
      setGenerated(res.data.data ?? res.data);
      // Refresh rounds (may have been auto-created) and draw data
      roundsApi.list(id).then(res => {
        const r = res.data.data ?? res.data ?? [];
        setRounds(r);
        if (r.length && !selectedRoundId) {
          setSelectedRoundId(r[0].id);
          loadRoundSettings(r[0]);
        }
      }).catch(() => {});
      tournamentsApi.draw(id).then(r => setDrawData(r.data.data ?? r.data ?? [])).catch(() => {});
    } catch (err) {
      const msg = err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat()[0] || 'Failed to generate draw.';
      setError(msg);
    }
    setGenerating(false);
  }

  async function handleConfirm() {
    setConfirming(true);
    try {
      await drawsApi.confirm({ tournament_id: Number(id), round_id: selectedRoundId });
      setGenerated(null);
      // Refresh rounds and draw data to pick up generated_at timestamp
      roundsApi.list(id).then(res => setRounds(res.data.data ?? res.data ?? [])).catch(() => {});
      tournamentsApi.draw(id).then(r => setDrawData(r.data.data ?? r.data ?? [])).catch(() => {});
    } catch { /* ignore */ }
    setConfirming(false);
  }

  function handleClear() {
    setGenerated(null);
  }

  return (
    <div>
      <TournamentSubNav tournament={tournament} />
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="font-display font-extrabold uppercase text-[28px] leading-none">Generate draw</h1>
          <p className="text-ink-500 text-[14px] mt-1.5">
            Choose the draw mode <b>per round</b> at generation time.{' '}
            {isFirstRound
              ? 'Round 1 pairs the approved entrants.'
              : 'Later rounds pair the winners of the previous round.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-bad-tint text-bad text-[13px] px-4 py-3 rounded-md mb-4 flex items-center justify-between">
          {error}
          <button onClick={() => setError('')} className="text-bad/60 hover:text-bad font-bold ml-3">×</button>
        </div>
      )}

      {/* 2-column layout */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left column — config cards */}
        <div className="space-y-5">
          {/* Card 1: Round selector */}
          <div className="card p-5">
            <div className="seclabel text-felt mb-3">1 · Round</div>
            {rounds.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-3">
                {rounds.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleRoundChange(r.id)}
                    className={`px-3.5 py-2 rounded-md text-[13px] font-display font-semibold transition flex items-center gap-1.5 ${
                      r.id === selectedRoundId
                        ? 'bg-felt text-white'
                        : 'bg-card-alt text-ink-600 hover:text-ink-900'
                    }`}
                  >
                    {r.name}
                    {r.generated_at && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={r.id === selectedRoundId ? 'text-white/70' : 'text-ok'}>
                        <path d="M5 12l5 5L20 6" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-muted mb-3">Rounds will be created automatically based on the number of approved players.</p>
            )}
            {poolSize > 0 && (
              <div className="flex items-center gap-2 rounded-md bg-card-alt px-3.5 py-2.5 text-[13px]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-felt shrink-0">
                  <path d="M12 2v6m0 0l3-3m-3 3L9 5" /><circle cx="12" cy="15" r="6" />
                </svg>
                <span className="text-ink-600">Pool for this round:</span>
                <b className="text-heading">{poolSource}</b>
                <span className="ml-auto font-display font-bold text-felt tabular-nums">{poolSize} players</span>
              </div>
            )}
          </div>

          {/* Card 2: Draw mode */}
          <div className="card p-5">
            <div className="seclabel text-felt mb-3">
              2 · Draw mode <span className="text-muted font-sans normal-case tracking-normal">· per round</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <DrawModeCard
                selected={drawMode === 'fixed'}
                onClick={() => handleModeChange('fixed')}
                title="Fixed pairing"
                description="Pair the whole pool at once using seeds. Instant, deterministic bracket."
                icon={<path d="M3 6h7v4H3zM3 14h7v4H3zM14 6h7v4h-7zM14 14h7v4h-7z" />}
              />
              <DrawModeCard
                selected={drawMode === 'random'}
                onClick={() => handleModeChange('random')}
                title="Random reveal"
                description="Reveal one match at a time with a live spin. Confirm or re-roll each pairing."
                icon={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}
              />
            </div>
          </div>

          {/* Card 3: Round settings */}
          <div className="card p-5">
            <div className="seclabel text-felt mb-3">3 · Round settings</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="lbl">Frames — best of</label>
                <div className="flex items-center gap-2">
                  <select
                    value={bestOf}
                    onChange={handleBestOfChange}
                    className="input !py-2 !w-24 appearance-none text-center"
                  >
                    {BEST_OF_OPTIONS.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <span className="text-[13px] text-ink-500">
                    → first to <b className="text-body">{framesToWin(bestOf)}</b> frames
                  </span>
                </div>
              </div>
              <div>
                <label className="lbl">
                  Assign byes to{' '}
                  {byes > 0
                    ? <span className="text-muted">({byes})</span>
                    : <span className="text-muted">(none needed)</span>}
                </label>
                <Select
                  value={byeMode}
                  onChange={e => setByeMode(e.target.value)}
                  disabled={byes === 0}
                  className={byes === 0 ? 'opacity-50' : ''}
                >
                  {BYE_MODES.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Card 4: Generated output */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="seclabel text-felt">
                {isAlreadyGenerated && !generated ? 'Current draw' : 'Generated matches'}
              </div>
              {generated && (
                <button onClick={handleClear} className="text-[12.5px] font-semibold text-ink-500 hover:text-bad">
                  Clear
                </button>
              )}
            </div>

            {hasMatches ? (
              <div className="card overflow-hidden">
                {/* Dark header */}
                <div className="px-5 py-3 bg-night text-white flex items-center gap-3">
                  <span className="font-display font-bold uppercase tracking-[0.1em] text-[13px]">
                    {selectedRound?.name}
                  </span>
                  <span className="seclabel text-ink-400 !text-[10px]">
                    Best of {bestOf} · first to {framesToWin(bestOf)}
                  </span>
                  <span className="ml-auto text-[11px] text-ink-400">
                    {displayMatches.length} matches · {displayByes.length} byes
                  </span>
                </div>

                {/* Match rows */}
                {displayMatches.map((m, i) => (
                  <div
                    key={m.id || m.position || i}
                    className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-3 px-5 py-3 border-b border-divider last:border-0"
                  >
                    <span className="font-display font-semibold text-ink-300 tabular-nums w-5 text-center">
                      {i + 1}
                    </span>
                    <div className="flex justify-start">
                      <PlayerChip player={m.player1} />
                    </div>
                    <span className="font-display font-bold text-ink-300 text-[13px]">v</span>
                    <div className="flex justify-end">
                      <PlayerChip player={m.player2} />
                    </div>
                  </div>
                ))}

                {/* Bye rows */}
                {displayByes.map((p, i) => {
                  const player = p.player1 || p;
                  return (
                    <div
                      key={`bye-${i}`}
                      className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-3 px-5 py-3 border-b border-divider last:border-0 bg-card-alt/50"
                    >
                      <span className="font-display font-semibold text-ink-300 tabular-nums w-5 text-center">—</span>
                      <div className="flex justify-start">
                        <PlayerChip player={player} />
                      </div>
                      <span className="badge bg-ink-100 text-ink-500 !text-[9px]">Bye</span>
                      <div className="text-right text-[12px] text-muted italic">advances</div>
                    </div>
                  );
                })}

                {/* Footer: published vs unpublished */}
                {selectedRound?.generated_at && !generated ? (
                  <div className="flex items-center gap-2 px-5 py-3 bg-card-alt border-t border-divider">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-ok shrink-0">
                      <path d="M5 12l5 5L20 6" />
                    </svg>
                    <span className="text-[13px] text-ink-600 font-semibold">Published</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto"
                      onClick={handleGenerate}
                      disabled={generating}
                    >
                      {generating ? 'Regenerating...' : 'Re-generate'}
                    </Button>
                  </div>
                ) : generated ? (
                  <div className="flex items-center gap-2 px-5 py-3 bg-ok-tint border-t border-ok/20">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-ok shrink-0">
                      <path d="M5 12l5 5L20 6" />
                    </svg>
                    <span className="text-[13px] text-[#0C6B3C] font-semibold">Draw generated.</span>
                    <Button
                      size="sm"
                      className="ml-auto"
                      onClick={handleConfirm}
                      disabled={confirming}
                    >
                      {confirming ? 'Publishing...' : 'Publish round'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-5 py-3 bg-warn-tint border-t border-warn/20">
                    <span className="text-[13px] text-[#9A5B12] font-semibold">Not yet published.</span>
                    <Button
                      size="sm"
                      className="ml-auto"
                      onClick={handleConfirm}
                      disabled={confirming}
                    >
                      {confirming ? 'Publishing...' : 'Publish round'}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="card border-dashed grid place-items-center text-center py-14">
                <div>
                  <div className="w-14 h-14 rounded-full bg-card-alt grid place-items-center mb-3 text-ink-300 mx-auto">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M3 6h7v12H3zM14 9h7v6h-7z" /><path d="M10 12h4" />
                    </svg>
                  </div>
                  <div className="font-display font-bold text-ink-700">No matches generated yet</div>
                  <p className="text-muted text-[13px] mt-1">
                    Configure the round above, then {drawMode === 'fixed' ? 'generate the pairing.' : 'launch the live reveal.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column — Sticky sidebar */}
        <div className="card overflow-hidden sticky top-[76px]">
          <div className="px-5 py-3.5 bg-night text-white">
            <div className="seclabel text-ink-300 !text-[10px]">
              {isAlreadyGenerated ? 'Round summary' : 'Pre-generation summary'}
            </div>
            <div className="font-display font-bold text-[16px] mt-0.5">
              {selectedRound?.name || 'Select a round'}
            </div>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-500">Pool size</span>
              <span className="font-display font-bold tabular-nums text-[15px]">{poolSize}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-500">Matches</span>
              <span className="font-display font-bold tabular-nums text-[15px] text-felt">{matchCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-500">Byes</span>
              <span className={`font-display font-bold tabular-nums text-[15px] ${byes > 0 ? 'text-warn' : ''}`}>{byes}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-divider">
              <span className="text-[13px] text-ink-500">Advance to next</span>
              <span className="font-display font-bold tabular-nums text-[15px]">{matchCount + byes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-500">Format</span>
              <span className="font-display font-semibold text-[13px]">Best of {bestOf}</span>
            </div>

            {/* Mode badge */}
            <div className="rounded-md bg-card-alt px-3 py-2 text-[12px] text-ink-500 flex items-center gap-2">
              <span className={`badge ${drawMode === 'fixed' ? 'bg-felt text-white' : 'bg-brass-tint text-brass-700'} !text-[9px]`}>
                {drawMode === 'fixed' ? 'Fixed' : 'Random'}
              </span>
              {drawMode === 'fixed' ? 'Pairs instantly on generate.' : 'Opens the live reveal screen.'}
            </div>

            {/* Action button */}
            {drawMode === 'fixed' ? (
              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={generating || (rounds.length > 0 && !selectedRoundId)}
              >
                {generating ? 'Generating...' : isAlreadyGenerated ? 'Re-generate pairing' : 'Generate pairing'}
              </Button>
            ) : (
              <Button
                variant="brass"
                className="w-full"
                onClick={handleGenerate}
                disabled={rounds.length > 0 && !selectedRoundId}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                  <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                </svg>
                Launch live reveal
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
