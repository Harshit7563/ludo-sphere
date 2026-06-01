import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import RushHeader from '../components/RushHeader';
import MenuIcon from '../components/MenuIcons';
import StatIcon from '../components/StatIcons';

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

function formatAmount(n) {
  const num = Number(n) || 0;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}K`;
  return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function formatMoney(n) {
  return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('deposit');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api('/wallet')
      .then(setWallet)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const kycStatus = wallet?.kycStatus || 'none';
  const kycBlocksWithdraw =
    mode === 'withdraw' && (wallet?.kycRequiredForWithdraw ?? kycStatus !== 'verified');

  const submit = async () => {
    const val = Number(amount);
    if (!val || val <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (mode === 'withdraw' && kycBlocksWithdraw) {
      if (kycStatus === 'pending') {
        setError('KYC review chal rahi hai. Withdraw verify hone ke baad hi hoga.');
      } else {
        setError('Withdrawal ke liye KYC complete karna zaroori hai.');
        navigate('/kyc');
      }
      return;
    }
    setError('');
    setMsg('');
    setBusy(true);
    try {
      const endpoint = mode === 'deposit' ? '/wallet/deposit' : '/wallet/withdraw';
      const res = await api(endpoint, { method: 'POST', body: JSON.stringify({ amount: val }) });
      setMsg(
        mode === 'deposit'
          ? `₹${formatMoney(val)} added successfully!`
          : res.message || 'Withdrawal request submitted'
      );
      setAmount('');
      refreshUser();
      load();
    } catch (e) {
      setError(e.message);
      if (e.code === 'KYC_REQUIRED') navigate('/kyc');
    } finally {
      setBusy(false);
    }
  };

  const balance = Number(wallet?.balance || 0);
  const bonus = Number(wallet?.bonus_balance || 0);

  return (
    <div className="page page-rush page-wallet">
      <div className="rush-bg-effects">
        <span className="rush-orb rush-orb-1" />
        <span className="rush-orb rush-orb-2" />
      </div>

      <RushHeader />

      {loading ? (
        <div className="wallet-loading">
          <div className="loader" />
          <p>Loading wallet...</p>
        </div>
      ) : (
        <>
          <motion.div
            className="wallet-balance-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="wallet-balance-top">
              <span className="wallet-balance-label">Total Balance</span>
              <span className="wallet-balance-chip">🪙 INR</span>
            </div>
            <div className="wallet-balance-amount">
              <span className="wallet-currency">₹</span>
              {formatMoney(balance)}
            </div>
            <div className="wallet-balance-row">
              <div>
                <small>Bonus</small>
                <strong>₹{formatMoney(bonus)}</strong>
              </div>
              <div>
                <small>Withdrawable</small>
                <strong>₹{formatMoney(balance)}</strong>
              </div>
            </div>
          </motion.div>

          <div className="wallet-stats">
            <div className="wallet-stat wallet-stat-green">
              <StatIcon name="wins" />
              <strong>₹{formatMoney(wallet?.total_won)}</strong>
              <span>Total Won</span>
            </div>
            <div className="wallet-stat wallet-stat-red">
              <StatIcon name="losses" />
              <strong>₹{formatMoney(wallet?.total_lost)}</strong>
              <span>Total Lost</span>
            </div>
            <div className="wallet-stat wallet-stat-blue">
              <MenuIcon name="wallet" />
              <strong>₹{formatMoney(wallet?.total_deposited)}</strong>
              <span>Deposited</span>
            </div>
            <div className="wallet-stat wallet-stat-orange">
              <MenuIcon name="transactions" />
              <strong>₹{formatMoney(wallet?.total_withdrawn)}</strong>
              <span>Withdrawn</span>
            </div>
          </div>

          <div className="wallet-section">
            <h2>ADD / WITHDRAW FUNDS</h2>

            <div className="wallet-mode-tabs">
              <button
                type="button"
                className={`wallet-mode-tab ${mode === 'deposit' ? 'active deposit' : ''}`}
                onClick={() => { setMode('deposit'); setError(''); setMsg(''); }}
              >
                Deposit
              </button>
              <button
                type="button"
                className={`wallet-mode-tab ${mode === 'withdraw' ? 'active withdraw' : ''}`}
                onClick={() => { setMode('withdraw'); setError(''); setMsg(''); }}
              >
                Withdraw
              </button>
            </div>

            {msg && <div className="wallet-toast success">{msg}</div>}
            {error && <div className="wallet-toast error">{error}</div>}

            {mode === 'withdraw' && kycBlocksWithdraw && (
              <div className={`wallet-kyc-banner ${kycStatus === 'pending' ? 'pending' : 'required'}`}>
                <span className="wallet-kyc-banner-icon" aria-hidden>
                  {kycStatus === 'pending' ? '⏳' : '🪪'}
                </span>
                <div className="wallet-kyc-banner-copy">
                  <strong>
                    {kycStatus === 'pending'
                      ? 'KYC under review'
                      : 'KYC required to withdraw'}
                  </strong>
                  <p>
                    {kycStatus === 'pending'
                      ? 'Verification usually takes 24-48 hours. You can withdraw after approval.'
                      : 'Complete PAN & Aadhaar verification to unlock withdrawals.'}
                  </p>
                </div>
                {kycStatus !== 'pending' && (
                  <button type="button" className="wallet-kyc-banner-btn" onClick={() => navigate('/kyc')}>
                    Verify now
                  </button>
                )}
              </div>
            )}

            <div className="wallet-form-card">
              <label htmlFor="walletAmount">Amount (₹)</label>
              <div className="wallet-input-wrap">
                <span>₹</span>
                <input
                  id="walletAmount"
                  className="wallet-input"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                />
              </div>

              <p className="wallet-quick-label">Quick select</p>
              <div className="wallet-quick-amounts">
                {QUICK_AMOUNTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={`wallet-quick-btn ${Number(amount) === q ? 'active' : ''}`}
                    onClick={() => setAmount(String(q))}
                  >
                    ₹{formatAmount(q)}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className={`wallet-submit-btn ${mode}`}
                disabled={busy || (mode === 'withdraw' && kycBlocksWithdraw)}
                onClick={submit}
              >
                {busy
                  ? 'Processing...'
                  : mode === 'deposit'
                    ? 'Deposit Now'
                    : kycBlocksWithdraw
                      ? 'Complete KYC first'
                      : 'Withdraw Now'}
              </button>

              {mode === 'withdraw' && !kycBlocksWithdraw && (
                <p className="wallet-hint">Withdrawals are processed within 24-48 hours</p>
              )}
            </div>
          </div>

          <button type="button" className="wallet-history-btn" onClick={() => navigate('/transactions')}>
            <span className="profile-menu-icon profile-menu-icon-blue">
              <MenuIcon name="transactions" />
            </span>
            <span className="wallet-history-label">Transaction History</span>
            <span className="profile-menu-arrow">›</span>
          </button>
        </>
      )}
    </div>
  );
}
