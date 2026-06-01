const SEGMENTS = [
  { base: '#ff5722', light: '#ff8a65', dark: '#c62828' },
  { base: '#ffc107', light: '#ffe082', dark: '#f57f17' },
  { base: '#66bb6a', light: '#a5d6a7', dark: '#2e7d32' },
  { base: '#42a5f5', light: '#90caf9', dark: '#1565c0' },
  { base: '#ab47bc', light: '#ce93d8', dark: '#6a1b9a' },
  { base: '#26c6da', light: '#80deea', dark: '#00838f' },
  { base: '#ff9800', light: '#ffcc80', dark: '#e65100' },
  { base: '#ec407a', light: '#f48fb1', dark: '#ad1457' },
];

function wedgePath(index, total, r = 8.8, cx = 12, cy = 12) {
  const start = (index / total) * Math.PI * 2 - Math.PI / 2;
  const end = ((index + 1) / total) * Math.PI * 2 - Math.PI / 2;
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
}

function wedgeHighlight(index, total, r = 8.8, cx = 12, cy = 12) {
  const mid = ((index + 0.5) / total) * Math.PI * 2 - Math.PI / 2;
  const inner = 3.2;
  const outer = r - 0.6;
  const spread = (Math.PI * 2) / total * 0.22;
  const s = mid - spread;
  const e = mid + spread;
  const x1 = cx + inner * Math.cos(s);
  const y1 = cy + inner * Math.sin(s);
  const x2 = cx + outer * Math.cos(s);
  const y2 = cy + outer * Math.sin(s);
  const x3 = cx + outer * Math.cos(e);
  const y3 = cy + outer * Math.sin(e);
  const x4 = cx + inner * Math.cos(e);
  const y4 = cy + inner * Math.sin(e);
  return `M ${x1} ${y1} L ${x2} ${y2} A ${outer} ${outer} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${inner} ${inner} 0 0 0 ${x1} ${y1} Z`;
}

export default function SpinWheelIcon({ spinning = false, className = '' }) {
  return (
    <span className={`rush-spin-wheel ${spinning ? 'is-spinning-fast' : ''} ${className}`.trim()} aria-hidden>
      <span className="rush-spin-wheel-shadow" />
      <span className="rush-spin-wheel-plate" />

      <span className="rush-spin-wheel-rotor">
        <svg className="rush-spin-wheel-svg" width="38" height="38" viewBox="0 0 24 24" fill="none">
          <defs>
            <radialGradient id="wheel-base" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#3a4a62" />
              <stop offset="100%" stopColor="#0a1018" />
            </radialGradient>
            <linearGradient id="wheel-rim" x1="4" y1="4" x2="20" y2="20">
              <stop offset="0%" stopColor="#fff3c4" />
              <stop offset="35%" stopColor="#ffc107" />
              <stop offset="70%" stopColor="#ff8f00" />
              <stop offset="100%" stopColor="#bf360c" />
            </linearGradient>
            <linearGradient id="wheel-rim-inner" x1="12" y1="2" x2="12" y2="22">
              <stop offset="0%" stopColor="#1a2438" />
              <stop offset="100%" stopColor="#050810" />
            </linearGradient>
            <radialGradient id="wheel-hub" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#fff8e1" />
              <stop offset="45%" stopColor="#ffc107" />
              <stop offset="100%" stopColor="#e65100" />
            </radialGradient>
            <filter id="wheel-depth" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.2" stdDeviation="0.8" floodColor="#000" floodOpacity="0.45" />
            </filter>
            {SEGMENTS.map((seg, i) => {
              const mid = ((i + 0.5) / SEGMENTS.length) * Math.PI * 2 - Math.PI / 2;
              const x2 = 12 + 10 * Math.cos(mid);
              const y2 = 12 + 10 * Math.sin(mid);
              return (
                <linearGradient
                  key={`grad-${i}`}
                  id={`wheel-seg-${i}`}
                  gradientUnits="userSpaceOnUse"
                  x1="12"
                  y1="12"
                  x2={x2}
                  y2={y2}
                >
                  <stop offset="0%" stopColor={seg.light} />
                  <stop offset="55%" stopColor={seg.base} />
                  <stop offset="100%" stopColor={seg.dark} />
                </linearGradient>
              );
            })}
          </defs>

          <circle cx="12" cy="12.3" r="10.4" fill="rgba(0,0,0,0.35)" />
          <circle cx="12" cy="12" r="10.4" fill="url(#wheel-base)" filter="url(#wheel-depth)" />
          <circle cx="12" cy="12" r="10.4" fill="none" stroke="url(#wheel-rim)" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="9.1" fill="none" stroke="url(#wheel-rim-inner)" strokeWidth="0.7" opacity="0.85" />

          {SEGMENTS.map((seg, i) => (
            <path key={seg.base + i} d={wedgePath(i, SEGMENTS.length)} fill={`url(#wheel-seg-${i})`} />
          ))}

          {SEGMENTS.map((_, i) => (
            <path
              key={`hi-${i}`}
              d={wedgeHighlight(i, SEGMENTS.length)}
              fill="rgba(255,255,255,0.18)"
            />
          ))}

          <circle cx="12" cy="12" r="3.1" fill="#0d1524" stroke="#ffb300" strokeWidth="0.9" />
          <circle cx="12" cy="12" r="2.35" fill="url(#wheel-hub)" />
          <ellipse cx="11.2" cy="11.1" rx="0.85" ry="0.55" fill="rgba(255,255,255,0.55)" transform="rotate(-25 11.2 11.1)" />
          <circle cx="12" cy="12" r="10.4" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.45" />
        </svg>
      </span>

      <span className="rush-spin-wheel-pointer">
        <span className="rush-spin-wheel-pointer-pin" />
        <span className="rush-spin-wheel-pointer-body" />
      </span>
    </span>
  );
}
