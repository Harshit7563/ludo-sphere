export function IconStatBalance({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M12 7.5c-1.8 0-2.5.9-2.5 1.6 0 1.1 1.2 1.5 2.5 1.7 1.4.2 2.5.6 2.5 1.7 0 .7-.7 1.6-2.5 1.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M12 6.5v1M12 15.5v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 4.5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
      <path d="M9 19.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

export function IconStatWins({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 4h8v5.2a4 4 0 01-8 0V4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path d="M10 16.5h4v2.5H10v-2.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7.5 19h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 9.5v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10.5 11h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconStatLosses({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3.5l7.5 4.3v8.4L12 20.5 4.5 16.2V7.8L12 3.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path d="M9 9.5l6 6M15 9.5l-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconStatGames({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="16" height="9" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      <path d="M8.5 12.5v3M7 14h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="15.5" cy="12" r="1" fill="currentColor" />
      <circle cx="17.5" cy="14" r="1" fill="currentColor" />
      <path d="M9.5 8V6.5a2 2 0 012-2h1a2 2 0 012 2V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const STAT_ICONS = {
  balance: IconStatBalance,
  wins: IconStatWins,
  losses: IconStatLosses,
  games: IconStatGames,
};

export default function StatIcon({ name, className = '' }) {
  const Icon = STAT_ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}
