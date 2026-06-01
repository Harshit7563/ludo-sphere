import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import SubPageShell from '../components/SubPageShell';
import QuickLinkIcon from '../components/QuickLinkIcons';
import ModeIcon from '../components/ModeIcons';
import { formatRupee, grossPrizePool, winnerPrizeFromEntry } from '../utils/matchPrize';

const MODES = [
  { id: '2p', label: '2 Players', sub: '1v1 Private', icon: '2p' },
  { id: '4p', label: '4 Players', sub: 'Classic Ludo', icon: '4p' },
];

const FEES = [
  { value: 0, label: 'Free', sub: 'Practice' },
  { value: 10, label: '₹10', sub: 'Starter' },
  { value: 50, label: '₹50', sub: 'Pro' },
  { value: 100, label: '₹100', sub: 'High' },
];

function stakePrize(fee, mode) {
  if (fee <= 0) return 'Practice';
  if (mode === '2p') return formatRupee(winnerPrizeFromEntry(fee, '2p'));
  return formatRupee(grossPrizePool(fee, mode));
}

function entryLabel(fee) {
  return FEES.find((f) => f.value === fee)?.label || formatRupee(fee);
}

export default function CreateRoom() {
  const [mode, setMode] = useState('4p');
  const [entryFee, setEntryFee] = useState(0);
  const [customOpen, setCustomOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const selectedMode = MODES.find((m) => m.id === mode) || MODES[0];
  const maxPlayers = mode === '2p' ? 2 : 4;
  const balance = Number(user?.balance ?? 0);
  const canAfford = entryFee <= 0 || balance >= entryFee;

  const create = async () => {
    if (!canAfford) {
      setError('Insufficient wallet balance for this entry fee');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const room = await api('/rooms/create', {
        method: 'POST',
        body: JSON.stringify({ mode, entryFee: Number(entryFee), isPrivate: true }),
      });
      navigate(`/game/${room.room_code}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SubPageShell title="Create Room" className="page-create-room">
      <motion.div
        className="cr-setup"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="cr-hero">
          <span className="cr-hero-shine" aria-hidden />
          <div className="cr-hero-top">
            <span className="cr-hero-icon">
              <QuickLinkIcon name="private" />
            </span>
            <span className="cr-hero-badge">Private</span>
          </div>
          <strong className="cr-hero-title">Host a Room</strong>
          <p className="cr-hero-sub">Pick mode & stake — friends join with your room code</p>
          {balance > 0 && (
            <div className="cr-wallet-pill">
              <span>Wallet</span>
              <strong>{formatRupee(balance)}</strong>
            </div>
          )}
        </div>

        <ol className="cr-steps" aria-label="How it works">
          <li className="cr-step cr-step--done">
            <span className="cr-step-num">1</span>
            <span>Setup</span>
          </li>
          <li className="cr-step cr-step--active">
            <span className="cr-step-num">2</span>
            <span>Stake</span>
          </li>
          <li className="cr-step">
            <span className="cr-step-num">3</span>
            <span>Invite</span>
          </li>
        </ol>

        {error && <div className="sub-alert sub-alert-error cr-alert">{error}</div>}

        <section className="cr-panel">
          <header className="cr-panel-head">
            <h2>Game Mode</h2>
            <span>{maxPlayers} seats</span>
          </header>
          <div className="mm-mode-grid">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`mm-mode-card mm-mode-${m.id} ${mode === m.id ? 'active' : ''}`}
                onClick={() => setMode(m.id)}
              >
                <span className="mm-mode-icon">
                  <ModeIcon type={m.icon} />
                </span>
                <strong>{m.label}</strong>
                <span>{m.sub}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="cr-panel cr-panel--stakes">
          <header className="cr-panel-head">
            <h2>Entry Fee</h2>
            <span>{mode === '2p' ? 'Winner takes 90%' : 'Full pool to winner'}</span>
          </header>

          <div className="mm-fee-pool-bar cr-pool-bar">
            <div className="mm-fee-pool-box">
              <span className="mm-fee-pool-label">Entry</span>
              <strong>{entryLabel(entryFee)}</strong>
            </div>
            <div className="mm-fee-pool-divider" />
            <div className="mm-fee-pool-box highlight">
              <span className="mm-fee-pool-label">{mode === '2p' ? 'You Win' : 'Prize Pool'}</span>
              <strong>{stakePrize(entryFee, mode)}</strong>
            </div>
          </div>

          <div className="mm-fee-grid cr-fee-grid">
            {FEES.map((f) => (
              <button
                key={f.value}
                type="button"
                className={`mm-fee-chip ${entryFee === f.value && !customOpen ? 'active' : ''}`}
                onClick={() => {
                  setEntryFee(f.value);
                  setCustomOpen(false);
                }}
              >
                <strong>{f.label}</strong>
                <span>{f.sub}</span>
                <em className="mm-fee-prize">{stakePrize(f.value, mode)}</em>
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`cr-custom-toggle ${customOpen ? 'open' : ''}`}
            onClick={() => setCustomOpen((v) => !v)}
          >
            <span>Custom amount</span>
            <span className="cr-custom-chevron" aria-hidden>
              ›
            </span>
          </button>

          {customOpen && (
            <motion.div
              className="cr-custom-field"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label htmlFor="cr-custom-fee">Enter stake (₹)</label>
              <input
                id="cr-custom-fee"
                type="number"
                min="0"
                value={entryFee || ''}
                onChange={(e) => setEntryFee(Number(e.target.value) || 0)}
                placeholder="0"
              />
            </motion.div>
          )}
        </section>

        <div className="cr-tips">
          <div className="cr-tip">
            <span className="cr-tip-icon">🔗</span>
            <p>Share the 6-letter code from the lobby after you create</p>
          </div>
          <div className="cr-tip">
            <span className="cr-tip-icon">👥</span>
            <p>Up to {maxPlayers - 1} friend{maxPlayers > 2 ? 's' : ''} can join before you start</p>
          </div>
        </div>

        <div className="mm-summary cr-summary">
          <div>
            <span>Mode</span>
            <strong>{selectedMode.label}</strong>
          </div>
          <div>
            <span>Entry</span>
            <strong>{entryLabel(entryFee)}</strong>
          </div>
          <div>
            <span>{mode === '2p' ? 'You Win' : 'Prize'}</span>
            <strong>{stakePrize(entryFee, mode)}</strong>
          </div>
        </div>

        <div className="cr-footer">
          {!canAfford && entryFee > 0 && (
            <p className="cr-balance-warn">Need {formatRupee(entryFee - balance)} more in wallet</p>
          )}
          <button
            type="button"
            className="mm-find-btn cr-create-btn"
            onClick={create}
            disabled={loading || !canAfford}
          >
            {loading ? 'Creating room…' : 'Create Room'}
          </button>
          <Link to="/join-room" className="cr-join-link">
            Have a code? <strong>Join room</strong>
          </Link>
        </div>
      </motion.div>
    </SubPageShell>
  );
}
