import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as tournamentsApi from '../../api/tournaments';
import * as matchesApi from '../../api/matches';
import * as roundsApi from '../../api/rounds';
import MatchRow from '../../components/ui/MatchRow';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal, { ModalBody, ModalFooter } from '../../components/ui/Modal';
import RoundHeader from '../../components/ui/RoundHeader';
import TournamentSubNav from '../../components/admin/TournamentSubNav';

export default function ManageMatchesPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [drawData, setDrawData] = useState(null);
  const [loading, setLoading] = useState(true);
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
  const [declareForm, setDeclareForm] = useState({ score1: '', score2: '' });
  const [declareSaving, setDeclareSaving] = useState(false);

  function loadData() {
    tournamentsApi.draw(id).then(res => setDrawData(res.data.data ?? res.data)).catch(() => {});
  }

  useEffect(() => {
    tournamentsApi.show(id).then(res => setTournament(res.data.data ?? res.data)).catch(() => {});
    loadData();
    setLoading(false);
  }, [id]);

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
      await matchesApi.update(editMatch.id, editForm);
      loadData();
      setEditMatch(null);
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function handleWalkover(matchId, winnerId) {
    await matchesApi.walkover(matchId, { winner_id: winnerId });
    loadData();
  }

  async function handleComplete(matchId) {
    await matchesApi.complete(matchId);
    loadData();
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
      await matchesApi.update(scoreMatch.id, { score1: s1, score2: s2 });
      await matchesApi.complete(scoreMatch.id);
      loadData();
      setScoreMatch(null);
    } catch (err) {
      setScoreError(err.response?.data?.message || 'Failed to complete match.');
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
      const payload = { winner_id: winnerId };

      // Auto-set scores: winner gets frames_to_win, loser gets entered score or 0
      const loserScore = parseInt(declareForm.loserScore, 10);
      const loserVal = isNaN(loserScore) || loserScore < 0 ? 0 : (ftw ? Math.min(loserScore, ftw - 1) : loserScore);
      payload.score1 = isP1Winner ? (ftw || 0) : loserVal;
      payload.score2 = isP1Winner ? loserVal : (ftw || 0);

      await matchesApi.declareWinner(declareMatch.id, payload);
      loadData();
      setDeclareMatch(null);
    } catch { /* ignore */ }
    setDeclareSaving(false);
  }

  const rounds = Array.isArray(drawData) ? drawData : (drawData?.rounds || []);

  return (
    <div>
      <TournamentSubNav tournament={tournament} />
      <div className="mb-6">
        <h1 className="font-display font-bold text-[1.5rem]">Manage matches</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Loading...</div>
      ) : rounds.length === 0 ? (
        <EmptyState title="No rounds or matches found" message="Generate a draw first." />
      ) : (
        <div className="space-y-6">
          {rounds.map(round => (
            <div key={round.id} className="card overflow-hidden">
              <RoundHeader name={round.name} subtitle={round.frames_to_win ? `Best of ${round.frames_to_win * 2 - 1}` : undefined} detail={`${round.matches?.length || 0} matches`} />
              {round.matches?.map((m, i) => {
                const isActive = m.status !== 'completed' && m.status !== 'walkover' && m.player1 && m.player2;
                return (
                  <MatchRow
                    key={m.id}
                    match={m}
                    index={i + 1}
                    onEdit={() => openEdit(m)}
                    adminActions={isActive ? (
                      <>
                        <button className="btn btn-ghost btn-sm text-[11px]" onClick={() => handleWalkover(m.id, m.player1.id)}>W/O → {m.player1.name?.split(' ').pop()}</button>
                        <button className="btn btn-ghost btn-sm text-[11px]" onClick={() => handleWalkover(m.id, m.player2.id)}>W/O → {m.player2.name?.split(' ').pop()}</button>
                        <button className="btn btn-ghost btn-sm text-[11px] text-felt" onClick={() => openScoreModal(m, round)}>Set Score</button>
                        <button className="btn btn-ghost btn-sm text-[11px] text-felt" onClick={() => openDeclareModal(m, round)}>Declare Winner</button>
                        <button className="btn btn-ghost btn-sm text-[11px] text-felt" onClick={() => handleComplete(m.id)}>Complete</button>
                        {m.umpire && <span className="ml-auto text-[11px] text-muted">Umpire: {m.umpire.name}</span>}
                        {!m.umpire && <span className="ml-auto text-[11px] text-muted italic">No umpire assigned</span>}
                      </>
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
    </div>
  );
}
