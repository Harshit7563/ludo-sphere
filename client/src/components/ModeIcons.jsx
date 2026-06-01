function Pawn({ cx, cy, r = 2.2 }) {
  return (
    <>
      <circle cx={cx} cy={cy - 2.8} r={r} stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.22" />
      <path
        d={`M${cx - r} ${cy + 2.2} Q${cx} ${cy - 0.5} ${cx + r} ${cy + 2.2} Z`}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.18"
      />
    </>
  );
}

export function IconMode2Players({ className = '' }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="9"
        width="8"
        height="8"
        rx="1.8"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="currentColor"
        fillOpacity="0.12"
        transform="rotate(-10 7 13)"
      />
      <circle cx="5.5" cy="11.5" r="0.9" fill="currentColor" />
      <circle cx="8.5" cy="14.5" r="0.9" fill="currentColor" />

      <rect
        x="13"
        y="7"
        width="8"
        height="8"
        rx="1.8"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="currentColor"
        fillOpacity="0.12"
        transform="rotate(10 17 11)"
      />
      <circle cx="15.5" cy="9.5" r="0.9" fill="currentColor" />
      <circle cx="18.5" cy="9.5" r="0.9" fill="currentColor" />
      <circle cx="17" cy="12.5" r="0.9" fill="currentColor" />

      <path d="M12 5v14" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2.5 2.5" opacity="0.35" strokeLinecap="round" />
    </svg>
  );
}

export function IconMode4Players({ className = '' }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="2" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.14" />
      <rect x="13" y="2" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.1" />
      <rect x="2" y="13" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.1" />
      <rect x="13" y="13" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.14" />

      <rect x="10" y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity="0.25" />

      <Pawn cx="6.5" cy="6.5" r="1.5" />
      <Pawn cx="17.5" cy="6.5" r="1.5" />
      <Pawn cx="6.5" cy="17.5" r="1.5" />
      <Pawn cx="17.5" cy="17.5" r="1.5" />
    </svg>
  );
}

const MODE_ICONS = {
  '2p': IconMode2Players,
  '4p': IconMode4Players,
};

export default function ModeIcon({ type, className = '' }) {
  const Icon = MODE_ICONS[type];
  if (!Icon) return null;
  return <Icon className={className} />;
}
