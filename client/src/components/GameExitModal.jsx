import { motion, AnimatePresence } from 'framer-motion';

export default function GameExitModal({ open, onCancel, onConfirm }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="game-exit-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          role="presentation"
        >
          <motion.div
            className="game-exit-modal"
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-exit-title"
          >
            <div className="game-exit-modal-icon" aria-hidden>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 id="game-exit-title" className="game-exit-modal-title">Leave game?</h2>
            <p className="game-exit-modal-text">
              Your progress in this match will be lost if you exit now.
            </p>
            <div className="game-exit-modal-actions">
              <button type="button" className="game-exit-btn game-exit-btn--cancel" onClick={onCancel}>
                Cancel
              </button>
              <button type="button" className="game-exit-btn game-exit-btn--confirm" onClick={onConfirm}>
                Exit
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
