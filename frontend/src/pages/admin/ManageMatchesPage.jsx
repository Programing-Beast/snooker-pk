import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetTournamentQuery, useGetTournamentDrawQuery, useGetQualifierPoolQuery } from '../../store/api/tournamentsApi';
import { useUpdateMatchMutation, useWalkoverMatchMutation, useCompleteMatchMutation, useDeclareWinnerMutation, useAssignUmpireMutation, useCreateQualifierMatchMutation, useDeleteQualifierMatchMutation, useGenerateQualifierDrawMutation } from '../../store/api/matchesApi';
import { useGetUmpireUsersQuery } from '../../store/api/usersApi';
import MatchRow from '../../components/ui/MatchRow';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal, { ModalBody, ModalFooter } from '../../components/ui/Modal';
import PlayerAvatar from '../../components/ui/PlayerAvatar';
import RoundHeader from '../../components/ui/RoundHeader';
import TournamentSubNav from '../../components/admin/TournamentSubNav';

export default function ManageMatchesPage() {
  const { id } = useParams();
  const { data: tournament } = useGetTournamentQuery(id);
  const { data: drawData, isLoading, refetch: refetchDraw } = useGetTournamentDrawQuery(id);
  const [updateMatch] = useUpdateMatchMutation();
  const [walkoverMatch] = useWalkoverMatchMutation();
  const [completeMatch] = useCompleteMatchMutation();
  const [declareWinner] = useDeclareWinnerMutation();
  const [assignUmpire] = useAssignUmpireMutation();
  const [createQualifierMatch] = useCreateQualifierMatchMutation();
  const [deleteQualifierMatch] = useDeleteQualifierMatchMutation();
  const [generateQualifierDraw] = useGenerateQualifierDrawMutation();
  const { data: umpireUsers = [] } = useGetUmpireUsersQuery();

  const [editMatch, setEditMatch] = useState(null);
  const [editForm, setEditForm] = useState({ scheduled_at: '', table_no: '', youtube_url: '', facebook_url: '' });
  const [saving, setSaving] = useState(false);

  // Set Score modal state
  const [scoreMatch, setScoreMatch] = useState(null);
  const [scoreForm, setScoreForm] = useState({ score1: '', score2: '' });
  const [scoreError, setScoreError] = useState('');
  const [scoreSaving, setScoreSaving] = useState(false);

  // Declare Winner modal state
  const [declareMatch, setDeclareMatch] = useState(null);
  const [declareForm, setDeclareForm] = useState({ loserScore: '' });
  const [declareSaving, setDeclareSaving] = useState(false);

  // Assign Umpire modal state
  const [assignMatch, setAssignMatch] = useState(null);
  const [selectedUmpireId, setSelectedUmpireId] = useState('');
  const [assignSaving, setAssignSaving] = useState(false);

  // Qualifier match creation state
  const [qualifierRoundId, setQualifierRoundId] = useState(null);
  const [qPlayer1, setQPlayer1] = useState('');
  const [qPlayer2, setQPlayer2] = useState('');
  const [qCreating, setQCreating] = useState(false);

  function openEdit(match) {
    setEditMatch(match);
    setEditForm({
      scheduled_at: match.scheduled_at || '',
      table_no: match.table_no || '',
      youtube_url: match.youtube_url || '',
      facebook_url: match.facebook_url || '',
    });
  }

  async function saveMatch() {
    if (!editMatch) return;
    setSaving(true);
    try {
      await updateMatch({ id: editMatch.id, data: editForm, tournamentId: id }).unwrap();
      setEditMatch(null);
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function handleWalkover(matchId, winnerId) {
    await walkoverMatch({ id: matchId, data: { winner_id: winnerId }, tournamentId: id }).unwrap();
  }

  async function handleComplete(matchId) {
    await completeMatch({ id: matchId, tournamentId: id }).unwrap();
  }

  // Set Score modal helpers
  function openScoreModal(match, round) {
    setScoreMatch({ ...match, frames_to_win: round.frames_to_win });
    setScoreForm({ score1: match.score1 ?? '', score2: match.score2 ?? '' });
    setScoreError('');
  }

  async function saveScore() {
    if (!scoreMatch) return;
    const s1 = parseInt(scoreForm.score1, 10);
    const s2 = parseInt(scoreForm.score2, 10);
    const ftw = scoreMatch.frames_to_win;
    const bestOf = ftw ? ftw * 2 - 1 : null;

    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) {
      setScoreError('Enter valid scores for both players.');
      return;
    }
    if (ftw && s1 < ftw && s2 < ftw) {
      setScoreError(`At least one player must reach ${ftw} frames to win.`);
      return;
    }
    if (ftw && s1 > ftw) {
      setScoreError(`${scoreMatch.player1?.name} score cannot exceed ${ftw}.`);
      return;
    }
    if (ftw && s2 > ftw) {
      setScoreError(`${scoreMatch.player2?.name} score cannot exceed ${ftw}.`);
      return;
    }
    if (ftw && s1 === ftw && s2 === ftw) {
      setScoreError('Both players cannot reach frames to win.');
      return;
    }
    if (bestOf && s1 + s2 > bestOf) {
      setScoreError(`Total frames cannot exceed ${bestOf} (best of ${bestOf}).`);
      return;
    }

    setScoreSaving(true);
    try {
      await updateMatch({ id: scoreMatch.id, data: { score1: s1, score2: s2 }, tournamentId: id }).unwrap();
      await completeMatch({ id: scoreMatch.id, tournamentId: id }).unwrap();
      setScoreMatch(null);
    } catch (err) {
      setScoreError(err.data?.message || 'Failed to complete match.');
    }
    setScoreSaving(false);
  }

  // Declare Winner helpers
  function openDeclareModal(match, round) {
    setDeclareMatch({ ...match, frames_to_win: round.frames_to_win });
    setDeclareForm({ loserScore: '' });
  }

  async function handleDeclareWinner(winnerId) {
    if (!declareMatch) return;
    setDeclareSaving(true);
    try {
      const ftw = declareMatch.frames_to_win;
      const isP1Winner = winnerId === declareMatch.player1?.id;
      const loserScore = parseInt(declareForm.loserScore, 10);
      const loserVal = isNaN(loserScore) || loserScore < 0 ? 0 : (ftw ? Math.min(loserScore, ftw - 1) : loserScore);
      const payload = {
        winner_id: winnerId,
        score1: isP1Winner ? (ftw || 0) : loserVal,
        score2: isP1Winner ? loserVal : (ftw || 0),
      };

      await declareWinner({ id: declareMatch.id, data: payload, tournamentId: id }).unwrap();
      setDeclareMatch(null);
    } catch { /* ignore */ }
    setDeclareSaving(false);
  }

  function openAssignModal(match) {
    setAssignMatch(match);
    setSelectedUmpireId(match.umpire?.id ?? '');
  }

  async function handleAssignUmpire() {
    if (!assignMatch || !selectedUmpireId) return;
    setAssignSaving(true);
    try {
      await assignUmpire({ id: assignMatch.id, data: { umpire_id: Number(selectedUmpireId) }, tournamentId: id }).unwrap();
      setAssignMatch(null);
    } catch { /* ignore */ }
    setAssignSaving(false);
  }

  // Qualifier match creation
  async function handleCreateQualifierMatch(roundId) {
    if (!qPlayer1 || !qPlayer2) return;
    setQCreating(true);
    try {
      await createQualifierMatch({
        tournament_id: Number(id),
        round_id: roundId,
        player1_id: Number(qPlayer1),
        player2_id: Number(qPlayer2),
      }).unwrap();
      setQPlayer1('');
      setQPlayer2('');
      refetchDraw();
    } catch { /* ignore */ }
    setQCreating(false);
  }

  async function handleDeleteQualifierMatch(matchId) {
    try {
      await deleteQualifierMatch(matchId, { tournamentId: id }).unwrap();
      refetchDraw();
    } catch { /* ignore */ }
  }

  async function handleGenerateQualifierDraw(roundId) {
    try {
      await generateQualifierDraw({
        tournament_id: Number(id),
        round_id: roundId,
      }).unwrap();
      refetchDraw();
    } catch { /* ignore */ }
  }

  const rounds = Array.isArray(drawData) ? drawData : (drawData?.rounds || []);

  return (
    <div>
      <TournamentSubNav tournament={tournament} />
      <div className="mb-6">
        <h1 className="font-display font-bold text-[1.5rem]">Manage matches</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted">Loading...</div>
      ) : rounds.length === 0 ? (
        <EmptyState title="No rounds or matches found" message="Generate a draw first." />
      ) : (
        <div className="space-y-6">
          {rounds.map(round => (
            <div key={round.id} className="card overflow-hidden">
              <RoundHeader round={round}>
                {round.is_qualifier && (
                  <span className="badge bg-felt text-white text-[9px] ml-2">Qualifier</span>
                )}
              </RoundHeader>

              {/* Qualifier: add match UI */}
              {round.is_qualifier && (
                <QualifierAddMatch
                  tournamentId={id}
                  round={round}
                  onCreateMatch={handleCreateQualifierMatch}
                  onGenerateDraw={handleGenerateQualifierDraw}
                  qPlayer1={qualifierRoundId === round.id ? qPlayer1 : ''}
                  qPlayer2={qualifierRoundId === round.id ? qPlayer2 : ''}
                  setQPlayer1={(v) => { setQualifierRoundId(round.id); setQPlayer1(v); }}
                  setQPlayer2={(v) => { setQualifierRoundId(round.id); setQPlayer2(v); }}
                  creating={qCreating && qualifierRoundId === round.id}
                />
              )}

              {round.matches?.map((m, i) => {
                const isCompleted = m.status === 'completed' || m.status === 'walkover';
                const isActive = !isCompleted && m.player1 && m.player2;
                const hasBothPlayers = m.player1 && m.player2;

                return (
                  <MatchRow
                    key={m.id}
                    match={m}
                    index={i + 1}
                    onEdit={() => openEdit(m)}
                    adminActions={hasBothPlayers ? (
                      <>
                        {isActive && (
                          <>
                            <Link to={`/umpire/${m.id}`} className="btn btn-primary btn-sm text-[11px]">Scoreboard</Link>
                            <button className="btn btn-ghost btn-sm text-[11px]" onClick={() => handleWalkover(m.id, m.player1.id)}>W/O → {m.player1.name?.split(' ').pop()}</button>
                            <button className="btn btn-ghost btn-sm text-[11px]" onClick={() => handleWalkover(m.id, m.player2.id)}>W/O → {m.player2.name?.split(' ').pop()}</button>
                            <button className="btn btn-ghost btn-sm text-[11px] text-felt" onClick={() => openScoreModal(m, round)}>Set Score</button>
                            <button className="btn btn-ghost btn-sm text-[11px] text-felt" onClick={() => openDeclareModal(m, round)}>Declare Winner</button>
                            <button className="btn btn-ghost btn-sm text-[11px] text-felt" onClick={() => handleComplete(m.id)}>Complete</button>
                          </>
                        )}
                        {isCompleted && (
                          <button className="btn btn-ghost btn-sm text-[11px]" onClick={() => openEdit(m)}>Edit</button>
                        )}
                        <button className="btn btn-ghost btn-sm text-[11px] ml-auto flex items-center gap-1.5" onClick={() => openAssignModal(m)}>
                          {m.umpire ? (
                            <>
                              <PlayerAvatar name={m.umpire.name} size="sm" />
                              <span className="text-felt font-semibold">{m.umpire.name}</span>
                              <span className="text-muted">(umpire)</span>
                            </>
                          ) : (
                            <span className="text-muted">Assign Umpire</span>
                          )}
                        </button>
                        {round.is_qualifier && m.status === 'scheduled' && (
                          <button
                            className="btn btn-ghost btn-sm text-[11px] text-bad"
                            onClick={() => handleDeleteQualifierMatch(m.id)}
                          >
                            Delete
                          </button>
                        )}
                      </>
                    ) : round.is_qualifier && m.status === 'scheduled' ? (
                      <button
                        className="btn btn-ghost btn-sm text-[11px] text-bad"
                        onClick={() => handleDeleteQualifierMatch(m.id)}
                      >
                        Delete
                      </button>
                    ) : null}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      <Modal open={!!editMatch} onClose={() => setEditMatch(null)}>
        <ModalBody>
          <h3 className="font-display font-bold text-[18px] mb-4">Edit match</h3>
          <div className="space-y-4">
            <Input label="Scheduled date/time" type="datetime-local" value={editForm.scheduled_at} onChange={e => setEditForm(f => ({ ...f, scheduled_at: e.target.value }))} />
            <Input label="Table number" value={editForm.table_no} onChange={e => setEditForm(f => ({ ...f, table_no: e.target.value }))} placeholder="1" />
            <Input label="YouTube URL" value={editForm.youtube_url} onChange={e => setEditForm(f => ({ ...f, youtube_url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." />
            <Input label="Facebook URL" value={editForm.facebook_url} onChange={e => setEditForm(f => ({ ...f, facebook_url: e.target.value }))} placeholder="https://facebook.com/watch/..." />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setEditMatch(null)}>Cancel</Button>
          <Button size="sm" onClick={saveMatch} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </ModalFooter>
      </Modal>

      {/* Set Score modal */}
      <Modal open={!!scoreMatch} onClose={() => setScoreMatch(null)}>
        <ModalBody>
          <h3 className="font-display font-bold text-[18px] mb-4">Set Score & Complete</h3>
          {scoreMatch && (
            <div className="space-y-4">
              <Input
                label={scoreMatch.player1?.name || 'Player 1'}
                type="number"
                min="0"
                max={scoreMatch.frames_to_win || undefined}
                value={scoreForm.score1}
                onChange={e => setScoreForm(f => ({ ...f, score1: e.target.value }))}
              />
              <Input
                label={scoreMatch.player2?.name || 'Player 2'}
                type="number"
                min="0"
                max={scoreMatch.frames_to_win || undefined}
                value={scoreForm.score2}
                onChange={e => setScoreForm(f => ({ ...f, score2: e.target.value }))}
              />
              {scoreMatch.frames_to_win && (
                <p className="text-[12px] text-muted">Best of {scoreMatch.frames_to_win * 2 - 1} · First to {scoreMatch.frames_to_win}</p>
              )}
              {scoreError && <p className="text-[12px] text-red-500">{scoreError}</p>}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setScoreMatch(null)}>Cancel</Button>
          <Button size="sm" onClick={saveScore} disabled={scoreSaving}>{scoreSaving ? 'Saving...' : 'Save & Complete'}</Button>
        </ModalFooter>
      </Modal>

      {/* Declare Winner modal */}
      <Modal open={!!declareMatch} onClose={() => setDeclareMatch(null)}>
        <ModalBody>
          <h3 className="font-display font-bold text-[18px] mb-4">Declare Winner</h3>
          {declareMatch && (
            <div className="space-y-4">
              {declareMatch.frames_to_win && (
                <p className="text-[12px] text-muted">Best of {declareMatch.frames_to_win * 2 - 1} · Winner gets {declareMatch.frames_to_win} frames automatically.</p>
              )}
              <Input
                label="Loser's score (optional)"
                type="number"
                min="0"
                max={declareMatch.frames_to_win ? declareMatch.frames_to_win - 1 : undefined}
                value={declareForm.loserScore}
                onChange={e => setDeclareForm(f => ({ ...f, loserScore: e.target.value }))}
                placeholder="0"
              />
              <p className="text-[12px] text-muted">Select the winner below.</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDeclareWinner(declareMatch.player1.id)}
                  disabled={declareSaving}
                >
                  {declareMatch.player1?.name}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => handleDeclareWinner(declareMatch.player2.id)}
                  disabled={declareSaving}
                >
                  {declareMatch.player2?.name}
                </Button>
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>

      {/* Assign Umpire modal */}
      <Modal open={!!assignMatch} onClose={() => setAssignMatch(null)}>
        <ModalBody>
          <h3 className="font-display font-bold text-[18px] mb-4">Assign Umpire</h3>
          {assignMatch && (
            <div className="space-y-4">
              <p className="text-[13px] text-muted">
                {assignMatch.player1?.name || 'TBD'} vs {assignMatch.player2?.name || 'TBD'}
              </p>
              <div>
                <label className="block text-[13px] font-medium mb-1">Umpire</label>
                <select
                  className="w-full rounded-md border border-interactive-border bg-interactive px-3 py-2 text-sm text-heading"
                  value={selectedUmpireId}
                  onChange={e => setSelectedUmpireId(e.target.value)}
                >
                  <option value="">Select umpire...</option>
                  {umpireUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setAssignMatch(null)}>Cancel</Button>
          <Button size="sm" onClick={handleAssignUmpire} disabled={assignSaving || !selectedUmpireId}>
            {assignSaving ? 'Saving...' : 'Save'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

function QualifierAddMatch({ tournamentId, round, onCreateMatch, onGenerateDraw, qPlayer1, qPlayer2, setQPlayer1, setQPlayer2, creating }) {
  const { data: poolData } = useGetQualifierPoolQuery(
    { tournamentId, roundId: round.id },
    { refetchOnMountOrArgChange: true }
  );
  const [generating, setGenerating] = useState(false);

  const pool = poolData?.data || [];

  async function handleAutoPair() {
    setGenerating(true);
    await onGenerateDraw(round.id);
    setGenerating(false);
  }

  if (pool.length < 2 && !qPlayer1 && !qPlayer2) {
    return (
      <div className="px-5 py-3 bg-card-alt border-b border-divider text-[13px] text-ink-500">
        {pool.length === 0 ? 'No players available in the pool.' : 'Need at least 2 players in the pool to create a match.'}
      </div>
    );
  }

  return (
    <div className="px-5 py-3 bg-card-alt border-b border-divider">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[12px] font-semibold text-ink-600">Available pool:</span>
        <span className="font-display font-bold text-felt text-[13px]">{pool.length} players</span>
        {pool.length >= 2 && (
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto text-[11px]"
            onClick={handleAutoPair}
            disabled={generating}
          >
            {generating ? 'Pairing...' : `Auto-pair all (${Math.floor(pool.length / 2)} matches)`}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <select
          className="text-[13px] border border-ink-200 rounded px-2 py-1.5 bg-white text-ink-700 min-w-[160px]"
          value={qPlayer1}
          onChange={e => setQPlayer1(e.target.value)}
        >
          <option value="">Player 1...</option>
          {pool.filter(p => String(p.id) !== String(qPlayer2)).map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <span className="text-[13px] font-bold text-ink-300">vs</span>
        <select
          className="text-[13px] border border-ink-200 rounded px-2 py-1.5 bg-white text-ink-700 min-w-[160px]"
          value={qPlayer2}
          onChange={e => setQPlayer2(e.target.value)}
        >
          <option value="">Player 2...</option>
          {pool.filter(p => String(p.id) !== String(qPlayer1)).map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <Button
          size="sm"
          onClick={() => onCreateMatch(round.id)}
          disabled={creating || !qPlayer1 || !qPlayer2}
        >
          {creating ? 'Creating...' : 'Create Match'}
        </Button>
      </div>
    </div>
  );
}
