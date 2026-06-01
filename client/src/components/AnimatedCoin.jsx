import { useId } from 'react';

function CoinFaceHead({ uid }) {
  return (
    <svg className="rush-coin-svg" viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <radialGradient id={`${uid}-gold`} cx="34%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#fffde7" />
          <stop offset="35%" stopColor="#ffd54f" />
          <stop offset="72%" stopColor="#ff8f00" />
          <stop offset="100%" stopColor="#e65100" />
        </radialGradient>
        <linearGradient id={`${uid}-goldRing`} x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#fff9c4" />
          <stop offset="50%" stopColor="#ffb300" />
          <stop offset="100%" stopColor="#ff6f00" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${uid}-gold)`} />
      <circle cx="32" cy="32" r="30" stroke={`url(#${uid}-goldRing)`} strokeWidth="2.5" />
      <circle cx="32" cy="32" r="24" stroke="rgba(93, 50, 0, 0.35)" strokeWidth="1.2" strokeDasharray="3 4" />
      {/* Crown */}
      <path
        d="M22 24l4-7 6 5 6-5 4 7v4H22v-4z"
        fill="rgba(93, 50, 0, 0.55)"
        stroke="rgba(62, 39, 0, 0.5)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <text
        x="32"
        y="42"
        textAnchor="middle"
        fill="#4e342e"
        fontFamily="Poppins, system-ui, sans-serif"
        fontSize="22"
        fontWeight="800"
      >
        H
      </text>
      <text
        x="32"
        y="52"
        textAnchor="middle"
        fill="rgba(78, 52, 46, 0.75)"
        fontFamily="Poppins, system-ui, sans-serif"
        fontSize="6.5"
        fontWeight="800"
        letterSpacing="2"
      >
        HEAD
      </text>
      {/* Shine */}
      <ellipse cx="24" cy="20" rx="10" ry="6" fill="rgba(255, 255, 255, 0.35)" transform="rotate(-25 24 20)" />
    </svg>
  );
}

function CoinFaceTail({ uid }) {
  return (
    <svg className="rush-coin-svg" viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <radialGradient id={`${uid}-silver`} cx="34%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="38%" stopColor="#eceff1" />
          <stop offset="75%" stopColor="#90a4ae" />
          <stop offset="100%" stopColor="#546e7a" />
        </radialGradient>
        <linearGradient id={`${uid}-silverRing`} x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#fafafa" />
          <stop offset="50%" stopColor="#b0bec5" />
          <stop offset="100%" stopColor="#607d8b" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${uid}-silver)`} />
      <circle cx="32" cy="32" r="30" stroke={`url(#${uid}-silverRing)`} strokeWidth="2.5" />
      <circle cx="32" cy="32" r="24" stroke="rgba(38, 50, 56, 0.3)" strokeWidth="1.2" strokeDasharray="3 4" />
      {/* Star burst */}
      <path
        d="M32 18l2.2 6.8H41l-5.5 4 2.1 6.8L32 31.6l-5.6 4 2.1-6.8-5.5-4h6.8L32 18z"
        fill="rgba(38, 50, 56, 0.4)"
      />
      <text
        x="32"
        y="44"
        textAnchor="middle"
        fill="#263238"
        fontFamily="Poppins, system-ui, sans-serif"
        fontSize="22"
        fontWeight="800"
      >
        T
      </text>
      <text
        x="32"
        y="52"
        textAnchor="middle"
        fill="rgba(38, 50, 56, 0.7)"
        fontFamily="Poppins, system-ui, sans-serif"
        fontSize="6.5"
        fontWeight="800"
        letterSpacing="2"
      >
        TAIL
      </text>
      <ellipse cx="24" cy="20" rx="10" ry="6" fill="rgba(255, 255, 255, 0.45)" transform="rotate(-25 24 20)" />
    </svg>
  );
}

/** 3D flipping coin for Head & Tail CTA */
export default function AnimatedCoin({ className = '' }) {
  const uid = useId().replace(/:/g, '');

  return (
    <div className={`rush-coin-flip ${className}`.trim()} aria-hidden>
      <span className="rush-coin-shadow" />
      <span className="rush-coin-halo" />
      <div className="rush-coin-flip-scene">
        <div className="rush-coin-flip-inner">
          <div className="rush-coin-rim" />
          <div className="rush-coin-face rush-coin-face--head">
            <CoinFaceHead uid={uid} />
          </div>
          <div className="rush-coin-face rush-coin-face--tail">
            <CoinFaceTail uid={uid} />
          </div>
        </div>
      </div>
      <span className="rush-coin-shine-sweep" />
    </div>
  );
}
