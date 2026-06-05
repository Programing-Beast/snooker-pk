import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: 'M3 11l9-8 9 8M5 10v10h14V10' },
  { to: '/admin/tournaments', label: 'Tournaments', icon: 'M3 4h18M3 10h18M3 16h18' },
  { to: '/admin/players', label: 'Players', icon: 'M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2M12 3a4 4 0 110 8 4 4 0 010-8zM17 11h6' },
  { to: '/admin/rankings', label: 'Rankings', icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-page flex">
      {/* Sidebar */}
      <aside className="dark-ctx hidden lg:flex flex-col w-60 bg-night border-r border-divider shrink-0">
        <div className="px-5 h-16 flex items-center border-b border-divider">
          <span className="font-display font-extrabold text-white uppercase tracking-tight">
            Snooker<span className="text-live">PK</span>
          </span>
          <span className="ml-2 badge bg-brass/20 text-brass text-[9px]">Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition ${
                  isActive ? 'bg-interactive text-heading' : 'text-muted hover:text-heading hover:bg-interactive'
                }`
              }
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={item.icon} />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-divider">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-felt grid place-items-center font-display font-bold text-white text-xs ring-2 ring-brass">
              {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-heading truncate">{user?.name || 'Admin'}</div>
              <button onClick={logout} className="text-[11px] text-muted hover:text-live transition">Sign out</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="dark-ctx lg:hidden fixed top-0 inset-x-0 z-40 bg-night/90 backdrop-blur border-b border-divider">
        <div className="px-4 h-14 flex items-center justify-between">
          <span className="font-display font-extrabold text-white uppercase tracking-tight text-[15px]">
            Snooker<span className="text-live">PK</span>
            <span className="ml-2 badge bg-brass/20 text-brass text-[9px]">Admin</span>
          </span>
          <NavLink to="/" className="text-[12px] text-muted hover:text-heading">Exit admin</NavLink>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 lg:ml-0">
        <div className="lg:hidden h-14" /> {/* spacer for mobile header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
