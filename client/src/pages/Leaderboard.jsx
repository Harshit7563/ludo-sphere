import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import RushHeader from '../components/RushHeader';
import MoneyRain from '../components/MoneyRain';

const PODIUM_META = [
  { rank: 2, medal: '🥈', height: 72, theme: 'lb-podium-silver' },
  { rank: 1, medal: '🏆', height: 96, theme: 'lb-podium-gold' },
  { rank: 3, medal: '🥉', height: 58, theme: 'lb-podium-bronze' },
];

function RankBadge({ rank }) {
  if (rank === 1) return <span className="lb-rank-badge lb-rank-1">🏆</span>;
  if (rank === 2) return <span className="lb-rank-badge lb-rank-2">🥈</span>;
  if (rank === 3) return <span className="lb-rank-badge lb-rank-3">🥉</span>;
  return <span className="lb-rank-badge lb-rank-n">#{rank}</span>;
}

export default function Leaderboard() {
  const location = useLocation();
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMoneyRain, setShowMoneyRain] = useState(true);

  useEffect(() => {
    setShowMoneyRain(true);
    const timer = setTimeout(() => setShowMoneyRain(false), 1300);
    return () => clearTimeout(timer);
  }, [location.key]);

  useEffect(() => {
    Promise.all([
      api('/leaderboard').then(setLeaders),
      api('/leaderboard/me').then(setMyRank),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);
  const myId = user?.id;

  const getByRank = (rank) => leaders[rank - 1];

  return (
    <div className="page page-rush page-leaderboard">
      {showMoneyRain && <MoneyRain />}
      <div className="rush-bg-effects">
        <span className="rush-orb rush-orb-1" />
        <span className="rush-orb rush-orb-2" />
      </div>

      <RushHeader />

      <motion.div
        className="lb-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="lb-hero-icon">📊</div>
        <div className="lb-hero-text">
          <h1>LEADERBOARD</h1>
          <p>Top players & rankings</p>
        </div>
        <div className="lb-hero-stat">
          <strong>{leaders.length}</strong>
          <span>PLAYERS</span>
        </div>
      </motion.div>

      {myRank && (
        <motion.div
          className="lb-my-rank"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="lb-my-rank-left">
            <span className="lb-my-rank-label">Your rank</span>
            <strong>#{myRank.rank || '—'}</strong>
          </div>
          <div className="lb-my-rank-stats">
            <div><span>Rating</span><strong>{myRank.rating ?? 1000}</strong></div>
            <div><span>Wins</span><strong>{myRank.wins ?? 0}</strong></div>
            <div><span>Losses</span><strong>{myRank.losses ?? 0}</strong></div>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="lb-loading">
          <div className="loader" />
          <p>Loading rankings...</p>
        </div>
      ) : leaders.length === 0 ? (
        <div className="lb-empty">
          <span>📊</span>
          <h3>No rankings yet</h3>
          <p>Play games to appear on the board</p>
        </div>
      ) : (
        <>
          {top3.length >= 2 && (
            <motion.div
              className="lb-podium"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {PODIUM_META.map(({ rank, medal, height, theme }) => {
                const player = getByRank(rank);
                if (!player) return <div key={rank} className="lb-podium-slot empty" />;

                return (
                  <div key={rank} className={`lb-podium-slot ${theme} ${rank === 1 ? 'first' : ''}`}>
                    <span className="lb-podium-medal">{medal}</span>
                    <div className="lb-podium-avatar">{(player.display_name || player.username)[0]}</div>
                    <p className="lb-podium-name">{player.display_name || player.username}</p>
                    <span className="lb-podium-rating">{player.rating} pts</span>
                    <div className="lb-podium-bar" style={{ height }} />
                  </div>
                );
              })}
            </motion.div>
          )}

          <div className="lb-section-head">
            <h2>ALL PLAYERS</h2>
          </div>

          <div className="lb-list">
            {(top3.length < 2 ? leaders : rest).map((l, i) => {
              const rank = top3.length < 2 ? i + 1 : i + 4;
              const isMe = l.user_id === myId;

              return (
                <motion.div
                  key={l.user_id}
                  className={`lb-row ${isMe ? 'lb-row-me' : ''} ${rank <= 3 ? `lb-row-top${rank}` : ''}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * Math.min(i, 8) }}
                >
                  <RankBadge rank={rank} />
                  <div className="lb-row-avatar">{(l.display_name || l.username)[0]}</div>
                  <div className="lb-row-info">
                    <p className="lb-row-name">
                      {l.display_name || l.username}
                      {isMe && <span className="lb-you-tag">YOU</span>}
                    </p>
                    <p className="lb-row-meta">{l.wins}W • {l.losses ?? 0}L • Rating {l.rating}</p>
                  </div>
                  <div className="lb-row-earn">
                    <span className="lb-earn-label">Won</span>
                    <strong>₹{Number(l.total_earnings || 0).toLocaleString('en-IN')}</strong>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
