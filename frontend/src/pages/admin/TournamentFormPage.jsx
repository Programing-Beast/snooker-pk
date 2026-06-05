import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as tournamentsApi from '../../api/tournaments';
import * as prizesApi from '../../api/prizes';
import * as organizersApi from '../../api/tournamentOrganizers';
import * as playersApi from '../../api/players';
import * as playerPhonesApi from '../../api/playerPhones';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import FileUpload from '../../components/ui/FileUpload';
import Button from '../../components/ui/Button';
import PlayerAvatar from '../../components/ui/PlayerAvatar';

const STEPS = ['Basics', 'Prizes', 'Organizers'];

const PK_CITIES = [
  'Abbottabad', 'Attock', 'Bahawalnagar', 'Bahawalpur', 'Bannu',
  'Bhakkar', 'Burewala', 'Chakwal', 'Chiniot', 'Dera Ghazi Khan',
  'Dera Ismail Khan', 'Faisalabad', 'Ghotki', 'Gojra', 'Gujranwala',
  'Gujrat', 'Hafizabad', 'Haripur', 'Hyderabad', 'Islamabad',
  'Jacobabad', 'Jhelum', 'Jhang', 'Kamalia', 'Karachi',
  'Kasur', 'Khairpur', 'Khanewal', 'Khanpur', 'Khushab',
  'Kohat', 'Lahore', 'Lalamusa', 'Larkana', 'Lodhran',
  'Mandi Bahauddin', 'Mansehra', 'Mardan', 'Mianwali', 'Mingora',
  'Mirpur Khas', 'Multan', 'Muridke', 'Muzaffarabad', 'Muzaffargarh',
  'Nawabshah', 'Nowshera', 'Okara', 'Pakpattan', 'Peshawar',
  'Quetta', 'Rahim Yar Khan', 'Rawalpindi', 'Sadiqabad', 'Sahiwal',
  'Sargodha', 'Sheikhupura', 'Sialkot', 'Sukkur', 'Swabi',
  'Tando Adam', 'Taxila', 'Vehari', 'Wah Cantt', 'Wazirabad',
];

export default function TournamentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [tournamentId, setTournamentId] = useState(id || null);

  // Basics
  const [form, setForm] = useState({
    name: '', slug: '', venue: '', city: '', country_code: 'PAK',
    start_date: '', end_date: '', description: '', max_players: 32,
    entry_status: 'open',
  });
  const [banner, setBanner] = useState(null);

  // Prizes
  const [prizes, setPrizes] = useState([
    { position_label: 'Winner', amount: '', count: 1, is_highlight: true, type: 'winner', ranking_prize: true },
    { position_label: 'Runner-up', amount: '', count: 1, is_highlight: false, type: 'runner_up', ranking_prize: true },
  ]);

  // Organizers
  const [existingOrganizers, setExistingOrganizers] = useState([]);
  const [phoneQuery, setPhoneQuery] = useState('');
  const [phoneResults, setPhoneResults] = useState([]);
  const [phoneSearching, setPhoneSearching] = useState(false);
  const [orgRole, setOrgRole] = useState('');
  const phoneDebounce = useRef(null);

  // Inline create player
  const [showInlineCreate, setShowInlineCreate] = useState(false);
  const [inlineForm, setInlineForm] = useState({ name: '', city: '', phone: '' });
  const [inlineCreating, setInlineCreating] = useState(false);

  // Slug auto-generation
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (!id) return;
    tournamentsApi.show(id).then(res => {
      const t = res.data.data ?? res.data;
      setForm({
        name: t.name || '', slug: t.slug || '', venue: t.venue || '', city: t.city || '',
        country_code: t.country_code || 'PAK', start_date: t.start_date?.slice(0, 10) || '',
        end_date: t.end_date?.slice(0, 10) || '', description: t.description || '',
        max_players: t.max_players || 32, entry_status: t.entry_status || 'open',
      });
      if (t.prizes?.length) setPrizes(t.prizes.map(p => ({ ...p })));
      if (t.organizers?.length) setExistingOrganizers(t.organizers);
      if (t.slug) setSlugManual(true);
    }).catch(() => {});
  }, [id]);

  // Load organizers when entering step 2
  useEffect(() => {
    if (step === 2 && tournamentId) {
      organizersApi.list(tournamentId)
        .then(res => setExistingOrganizers(res.data.data || []))
        .catch(() => {});
    }
  }, [step, tournamentId]);

  function toSlug(str) {
    return str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s]+/g, '-').replace(/-+/g, '-');
  }

  function set(field) {
    return (e) => {
      const val = e.target.value;
      setForm(prev => {
        const next = { ...prev, [field]: val };
        if (field === 'name' && !slugManual) {
          next.slug = toSlug(val);
        }
        return next;
      });
    };
  }

  // Debounced phone search for organizer lookup
  const handleOrgPhoneSearch = useCallback((value) => {
    setPhoneQuery(value);
    setShowInlineCreate(false);
    if (phoneDebounce.current) clearTimeout(phoneDebounce.current);
    if (!value || value.length < 3) {
      setPhoneResults([]);
      setPhoneSearching(false);
      return;
    }
    setPhoneSearching(true);
    phoneDebounce.current = setTimeout(() => {
      playersApi.list({ phone: value, per_page: 5 })
        .then(res => setPhoneResults(res.data.data || []))
        .catch(() => setPhoneResults([]))
        .finally(() => setPhoneSearching(false));
    }, 400);
  }, []);

  async function addOrganizer(player) {
    if (!tournamentId || !player.user_id) return;
    // Check if already added
    if (existingOrganizers.some(o => o.user_id === player.user_id)) return;
    setSaving(true);
    try {
      const res = await organizersApi.create(tournamentId, { user_id: player.user_id, role: orgRole });
      setExistingOrganizers(prev => [...prev, res.data.data]);
      setPhoneQuery('');
      setPhoneResults([]);
      setOrgRole('');
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function removeOrganizer(orgId) {
    try {
      await organizersApi.destroy(orgId);
      setExistingOrganizers(prev => prev.filter(o => o.id !== orgId));
    } catch { /* ignore */ }
  }

  async function handleInlineCreate() {
    if (!inlineForm.name || !inlineForm.phone) return;
    setInlineCreating(true);
    try {
      // Create the player
      const playerRes = await playersApi.create({ name: inlineForm.name, city: inlineForm.city, country_code: 'PAK' });
      const newPlayer = playerRes.data.data ?? playerRes.data;
      // Add phone
      await playerPhonesApi.create(newPlayer.id, { phone: inlineForm.phone, label: 'Primary' });
      // Add as organizer if they have a user_id
      if (newPlayer.user_id && tournamentId) {
        const orgRes = await organizersApi.create(tournamentId, { user_id: newPlayer.user_id, role: orgRole });
        setExistingOrganizers(prev => [...prev, orgRes.data.data]);
      }
      setInlineForm({ name: '', city: '', phone: '' });
      setShowInlineCreate(false);
      setPhoneQuery('');
      setPhoneResults([]);
      setOrgRole('');
    } catch { /* ignore */ }
    setInlineCreating(false);
  }

  async function saveBasics() {
    setSaving(true);
    setErrors({});
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) data.append(k, v);
      });
      if (banner) data.append('banner', banner);

      if (isEdit) {
        await tournamentsApi.update(id, data);
      } else {
        const res = await tournamentsApi.create(data);
        const t = res.data.data ?? res.data;
        setTournamentId(t.id);
      }
      setStep(1);
    } catch (err) {
      setErrors(err.response?.data?.errors || { general: [err.response?.data?.message || 'Failed'] });
    } finally { setSaving(false); }
  }

  async function savePrizes() {
    if (!tournamentId) { setStep(2); return; }
    setSaving(true);
    try {
      for (const p of prizes) {
        if (p.id) await prizesApi.update(p.id, p);
        else if (p.position_label && p.amount) await prizesApi.create(tournamentId, p);
      }
      setStep(2);
    } catch { /* proceed anyway */ }
    setSaving(false);
  }

  function updateArray(setter, index, field, value) {
    setter(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  return (
    <div>
      <div className="mb-6">
        <div className="seclabel text-felt mb-1.5">Admin</div>
        <h1 className="font-display font-bold text-[1.5rem]">{isEdit ? 'Edit tournament' : 'Create tournament'}</h1>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => i <= step && setStep(i)}
            className={`px-4 py-2 rounded-md text-[13px] font-display font-semibold ${
              i === step ? 'bg-felt text-white' : i < step ? 'bg-felt-50 text-felt' : 'bg-card-alt text-muted'
            }`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {errors.general && <div className="bg-bad-tint text-bad text-[13px] px-4 py-3 rounded-md mb-4">{errors.general[0]}</div>}

      {/* Step 0: Basics */}
      {step === 0 && (
        <div className="card p-6 space-y-4 max-w-2xl">
          <Input label="Tournament name" value={form.name} onChange={set('name')} error={errors.name?.[0]} />
          <Input
            label="URL slug"
            value={form.slug}
            onChange={e => { setSlugManual(true); setForm(prev => ({ ...prev, slug: e.target.value })); }}
            placeholder="karachi-national-open-26"
            error={errors.slug?.[0]}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Venue" value={form.venue} onChange={set('venue')} error={errors.venue?.[0]} />
            <Select label="City" value={form.city} onChange={set('city')} error={errors.city?.[0]}>
              <option value="">Select city</option>
              {PK_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Start date" type="date" value={form.start_date} onChange={set('start_date')} error={errors.start_date?.[0]} />
            <Input label="End date" type="date" value={form.end_date} onChange={set('end_date')} error={errors.end_date?.[0]} />
          </div>
          <Input label="Max players" type="number" value={form.max_players} onChange={set('max_players')} error={errors.max_players?.[0]} />
          <Select label="Entry status" value={form.entry_status} onChange={set('entry_status')}>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </Select>
          <div>
            <label className="lbl">Description</label>
            <textarea className="input min-h-[100px]" value={form.description} onChange={set('description')} />
          </div>
          <FileUpload label="Banner image" onFile={setBanner} />
          <Button onClick={saveBasics} disabled={saving}>{saving ? 'Saving...' : 'Next: Prizes →'}</Button>
        </div>
      )}

      {/* Step 1: Prizes */}
      {step === 1 && (
        <div className="space-y-4 max-w-2xl">
          {prizes.map((p, i) => {
            const isSystem = p.type === 'winner' || p.type === 'runner_up';
            return (
              <div key={p.id || i} className={`card p-5 space-y-3 ${isSystem ? 'border-l-4 border-l-felt' : ''}`}>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {isSystem ? (p.type === 'winner' ? 'Winner prize' : 'Runner-up prize') : `Prize ${i + 1}`}
                  </span>
                  <div className="flex items-center gap-4 ml-auto">
                    <label className="flex items-center gap-1.5 text-[12px] text-ink-500 cursor-pointer select-none">
                      Ranking
                      <button
                        type="button"
                        role="switch"
                        aria-checked={p.ranking_prize ?? true}
                        onClick={() => updateArray(setPrizes, i, 'ranking_prize', !(p.ranking_prize ?? true))}
                        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${(p.ranking_prize ?? true) ? 'bg-felt' : 'bg-ink-200'}`}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform mt-0.5 ${(p.ranking_prize ?? true) ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                      </button>
                    </label>
                    {!isSystem && (
                      <label className="flex items-center gap-1.5 text-[12px] text-ink-500 cursor-pointer select-none">
                        Multiple
                        <button
                          type="button"
                          role="switch"
                          aria-checked={p.multiple ?? false}
                          onClick={() => updateArray(setPrizes, i, 'multiple', !(p.multiple ?? false))}
                          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${(p.multiple ?? false) ? 'bg-felt' : 'bg-ink-200'}`}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform mt-0.5 ${(p.multiple ?? false) ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                        </button>
                      </label>
                    )}
                    {!isSystem && (
                      <label className="flex items-center gap-1.5 text-[12px] text-ink-500 cursor-pointer select-none">
                        Scoring
                        <button
                          type="button"
                          role="switch"
                          aria-checked={!!p.score_threshold}
                          onClick={() => {
                            if (p.score_threshold) {
                              updateArray(setPrizes, i, 'score_threshold', null);
                            } else {
                              updateArray(setPrizes, i, 'score_threshold', 50);
                            }
                          }}
                          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${p.score_threshold ? 'bg-felt' : 'bg-ink-200'}`}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform mt-0.5 ${p.score_threshold ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                        </button>
                      </label>
                    )}
                    {!isSystem && (
                      <button onClick={() => setPrizes(prev => prev.filter((_, j) => j !== i))} className="text-[12px] text-bad hover:text-bad/80">Remove</button>
                    )}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input label="Label" value={p.position_label} onChange={e => updateArray(setPrizes, i, 'position_label', e.target.value)} disabled={isSystem} />
                  <Input label="Amount (PKR)" type="number" value={p.amount} onChange={e => updateArray(setPrizes, i, 'amount', e.target.value)} />
                </div>
                {!isSystem && !!p.score_threshold && (
                  <Select
                    label="Score threshold"
                    value={p.score_threshold}
                    onChange={e => updateArray(setPrizes, i, 'score_threshold', Number(e.target.value))}
                  >
                    <option value={50}>50+</option>
                    <option value={70}>70+</option>
                    <option value={100}>100+</option>
                  </Select>
                )}
              </div>
            );
          })}
          <button onClick={() => setPrizes(prev => [...prev, { position_label: '', amount: '', count: 1, is_highlight: false, type: 'custom', ranking_prize: true, multiple: false, score_threshold: null }])} className="btn btn-ghost btn-sm">+ Add prize</button>
          <div className="flex gap-3 pt-2">
            <Button onClick={savePrizes} disabled={saving}>{saving ? 'Saving...' : 'Next: Organizers →'}</Button>
            <Button variant="ghost" onClick={() => setStep(2)}>Skip</Button>
          </div>
        </div>
      )}

      {/* Step 2: Organizers */}
      {step === 2 && (
        <div className="card p-6 space-y-4 max-w-2xl">
          {/* Existing organizers */}
          {existingOrganizers.length > 0 && (
            <div className="space-y-2 mb-4">
              {existingOrganizers.map(o => {
                const player = o.user?.player;
                const phone = player?.phones?.[0]?.phone;
                return (
                  <div key={o.id} className="flex items-center gap-3 py-2 border-b border-divider last:border-0">
                    <PlayerAvatar name={player?.name || o.user?.name} photo={player?.photo_path} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[14px] truncate">{player?.name || o.user?.name}</div>
                      <div className="flex items-center gap-2 text-[12px] text-ink-500">
                        {o.role && <span>{o.role}</span>}
                        {phone && <span>{phone}</span>}
                      </div>
                    </div>
                    <button onClick={() => removeOrganizer(o.id)} className="text-bad hover:text-bad/80 text-[13px]">Remove</button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Search by phone to add organizer */}
          <div className="space-y-3 p-4 bg-card-alt rounded-lg">
            <label className="lbl">Add organizer by phone</label>
            <input
              className="input"
              placeholder="Search by phone number..."
              value={phoneQuery}
              onChange={e => handleOrgPhoneSearch(e.target.value)}
            />
            <Input label="Role (optional)" value={orgRole} onChange={e => setOrgRole(e.target.value)} placeholder="Tournament Director" />

            {phoneSearching && <p className="text-[12px] text-muted">Searching...</p>}

            {phoneResults.length > 0 && (
              <div className="border border-border-subtle rounded-md overflow-hidden">
                {phoneResults.map(p => {
                  const alreadyAdded = existingOrganizers.some(o => o.user_id === p.user_id);
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-card-alt">
                      <PlayerAvatar name={p.name} photo={p.photo_path} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[13px] truncate">{p.name}</div>
                        {p.phones?.[0]?.phone && <div className="text-[11px] text-ink-500">{p.phones[0].phone}</div>}
                      </div>
                      {alreadyAdded ? (
                        <span className="text-[11px] text-muted">Already added</span>
                      ) : p.user_id ? (
                        <Button size="sm" onClick={() => addOrganizer(p)} disabled={saving}>Add</Button>
                      ) : (
                        <span className="text-[11px] text-muted">No user account</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {phoneQuery.length >= 3 && !phoneSearching && phoneResults.length === 0 && (
              <div className="text-[13px] text-ink-500">
                No player found.{' '}
                <button className="text-felt font-semibold hover:underline" onClick={() => {
                  setShowInlineCreate(true);
                  setInlineForm(prev => ({ ...prev, phone: phoneQuery }));
                }}>
                  Create new player
                </button>
              </div>
            )}

            {/* Inline create player form */}
            {showInlineCreate && (
              <div className="border border-border-subtle rounded-md p-3 space-y-3">
                <div className="text-[13px] font-semibold">Create new player</div>
                <Input label="Name" value={inlineForm.name} onChange={e => setInlineForm(f => ({ ...f, name: e.target.value }))} />
                <Input label="Phone" value={inlineForm.phone} onChange={e => setInlineForm(f => ({ ...f, phone: e.target.value }))} />
                <Select label="City" value={inlineForm.city} onChange={e => setInlineForm(f => ({ ...f, city: e.target.value }))}>
                  <option value="">Select city</option>
                  {PK_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleInlineCreate} disabled={inlineCreating}>
                    {inlineCreating ? 'Creating...' : 'Create & add'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowInlineCreate(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={() => navigate('/admin')}>{isEdit ? 'Save & finish' : 'Finish'}</Button>
            <Button variant="ghost" onClick={() => navigate('/admin')}>Skip</Button>
          </div>
        </div>
      )}

    </div>
  );
}
