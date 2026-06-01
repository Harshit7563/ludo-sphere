export default function GameExitButton({ onClick, label = 'Leave game' }) {
  return (
    <button
      type="button"
      className="game-exit-trigger"
      onClick={onClick}
      aria-label={label}
    >
      <span className="game-exit-trigger-glow" aria-hidden />
      <svg className="game-exit-trigger-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
