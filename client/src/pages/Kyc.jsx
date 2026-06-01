import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';

const STATUS = {
  none: {
    title: 'Verify Your Identity',
    desc: 'Required for withdrawals — verify PAN & Aadhaar',
    tone: 'default',
    icon: '🪪',
  },
  pending: {
    title: 'Under Review',
    desc: 'We are verifying your documents. Usually takes 24-48 hours.',
    tone: 'pending',
    icon: '⏳',
  },
  verified: {
    title: 'KYC Verified',
    desc: 'Your identity is verified. Full wallet features unlocked.',
    tone: 'verified',
    icon: '✅',
  },
  rejected: {
    title: 'Verification Failed',
    desc: 'Please check details and submit again.',
    tone: 'rejected',
    icon: '❌',
  },
};

export default function Kyc() {
  const navigate = useNavigate();
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    panNumber: '',
    aadhaarNumber: '',
    dateOfBirth: '',
  });

  const load = () => {
    setLoading(true);
    api('/kyc')
      .then((data) => {
        setKyc(data);
        if (data.fullName) {
          setForm((f) => ({
            ...f,
            fullName: data.fullName || '',
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : '',
          }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const status = kyc?.status || 'none';
  const meta = STATUS[status] || STATUS.none;
  const canSubmit = status === 'none' || status === 'rejected';

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setSubmitting(true);
    try {
      const res = await api('/kyc', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMsg(res.message || 'Submitted!');
      load();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="page page-rush page-kyc">
      <div className="rush-bg-effects">
        <span className="rush-orb rush-orb-1" />
        <span className="rush-orb rush-orb-2" />
      </div>

      <div className="kyc-topbar">
        <button type="button" className="kyc-back" onClick={() => navigate(-1)} aria-label="Go back">
          ←
        </button>
        <h1>KYC Verification</h1>
      </div>

      {loading ? (
        <div className="kyc-loading">
          <div className="loader" />
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <motion.div
            className={`kyc-status-card kyc-status-${meta.tone}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="kyc-status-icon">{meta.icon}</span>
            <div>
              <strong>{meta.title}</strong>
              <p>{meta.desc}</p>
            </div>
            <span className={`kyc-status-pill kyc-pill-${meta.tone}`}>
              {status === 'none' ? 'Required' : status}
            </span>
          </motion.div>

          {status === 'rejected' && kyc?.rejectionReason && (
            <div className="kyc-alert rejected">{kyc.rejectionReason}</div>
          )}

          {msg && (
            <div className={`kyc-alert ${msg.includes('success') || msg.includes('Submitted') ? 'success' : 'error'}`}>
              {msg}
            </div>
          )}

          {(status === 'pending' || status === 'verified') && (
            <div className="kyc-details-card">
              <h2>SUBMITTED DETAILS</h2>
              <div className="kyc-detail-row">
                <span>Name</span>
                <strong>{kyc.fullName || '—'}</strong>
              </div>
              <div className="kyc-detail-row">
                <span>PAN</span>
                <strong>{kyc.panMasked || '—'}</strong>
              </div>
              <div className="kyc-detail-row">
                <span>Aadhaar</span>
                <strong>{kyc.aadhaarLast4 ? `XXXX XXXX ${kyc.aadhaarLast4}` : '—'}</strong>
              </div>
              {kyc.submittedAt && (
                <div className="kyc-detail-row">
                  <span>Submitted</span>
                  <strong>{new Date(kyc.submittedAt).toLocaleDateString('en-IN')}</strong>
                </div>
              )}
            </div>
          )}

          {canSubmit && (
            <>
              <div className="kyc-steps">
                <div className="kyc-step active"><span>1</span> Details</div>
                <div className="kyc-step-line" />
                <div className="kyc-step"><span>2</span> Review</div>
                <div className="kyc-step-line" />
                <div className="kyc-step"><span>3</span> Verified</div>
              </div>

              <form className="kyc-form" onSubmit={submit}>
                <h2>ENTER DETAILS</h2>
                <p className="kyc-form-note">Use the same name as on your PAN & Aadhaar card</p>

                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  className="profile-input"
                  value={form.fullName}
                  onChange={set('fullName')}
                  placeholder="As per PAN card"
                  required
                />

                <label htmlFor="panNumber">PAN Number</label>
                <input
                  id="panNumber"
                  className="profile-input"
                  value={form.panNumber}
                  onChange={set('panNumber')}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  required
                  style={{ textTransform: 'uppercase' }}
                />

                <label htmlFor="aadhaarNumber">Aadhaar Number</label>
                <input
                  id="aadhaarNumber"
                  className="profile-input"
                  value={form.aadhaarNumber}
                  onChange={set('aadhaarNumber')}
                  placeholder="12 digit Aadhaar"
                  inputMode="numeric"
                  maxLength={12}
                  required
                />

                <label htmlFor="dateOfBirth">Date of Birth (optional)</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  className="profile-input"
                  value={form.dateOfBirth}
                  onChange={set('dateOfBirth')}
                />

                <button type="submit" className="profile-save-btn" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </form>
            </>
          )}

          <div className="kyc-info-card">
            <strong>Why KYC?</strong>
            <ul>
              <li>Secure withdrawals to your bank</li>
              <li>Higher deposit & prize limits</li>
              <li>Protect your account from fraud</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
