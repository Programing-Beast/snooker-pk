import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, hasRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const roles = user.roles || [];
      if (roles.includes('admin')) navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
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
          <p className="text-ink-400 text-[14px] mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="bg-bad-tint text-bad text-[13px] px-4 py-3 rounded-md">{error}</div>
          )}
          <div>
            <label className="lbl">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="lbl">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? (
              <><span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Signing in...</>
            ) : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-ink-400 text-[13px] mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-felt-400 hover:text-white font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
