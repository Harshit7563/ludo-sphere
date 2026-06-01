import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MODES = [
  {
    id: 'online-2',
    players: 2,
    label: 'ONLINE',
    sub: '2 PLAYER',
    gradient: 'linear-gradient(160deg, #5cdb5c 0%, #2eb872 40%, #1a9d5c 100%)',
    shadow: '0 12px 0 #148f52, 0 20px 40px rgba(46, 184, 114, 0.35)',
    path: '/matchmaking',
  },
  {
    id: 'online-4',
    players: 4,
    label: 'ONLINE',
    sub: '4 PLAYER',
    gradient: 'linear-gradient(160deg, #5eb3ff 0%, #3a86ff 40%, #2563eb 100%)',
    shadow: '0 12px 0 #1d4ed8, 0 20px 40px rgba(58, 134, 255, 0.35)',
    path: '/matchmaking',
  },
  {
    id: 'private',
    players: 2,
    label: 'PRIVATE',
    sub: 'ROOM',
    gradient: 'linear-gradient(160deg, #c77dff 0%, #9b5de5 50%, #7b2cbf 100%)',
    shadow: '0 12px 0 #6a1b9a, 0 20px 40px rgba(155, 93, 229, 0.35)',
    path: '/create-room',
  },
];

function MiniBoard() {
  return (
    <div className="carousel-board">
      <div className="carousel-board-inner">
        <div className="cb-corner cb-r" />
        <div className="cb-corner cb-g" />
        <div className="cb-corner cb-y" />
        <div className="cb-corner cb-b" />
        <div className="cb-center">🏆</div>
      </div>
      <div className="carousel-dice">
        <span className="cdie">⚀</span>
        <span className="cdie">⚁</span>
      </div>
    </div>
  );
}

export default function GameModeCarousel() {
  const [playerMode, setPlayerMode] = useState(2);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const handlePlay = () => {
    const mode = MODES[activeIndex];
    if (mode.id === 'private') {
      navigate('/create-room');
    } else {
      const p = mode.id === 'online-4' ? 4 : playerMode;
      navigate(`/matchmaking?mode=${p}p`);
    }
  };

  const onScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardWidth = el.offsetWidth * 0.78;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(idx, MODES.length - 1));
  };

  return (
    <section className="mode-carousel-section">
      <div className="mode-carousel-track" ref={scrollRef} onScroll={onScroll}>
        {MODES.map((mode, i) => (
          <motion.article
            key={mode.id}
            className={`mode-hero-card ${activeIndex === i ? 'active' : ''}`}
            style={{ background: mode.gradient, boxShadow: mode.shadow }}
            onClick={() => {
              setActiveIndex(i);
              scrollRef.current?.scrollTo({ left: i * scrollRef.current.offsetWidth * 0.78, behavior: 'smooth' });
            }}
            whileTap={{ scale: 0.98 }}
          >
            <MiniBoard />
            <div className="mode-hero-text">
              <span className="mode-hero-label">{mode.label}</span>
              <span className="mode-hero-sub">{mode.sub}</span>
            </div>
          </motion.article>
        ))}
      </div>

      {activeIndex < 2 && (
        <div className="player-toggle">
          <button
            type="button"
            className={`toggle-btn ${playerMode === 2 ? 'active' : ''}`}
            onClick={() => setPlayerMode(2)}
          >
            2P
          </button>
          <button
            type="button"
            className={`toggle-btn ${playerMode === 4 ? 'active' : ''}`}
            onClick={() => setPlayerMode(4)}
          >
            4P
          </button>
        </div>
      )}

      <button type="button" className="btn-play-now" onClick={handlePlay}>
        PLAY NOW
      </button>

      <div className="quick-links">
        <button type="button" className="quick-link-btn" onClick={() => navigate('/join-room')}>Join</button>
        <button type="button" className="quick-link-btn" onClick={() => navigate('/friends')}>Friends</button>
        <button type="button" className="quick-link-btn" onClick={() => navigate('/leaderboard', { state: { moneyRain: true } })}>Rank</button>
        <button type="button" className="quick-link-btn" onClick={() => navigate('/profile')}>Profile</button>
      </div>
    </section>
  );
}
