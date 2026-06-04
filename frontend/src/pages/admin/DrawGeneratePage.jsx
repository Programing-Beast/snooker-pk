import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as drawsApi from '../../api/draws';
import * as roundsApi from '../../api/rounds';
import * as tournamentsApi from '../../api/tournaments';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import MatchRow from '../../components/ui/MatchRow';
import EmptyState from '../../components/ui/EmptyState';

export default function DrawGeneratePage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState('');
  const [preview, setPreview] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    tournamentsApi.show(id).then(res => {
      const t = res.data.data ?? res.data;
      setTournament(t);
    }).catch(() => {});
    roundsApi.list(id).then(res => {
      const r = res.data.data ?? res.data ?? [];
      setRounds(r);
      if (r.length) setSelectedRound(r[0].id);
    }).catch(() => {});
  }, [id]);

  async function loadPreview() {
    try {
      const res = await drawsApi.preview(id);
      setPreview(res.data.data ?? res.data);
    } catch { /* ignore */ }
  }

  async function generate() {
    setGenerating(true);
    try {
      const round = rounds.find(r => r.id === Number(selectedRound));
      const res = await drawsApi.generate({
        tournament_id: Number(id),
        round_id: Number(selectedRound),
        mode: round?.draw_mode || 'fixed',
      });
      setPreview(res.data.data ?? res.data);
    } catch { /* ignore */ }
    setGenerating(false);
  }

  async function confirmDraw() {
    setConfirming(true);
    try {
      await drawsApi.confirm({ tournament_id: Number(id) });
      setPreview(null);
      loadPreview();
    } catch { /* ignore */ }
    setConfirming(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="seclabel text-felt mb-1.5">Admin</div>
          <h1 className="font-display font-bold text-[1.5rem]">Generate draw</h1>
          {tournament && <p className="text-ink-500 text-[14px] mt-1">{tournament.name}</p>}
        </div>
        <Link to={`/admin/tournaments/${id}/reveal`} className="btn btn-brass btn-sm">Live reveal →</Link>
      </div>

      {/* Round selection */}
      <div className="card p-5 mb-6 max-w-lg">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-end">
          <Select label="Round" value={selectedRound} onChange={e => setSelectedRound(e.target.value)}>
            {rounds.map(r => <option key={r.id} value={r.id}>{r.name} ({r.draw_mode})</option>)}
          </Select>
          <Button onClick={loadPreview} variant="secondary">Preview</Button>
          <Button onClick={generate} disabled={generating}>{generating ? 'Generating...' : 'Generate'}</Button>
        </div>
      </div>

      {/* Preview */}
      {preview?.matches?.length > 0 ? (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="px-[18px] py-3 bg-night text-white font-display font-semibold text-[12px] tracking-[0.12em] uppercase">
              Draw preview
            </div>
            {preview.matches.map((m, i) => <MatchRow key={m.id || m.position} match={m} index={i + 1} />)}
          </div>
          <div className="flex gap-3">
            <Button onClick={confirmDraw} disabled={confirming}>{confirming ? 'Confirming...' : 'Confirm draw'}</Button>
            <Button variant="ghost" onClick={generate}>Re-generate</Button>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No draw preview"
          message="Select a round and click Preview or Generate to see the draw."
        />
      )}
    </div>
  );
}
