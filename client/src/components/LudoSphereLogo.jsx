import { motion } from 'framer-motion';

const SIZES = {
  sm: { wrap: 44, orb: 36, textMain: 14, textSub: 7, gap: 4 },
  md: { wrap: 88, orb: 72, textMain: 26, textSub: 10, gap: 8 },
  lg: { wrap: 120, orb: 100, textMain: 38, textSub: 12, gap: 10 },
};

function SphereMark({ size, animated }) {
  const s = SIZES[size]?.orb ?? 72;
  const id = `ls-${size}`;

  return (
    <div
      className={`ls-sphere-mark ${animated ? 'ls-sphere-mark--animated' : ''}`}
      style={{ width: s, height: s }}
      aria-hidden
    >
      <span className="ls-orbit ls-orbit-a" />
      <span className="ls-orbit ls-orbit-b" />
      <span className="ls-orbit ls-orbit-c" />

      <svg className="ls-sphere-svg" viewBox="0 0 100 100" width={s} height={s}>
        <defs>
          <radialGradient id={`${id}-glow`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#ffe082" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0a0a12" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`${id}-clip`}>
            <circle cx="50" cy="50" r="42" />
          </clipPath>
        </defs>

        {/* Outer glow halo */}
        <circle cx="50" cy="50" r="46" fill={`url(#${id}-glow)`} opacity="0.35" className="ls-halo" />

        {/* 4-quadrant ludo sphere */}
        <g clipPath={`url(#${id}-clip)`}>
          <path d="M50 8 A42 42 0 0 1 92 50 L50 50 Z" fill="#ffb300" />
          <path d="M92 50 A42 42 0 0 1 50 92 L50 50 Z" fill="#43a047" />
          <path d="M50 92 A42 42 0 0 1 8 50 L50 50 Z" fill="#1e88e5" />
          <path d="M8 50 A42 42 0 0 1 50 8 L50 50 Z" fill="#e53935" />
        </g>

        {/* Sphere shading */}
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
        <ellipse cx="38" cy="34" rx="18" ry="12" fill={`url(#${id}-shine)`} opacity="0.7" />

        {/* Center dice */}
        <g className="ls-dice-float">
          <rect x="36" y="36" width="28" height="28" rx="6" fill="#fffef8" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />
          <circle cx="44" cy="44" r="2.8" fill="#c62828" />
          <circle cx="56" cy="56" r="2.8" fill="#c62828" />
          <circle cx="50" cy="50" r="2.8" fill="#c62828" />
        </g>
      </svg>

      <span className="ls-spark ls-spark-1" />
      <span className="ls-spark ls-spark-2" />
      <span className="ls-spark ls-spark-3" />
    </div>
  );
}

export default function LudoSphereLogo({
  size = 'md',
  animated = true,
  showText = true,
  layout = 'stack',
  className = '',
}) {
  const dim = SIZES[size] ?? SIZES.md;
  const isRow = layout === 'row';

  const content = (
    <>
      <SphereMark size={size} animated={animated} />
      {showText && (
        <div className={`ls-wordmark ${animated ? 'ls-wordmark--animated' : ''}`}>
          <span
            className="ls-title"
            style={{ fontSize: dim.textMain }}
          >
            LUDO
          </span>
          <span
            className="ls-subtitle"
            style={{ fontSize: dim.textSub }}
          >
            SPHERE
          </span>
        </div>
      )}
    </>
  );

  if (!animated) {
    return (
      <div
        className={`ls-logo ls-logo--${size} ls-logo--${layout} ${className}`.trim()}
        style={{ gap: dim.gap }}
      >
        {content}
      </div>
    );
  }

  return (
    <motion.div
      className={`ls-logo ls-logo--${size} ls-logo--${layout} ${className}`.trim()}
      style={{ gap: dim.gap }}
      initial={{ opacity: 0, scale: 0.82, y: isRow ? 0 : 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      {content}
    </motion.div>
  );
}
