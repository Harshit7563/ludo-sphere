import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LobbyIcon from './LobbyIcons';
import QuickLinkIcon from './QuickLinkIcons';
import TournamentCta from './TournamentCta';
import HeadTailCta from './HeadTailCta';

const LOBBIES = [
  {
    id: '1v1',
    title: '1v1',
    sub: 'Ludo · head to head',
    fee: 0,
    prize: 'Up to ₹9K',
    players: '2P',
    gradient: 'rush-lobby-orange',
    icon: 'classic',
    path: '/matchmaking?mode=2p',
    hot: true,
  },
  {
    id: '2v2',
    title: '2v2',
    sub: 'Ludo · team battle',
    fee: 50,
    prize: '₹200',
    players: '4P',
    gradient: 'rush-lobby-purple',
    icon: 'pro',
    path: '/matchmaking?mode=4p',
  },
];

export default function RushLobbies() {
  const navigate = useNavigate();

  return (
    <section className="rush-lobbies">
      <div className="rush-section-head">
        <h2>
          <span className="rush-bolt-electric" aria-hidden="true">
            <span className="rush-bolt-glow" />
            <span className="rush-bolt-core">⚡</span>
            <span className="rush-bolt-arc rush-bolt-arc-1" />
            <span className="rush-bolt-arc rush-bolt-arc-2" />
          </span>
          BATTLE LOBBIES
        </h2>
        <span className="rush-live">
          <span className="rush-live-dot" aria-hidden />
          LIVE
        </span>
      </div>

      <div className="rush-lobby-grid rush-lobby-grid--ludo">
        {LOBBIES.map((lobby, i) => (
          <motion.button
            key={lobby.id}
            type="button"
            className={`rush-lobby-card ${lobby.gradient}${lobby.hot ? ' has-hot' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(lobby.path)}
          >
            {lobby.hot && (
              <span className="rush-hot-tag">
                <svg className="rush-hot-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <defs>
                    <linearGradient id="hot-flame" x1="12" y1="2" x2="12" y2="22">
                      <stop offset="0%" stopColor="#fff176" />
                      <stop offset="50%" stopColor="#ff9100" />
                      <stop offset="100%" stopColor="#ff1744" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M12 22c4-2.5 6.5-6 6.5-10.5C18.5 7 15.5 4 12 2 8.5 4 5.5 7 5.5 11.5 5.5 16 8 19.5 12 22z"
                    fill="url(#hot-flame)"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                  />
                </svg>
                <span>HOT</span>
              </span>
            )}
            <div className="rush-lobby-top">
              <span className={`rush-lobby-icon rush-lobby-icon-${lobby.icon}`}>
                <LobbyIcon name={lobby.icon} />
              </span>
              <div className="rush-lobby-top-right">
                <span className="rush-lobby-fee">{lobby.fee === 0 ? 'FREE' : `₹${lobby.fee}`}</span>
              </div>
            </div>
            <h3>{lobby.title}</h3>
            <p className="rush-lobby-sub">{lobby.sub}</p>
            <div className="rush-lobby-meta">
              <span>Win {lobby.prize}</span>
              <span>{lobby.players}</span>
            </div>
            <span className="rush-lobby-play">PLAY →</span>
          </motion.button>
        ))}

        <motion.div
          className="rush-private-room rush-lobby-span-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
        >
          <div className="rush-private-room-inner">
            <span className="rush-private-room-shine" aria-hidden />

            <div className="rush-private-room-head">
              <span className="rush-private-room-icon" aria-hidden>
                <QuickLinkIcon name="private" />
              </span>
              <div className="rush-private-room-copy">
                <span className="rush-private-room-badge">Private</span>
                <h3>Create or Join</h3>
              </div>
            </div>

            <div className="rush-private-room-split">
              <motion.button
                type="button"
                className="rush-private-room-tile rush-private-room-tile--create"
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/create-room')}
              >
                <span className="rush-private-room-tile-icon">
                  <QuickLinkIcon name="private" />
                </span>
                <span className="rush-private-room-tile-label">Create</span>
              </motion.button>

              <span className="rush-private-room-or" aria-hidden>
                <span>OR</span>
              </span>

              <motion.button
                type="button"
                className="rush-private-room-tile rush-private-room-tile--join"
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/join-room')}
              >
                <span className="rush-private-room-tile-icon">
                  <QuickLinkIcon name="join" />
                </span>
                <span className="rush-private-room-tile-label">Join</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <TournamentCta onClick={() => navigate('/tournaments')} />

      <HeadTailCta onClick={() => navigate('/head-tail')} />
    </section>
  );
}
