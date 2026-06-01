import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { getAvatarSrc, getAvatarName } from '../data/kungFuPandaAvatars';
import RushHeader from '../components/RushHeader';
import AvatarPickerModal from '../components/AvatarPickerModal';
import ReferralShareButtons from '../components/ReferralShareButtons';
import StatIcon from '../components/StatIcons';
import MenuIcon from '../components/MenuIcons';
import {
  getScrollingBannerEnabled,
  setScrollingBannerEnabled,
} from '../utils/scrollingBanner';

const MENU = [
  { icon: 'wallet', tone: 'gold', label: 'Wallet', path: '/wallet' },
  { icon: 'transactions', tone: 'blue', label: 'Transactions', path: '/transactions' },
  { icon: 'friends', tone: 'cyan', label: 'Friends', path: '/friends' },
  { icon: 'rewards', tone: 'purple', label: 'Rewards', path: '/rewards' },
  { icon: 'kyc', tone: 'orange', label: 'KYC Verification', path: '/kyc' },
  { icon: 'referral', tone: 'green', label: 'Refer & Earn', path: '/referral' },
];

function formatAmount(n) {
  const num = Number(n) || 0;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}K`;
  return num.toFixed(0);
}

export default function Profile() {
  const { user, logout, refreshUser, setUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [msg, setMsg] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarRev, setAvatarRev] = useState(0);
  const [scrollingBanner, setScrollingBanner] = useState(() => getScrollingBannerEnabled());
  const navigate = useNavigate();

  const toggleScrollingBanner = () => {
    const next = !scrollingBanner;
    setScrollingBanner(next);
    setScrollingBannerEnabled(next);
  };

  const save = async () => {
    try {
      await api('/auth/profile', { method: 'PUT', body: JSON.stringify({ displayName }) });
      await refreshUser();
      setMsg('Profile updated!');
      setTimeout(() => setMsg(''), 2500);
    } catch (e) {
      setMsg(e.message);
    }
  };

  const handleSelectAvatar = async (avatarUrl) => {
    setSaving(true);
    setMsg('');
    try {
      const updated = await api('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ avatarUrl }),
      });
      setUser((prev) => (prev ? { ...prev, ...updated, avatar_url: updated.avatar_url } : prev));
      await refreshUser();
      setAvatarRev((v) => v + 1);
      setPickerOpen(false);
      setMsg('Avatar updated!');
      setTimeout(() => setMsg(''), 2500);
    } catch (e) {
      setMsg(e.message || 'Could not update avatar');
    } finally {
      setSaving(false);
    }
  };

  const level = Math.max(1, Math.floor((user?.rating || 1000) / 50));
  const wins = user?.wins || 0;
  const losses = user?.losses || 0;
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  return (
    <div className="page page-rush page-profile">
      <div className="rush-bg-effects">
        <span className="rush-orb rush-orb-1" />
        <span className="rush-orb rush-orb-2" />
      </div>

      <RushHeader />

      <motion.div
        className="profile-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button type="button" className="profile-avatar-btn" onClick={() => setPickerOpen(true)}>
          <span className="profile-avatar-glow" aria-hidden />
          <span className="profile-avatar-orbit profile-avatar-orbit-a" aria-hidden>
            <span className="profile-avatar-orbit-ring" />
          </span>
          <span className="profile-avatar-orbit profile-avatar-orbit-b" aria-hidden>
            <span className="profile-avatar-orbit-ring profile-avatar-orbit-ring-b" />
          </span>
          <span className="profile-avatar-core">
            <img
              key={`${user?.avatar_url || 'default'}-${avatarRev}`}
              src={getAvatarSrc(user)}
              alt={getAvatarName(user)}
              className="profile-avatar-img"
            />
          </span>
          <span className="profile-avatar-line-orbit" aria-hidden>
            <span className="profile-avatar-line" />
          </span>
          <span className="profile-avatar-edit">✎</span>
        </button>

        <h1>{user?.display_name || user?.username}</h1>
        <p>@{user?.username}</p>

        <div className="profile-badges">
          <span className="profile-badge gold">Lvl {level}</span>
          <span className="profile-badge">⭐ {user?.rating || 1000}</span>
          <span className="profile-badge green">{winRate}% WR</span>
        </div>
      </motion.div>

      <motion.div
        className="profile-stats"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="profile-stat-card profile-stat-gold">
          <span className="profile-stat-icon"><StatIcon name="balance" /></span>
          <strong>₹{formatAmount(user?.balance ?? 0)}</strong>
          <span>Balance</span>
        </div>
        <div className="profile-stat-card profile-stat-green">
          <span className="profile-stat-icon"><StatIcon name="wins" /></span>
          <strong>{wins}</strong>
          <span>Wins</span>
        </div>
        <div className="profile-stat-card profile-stat-red">
          <span className="profile-stat-icon"><StatIcon name="losses" /></span>
          <strong>{losses}</strong>
          <span>Losses</span>
        </div>
        <div className="profile-stat-card profile-stat-blue">
          <span className="profile-stat-icon"><StatIcon name="games" /></span>
          <strong>{user?.games_played || 0}</strong>
          <span>Games</span>
        </div>
      </motion.div>

      {msg && (
        <motion.div
          className={`profile-toast ${msg.includes('updated') ? 'success' : 'error'}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {msg}
        </motion.div>
      )}

      <div className="profile-section">
        <h2>EDIT PROFILE</h2>
        <div className="profile-card">
          <label htmlFor="displayName">Display Name</label>
          <input
            id="displayName"
            className="profile-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
          <button type="button" className="profile-save-btn" onClick={save}>
            Save Changes
          </button>
        </div>
      </div>

      <div className="profile-section">
        <h2>REFERRAL CODE</h2>
        <div className="profile-referral">
          <code>{user?.referral_code || '—'}</code>
          <div className="profile-referral-actions">
            <button
              type="button"
              className="profile-referral-copy"
              onClick={() => {
                navigator.clipboard?.writeText(user?.referral_code || '');
                setMsg('Code copied!');
                setTimeout(() => setMsg(''), 2000);
              }}
            >
              Copy Code
            </button>
            <ReferralShareButtons code={user?.referral_code} compact />
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h2>SETTINGS</h2>
        <div className="profile-card profile-settings-card">
          <div className="profile-setting-row">
            <div className="profile-setting-copy">
              <strong>Scrolling banner</strong>
              <p>Live winners line on home (below Daily Spin)</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={scrollingBanner}
              className={`profile-toggle ${scrollingBanner ? 'on' : ''}`}
              onClick={toggleScrollingBanner}
            >
              <span className="profile-toggle-thumb" />
            </button>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h2>QUICK LINKS</h2>
        <div className="profile-menu">
          {MENU.map((item) => (
            <button key={item.path} type="button" className="profile-menu-item" onClick={() => navigate(item.path)}>
              <span className={`profile-menu-icon profile-menu-icon-${item.tone}`}>
                <MenuIcon name={item.icon} />
              </span>
              <span className="profile-menu-label">{item.label}</span>
              <span className="profile-menu-arrow">›</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="profile-signout"
        onClick={() => { logout(); navigate('/login'); }}
      >
        Sign Out
      </button>

      <AvatarPickerModal
        open={pickerOpen}
        onClose={() => !saving && setPickerOpen(false)}
        currentAvatarUrl={user?.avatar_url}
        onSelect={handleSelectAvatar}
        saving={saving}
      />
    </div>
  );
}
