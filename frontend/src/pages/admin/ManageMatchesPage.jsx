import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as tournamentsApi from '../../api/tournaments';
import * as matchesApi from '../../api/matches';
import * as roundsApi from '../../api/rounds';
import MatchRow from '../../components/ui/MatchRow';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal, { ModalBody, ModalFooter } from '../../components/ui/Modal';
import TournamentSubNav from '../../components/admin/TournamentSubNav';

export default function ManageMatchesPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [drawData, setDrawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMatch, setEditMatch] = useState(null);
  const [editForm, setEditForm] = useState({ scheduled_at: '', table_no: '' });
  const [saving, setSaving] = useState(false);

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

  const rounds = drawData?.rounds || [];

  return (
    <div>
      <TournamentSubNav tournament={tournament} />
      <div className="mb-6">
        <h1 className="font-display font-bold text-[1.5rem]">Manage matches</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-ink-400">Loading...</div>
      ) : rounds.length === 0 ? (
        <div className="card p-8 text-center text-ink-400">No rounds or matches found. Generate a draw first.</div>
      ) : (
        <div className="space-y-6">
          {rounds.map(round => (
            <div key={round.id} className="card overflow-hidden">
              <div className="px-[18px] py-3 bg-night text-white font-display font-semibold text-[12px] tracking-[0.12em] uppercase flex items-center gap-3">
                {round.name}
                {round.frames_to_win && <span className="text-ink-400 font-medium normal-case tracking-normal">· Best of {round.frames_to_win * 2 - 1}</span>}
                <span className="ml-auto text-ink-400 font-medium normal-case tracking-normal">{round.matches?.length || 0} matches</span>
              </div>
              {round.matches?.map(m => (
                <div key={m.id}>
                  <MatchRow match={m} />
                  {/* Admin actions row */}
                  <div className="flex items-center gap-2 px-[18px] py-2 border-b border-hairline bg-surface2">
                    <button className="btn btn-ghost btn-sm text-[11px]" onClick={() => openEdit(m)}>Schedule / Table</button>
                    {m.status !== 'completed' && m.player1 && m.player2 && (
                      <>
                        <button className="btn btn-ghost btn-sm text-[11px]" onClick={() => handleWalkover(m.id, m.player1.id)}>W/O → {m.player1.name?.split(' ').pop()}</button>
                        <button className="btn btn-ghost btn-sm text-[11px]" onClick={() => handleWalkover(m.id, m.player2.id)}>W/O → {m.player2.name?.split(' ').pop()}</button>
                        <button className="btn btn-ghost btn-sm text-[11px] text-felt" onClick={() => handleComplete(m.id)}>Complete</button>
                      </>
                    )}
                    {m.umpire && <span className="ml-auto text-[11px] text-ink-400">Umpire: {m.umpire.name}</span>}
                    {!m.umpire && m.status !== 'completed' && (
                      <span className="ml-auto text-[11px] text-ink-400 italic">No umpire assigned</span>
                    )}
                  </div>
                </div>
              ))}
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
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setEditMatch(null)}>Cancel</Button>
          <Button size="sm" onClick={saveMatch} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
