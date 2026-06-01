import { useId } from 'react';

export default function AiRobotIcon({ className = '', size = 40 }) {
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}-head`} x1="8" y1="6" x2="32" y2="34">
          <stop offset="0%" stopColor="#f3e5f5" />
          <stop offset="50%" stopColor="#ce93d8" />
          <stop offset="100%" stopColor="#9575cd" />
        </linearGradient>
        <linearGradient id={`${uid}-screen`} x1="12" y1="14" x2="28" y2="28">
          <stop offset="0%" stopColor="#5e35b1" />
          <stop offset="100%" stopColor="#311b92" />
        </linearGradient>
        <radialGradient id={`${uid}-eye`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#80deea" />
          <stop offset="100%" stopColor="#26c6da" />
        </radialGradient>
        <filter id={`${uid}-shadow`}>
          <feDropShadow dx="0" dy="2" stdDeviation="1.8" floodColor="#7e57c2" floodOpacity="0.45" />
        </filter>
      </defs>

      <ellipse cx="20" cy="35" rx="10" ry="2" fill="rgba(124,77,255,0.22)" />

      {/* Chubby round head */}
      <circle
        cx="20"
        cy="20"
        r="14.5"
        fill={`url(#${uid}-head)`}
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.2"
        filter={`url(#${uid}-shadow)`}
      />

      {/* Cute ears */}
      <circle cx="7.5" cy="19" r="3.2" fill="#e1bee7" stroke="rgba(255,255,255,0.4)" strokeWidth="0.7" />
      <circle cx="32.5" cy="19" r="3.2" fill="#e1bee7" stroke="rgba(255,255,255,0.4)" strokeWidth="0.7" />
      <circle cx="7.5" cy="19" r="1.4" fill="#f8bbd0" opacity="0.7" />
      <circle cx="32.5" cy="19" r="1.4" fill="#f8bbd0" opacity="0.7" />

      {/* Face screen */}
      <rect
        x="11.5"
        y="14"
        width="17"
        height="13"
        rx="5.5"
        fill={`url(#${uid}-screen)`}
        stroke="rgba(224,190,255,0.5)"
        strokeWidth="0.8"
      />

      {/* Big cute eyes */}
      <ellipse cx="16" cy="20" rx="3.1" ry="3.4" fill={`url(#${uid}-eye)`} />
      <ellipse cx="24" cy="20" rx="3.1" ry="3.4" fill={`url(#${uid}-eye)`} />
      <circle cx="16.8" cy="18.8" r="1.1" fill="#fff" opacity="0.95" />
      <circle cx="24.8" cy="18.8" r="1.1" fill="#fff" opacity="0.95" />
      <circle cx="15.2" cy="21.2" r="0.45" fill="#fff" opacity="0.55" />
      <circle cx="23.2" cy="21.2" r="0.45" fill="#fff" opacity="0.55" />

      {/* Blush cheeks */}
      <ellipse cx="13.2" cy="22.8" rx="1.6" ry="1" fill="#f48fb1" opacity="0.55" />
      <ellipse cx="26.8" cy="22.8" rx="1.6" ry="1" fill="#f48fb1" opacity="0.55" />

      {/* Happy smile */}
      <path
        d="M16.2 24.2c1.2 1.4 2.4 2.1 3.8 2.1s2.6-.7 3.8-2.1"
        stroke="#ffe082"
        strokeWidth="1.35"
        strokeLinecap="round"
        fill="none"
      />

      {/* Antenna */}
      <path d="M20 6.5v3.2" stroke="#b39ddb" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="20" cy="5.2" r="2" fill="#ff80ab" stroke="#fff" strokeWidth="0.6" />
      <circle cx="19.3" cy="4.6" r="0.5" fill="#fff" opacity="0.8" />

      {/* Head shine */}
      <ellipse cx="15" cy="12" rx="4" ry="2.5" fill="#fff" opacity="0.35" />
    </svg>
  );
}
