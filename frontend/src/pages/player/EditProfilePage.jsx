import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUpdatePlayerMutation } from '../../store/api/playersApi';
import * as playerPhonesApi from '../../api/playerPhones';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || '/storage';

const PK_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Abbottabad', 'Mardan',
  'Sukkur', 'Sahiwal', 'Jhang', 'Okara', 'Wah Cantt',
  'Dera Ghazi Khan', 'Mirpur', 'Mingora', 'Nawabshah', 'Chiniot',
  'Kotri', 'Kamoke', 'Hafizabad', 'Sadiqabad', 'Jacobabad',
];

function resolvePhoto(photo) {
  if (!photo) return null;
  if (photo.startsWith('http') || photo.startsWith('/')) return photo;
  return `${STORAGE_URL}/${photo}`;
}

export default function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toastRef = useRef(null);
  const [updatePlayer] = useUpdatePlayerMutation();
  const [form, setForm] = useState({
    name: '', country_code: 'PAK', city: '', bio: '', address: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

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

  const existingPhoto = resolvePhoto(user?.player?.photo_path);

  useEffect(() => {
    if (user?.player) {
      const p = user.player;
      setForm({
        name: p.name || user.name || '',
        country_code: p.country_code || 'PAK',
        city: p.city || '',
        bio: p.bio || '',
        address: p.address || '',
      });
      playerPhonesApi.list(p.id)
        .then(res => {
          const loaded = res.data.data || [];
          setPhones(loaded);
          resetPhoneForm(loaded);
        })
        .catch(() => {});
    }
  }, [user]);

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

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user?.player?.id) return;
    setSaving(true);
    setErrors({});
    setSaved(false);
    setShowToast(false);

    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) data.append(k, v); });
      if (photo) data.append('photo', photo);

      await updatePlayer({ id: user.player.id, data }).unwrap();
      setSaved(true);
      setShowToast(true);
      toastRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      const d = err.data;
      if (d?.errors) setErrors(d.errors);
      else setErrors({ general: [d?.message || 'Failed to save'] });
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setShowToast(false);
    setSaved(false);
    navigate('/dashboard');
  }

  async function handleAddPhone() {
    if (!user?.player?.id || !newPhone.trim()) return;
    setPhoneSaving(true);
    setPhoneError('');
    try {
      const payload = { phone: newPhone, label: newPhoneLabel };
      if (newPhoneLabel === 'Primary' && newPhoneWhatsApp) payload.is_whatsapp = true;
      const res = await playerPhonesApi.create(user.player.id, payload);
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

  const displayPhoto = photoPreview || existingPhoto;

  return (
    <div className="px-4 sm:px-7 py-7 max-w-3xl mx-auto">
      <div className="mb-5" ref={toastRef}>
        <div className="seclabel text-felt mb-1.5">Account</div>
        <h1 className="font-display font-extrabold uppercase text-[30px] leading-none">Edit profile</h1>
      </div>

      {/* Success toast */}
      {showToast && (
        <div className="mb-5 flex items-center gap-3 rounded-md bg-ok-tint border border-ok/30 px-4 py-3 dropin">
          <span className="w-7 h-7 rounded-full bg-ok grid place-items-center text-white shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M5 12l5 5L20 6" /></svg>
          </span>
          <div className="text-[13.5px]">
            <b className="text-[#0C6B3C]">Profile updated.</b>{' '}
            <span className="text-ink-600">Your changes are now live on your public profile.</span>
          </div>
        </div>
      )}

      {errors.general && (
        <div className="mb-5 bg-bad-tint text-bad text-[13px] px-4 py-3 rounded-md">{errors.general[0]}</div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Photo section */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-cover bg-center ring-2 ring-hairline shrink-0 bg-ink-200"
            style={displayPhoto ? { backgroundImage: `url(${displayPhoto})` } : {}}
          >
            {!displayPhoto && (
              <div className="w-full h-full rounded-xl grid place-items-center font-display font-bold text-muted text-lg">
                {form.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div>
            <label className="btn btn-outline btn-sm cursor-pointer">
              Change photo
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
            </label>
            <div className="text-[11px] text-muted mt-1.5">JPG or PNG · up to 5MB</div>
          </div>
        </div>

        <div className="border-t border-divider" />

        {/* Form fields */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full name" value={form.name} onChange={set('name')} error={errors.name?.[0]} />
          <Select label="Country" value="PAK" disabled>
            <option value="PAK">Pakistan</option>
          </Select>
          <div>
            <label className="lbl">Phone</label>
            <input className="input" value={phones[0]?.phone || ''} readOnly placeholder="Add via phone section below" />
          </div>
          <Select label="City" value={form.city} onChange={set('city')} error={errors.city?.[0]}>
            <option value="">Select city</option>
            {PK_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <div className="sm:col-span-2">
            <Input label="Address" value={form.address} onChange={set('address')} placeholder="Club address or home city" error={errors.address?.[0]} />
          </div>
          <div className="sm:col-span-2">
            <label className="lbl">Bio</label>
            <textarea
              className="input min-h-[80px]"
              rows="3"
              value={form.bio}
              onChange={set('bio')}
              placeholder="A short bio about yourself..."
            />
            {errors.bio && <p className="text-[0.72rem] text-bad mt-1">{errors.bio[0]}</p>}
          </div>
        </div>

        <div className="border-t border-divider" />

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={saving}>
            {saved ? (
              <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="inline -mt-0.5 mr-1"><path d="M5 12l5 5L20 6" /></svg> Saved</>
            ) : saving ? 'Saving...' : 'Save changes'}
          </Button>
          <Button variant="ghost" type="button" onClick={handleCancel}>Cancel</Button>
        </div>
      </form>

      {/* Phone numbers section */}
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
              <Button onClick={handleAddPhone} disabled={phoneSaving || !newPhone.trim()}>
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
    </div>
  );
}
