import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import RushHeader from '../components/RushHeader';

const CARD_THEMES = ['rush-tourney-gold', 'rush-tourney-purple', 'rush-tourney-cyan', 'rush-tourney-orange'];

function formatDate(dateStr) {
  if (!dateStr) return 'Starting soon';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function playerPercent(registered, max) {
  const r = Number(registered) || 0;
  const m = Number(max) || 1;
  return Math.min(100, Math.round((r / m) * 100));
}

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [joining, setJoining] = useState(null);

  const load = () => {
    setLoading(true);
    api('/tournaments')
      .then(setTournaments)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const join = async (id) => {
    setJoining(id);
    setMsg('');
    try {
      await api(`/tournaments/${id}/join`, { method: 'POST' });
      setMsg('You are in! Good luck 🏆');
      load();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setJoining(null);
    }
  };

  const liveCount = tournaments.filter(t => t.status === 'registration' || t.status === 'active').length;

  return (
    <div className="page page-rush page-tournaments">
      <div className="rush-bg-effects">
        <span className="rush-orb rush-orb-1" />
        <span className="rush-orb rush-orb-2" />
      </div>

      <RushHeader />

      <motion.div
        className="tourney-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="tourney-hero-icon">🏆</div>
        <div className="tourney-hero-text">
          <h1>ARENA</h1>
          <p>Compete & win big prizes</p>
        </div>
        <div className="tourney-hero-stat">
          <strong>{liveCount}</strong>
          <span>LIVE</span>
        </div>
      </motion.div>

      {msg && (
        <motion.div
          className={`tourney-toast ${msg.includes('luck') ? 'success' : 'error'}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {msg}
        </motion.div>
      )}

      {loading ? (
        <div className="tourney-loading">
          <div className="loader" />
          <p>Loading arenas...</p>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="tourney-empty">
          <span>🏟️</span>
          <h3>No tournaments yet</h3>
          <p>Check back soon for new events</p>
        </div>
      ) : (
        <div className="tourney-list">
          {tournaments.map((t, i) => {
            const pct = playerPercent(t.registered_count, t.max_players);
            const theme = CARD_THEMES[i % CARD_THEMES.length];
            const isFull = pct >= 100;
            const isRegistered = t.is_registered;

            return (
              <motion.article
                key={t.id}
                className={`tourney-card ${theme}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="tourney-card-head">
                  <span className="tourney-card-icon">🏆</span>
                  <span className={`tourney-status status-${t.status}`}>{t.status}</span>
                </div>

                <h2 className="tourney-name">{t.name}</h2>
                <p className="tourney-meta">
                  {t.mode?.toUpperCase() || '4P'} • {formatDate(t.starts_at)}
                </p>

                <div className="tourney-prize-row">
                  <div className="tourney-prize-box">
                    <span className="label">Entry</span>
                    <strong>₹{Number(t.entry_fee).toFixed(0)}</strong>
                  </div>
                  <div className="tourney-prize-divider" />
                  <div className="tourney-prize-box highlight">
                    <span className="label">Prize Pool</span>
                    <strong>₹{Number(t.prize_pool).toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="tourney-slots">
                  <div className="tourney-slots-top">
                    <span>Players joined</span>
                    <span>{t.registered_count || 0}/{t.max_players}</span>
                  </div>
                  <div className="tourney-slots-bar">
                    <motion.div
                      className="tourney-slots-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                    />
                  </div>
                </div>

                {isRegistered ? (
                  <div className="tourney-registered">
                    <span>✓</span> You're registered
                  </div>
                ) : (
                  <button
                    type="button"
                    className="tourney-join-btn"
                    disabled={joining === t.id || isFull}
                    onClick={() => join(t.id)}
                  >
                    {joining === t.id ? 'JOINING...' : isFull ? 'FULL' : 'JOIN TOURNAMENT →'}
                  </button>
                )}
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
