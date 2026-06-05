import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { to: '/', label: 'Home', icon: 'M3 11l9-8 9 8M5 10v10h14V10' },
  { to: '/tournaments', label: 'Draws', icon: 'M3 4h18v16H3zM3 9h18M8 4v16' },
  { to: '/rankings', label: 'Ranks', icon: 'M4 19V5M10 19v-9M16 19V8M22 19H2' },
  { to: '/profile', label: 'Profile', icon: 'M12 8a4 4 0 110-8 4 4 0 010 8zM4 21c0-4 4-6 8-6s8 2 8 6' },
];

export default function MobileTabBar() {
  const { isAuthenticated } = useAuth();

  const profileTo = isAuthenticated ? '/dashboard' : '/login';

  return (
    <div className="md:hidden sticky bottom-0 grid grid-cols-4 bg-card/95 backdrop-blur border-t border-divider z-20">
      {TABS.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to === '/profile' ? profileTo : tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-2 ${isActive ? 'text-felt' : 'text-muted'}`
          }
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={tab.icon} />
          </svg>
          <span className="text-[9.5px] font-semibold font-display">{tab.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
