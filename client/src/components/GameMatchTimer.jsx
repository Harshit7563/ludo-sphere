const MATCH_DURATION_SEC = 10 * 60;
const RING_R = 42;
const RING_C = 2 * Math.PI * RING_R;

export default function GameMatchTimer({ secondsLeft, urgent }) {
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  const label = `${m}:${s.toString().padStart(2, '0')}`;
  const remaining = secondsLeft / MATCH_DURATION_SEC;
  const ringOffset = RING_C * (1 - remaining);

  return (
    <div
      className={`ng-timer ng-timer--ring ${urgent ? 'is-urgent' : ''}`}
      role="timer"
      aria-live="polite"
      aria-label={`Match time ${label}`}
    >
      <div className="mt-ring">
        <svg className="mt-ring-svg" viewBox="0 0 100 100" aria-hidden>
          <defs>
            <linearGradient id="mt-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="50%" stopColor="#7c4dff" />
              <stop offset="100%" stopColor="#ffc107" />
            </linearGradient>
            <linearGradient id="mt-ring-urgent" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff5252" />
              <stop offset="100%" stopColor="#ff9100" />
            </linearGradient>
          </defs>
          <circle className="mt-ring-track" cx="50" cy="50" r={RING_R} />
          <circle
            className="mt-ring-arc"
            cx="50"
            cy="50"
            r={RING_R}
            strokeDasharray={RING_C}
            strokeDashoffset={ringOffset}
          />
        </svg>
        <span className="mt-ring-time" key={label}>{label}</span>
      </div>
    </div>
  );
}

export { MATCH_DURATION_SEC };
