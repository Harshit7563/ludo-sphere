import { motion } from 'framer-motion';
import QuickLinkIcon from './QuickLinkIcons';

export default function TournamentCta({ onClick }) {
  return (
    <motion.button
      type="button"
      className="rush-tournament-cta"
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-label="Join live tournaments"
    >
      <span className="rush-tournament-shine" aria-hidden />
      <span className="rush-tournament-ring" aria-hidden />

      <span className="rush-tournament-icon-box" aria-hidden>
        <span className="rush-tournament-icon-glow" />
        <QuickLinkIcon name="events" className="rush-tournament-svg" />
      </span>

      <span className="rush-tournament-copy">
        <span className="rush-tournament-eyebrow">
          <span className="rush-tournament-live">
            <span className="rush-tournament-live-dot" />
            LIVE
          </span>
          Championship mode
        </span>
        <span className="rush-tournament-title">Tournaments</span>
        <span className="rush-tournament-hint">Big prize pools · limited slots</span>
      </span>

      <span className="rush-tournament-action" aria-hidden>
        <span className="rush-tournament-action-label">Enter</span>
        <span className="rush-tournament-action-arrow">→</span>
      </span>
    </motion.button>
  );
}
