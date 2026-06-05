import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PlayerAvatar from './PlayerAvatar';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/rankings', label: 'Rankings' },
  { to: '/store', label: 'Store', badge: 'Soon' },
];

export default function TopNav() {
  const { isAuthenticated, user, hasRole, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="dark-ctx sticky top-0 z-40 bg-night border-b border-white/10">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-display font-extrabold text-lg uppercase tracking-tight text-white">
            Snooker<span className="text-live">PK</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-1 ml-2">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-[13px] font-medium transition flex items-center gap-1.5 ${
                  isActive ? 'text-white bg-white/10' : 'text-ink-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {link.label}
              {link.badge && <span className="badge bg-brass/20 text-brass text-[9px] px-1.5 py-0.5">{link.badge}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Auth section */}
        <div className="ml-auto flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {hasRole('admin') && (
                <Link to="/admin" className="hidden md:inline-flex btn btn-sm bg-white/15 text-white border border-white/20 hover:bg-white/25">
                  Admin
                </Link>
              )}
              {hasRole('umpire') && (
                <Link to="/umpire/dashboard" className="hidden md:inline-flex btn btn-sm bg-felt text-white hover:bg-felt/80">
                  My Matches
                </Link>
              )}
              <button className="hidden md:grid w-9 h-9 rounded-md place-items-center text-ink-300 hover:text-white hover:bg-white/10 relative">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.7 21a2 2 0 01-3.4 0" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-live" />
              </button>
              <Link to="/dashboard" className="hidden md:flex items-center gap-2 pl-2">
                <PlayerAvatar name={user?.name} photo={user?.player?.photo_path} tier={user?.player?.tier} size="sm" />
                <div className="hidden lg:block leading-tight">
                  <div className="text-white text-[13px] font-semibold">{user?.name}</div>
                  <div className="text-ink-400 text-[11px]">{user?.player?.tier || 'Player'}</div>
                </div>
              </Link>
              <button onClick={logout} className="hidden md:inline text-[12px] text-ink-400 hover:text-white transition">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm bg-white/15 text-white border border-white/20 hover:bg-white/25">Log in</Link>
              <Link to="/register" className="btn btn-sm btn-primary hidden sm:inline-flex">Sign up</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden w-9 h-9 grid place-items-center text-ink-300 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-night border-t border-white/10 px-6 py-4 space-y-2">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-md text-[14px] font-medium ${isActive ? 'text-white bg-white/10' : 'text-ink-300'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-md text-[14px] font-medium text-ink-300">Dashboard</Link>
              {hasRole('admin') && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-md text-[14px] font-medium text-brass">Admin</Link>}
              {hasRole('umpire') && <Link to="/umpire/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-md text-[14px] font-medium text-felt-400">My Matches</Link>}
              <button onClick={() => { logout(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2.5 text-[14px] text-live">Sign out</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
