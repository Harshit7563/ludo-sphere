export function IconUser({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M5 20c0-4 3.5-6 7-6s7 2 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconMail({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLock({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconGift({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="10" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M12 10V21M3 14h18M12 10c-2-2.5-6-3-6 0s4 0 6 0 6-3 6 0-4 0-6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconDiceLogo() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
      <rect x="8" y="8" width="56" height="56" rx="14" fill="url(#authDiceBg)" stroke="rgba(255,183,77,0.5)" strokeWidth="2" />
      <circle cx="26" cy="26" r="4" fill="#c62828" />
      <circle cx="46" cy="46" r="4" fill="#c62828" />
      <circle cx="36" cy="36" r="4" fill="#c62828" />
      <defs>
        <linearGradient id="authDiceBg" x1="8" y1="8" x2="64" y2="64">
          <stop stopColor="#fffef8" />
          <stop offset="1" stopColor="#e8dcc8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
