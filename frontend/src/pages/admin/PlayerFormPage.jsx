import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as playersApi from '../../api/players';
import * as playerPhonesApi from '../../api/playerPhones';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import FileUpload from '../../components/ui/FileUpload';
import Button from '../../components/ui/Button';

const PK_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Abbottabad', 'Mardan',
  'Sukkur', 'Sahiwal', 'Jhang', 'Okara', 'Wah Cantt',
  'Dera Ghazi Khan', 'Mirpur', 'Mingora', 'Nawabshah', 'Chiniot',
  'Kotri', 'Kamoke', 'Hafizabad', 'Sadiqabad', 'Jacobabad',
];

export default function PlayerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '', country_code: 'PAK', city: '', tier: 'amateur',
    bio: '', address: '', ranking_points: 0, date_turned_pro: '', status: 'active',
  });
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  // Phone search before create
  const [phoneSearch, setPhoneSearch] = useState('');
  const [phoneSearchResults, setPhoneSearchResults] = useState([]);
  const [phoneSearching, setPhoneSearching] = useState(false);
  const phoneDebounce = useRef(null);

  // Phone management
  const [phones, setPhones] = useState([]);
  const [newPhone, setNewPhone] = useState('');
  const [newPhoneLabel, setNewPhoneLabel] = useState('Primary');
  const [newPhoneWhatsApp, setNewPhoneWhatsApp] = useState(false);
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const hasPrimary = phones.some(ph => ph.label === 'Primary');
  const secondaryCount = phones.filter(ph => ph.label === 'Secondary').length;
  const labelOptions = [];
  if (!hasPrimary) labelOptions.push('Primary');
  if (secondaryCount < 3) labelOptions.push('Secondary');

  useEffect(() => {
    if (!id) return;
    playersApi.show(id).then(res => {
      const p = res.data.data ?? res.data;
      setForm({
        name: p.name || '', country_code: p.country_code || 'PAK', city: p.city || '',
        tier: p.tier || 'amateur', bio: p.bio || '', address: p.address || '',
        ranking_points: p.ranking_points || 0, date_turned_pro: p.date_turned_pro || '',
        status: p.status || 'active',
      });
      return p;
    }).then(p => {
      return playerPhonesApi.list(p.id || id).then(res => {
        const loaded = res.data.data || [];
        setPhones(loaded);
        resetPhoneForm(loaded);
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  // Debounced phone search
  const handlePhoneSearch = useCallback((value) => {
    setPhoneSearch(value);
    if (phoneDebounce.current) clearTimeout(phoneDebounce.current);
    if (!value || value.length < 3) {
      setPhoneSearchResults([]);
      setPhoneSearching(false);
      return;
    }
    setPhoneSearching(true);
    phoneDebounce.current = setTimeout(() => {
      playersApi.list({ phone: value, per_page: 5 })
        .then(res => setPhoneSearchResults(res.data.data || []))
        .catch(() => setPhoneSearchResults([]))
        .finally(() => setPhoneSearching(false));
    }, 400);
  }, []);

  function resetPhoneForm(currentPhones) {
    const hp = currentPhones.some(ph => ph.label === 'Primary');
    setNewPhone('');
    setNewPhoneLabel(hp ? 'Secondary' : 'Primary');
    setNewPhoneWhatsApp(false);
    setPhoneError('');
  }

  function set(field) {
    return (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) data.append(k, v);
      });
      if (photo) data.append('photo', photo);

      if (isEdit) {
        await playersApi.update(id, data);
      } else {
        await playersApi.create(data);
      }
      navigate('/admin/players');
    } catch (err) {
      const d = err.response?.data;
      if (d?.errors) setErrors(d.errors);
      else setErrors({ general: [d?.message || 'Failed to save'] });
    } finally {
      setSaving(false);
    }
  }

  async function handleAddPhone() {
    if (!id || !newPhone.trim()) return;
    setPhoneSaving(true);
    setPhoneError('');
    try {
      const payload = { phone: newPhone, label: newPhoneLabel };
      if (newPhoneLabel === 'Primary' && newPhoneWhatsApp) payload.is_whatsapp = true;
      const res = await playerPhonesApi.create(id, payload);
      const updated = [...phones, res.data.data];
      setPhones(updated);
      resetPhoneForm(updated);
    } catch (err) {
      const errs = err.response?.data?.errors;
      const msg = errs?.phone?.[0] || errs?.label?.[0] || errs?.is_whatsapp?.[0] || err.response?.data?.message || 'Failed to add phone';
      setPhoneError(msg);
    }
    setPhoneSaving(false);
  }

  async function handleDeletePhone(phoneId) {
    try {
      await playerPhonesApi.destroy(phoneId);
      const updated = phones.filter(ph => ph.id !== phoneId);
      setPhones(updated);
      resetPhoneForm(updated);
    } catch { /* ignore */ }
  }

  const phoneMatchFound = phoneSearchResults.length > 0;

  if (loading) return <div className="max-w-2xl mx-auto px-6 py-16 text-center text-muted">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="seclabel text-felt mb-1.5">Admin</div>
        <h1 className="font-display font-bold text-[1.5rem]">{isEdit ? 'Edit player' : 'Create player'}</h1>
      </div>

      {/* Phone search before create */}
      {!isEdit && (
        <div className="card p-4 mb-6">
          <label className="lbl mb-1">Search by phone first</label>
          <input
            className="input"
            placeholder="Enter phone to check duplicates..."
            value={phoneSearch}
            onChange={e => handlePhoneSearch(e.target.value)}
          />
          {phoneSearching && <p className="text-[12px] text-muted mt-1">Searching...</p>}
          {phoneMatchFound && (
            <div className="mt-2 text-[13px] text-bad bg-bad-tint px-3 py-2 rounded">
              Player already exists: {phoneSearchResults.map(p => p.name).join(', ')}
            </div>
          )}
          {phoneSearch.length >= 3 && !phoneSearching && !phoneMatchFound && (
            <p className="text-[12px] text-ok mt-1">No existing player with this phone.</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {errors.general && (
          <div className="bg-bad-tint text-bad text-[13px] px-4 py-3 rounded-md">{errors.general[0]}</div>
        )}

        <Input label="Full name" value={form.name} onChange={set('name')} error={errors.name?.[0]} />

        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Country" value="PAK" disabled>
            <option value="PAK">Pakistan</option>
          </Select>
          <Select label="City" value={form.city} onChange={set('city')} error={errors.city?.[0]}>
            <option value="">Select city</option>
            {PK_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>

        <Select label="Tier" value={form.tier} onChange={set('tier')}>
          <option value="amateur">Amateur</option>
          <option value="pro">Professional</option>
        </Select>

        <div>
          <label className="lbl">Bio</label>
          <textarea
            className="input min-h-[100px]"
            value={form.bio}
            onChange={set('bio')}
            placeholder="A short bio..."
          />
          {errors.bio && <p className="text-[0.72rem] text-bad mt-1">{errors.bio[0]}</p>}
        </div>

        <Input label="Address" value={form.address} onChange={set('address')} placeholder="Club address or home city" error={errors.address?.[0]} />

        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Ranking points" type="number" value={form.ranking_points} onChange={set('ranking_points')} error={errors.ranking_points?.[0]} />
          <Input label="Date turned pro" type="date" value={form.date_turned_pro} onChange={set('date_turned_pro')} error={errors.date_turned_pro?.[0]} />
        </div>

        <Select label="Status" value={form.status} onChange={set('status')}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>

        <FileUpload label="Player photo" onFile={setPhoto} />

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving || (!isEdit && phoneMatchFound)}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create player'}
          </Button>
          <Button variant="ghost" type="button" onClick={() => navigate('/admin/players')}>Cancel</Button>
        </div>
      </form>

      {/* Phone numbers section — only when editing */}
      {isEdit && (
        <div className="card p-6 mt-6">
          <h3 className="font-display font-bold text-[16px] mb-4">Phone numbers</h3>

          {phones.length > 0 ? (
            <div className="space-y-2 mb-4">
              {phones.map(ph => (
                <div key={ph.id} className="flex items-center gap-3 py-2 border-b border-divider last:border-0">
                  <span className="font-mono text-[14px] flex-1">{ph.phone}</span>
                  <span className="text-[11px] font-medium text-ink-500 bg-card-alt px-2 py-0.5 rounded">{ph.label}</span>
                  {ph.is_whatsapp && <span className="text-[11px] font-medium text-ok bg-ok-tint px-2 py-0.5 rounded">WhatsApp</span>}
                  <button type="button" className="text-bad hover:text-bad/80 text-[13px]" onClick={() => handleDeletePhone(ph.id)}>Remove</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-muted mb-4">No phone numbers added yet.</p>
          )}

          {labelOptions.length > 0 ? (
            <>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="lbl">Phone</label>
                  <input
                    className="input"
                    placeholder="0300 1234567"
                    value={newPhone}
                    onChange={e => { setNewPhone(e.target.value); setPhoneError(''); }}
                  />
                </div>
                <div>
                  <label className="lbl">Label</label>
                  <select
                    className="input w-[130px]"
                    value={newPhoneLabel}
                    onChange={e => {
                      setNewPhoneLabel(e.target.value);
                      if (e.target.value !== 'Primary') setNewPhoneWhatsApp(false);
                    }}
                  >
                    {labelOptions.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <Button type="button" onClick={handleAddPhone} disabled={phoneSaving || !newPhone.trim()}>
                  {phoneSaving ? 'Adding...' : 'Add phone'}
                </Button>
              </div>
              {newPhoneLabel === 'Primary' && (
                <label className="flex items-center gap-2 mt-2 text-[13px] text-ink-600 cursor-pointer">
                  <input type="checkbox" checked={newPhoneWhatsApp} onChange={e => setNewPhoneWhatsApp(e.target.checked)} className="rounded" />
                  Also WhatsApp number
                </label>
              )}
              {phoneError && <p className="text-[12px] text-bad mt-2">{phoneError}</p>}
            </>
          ) : (
            <p className="text-[12px] text-muted">Maximum phone numbers reached (1 primary + 3 secondary).</p>
          )}
        </div>
      )}
    </div>
  );
}
