import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useDailySpin } from '../hooks/useDailySpin';
import SubPageShell from '../components/SubPageShell';
import SpinWheelVisual from '../components/SpinWheelVisual';
import QuickLinkIcon from '../components/QuickLinkIcons';

export default function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setMsgError] = useState('');
  const { refreshUser } = useAuth();

  const load = () => api('/rewards').then(setRewards).catch(console.error);

  const { rotation, animating, spinning, result, error: spinError, spin } = useDailySpin((res) => {
    setMsg(`Claimed ₹${res.amount}! New balance: ₹${res.balance}`);
    setMsgError('');
    refreshUser?.();
    load();
  });

  useEffect(() => { load(); }, []);

  const claim = async (id) => {
    setMsg('');
    setMsgError('');
    try {
      const res = await api(`/rewards/claim/${id}`, { method: 'POST' });
      setMsg(`Claimed ₹${res.amount}!`);
      load();
    } catch (e) {
      setMsgError(e.message);
    }
  };

  const unclaimed = rewards.filter((r) => !r.claimed);

  return (
    <SubPageShell title="Rewards" className="page-rewards">
      <div className="daily-spin-inline">
        <SpinWheelVisual
          uid="rewards-daily"
          size="md"
          rotation={rotation}
          animating={animating}
          idle={!spinning && !result}
        />

        <div className="daily-spin-inline-info">
          <strong>Daily Spin</strong>
          {result ? (
            <p className="daily-spin-inline-win">You won ₹{result.amount}!</p>
          ) : spinError ? (
            <p className="daily-spin-inline-err">{spinError}</p>
          ) : (
            <p>{spinning ? 'Wheel is spinning...' : 'Spin once per day for free coins'}</p>
          )}
          <button
            type="button"
            className="sub-btn sub-btn-gold daily-spin-inline-btn"
            onClick={() => {
              setMsg('');
              setMsgError('');
              spin();
            }}
            disabled={spinning}
          >
            {spinning ? 'Spinning...' : result ? 'Claimed Today' : 'Spin Now'}
          </button>
        </div>
      </div>

      {msg && <div className="sub-alert sub-alert-success">{msg}</div>}
      {error && <div className="sub-alert sub-alert-error">{error}</div>}

      <div className="sub-section-head">
        <h2>YOUR REWARDS</h2>
        <span>{unclaimed.length} pending</span>
      </div>

      <div className="sub-list">
        {rewards.length ? rewards.map((r) => (
          <div key={r.id} className="sub-list-item">
            <span className={`sub-list-icon sub-list-icon-${r.claimed ? 'green' : 'gold'}`}>
              <QuickLinkIcon name="bonus" />
            </span>
            <div className="sub-list-body">
              <strong>{r.title}</strong>
              <span>{r.type}</span>
            </div>
            <span className="reward-amount">₹{r.amount}</span>
            {!r.claimed ? (
              <button type="button" className="sub-btn-sm sub-btn-gold" onClick={() => claim(r.id)}>
                Claim
              </button>
            ) : (
              <span className="sub-badge sub-badge-green">Claimed</span>
            )}
          </div>
        )) : (
          <div className="sub-empty">
            <span className="sub-empty-icon"><QuickLinkIcon name="bonus" /></span>
            <p>No rewards yet — play games to earn!</p>
          </div>
        )}
      </div>
    </SubPageShell>
  );
}
