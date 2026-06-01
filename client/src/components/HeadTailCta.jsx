import { motion } from 'framer-motion';

export default function HeadTailCta({ onClick }) {
  return (
    <motion.button
      type="button"
      className="rush-headtail-cta"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.012 }}
      onClick={onClick}
      aria-label="Play Head and Tail"
    >
      <span className="rush-headtail-border-glow" aria-hidden />
      <span className="rush-headtail-shine" aria-hidden />
      <span className="rush-headtail-spark rush-headtail-spark--1" aria-hidden>
        ✦
      </span>
      <span className="rush-headtail-spark rush-headtail-spark--2" aria-hidden>
        ✦
      </span>

      <div className="rush-headtail-top">
        <span className="rush-headtail-live">
          <span className="rush-headtail-live-dot" />
          LIVE
        </span>
        <span className="rush-headtail-badge">Win up to 2×</span>
      </div>

      <div className="rush-headtail-footer">
        <span className="rush-headtail-copy">
          <span className="rush-headtail-mode">Instant flip mode</span>
          <span className="rush-headtail-title">Head & Tail</span>
          <span className="rush-headtail-hint">Pick side · auto flip · 15s rounds</span>
        </span>

        <span className="rush-headtail-action">
          <span className="rush-headtail-action-label">Play</span>
          <span className="rush-headtail-action-arrow">→</span>
        </span>
      </div>
    </motion.button>
  );
}
