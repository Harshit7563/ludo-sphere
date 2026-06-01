/** Shared 3D SVG filters & defs — unique ids per icon via `id` prop */

function Defs3D({ id }) {
  const s = id;
  return (
    <defs>
      <filter id={`${s}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.45" />
        <feDropShadow dx="0" dy="4" stdDeviation="2.5" floodColor="#000" floodOpacity="0.2" />
      </filter>
      <filter id={`${s}-glow`} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="1.2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id={`${s}-shine`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}

const icons3d = {
  trophy: (id) => (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className="ex3d-svg">
      <Defs3D id={id} />
      <defs>
        <linearGradient id={`${id}-gold`} x1="16" y1="4" x2="16" y2="26">
          <stop offset="0%" stopColor="#fff9c4" />
          <stop offset="35%" stopColor="#ffd54f" />
          <stop offset="70%" stopColor="#ff8f00" />
          <stop offset="100%" stopColor="#e65100" />
        </linearGradient>
        <linearGradient id={`${id}-gold-side`} x1="0" y1="16" x2="32" y2="16">
          <stop offset="0%" stopColor="#ffb300" />
          <stop offset="50%" stopColor="#ffe082" />
          <stop offset="100%" stopColor="#ef6c00" />
        </linearGradient>
      </defs>
      <ellipse cx="16" cy="27" rx="9" ry="2.5" fill="#3e2723" opacity="0.35" />
      <path d="M11 24h10l1.5 3H9.5l1.5-3z" fill="#5d4037" filter={`url(#${id}-shadow)`} />
      <path d="M12 24h8v2H12v-2z" fill="#8d6e63" />
      <path d="M9 22h14v2H9v-2z" fill={`url(#${id}-gold-side)`} filter={`url(#${id}-shadow)`} />
      <path d="M10 6h12v6c0 4-2.8 7-6 7s-6-3-6-7V6z" fill={`url(#${id}-gold)`} filter={`url(#${id}-shadow)`} />
      <path d="M10 6h12v2H10V6z" fill="#fff8e1" opacity="0.7" />
      <path d="M8 6H5.5a3.5 3.5 0 007 0H8zm19 0h-2.5a3.5 3.5 0 01-7 0H19z" fill="#ef6c00" filter={`url(#${id}-shadow)`} />
      <path d="M8 6H6a3 3 0 006 0H8z" fill="#ffb300" />
      <path d="M20 6h2a3 3 0 01-6 0h2z" fill="#ff8f00" />
      <ellipse cx="13" cy="10" rx="2" ry="3" fill="#fff" opacity="0.35" />
    </svg>
  ),

  dice: (id) => (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className="ex3d-svg">
      <Defs3D id={id} />
      <defs>
        <linearGradient id={`${id}-top`} x1="8" y1="6" x2="24" y2="14">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0e0e0" />
        </linearGradient>
        <linearGradient id={`${id}-left`} x1="4" y1="14" x2="14" y2="28">
          <stop offset="0%" stopColor="#eeeeee" />
          <stop offset="100%" stopColor="#9e9e9e" />
        </linearGradient>
        <linearGradient id={`${id}-right`} x1="18" y1="14" x2="28" y2="28">
          <stop offset="0%" stopColor="#bdbdbd" />
          <stop offset="100%" stopColor="#757575" />
        </linearGradient>
      </defs>
      <ellipse cx="17" cy="28" rx="10" ry="2.5" fill="#000" opacity="0.25" />
      <path d="M18 12L26 17v9L18 31H10L4 26V17l6-5 8-5z" fill={`url(#${id}-right)`} filter={`url(#${id}-shadow)`} />
      <path d="M4 17l6 5v9l-6-5V17z" fill={`url(#${id}-left)`} filter={`url(#${id}-shadow)`} />
      <path d="M10 7l8 5 8-5-8-5-8 5z" fill={`url(#${id}-top)`} filter={`url(#${id}-shadow)`} />
      <path d="M10 7l8 5v3l-8-5V7z" fill="#fff" opacity="0.25" />
      <circle cx="14" cy="13" r="1.6" fill="#263238" />
      <circle cx="20" cy="19" r="1.6" fill="#263238" />
      <circle cx="20" cy="13" r="1.6" fill="#263238" />
      <circle cx="14" cy="19" r="1.6" fill="#263238" />
      <circle cx="17" cy="16" r="1.6" fill="#263238" />
    </svg>
  ),

  fire: (id) => (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className="ex3d-svg">
      <Defs3D id={id} />
      <defs>
        <radialGradient id={`${id}-core`} cx="50%" cy="80%" r="55%">
          <stop offset="0%" stopColor="#ffeb3b" />
          <stop offset="40%" stopColor="#ff9800" />
          <stop offset="100%" stopColor="#d50000" />
        </radialGradient>
        <linearGradient id={`${id}-outer`} x1="16" y1="28" x2="16" y2="6">
          <stop offset="0%" stopColor="#ff5722" />
          <stop offset="50%" stopColor="#ff9800" />
          <stop offset="100%" stopColor="#ffeb3b" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <ellipse cx="16" cy="28" rx="7" ry="2" fill="#bf360c" opacity="0.3" />
      <path
        d="M16 27c4.5-2.5 7.5-6 7.5-10.5 0-3.5-2.5-6.5-4.5-8.5.8 3.5-1.5 5.5-2.5 8-1-4-3.5-5.5-5-8.5 0 5-2.5 8.5-2.5 12 0 2.5.8 5 3.5 7.5 1-3.5 2.5-5.5 4-7.5z"
        fill={`url(#${id}-outer)`}
        filter={`url(#${id}-shadow)`}
      />
      <path
        d="M16 25c3-1.8 5-4.5 5-7.5 0-2.5-1.5-4.5-3-6 .5 2.5-1 4-1.5 6-.8-3-2.5-4-3.5-6 0 3.5-1.5 6-1.5 9 0 2 1 4 3 5.5.8-2.5 1.5-4 2.5-5.5z"
        fill={`url(#${id}-core)`}
        filter={`url(#${id}-glow)`}
      />
      <path d="M14 14c1-2 2-3 3-4 1 1.5 1.5 3 0 4.5-1-1-2-2.5-3-0.5z" fill="#fff59d" opacity="0.75" />
    </svg>
  ),

  diamond: (id) => (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className="ex3d-svg">
      <Defs3D id={id} />
      <defs>
        <linearGradient id={`${id}-f1`} x1="16" y1="5" x2="8" y2="16">
          <stop offset="0%" stopColor="#e1f5fe" />
          <stop offset="100%" stopColor="#4fc3f7" />
        </linearGradient>
        <linearGradient id={`${id}-f2`} x1="16" y1="5" x2="24" y2="16">
          <stop offset="0%" stopColor="#b3e5fc" />
          <stop offset="100%" stopColor="#0288d1" />
        </linearGradient>
        <linearGradient id={`${id}-f3`} x1="16" y1="14" x2="16" y2="27">
          <stop offset="0%" stopColor="#29b6f6" />
          <stop offset="100%" stopColor="#01579b" />
        </linearGradient>
      </defs>
      <ellipse cx="16" cy="28" rx="8" ry="2" fill="#01579b" opacity="0.35" />
      <path d="M16 27L6 14h20L16 27z" fill={`url(#${id}-f3)`} filter={`url(#${id}-shadow)`} />
      <path d="M16 5l10 9H6l10-9z" fill={`url(#${id}-f2)`} filter={`url(#${id}-shadow)`} />
      <path d="M16 5L6 14h5l5-9z" fill={`url(#${id}-f1)`} />
      <path d="M16 5l10 9h-5l-5-9z" fill="#81d4fa" opacity="0.6" />
      <path d="M11 14h10l5 13H6l5-13z" fill="#0277bd" opacity="0.25" />
      <path d="M13 9l3 4 3-4-3-2-3 2z" fill="#fff" opacity="0.65" />
      <path d="M16 14v13" stroke="#4fc3f7" strokeWidth="0.6" opacity="0.5" />
    </svg>
  ),

  laugh: (id) => (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className="ex3d-svg">
      <Defs3D id={id} />
      <defs>
        <radialGradient id={`${id}-face`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fff9c4" />
          <stop offset="55%" stopColor="#ffca28" />
          <stop offset="100%" stopColor="#f57c00" />
        </radialGradient>
      </defs>
      <ellipse cx="16" cy="27" rx="10" ry="2.5" fill="#000" opacity="0.2" />
      <circle cx="16" cy="16" r="12" fill={`url(#${id}-face)`} filter={`url(#${id}-shadow)`} />
      <ellipse cx="12" cy="11" rx="4" ry="3" fill="#fff" opacity="0.4" />
      <path d="M8 11c1.5-2.5 4-3.5 5.5-2.5M24 11c-1.5-2.5-4-3.5-5.5-2.5" stroke="#ef6c00" strokeWidth="1.3" strokeLinecap="round" />
      <ellipse cx="11" cy="14.5" rx="2" ry="2.5" fill="#4e342e" />
      <ellipse cx="21" cy="14.5" rx="2" ry="2.5" fill="#4e342e" />
      <circle cx="11.5" cy="13.5" r="0.7" fill="#fff" />
      <circle cx="21.5" cy="13.5" r="0.7" fill="#fff" />
      <path d="M9 18.5c2.5 5 11.5 5 14 0" stroke="#4e342e" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M9 18.5c2.5 4 11.5 4 14 0" fill="#ff6f00" opacity="0.35" />
      <path d="M10 20c2 2 10 2 12 0" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    </svg>
  ),

  clap: (id) => (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className="ex3d-svg">
      <Defs3D id={id} />
      <defs>
        <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffcc80" />
          <stop offset="100%" stopColor="#ff8a65" />
        </linearGradient>
        <linearGradient id={`${id}-skin-d`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffab91" />
          <stop offset="100%" stopColor="#e64a19" />
        </linearGradient>
      </defs>
      <ellipse cx="16" cy="28" rx="11" ry="2" fill="#000" opacity="0.2" />
      <path d="M9 9v13l4 3V11l-4-2z" fill={`url(#${id}-skin-d)`} filter={`url(#${id}-shadow)`} />
      <path d="M10 9v4l2 1V10l-2-1z" fill="#ffe0b2" opacity="0.6" />
      <path d="M14 10l5-7 4 2.5-6 9 2.5 11-5-2.5 3-13z" fill={`url(#${id}-skin)`} filter={`url(#${id}-shadow)`} />
      <path d="M17 8l3-4 2 1.5-4 6z" fill="#fff3e0" opacity="0.5" />
      <path d="M22 12l3-9 4 1.5-4 11 1.5 9-5-1.5 0.5-11z" fill={`url(#${id}-skin-d)`} filter={`url(#${id}-shadow)`} />
      <path d="M8 23h16" stroke="#e64a19" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      <path d="M14 6l1-2M20 4l1-1" stroke="#ffab91" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  ),

  cool: (id) => (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className="ex3d-svg">
      <Defs3D id={id} />
      <defs>
        <radialGradient id={`${id}-face`} cx="35%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#fff9c4" />
          <stop offset="60%" stopColor="#ffca28" />
          <stop offset="100%" stopColor="#ef6c00" />
        </radialGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#455a64" />
          <stop offset="50%" stopColor="#263238" />
          <stop offset="100%" stopColor="#37474f" />
        </linearGradient>
        <linearGradient id={`${id}-lens`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4fc3f7" />
          <stop offset="100%" stopColor="#01579b" />
        </linearGradient>
      </defs>
      <ellipse cx="16" cy="27" rx="10" ry="2.5" fill="#000" opacity="0.2" />
      <circle cx="16" cy="17" r="12" fill={`url(#${id}-face)`} filter={`url(#${id}-shadow)`} />
      <ellipse cx="12" cy="12" rx="3.5" ry="2.5" fill="#fff" opacity="0.35" />
      <rect x="6" y="12" width="20" height="7" rx="3.5" fill={`url(#${id}-glass)`} filter={`url(#${id}-shadow)`} />
      <rect x="7" y="13" width="7.5" height="5" rx="2.5" fill={`url(#${id}-lens)`} />
      <rect x="17.5" y="13" width="7.5" height="5" rx="2.5" fill={`url(#${id}-lens)`} />
      <path d="M7 14.5h4M21 14.5h4" stroke="#81d4fa" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="10" cy="14" rx="2" ry="1.2" fill="#fff" opacity="0.45" />
      <ellipse cx="22" cy="14" rx="2" ry="1.2" fill="#fff" opacity="0.45" />
      <path d="M11 21.5c2 2.5 8 2.5 10 0" stroke="#5d4037" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  ),

  muscle: (id) => (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className="ex3d-svg">
      <Defs3D id={id} />
      <defs>
        <linearGradient id={`${id}-arm`} x1="8" y1="8" x2="26" y2="26">
          <stop offset="0%" stopColor="#ffccbc" />
          <stop offset="40%" stopColor="#ff8a65" />
          <stop offset="100%" stopColor="#d84315" />
        </linearGradient>
        <radialGradient id={`${id}-bulge`} cx="40%" cy="35%" r="50%">
          <stop offset="0%" stopColor="#ffab91" />
          <stop offset="100%" stopColor="#e64a19" />
        </radialGradient>
      </defs>
      <ellipse cx="17" cy="28" rx="10" ry="2.5" fill="#000" opacity="0.22" />
      <path
        d="M7 19c0-7 5.5-11.5 11.5-9.5 2.2 1 4.2-.2 5.5-2.5 3.5 4.5.5 10-3.5 12.5-2.2 1.5-6.5 1.5-9.5-.5-2.5 3.5-5.5 3.5-8.5 0-3.5 4.5-9 4.5-12 0-2.2 2.2-2.5 4.5-1.2 1.5.8 3 1.2 5 .2 2.2z"
        fill={`url(#${id}-arm)`}
        filter={`url(#${id}-shadow)`}
      />
      <ellipse cx="14" cy="13" rx="5" ry="4" fill={`url(#${id}-bulge)`} filter={`url(#${id}-glow)`} />
      <ellipse cx="12" cy="11" rx="2.5" ry="2" fill="#fff" opacity="0.35" />
      <path d="M22 8c2 1 3 3 2 5M9 14c-1 2 0 4 1 5" stroke="#bf360c" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  ),
};

export const EXPRESSIONS = [
  { id: 'trophy', emoji: '🏆', label: 'Trophy' },
  { id: 'dice', emoji: '🎲', label: 'Dice' },
  { id: 'fire', emoji: '🔥', label: 'Fire' },
  { id: 'diamond', emoji: '💎', label: 'Gem' },
  { id: 'laugh', emoji: '😂', label: 'Laugh' },
  { id: 'clap', emoji: '👏', label: 'Clap' },
  { id: 'cool', emoji: '😎', label: 'Cool' },
  { id: 'muscle', emoji: '💪', label: 'Power' },
];

export default function ExpressionIcon({ name, size = 28 }) {
  const render = icons3d[name];
  const uid = `ex3d-${name}`;
  return (
    <span className="expression-icon expression-icon-3d" style={{ width: size, height: size }}>
      {render ? render(uid) : null}
    </span>
  );
}
