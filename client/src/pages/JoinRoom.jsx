import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import SubPageShell from '../components/SubPageShell';
import QuickLinkIcon from '../components/QuickLinkIcons';

export default function JoinRoom() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const join = async () => {
    if (code.length < 4) {
      setError('Enter a valid room code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api(`/rooms/join/${code.toUpperCase()}`, {
        method: 'POST',
        body: JSON.stringify({ code: code.toUpperCase() }),
      });
      navigate(`/game/${code.toUpperCase()}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SubPageShell title="Join Room" className="page-join-room">
      <motion.div
        className="sub-hero sub-hero-cyan"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="sub-hero-icon sub-hero-icon-cyan">
          <QuickLinkIcon name="join" />
        </span>
        <div>
          <strong>Enter Room Code</strong>
          <p>Join your friend&apos;s private Ludo room</p>
        </div>
      </motion.div>

      {error && <div className="sub-alert sub-alert-error">{error}</div>}

      <motion.div
        className="join-code-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onClick={() => inputRef.current?.focus()}
        role="presentation"
      >
        <label htmlFor="room-code">6-character code</label>
        <input
          ref={inputRef}
          id="room-code"
          className="join-code-input"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          placeholder=""
          maxLength={6}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="join-code-dots">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className={`join-code-dot ${code[i] ? 'filled' : ''}`}>
              {code[i] || ''}
            </span>
          ))}
        </div>
      </motion.div>

      <button type="button" className="sub-btn sub-btn-primary mm-find-btn" onClick={join} disabled={loading || code.length < 4}>
        {loading ? 'Joining...' : 'Join Game'}
      </button>
    </SubPageShell>
  );
}
