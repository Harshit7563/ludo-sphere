import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function formatAmount(n) {
  const num = Number(n) || 0;
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}k`;
  return num.toFixed(0);
}

export default function TopStatsBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const coins = user?.balance ?? user?.wallet?.balance ?? 0;
  const gems = user?.bonus_balance ?? 0;
  const level = user?.rating ?? 1000;
  const displayLevel = Math.max(1, Math.floor(level / 50));

  return (
    <header className="top-stats-bar">
      <button type="button" className="stat-pill stat-level" onClick={() => navigate('/leaderboard', { state: { moneyRain: true } })}>
        <span className="stat-icon stat-icon-star">★</span>
        <span className="stat-value">{displayLevel}</span>
      </button>
      <button type="button" className="stat-pill stat-coins" onClick={() => navigate('/wallet')}>
        <span className="stat-icon stat-icon-coin">🪙</span>
        <span className="stat-value">{formatAmount(coins)}</span>
        <span className="stat-plus">+</span>
      </button>
      <button type="button" className="stat-pill stat-gems" onClick={() => navigate('/wallet')}>
        <span className="stat-icon stat-icon-gem">💎</span>
        <span className="stat-value">{formatAmount(gems) || '0'}</span>
        <span className="stat-plus">+</span>
      </button>
    </header>
  );
}
