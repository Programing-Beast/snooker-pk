import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function set(field) {
    return (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const user = await register(form);
      const roles = user.roles || [];
      if (roles.includes('admin')) navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else setErrors({ general: [data?.message || 'Registration failed'] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-night felt-grain flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-display font-extrabold text-2xl uppercase tracking-tight text-white">
            Snooker<span className="text-live">PK</span>
          </Link>
          <p className="text-ink-400 text-[14px] mt-2">Create your free account</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {errors.general && (
            <div className="bg-bad-tint text-bad text-[13px] px-4 py-3 rounded-md">{errors.general[0]}</div>
          )}
          <div>
            <label className="lbl">Full name</label>
            <input className="input" value={form.name} onChange={set('name')} placeholder="Muhammad Asif" required />
            {errors.name && <p className="text-[0.72rem] text-bad mt-1">{errors.name[0]}</p>}
          </div>
          <div>
            <label className="lbl">Email</label>
            <input type="email" className="input" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            {errors.email && <p className="text-[0.72rem] text-bad mt-1">{errors.email[0]}</p>}
          </div>
          <div>
            <label className="lbl">Password</label>
            <input type="password" className="input" value={form.password} onChange={set('password')} placeholder="Min 8 characters" required />
            {errors.password && <p className="text-[0.72rem] text-bad mt-1">{errors.password[0]}</p>}
          </div>
          <div>
            <label className="lbl">Confirm password</label>
            <input type="password" className="input" value={form.password_confirmation} onChange={set('password_confirmation')} placeholder="Same as above" required />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? (
              <><span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Creating account...</>
            ) : 'Create account'}
          </button>
        </form>

        <p className="text-center text-ink-400 text-[13px] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-felt-400 hover:text-white font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
