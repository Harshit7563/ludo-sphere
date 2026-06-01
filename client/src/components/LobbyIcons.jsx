function IconLobbyFree({ className = '' }) {
  return (
    <svg className={className} width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lobby-dice-top" x1="6" y1="4" x2="18" y2="12">
          <stop offset="0%" stopColor="#e1f5fe" />
          <stop offset="100%" stopColor="#4dd0e1" />
        </linearGradient>
        <linearGradient id="lobby-dice-left" x1="4" y1="10" x2="12" y2="20">
          <stop offset="0%" stopColor="#80deea" />
          <stop offset="100%" stopColor="#00838f" />
        </linearGradient>
        <linearGradient id="lobby-dice-right" x1="12" y1="10" x2="20" y2="20">
          <stop offset="0%" stopColor="#26c6da" />
          <stop offset="100%" stopColor="#006064" />
        </linearGradient>
      </defs>
      <path d="M12 3 19 7.5v9L12 21 5 16.5v-9L12 3z" fill="url(#lobby-dice-right)" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
      <path d="M12 3 5 7.5 12 12l7-4.5L12 3z" fill="url(#lobby-dice-top)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
      <path d="M5 7.5v9l7 4.5V12L5 7.5z" fill="url(#lobby-dice-left)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      <circle cx="9" cy="10" r="1" fill="#fff" opacity="0.9" />
      <circle cx="15" cy="10" r="1" fill="#fff" opacity="0.9" />
      <circle cx="12" cy="14" r="1" fill="#fff" opacity="0.9" />
      <path d="M12 12 19 16.5M12 12 5 16.5" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" />
    </svg>
  );
}

function IconLobbyClassic({ className = '' }) {
  return (
    <svg className={className} width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lobby-bolt-main" x1="12" y1="2" x2="12" y2="22">
          <stop offset="0%" stopColor="#fff9c4" />
          <stop offset="40%" stopColor="#ffd54f" />
          <stop offset="100%" stopColor="#ff6f00" />
        </linearGradient>
        <linearGradient id="lobby-bolt-shade" x1="8" y1="4" x2="16" y2="20">
          <stop offset="0%" stopColor="#ffb300" />
          <stop offset="100%" stopColor="#e65100" />
        </linearGradient>
        <filter id="lobby-bolt-glow">
          <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="#ff9800" floodOpacity="0.8" />
        </filter>
      </defs>
      <path
        d="M13.5 2 8 13h4.5L10.5 22 16 11h-4.5L13.5 2z"
        fill="url(#lobby-bolt-shade)"
        opacity="0.45"
        transform="translate(0.6 0.4)"
      />
      <path
        d="M13.5 2 8 13h4.5L10.5 22 16 11h-4.5L13.5 2z"
        fill="url(#lobby-bolt-main)"
        stroke="#fff3e0"
        strokeWidth="0.6"
        strokeLinejoin="round"
        filter="url(#lobby-bolt-glow)"
      />
      <path d="M12.5 4 10 12h2.5l-1 5 4.5-8h-2.5l1.5-5z" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

function IconLobbyPro({ className = '' }) {
  return (
    <svg className={className} width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lobby-trophy-cup" x1="8" y1="4" x2="16" y2="16">
          <stop offset="0%" stopColor="#fff8e1" />
          <stop offset="45%" stopColor="#ffd54f" />
          <stop offset="100%" stopColor="#ff8f00" />
        </linearGradient>
        <linearGradient id="lobby-trophy-base" x1="6" y1="16" x2="18" y2="22">
          <stop offset="0%" stopColor="#ce93d8" />
          <stop offset="100%" stopColor="#6a1b9a" />
        </linearGradient>
      </defs>
      <ellipse cx="12" cy="20.5" rx="6" ry="1.2" fill="rgba(0,0,0,0.35)" />
      <path d="M7 18h10v2.5H7V18z" fill="url(#lobby-trophy-base)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
      <path d="M9 18V16h6v2" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
      <path
        d="M8 4h8v5c0 2.8-1.8 5-4 5s-4-2.2-4-5V4z"
        fill="url(#lobby-trophy-cup)"
        stroke="#ff8f00"
        strokeWidth="0.5"
      />
      <path d="M8 6H6.5c0 1.6 1 2.8 2.2 3.3M16 6h1.5c0 1.6-1 2.8-2.2 3.3" stroke="#ffd54f" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="10" cy="6.5" rx="1.2" ry="0.7" fill="rgba(255,255,255,0.45)" transform="rotate(-20 10 6.5)" />
      <path d="M12 14v2" stroke="#ff8f00" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconLobbyMega({ className = '' }) {
  return (
    <svg className={className} width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lobby-gem-left" x1="4" y1="6" x2="12" y2="20">
          <stop offset="0%" stopColor="#80deea" />
          <stop offset="100%" stopColor="#00838f" />
        </linearGradient>
        <linearGradient id="lobby-gem-right" x1="12" y1="6" x2="20" y2="20">
          <stop offset="0%" stopColor="#fff59d" />
          <stop offset="100%" stopColor="#ff8f00" />
        </linearGradient>
        <linearGradient id="lobby-gem-top" x1="12" y1="3" x2="12" y2="10">
          <stop offset="0%" stopColor="#fffde7" />
          <stop offset="100%" stopColor="#ffd54f" />
        </linearGradient>
      </defs>
      <path d="M12 21 4 9.5 8 4h8l4 5.5L12 21z" fill="url(#lobby-gem-left)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
      <path d="M12 21 20 9.5 16 4H12v17z" fill="url(#lobby-gem-right)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
      <path d="M8 4h8L20 9.5H4L8 4z" fill="url(#lobby-gem-top)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.4" />
      <path d="M12 4v17M4 9.5h16M8 4l4 17 4-17" stroke="rgba(255,255,255,0.18)" strokeWidth="0.45" />
      <path d="M10 7.5 12 14l2-6.5" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" strokeLinecap="round" />
      <circle cx="11" cy="8" r="0.8" fill="rgba(255,255,255,0.55)" />
    </svg>
  );
}

const LOBBY_ICONS = {
  free: IconLobbyFree,
  classic: IconLobbyClassic,
  pro: IconLobbyPro,
  mega: IconLobbyMega,
};

export default function LobbyIcon({ name, className = '' }) {
  const Icon = LOBBY_ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}
