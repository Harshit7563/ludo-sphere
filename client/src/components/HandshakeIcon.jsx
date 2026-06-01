export default function HandshakeIcon({ className = '' }) {
  return (
    <span className={`rush-handshake-icon ${className}`.trim()} aria-hidden>
      <span className="rush-handshake-ring" />
      <span className="rush-handshake-shine" />

      <svg className="rush-handshake-svg" width="40" height="40" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="hs-bg-grad" x1="4" y1="3" x2="20" y2="21">
            <stop offset="0%" stopColor="#5e35b1" />
            <stop offset="55%" stopColor="#311b92" />
            <stop offset="100%" stopColor="#1a1030" />
          </linearGradient>
          <linearGradient id="hs-skin-l" x1="5" y1="9" x2="13" y2="17">
            <stop offset="0%" stopColor="#ffe8cc" />
            <stop offset="100%" stopColor="#d8955c" />
          </linearGradient>
          <linearGradient id="hs-skin-r" x1="19" y1="9" x2="11" y2="17">
            <stop offset="0%" stopColor="#ffd9b3" />
            <stop offset="100%" stopColor="#c8874f" />
          </linearGradient>
          <linearGradient id="hs-cuff" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b39ddb" />
            <stop offset="100%" stopColor="#5e35b1" />
          </linearGradient>
          <filter id="hs-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#000" floodOpacity="0.35" />
          </filter>
        </defs>

        <circle cx="12" cy="12" r="10.6" fill="url(#hs-bg-grad)" stroke="rgba(206,147,216,0.45)" strokeWidth="0.75" />
        <circle cx="12" cy="12" r="9.4" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />

        <g className="hs-left" filter="url(#hs-shadow)">
          <path
            d="M1.5 19.5 4.8 16.8c0.6-0.5 1.4-0.6 2.1-0.3l1.8 0.8c0.5 0.2 0.8 0.7 0.7 1.2l-0.4 2.2-3.4 0.6-2.1-1.8z"
            fill="url(#hs-cuff)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.35"
          />
          <path
            d="M6.2 15.8c0.8-1.6 2.2-2.4 3.6-2.1 0.7 0.2 1.3 0.6 1.7 1.2 0.3-0.8 1.1-1.3 1.9-1.4 1.3-0.1 2.5 0.7 3 1.9"
            stroke="url(#hs-skin-l)"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M8.4 14.2c0.4 0.9 1.3 1.5 2.3 1.6 1 0.1 2-0.4 2.6-1.2"
            fill="url(#hs-skin-l)"
            stroke="#c8874f"
            strokeWidth="0.4"
            strokeLinejoin="round"
          />
          <circle cx="9.2" cy="13.2" r="0.55" fill="rgba(255,255,255,0.35)" />
        </g>

        <g className="hs-right" filter="url(#hs-shadow)">
          <path
            d="M22.5 19.5 19.2 16.8c-0.6-0.5-1.4-0.6-2.1-0.3l-1.8 0.8c-0.5 0.2-0.8 0.7-0.7 1.2l0.4 2.2 3.4 0.6 2.1-1.8z"
            fill="url(#hs-cuff)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.35"
          />
          <path
            d="M17.8 15.8c-0.8-1.6-2.2-2.4-3.6-2.1-0.7 0.2-1.3 0.6-1.7 1.2-0.3-0.8-1.1-1.3-1.9-1.4-1.3-0.1-2.5 0.7-3 1.9"
            stroke="url(#hs-skin-r)"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M15.6 14.2c-0.4 0.9-1.3 1.5-2.3 1.6-1 0.1-2-0.4-2.6-1.2"
            fill="url(#hs-skin-r)"
            stroke="#c8874f"
            strokeWidth="0.4"
            strokeLinejoin="round"
          />
          <circle cx="14.8" cy="13.2" r="0.55" fill="rgba(255,255,255,0.35)" />
        </g>

        <g className="hs-clasp">
          <rect x="10.2" y="12.8" width="3.6" height="2.2" rx="1" fill="#edb87a" stroke="#c8874f" strokeWidth="0.35" />
          <path d="M11.2 13.3h1.6M11.2 14.5h1.6" stroke="#c8874f" strokeWidth="0.45" strokeLinecap="round" opacity="0.55" />
        </g>

        <g className="hs-spark">
          <circle cx="17.8" cy="8.8" r="2.8" fill="rgba(255,213,79,0.18)" />
          <path
            d="M17.8 6.8 18.3 8.3l1.5 0.5-1.5 0.5-0.5 1.5-0.5-1.5-1.5-0.5 1.5-0.5 0.5-1.5z"
            fill="#ffd54f"
            stroke="#ffb300"
            strokeWidth="0.3"
          />
        </g>
      </svg>
    </span>
  );
}
