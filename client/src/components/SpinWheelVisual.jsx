import {
  WHEEL_PRIZES,
  WHEEL_SEGMENTS,
  wedgePath,
  wedgeLabelPos,
} from './spinWheelUtils';

export default function SpinWheelVisual({
  rotation = 0,
  animating = false,
  idle = false,
  size = 'lg',
  uid = 'wheel',
}) {
  const total = WHEEL_SEGMENTS.length;

  return (
    <div className={`spin-wheel-visual spin-wheel-visual-${size}`}>
      <span className="spin-wheel-visual-shadow" />
      <span className="spin-wheel-visual-plate" />

      <div
        className={`spin-wheel-visual-rotor ${animating ? 'is-animating' : ''} ${idle && !animating ? 'is-idle' : ''}`}
        style={{ '--spin-deg': `${rotation}deg` }}
      >
        <svg className="spin-wheel-visual-svg" viewBox="0 0 24 24" fill="none" aria-hidden>
          <defs>
            <radialGradient id={`${uid}-base`} cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#3a4a62" />
              <stop offset="100%" stopColor="#0a1018" />
            </radialGradient>
            <linearGradient id={`${uid}-rim`} x1="4" y1="4" x2="20" y2="20">
              <stop offset="0%" stopColor="#fff3c4" />
              <stop offset="35%" stopColor="#ffc107" />
              <stop offset="70%" stopColor="#ff8f00" />
              <stop offset="100%" stopColor="#bf360c" />
            </linearGradient>
            <linearGradient id={`${uid}-rim-inner`} x1="12" y1="2" x2="12" y2="22">
              <stop offset="0%" stopColor="#1a2438" />
              <stop offset="100%" stopColor="#050810" />
            </linearGradient>
            <radialGradient id={`${uid}-hub`} cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#fff8e1" />
              <stop offset="45%" stopColor="#ffc107" />
              <stop offset="100%" stopColor="#e65100" />
            </radialGradient>
            {WHEEL_SEGMENTS.map((seg, i) => {
              const mid = ((i + 0.5) / total) * Math.PI * 2 - Math.PI / 2;
              const x2 = 12 + 10 * Math.cos(mid);
              const y2 = 12 + 10 * Math.sin(mid);
              return (
                <linearGradient
                  key={`${uid}-grad-${i}`}
                  id={`${uid}-seg-${i}`}
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
          <circle cx="12" cy="12" r="10.4" fill={`url(#${uid}-base)`} />
          <circle cx="12" cy="12" r="10.4" fill="none" stroke={`url(#${uid}-rim)`} strokeWidth="1.8" />
          <circle cx="12" cy="12" r="9.1" fill="none" stroke={`url(#${uid}-rim-inner)`} strokeWidth="0.7" opacity="0.85" />

          {WHEEL_SEGMENTS.map((seg, i) => (
            <path key={`${uid}-w-${i}`} d={wedgePath(i, total)} fill={`url(#${uid}-seg-${i})`} />
          ))}

          {WHEEL_PRIZES.map((prize, i) => {
            const pos = wedgeLabelPos(i, total);
            return (
              <text
                key={`${uid}-t-${i}`}
                x={pos.x}
                y={pos.y}
                fill="#fff"
                fontSize="1.45"
                fontWeight="800"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${pos.rotate - 90} ${pos.x} ${pos.y})`}
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.45)' }}
              >
                ₹{prize}
              </text>
            );
          })}

          <circle cx="12" cy="12" r="3.1" fill="#0d1524" stroke="#ffb300" strokeWidth="0.9" />
          <circle cx="12" cy="12" r="2.35" fill={`url(#${uid}-hub)`} />
          <ellipse cx="11.2" cy="11.1" rx="0.85" ry="0.55" fill="rgba(255,255,255,0.55)" transform="rotate(-25 11.2 11.1)" />
        </svg>
      </div>

      <span className="spin-wheel-visual-pointer">
        <span className="spin-wheel-visual-pointer-pin" />
        <span className="spin-wheel-visual-pointer-body" />
      </span>
    </div>
  );
}
