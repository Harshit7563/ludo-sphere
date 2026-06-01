import { useEffect, useRef, useState } from 'react';
import DiceFaceImage from './DiceFaceImage';
import DiceRollAnim from './DiceRollAnim';

const MIN_ROLL_MS = 900;
const DEFAULT_TURN_SEC = 10;
const TURN_RING_R = 46;
const TURN_RING_C = 2 * Math.PI * TURN_RING_R;

function clampFace(v) {
  const n = Number(v);
  return n >= 1 && n <= 6 ? n : 1;
}

function TurnTimerHud({ turnStartedAt, turnDurationSec, urgent }) {
  const [progress, setProgress] = useState(0);
  const [secsLeft, setSecsLeft] = useState(turnDurationSec);

  useEffect(() => {
    if (!turnStartedAt) return;

    const durationMs = Math.max(1, turnDurationSec) * 1000;
    let raf = 0;

    const tick = () => {
      const elapsed = Date.now() - turnStartedAt;
      const remaining = Math.max(0, durationMs - elapsed);
      setProgress(Math.min(1, elapsed / durationMs));
      setSecsLeft(Math.ceil(remaining / 1000));
      if (remaining > 0) raf = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(raf);
  }, [turnStartedAt, turnDurationSec]);

  const ringOffset = TURN_RING_C * progress;
  const headAngle = progress * Math.PI * 2 - Math.PI / 2;
  const headX = 50 + TURN_RING_R * Math.cos(headAngle);
  const headY = 50 + TURN_RING_R * Math.sin(headAngle);

  return (
    <div className={`ng-turn-timer ${urgent ? 'is-urgent' : ''}`} aria-hidden>
      <svg className="ng-turn-timer-svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ng-turn-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="50%" stopColor="#7c4dff" />
            <stop offset="100%" stopColor="#ffc107" />
          </linearGradient>
          <linearGradient id="ng-turn-urgent-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff5252" />
            <stop offset="100%" stopColor="#ff9100" />
          </linearGradient>
          <filter id="ng-turn-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle className="ng-turn-glow" cx="50" cy="50" r="49" />
        <circle className="ng-turn-track" cx="50" cy="50" r={TURN_RING_R} />

        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const x1 = 50 + (TURN_RING_R - 2) * Math.cos(a);
          const y1 = 50 + (TURN_RING_R - 2) * Math.sin(a);
          const x2 = 50 + (TURN_RING_R + 1) * Math.cos(a);
          const y2 = 50 + (TURN_RING_R + 1) * Math.sin(a);
          return (
            <line
              key={i}
              className="ng-turn-tick"
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
            />
          );
        })}

        <circle
          className="ng-turn-arc-glow"
          cx="50"
          cy="50"
          r={TURN_RING_R}
          strokeDasharray={TURN_RING_C}
          strokeDashoffset={ringOffset}
        />
        <circle
          className="ng-turn-arc"
          cx="50"
          cy="50"
          r={TURN_RING_R}
          strokeDasharray={TURN_RING_C}
          strokeDashoffset={ringOffset}
          filter="url(#ng-turn-glow)"
        />
        <circle className="ng-turn-head" cx={headX} cy={headY} r="2.8" />
      </svg>
      <span className="ng-turn-badge">{secsLeft}s</span>
    </div>
  );
}

export default function Dice3D({
  value,
  rolling,
  onRoll,
  canRoll,
  turnStartedAt,
  turnDurationSec = DEFAULT_TURN_SEC,
  showTurnRing = false,
  isMyTurn = true,
}) {
  const [face, setFace] = useState(() => clampFace(value));
  const [ringUrgent, setRingUrgent] = useState(false);
  const rollStart = useRef(0);

  useEffect(() => {
    if (rolling) {
      rollStart.current = Date.now();
      return;
    }
    if (value == null) return;

    const elapsed = rollStart.current ? Date.now() - rollStart.current : 0;
    const wait = rollStart.current ? Math.max(0, MIN_ROLL_MS - elapsed) : 0;

    const t = setTimeout(() => {
      setFace(clampFace(value));
      rollStart.current = 0;
    }, wait);

    return () => clearTimeout(t);
  }, [rolling, value]);

  useEffect(() => {
    if (!rolling && value != null && rollStart.current === 0) {
      setFace(clampFace(value));
    }
  }, [value, rolling]);

  useEffect(() => {
    if (!showTurnRing || !turnStartedAt) {
      setRingUrgent(false);
      return;
    }

    const durationMs = Math.max(1, turnDurationSec) * 1000;
    let raf = 0;

    const tick = () => {
      const elapsed = Date.now() - turnStartedAt;
      setRingUrgent(durationMs - elapsed <= 3000);
      if (elapsed < durationMs) raf = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(raf);
  }, [showTurnRing, turnStartedAt, turnDurationSec]);

  const shown = clampFace(face);

  let status = 'Last roll';
  if (rolling) status = 'Rolling…';
  else if (canRoll) status = 'Tap to roll';

  return (
    <div
      className={`game-dice-panel ${isMyTurn ? 'is-my-turn' : 'is-opponent-turn'} ${canRoll ? 'is-ready' : ''} ${rolling ? 'is-rolling' : ''} ${showTurnRing && turnStartedAt ? 'has-turn-ring' : ''} ${ringUrgent ? 'turn-ring-urgent' : ''}`}
    >
      <div className="dice-orbit-wrap">
        {showTurnRing && turnStartedAt && (
          <TurnTimerHud
            turnStartedAt={turnStartedAt}
            turnDurationSec={turnDurationSec}
            urgent={ringUrgent}
          />
        )}

        <button
          type="button"
          className="dice3d-tap"
          onClick={onRoll}
          disabled={!canRoll}
          aria-label={canRoll ? 'Roll dice' : `Dice showing ${shown}`}
        >
          <div className="dice3d-stage">
            <div className="dice3d-shadow" />
            {rolling ? <DiceRollAnim /> : <DiceFaceImage value={shown} key={shown} />}
          </div>
          <span className="dice3d-badge" aria-hidden>{shown}</span>
        </button>
      </div>

      <span className={`dice3d-status ${rolling ? 'rolling' : ''} ${canRoll ? 'ready' : ''}`}>
        {status}
      </span>
    </div>
  );
}
