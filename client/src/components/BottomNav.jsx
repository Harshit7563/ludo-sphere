import { NavLink } from 'react-router-dom';
import NavIcon from './NavIcons';

const items = [
  { path: '/tournaments', icon: 'trophy', label: 'Arena' },
  { path: '/home', icon: 'home', label: 'Home', end: true },
  { path: '/wallet', icon: 'wallet', label: 'Wallet' },
  { path: '/leaderboard', icon: 'rank', label: 'Leaderboard' },
  { path: '/profile', icon: 'account', label: 'Account' },
];

export default function BottomNav() {
  return (
    <nav className="rush-bottom-nav" aria-label="Main navigation">
      <div className="rush-bottom-bar">
        {items.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            state={item.path === '/leaderboard' ? { moneyRain: true } : undefined}
            className={({ isActive }) => `rush-nav-item ${isActive ? 'active' : 'inactive'}`}
          >
            {({ isActive }) => (
              <>
                <span className="rush-nav-icon-wrap">
                  <span className={`rush-nav-glow ${isActive ? 'on' : ''}`} aria-hidden />
                  <NavIcon name={item.icon} active={isActive} />
                </span>
                <span className="rush-nav-label">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
