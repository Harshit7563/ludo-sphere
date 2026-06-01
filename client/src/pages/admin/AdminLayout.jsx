import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin.css';

const links = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/wallets', label: 'Wallets', icon: '💰' },
  { to: '/admin/matches', label: 'Matches', icon: '🎲' },
  { to: '/admin/tournaments', label: 'Tournaments', icon: '🏆' },
  { to: '/admin/transactions', label: 'Transactions', icon: '📜' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { to: '/admin/referrals', label: 'Referrals', icon: '🔗' },
  { to: '/admin/fraud', label: 'Fraud', icon: '🛡️' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={`admin-layout${menuOpen ? ' admin-sidebar-open' : ''}`}>
      <button
        type="button"
        className="admin-sidebar-backdrop"
        aria-label="Close menu"
        onClick={closeMenu}
      />
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <h2 className="gold-text">👑 Admin Panel</h2>
          <p>Ludo Sphere</p>
        </div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
              onClick={closeMenu}
            >
              <span aria-hidden>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <p className="admin-user-email">{user?.email}</p>
          <button
            type="button"
            className="btn btn-outline btn-sm btn-block"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-btn"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            ☰
          </button>
          <span className="admin-topbar-title">Admin</span>
        </header>
        <main className="admin-content">
          <div className="admin-page-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
