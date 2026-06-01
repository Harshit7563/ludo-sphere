export function IconQuickPrivate({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 01-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 014 19v-8.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconQuickJoin({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="8" cy="15" r="4.5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M11.5 11.5l7-7M17.5 4h2.5v2.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 7l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconQuickEvents({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 4h8v5c0 2.8-1.8 5-4 5s-4-2.2-4-5V4z"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.14"
        strokeLinejoin="round"
      />
      <path d="M8 6H6c0 1.8 1 3.2 2.5 3.8M16 6h2c0 1.8-1 3.2-2.5 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 14v3M9 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconQuickBonus({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.12" />
      <path d="M12 10V20" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 14h16" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 10c-2.2 0-3.5-1.2-3.5-3S9.8 4 12 4s3.5 1.2 3.5 3-1.3 3-3.5 3z"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path d="M12 4V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const QUICK_ICONS = {
  private: IconQuickPrivate,
  join: IconQuickJoin,
  events: IconQuickEvents,
  bonus: IconQuickBonus,
};

export default function QuickLinkIcon({ name, className = '' }) {
  const Icon = QUICK_ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}
