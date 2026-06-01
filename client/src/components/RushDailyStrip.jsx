import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useDailySpin } from '../hooks/useDailySpin';
import SpinWheelVisual from './SpinWheelVisual';
import HandshakeIcon from './HandshakeIcon';

export default function RushDailyStrip() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { rotation, animating, spinning, result, error, spin } = useDailySpin(() => refreshUser?.());

  return (
    <div className="rush-daily-strip">
      <motion.button
        type="button"
        className={`rush-spin-card ${spinning ? 'is-spinning' : ''}`}
        onClick={spin}
        disabled={spinning}
        whileTap={spinning ? {} : { scale: 0.98 }}
      >
        <SpinWheelVisual
          uid="home-daily"
          size="sm"
          rotation={rotation}
          animating={animating}
          idle={!spinning && !result}
        />
        <div>
          <strong>DAILY SPIN</strong>
          {result ? (
            <span className="rush-spin-win">Won ₹{result.amount}!</span>
          ) : error ? (
            <span className="rush-spin-err">{error}</span>
          ) : (
            <span>{spinning ? 'Spinning...' : 'Free coins'}</span>
          )}
        </div>
      </motion.button>

      <button type="button" className="rush-refer-card" onClick={() => navigate('/referral')}>
        <HandshakeIcon />
        <div>
          <strong>INVITE</strong>
          <span>Earn ₹50</span>
        </div>
      </button>
    </div>
  );
}
