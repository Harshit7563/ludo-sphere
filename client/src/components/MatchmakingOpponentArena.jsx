import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KFP_AVATARS, getAvatarSrc, getKfpAvatar } from '../data/kungFuPandaAvatars';

const ORBIT_SLOTS = 4;

function resolvePlayerAvatar(player, fallbackIndex = 0) {
  if (player?.avatarUrl) {
    const kfp = getKfpAvatar(player.avatarUrl);
    if (kfp) return kfp.src;
    if (!player.avatarUrl.startsWith('kfp:')) return player.avatarUrl;
  }
  return KFP_AVATARS[fallbackIndex % KFP_AVATARS.length].src;
}

function resolvePlayerName(player) {
  return player?.displayName || player?.username || 'Player';
}

function shuffleAvatars() {
  const pool = [...KFP_AVATARS].sort(() => Math.random() - 0.5);
  return Array.from({ length: ORBIT_SLOTS }, (_, i) => pool[i % pool.length].src);
}

export default function MatchmakingOpponentArena({
  phase = 'scanning',
  myUser,
  opponents = [],
}) {
  const [orbitSrcs, setOrbitSrcs] = useState(() => shuffleAvatars());
  const myAvatar = getAvatarSrc(myUser);

  useEffect(() => {
    if (phase !== 'scanning') return undefined;
    setOrbitSrcs(shuffleAvatars());
    const timer = setInterval(() => setOrbitSrcs(shuffleAvatars()), 650);
    return () => clearInterval(timer);
  }, [phase]);

  const revealList = useMemo(
    () =>
      opponents.map((p, i) => ({
        id: p.id || i,
        name: resolvePlayerName(p),
        src: resolvePlayerAvatar(p, i + 2),
      })),
    [opponents],
  );

  const isMatched = phase === 'matched' && revealList.length > 0;

  return (
    <div className={`mm-opponent-arena${isMatched ? ' is-matched' : ''}`}>
      <div className="mm-opponent-arena-glow" aria-hidden />

      <AnimatePresence mode="wait">
        {!isMatched ? (
          <motion.div
            key="scan"
            className="mm-opponent-scan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
          >
            <div className="mm-orbit-ring">
              {orbitSrcs.map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  className="mm-orbit-slot"
                  style={{ '--orbit-i': i }}
                >
                  <img src={src} alt="" className="mm-orbit-avatar" />
                </div>
              ))}
            </div>
            <div className="mm-opponent-center">
              <img src={myAvatar} alt="" className="mm-opponent-center-img" />
              <span className="mm-opponent-you">You</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="matched"
            className="mm-opponent-matched"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          >
            <div className="mm-opponent-vs-row">
              <div className="mm-opponent-card mm-opponent-card--you">
                <img src={myAvatar} alt="" />
                <strong>You</strong>
              </div>
              <span className="mm-opponent-vs">VS</span>
              {revealList.map((opp) => (
                <div key={opp.id} className="mm-opponent-card mm-opponent-card--foe">
                  <motion.img
                    src={opp.src}
                    alt=""
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.08 }}
                  />
                  <motion.strong
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {opp.name}
                  </motion.strong>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { resolvePlayerAvatar, resolvePlayerName };
