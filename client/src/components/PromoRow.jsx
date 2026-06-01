import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function PromoRow() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const tournamentLevel = Math.max(1, Math.floor((user?.rating || 1000) / 50));

  const handleClaim = async () => {
    if (claimed || claiming) return;
    setClaiming(true);
    try {
      await api('/rewards/daily', { method: 'POST' });
      setClaimed(true);
      refreshUser?.();
    } catch {
      navigate('/rewards');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="promo-row">
      <button type="button" className="promo-card promo-tournament" onClick={() => navigate('/tournaments')}>
        <div className="promo-trophy">🏆</div>
        <div className="promo-text">
          <span className="promo-title">Tournament</span>
          <span className="promo-sub">Level {tournamentLevel}</span>
        </div>
      </button>

      <button type="button" className="promo-card promo-claim" onClick={handleClaim} disabled={claiming || claimed}>
        <span className="promo-claim-title">{claimed ? 'CLAIMED' : 'CLAIM'}</span>
        <div className="promo-progress">
          <div className="promo-progress-fill" style={{ width: claimed ? '100%' : '40%' }} />
        </div>
        <span className="promo-progress-label">{claimed ? '5/5' : '2/5'}</span>
      </button>
    </div>
  );
}
