import { useSound } from '../context/SoundContext';

export default function GameSoundToggle({ className = '' }) {
  const { enabled, toggleSound } = useSound();

  return (
    <button
      type="button"
      className={`game-sound-toggle ${enabled ? 'is-on' : 'is-off'} ${className}`.trim()}
      onClick={toggleSound}
      aria-label={enabled ? 'Sound on — tap to mute' : 'Sound off — tap to unmute'}
      aria-pressed={enabled}
      title={enabled ? 'Sound on' : 'Sound off'}
    >
      <span className="game-sound-toggle-glow" aria-hidden />
      <span className="game-sound-toggle-icon" aria-hidden>
        {enabled ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M11 5 6 9H3v6h3l5 4V5Z"
              fill="currentColor"
              opacity="0.95"
            />
            <path
              d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" opacity="0.5" />
            <path
              d="m16 9 5 5M21 9l-5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
