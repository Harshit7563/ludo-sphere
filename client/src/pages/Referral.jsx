import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import SubPageShell from '../components/SubPageShell';
import HandshakeIcon from '../components/HandshakeIcon';
import MenuIcon from '../components/MenuIcons';
import ReferralShareButtons from '../components/ReferralShareButtons';

export default function Referral() {
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { api('/rewards/referral').then(setData).catch(console.error); }, []);

  const copyCode = () => {
    navigator.clipboard?.writeText(data?.referralCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referrerBonus = data?.bonus?.referrer || 50;
  const referredBonus = data?.bonus?.referred || 25;

  return (
    <SubPageShell title="Refer & Earn" className="page-referral">
      <motion.div
        className="sub-hero sub-hero-green"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <HandshakeIcon />
        <div>
          <strong>Invite Friends</strong>
          <p>Share your code & earn rewards together</p>
        </div>
      </motion.div>

      <motion.div
        className="ref-code-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <span className="ref-code-label">Your Referral Code</span>
        <div className="ref-code-value">{data?.referralCode || '—'}</div>
        <div className="ref-code-actions">
          <button type="button" className="sub-btn sub-btn-gold" onClick={copyCode}>
            {copied ? '✓ Copied!' : 'Copy Code'}
          </button>
          <ReferralShareButtons code={data?.referralCode} />
        </div>
      </motion.div>

      <div className="ref-bonus-row">
        <div className="ref-bonus-box">
          <span>You Earn</span>
          <strong>₹{referrerBonus}</strong>
        </div>
        <div className="ref-bonus-divider" />
        <div className="ref-bonus-box highlight">
          <span>Friend Gets</span>
          <strong>₹{referredBonus}</strong>
        </div>
      </div>

      <div className="sub-section-head">
        <h2>REFERRALS</h2>
        <span>{data?.referrals?.length || 0} joined</span>
      </div>

      <div className="sub-list">
        {data?.referrals?.length ? data.referrals.map((r) => (
          <div key={r.id} className="sub-list-item">
            <span className="sub-list-avatar">{(r.display_name || r.username)?.[0]?.toUpperCase()}</span>
            <div className="sub-list-body">
              <strong>{r.display_name || r.username}</strong>
              <span>{new Date(r.joined_at).toLocaleDateString('en-IN')}</span>
            </div>
            <span className={`sub-badge ${r.status === 'completed' ? 'sub-badge-green' : 'sub-badge-gold'}`}>
              {r.status}
            </span>
          </div>
        )) : (
          <div className="sub-empty">
            <span className="sub-empty-icon"><MenuIcon name="referral" /></span>
            <p>No referrals yet — share your code!</p>
          </div>
        )}
      </div>
    </SubPageShell>
  );
}
