import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getAvatarSrc, getAvatarName } from '../data/kungFuPandaAvatars';
import RushAvatar from './RushAvatar';
import LudoSphereLogo from './LudoSphereLogo';
import StatIcon from './StatIcons';

function formatAmount(n) {
  const num = Number(n) || 0;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}K`;
  return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function RushHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const coins = user?.balance ?? user?.wallet?.balance ?? 0;
  const avatarSrc = getAvatarSrc(user);
  const avatarName = getAvatarName(user);

  return (
    <header className="rush-header">
      <div className="rush-header-side rush-header-side--left">
        <RushAvatar
          key={user?.avatar_url || 'default'}
          src={avatarSrc}
          alt={avatarName}
          onClick={() => navigate('/profile')}
        />
      </div>

      <LudoSphereLogo size="sm" animated layout="row" className="rush-header-logo" />

      <div className="rush-header-side rush-header-side--right">
        <div className="rush-wallet-group">
          <motion.button
            type="button"
            className="rush-coin-pill"
            onClick={() => navigate('/wallet')}
            whileTap={{ scale: 0.95 }}
            aria-label={`Wallet balance ₹${formatAmount(coins)}`}
          >
            <span className="rush-coin-icon-wrap">
              <StatIcon name="balance" />
            </span>
            <span className="rush-coin-amount">₹{formatAmount(coins)}</span>
            <span className="rush-coin-add" aria-hidden>+</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
