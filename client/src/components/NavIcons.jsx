export function IconTrophy({ className = '' }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 4h8v5.5a4 4 0 01-8 0V4z"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path d="M10 17h4v3H10v-3z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M7 20h10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconHome({ className = '' }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 01-1.5 1.5H15v-5.5H9V20.5H5.5A1.5 1.5 0 014 19v-8.5z"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.12"
      />
    </svg>
  );
}

export function IconPlay({ className = '' }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5.5v13l11-6.5-11-6.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function IconWallet({ className = '' }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
      <rect x="15" y="13" width="4" height="3" rx="1" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 6V5a2 2 0 012-2h6a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconRank({ className = '' }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 18V9l4 2V9l4-2v11M14 18V5l6-2v15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="1.5" fill="currentColor" />
      <circle cx="17" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function IconAccount({ className = '' }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2.2" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
    </svg>
  );
}

const ICONS = {
  trophy: IconTrophy,
  home: IconHome,
  play: IconPlay,
  wallet: IconWallet,
  rank: IconRank,
  account: IconAccount,
};

export default function NavIcon({ name, active }) {
  const Icon = ICONS[name];
  if (!Icon) return null;
  return <Icon className="nav-svg" />;
}
