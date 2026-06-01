export default function HeadTailBetTimer({
  secondsLeft,
  visible,
  totalSeconds = 15,
  closeSeconds = 5,
  betsOpen = true,
}) {
  if (!visible) return null;

  const hurry = betsOpen && secondsLeft <= 8;
  const progress = Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100));

  let label = 'Choose side & stake';
  if (!betsOpen) label = `Betting closed · flip in ${secondsLeft}s`;
  else if (hurry) label = 'Hurry! Pick side & stake';

  return (
    <div
      className={`ht-bet-timer ${!betsOpen ? 'ht-bet-timer--locked' : ''} ${hurry ? 'ht-bet-timer--urgent' : ''}`}
      role="timer"
      aria-live="polite"
    >
      <div
        className="ht-bet-timer-ring"
        style={{ '--ht-progress': `${progress}%` }}
        aria-hidden
      >
        <div className="ht-bet-timer-inner">
          <span className="ht-bet-timer-value">{secondsLeft}</span>
          <span className="ht-bet-timer-unit">sec</span>
        </div>
      </div>
      <p className="ht-bet-timer-label">{label}</p>
    </div>
  );
}
