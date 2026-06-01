import { motion } from 'framer-motion';

const DOTS = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]],
};

export default function DiceClassic({ value, rolling, onRoll, canRoll }) {
  const display = rolling ? null : (value || '?');
  const dots = display && display !== '?' ? DOTS[display] : null;

  return (
    <motion.button
      type="button"
      className={`dice-classic ${rolling ? 'rolling' : ''} ${canRoll ? 'can-roll' : ''}`}
      onClick={onRoll}
      disabled={!canRoll}
      whileTap={canRoll ? { scale: 0.92 } : {}}
      animate={rolling ? { rotate: [0, 90, 180, 270, 360] } : {}}
      transition={{ duration: 0.55 }}
    >
      <div className="dice-face">
        {dots ? (
          <svg viewBox="0 0 100 100" className="dice-dots">
            {dots.map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="9" />
            ))}
          </svg>
        ) : (
          <span className="dice-q">🎲</span>
        )}
      </div>
      {canRoll && <span className="dice-hint">TAP TO ROLL</span>}
    </motion.button>
  );
}
