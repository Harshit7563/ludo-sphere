export function IconMenuWallet({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.12" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
      <rect x="15" y="13" width="4" height="3" rx="1" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 6V5a2 2 0 012-2h6a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconMenuTransactions({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 4h10v16H7V4z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" strokeLinejoin="round" />
      <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 7V5.5A1.5 1.5 0 016.5 4h11A1.5 1.5 0 0119 5.5V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconMenuFriends({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.12" />
      <path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1" />
      <path d="M14.5 19c.3-2.2 1.8-3.5 4-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconMenuRewards({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3l1.8 3.6L18 7.5l-2.8 2.7.7 4.1L12 12.8 8.1 14.3l.7-4.1L6 7.5l4.2-.9L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
      <path d="M8 14.5v4.5l4 2 4-2v-4.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMenuKyc({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      <circle cx="10" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.15" />
      <path d="M6 16c.8-1.6 2.2-2.5 4-2.5s3.2.9 4 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 9h3M15 12h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconMenuReferral({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 8a4 4 0 108 0 4 4 0 00-8 0z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.12" />
      <path d="M6 20v-1a5 5 0 0110 0v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 6l3-1v4l-2-1" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="19" cy="5" r="1.2" fill="currentColor" />
    </svg>
  );
}

const MENU_ICONS = {
  wallet: IconMenuWallet,
  transactions: IconMenuTransactions,
  friends: IconMenuFriends,
  rewards: IconMenuRewards,
  kyc: IconMenuKyc,
  referral: IconMenuReferral,
};

export default function MenuIcon({ name, className = '' }) {
  const Icon = MENU_ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}
