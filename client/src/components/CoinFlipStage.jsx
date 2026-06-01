import { useEffect, useId, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

function CoinFaceHead({ uid }) {
  return (
    <svg className="ht-coin-svg" viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <radialGradient id={`${uid}-gold`} cx="34%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#fffde7" />
          <stop offset="35%" stopColor="#ffd54f" />
          <stop offset="72%" stopColor="#ff8f00" />
          <stop offset="100%" stopColor="#e65100" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${uid}-gold)`} />
      <circle cx="32" cy="32" r="30" stroke="#ff8f00" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="24" stroke="rgba(93, 50, 0, 0.25)" strokeWidth="1" strokeDasharray="3 4" />
      <path
        d="M22 24l4-7 6 5 6-5 4 7v4H22v-4z"
        fill="rgba(93, 50, 0, 0.55)"
        stroke="rgba(62, 39, 0, 0.5)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <text x="32" y="42" textAnchor="middle" fill="#4e342e" fontFamily="Poppins, sans-serif" fontSize="22" fontWeight="800">
        H
      </text>
      <text x="32" y="52" textAnchor="middle" fill="rgba(78, 52, 46, 0.75)" fontFamily="Poppins, sans-serif" fontSize="6.5" fontWeight="800" letterSpacing="2">
        HEAD
      </text>
      <ellipse cx="24" cy="20" rx="10" ry="6" fill="rgba(255, 255, 255, 0.35)" transform="rotate(-25 24 20)" />
    </svg>
  );
}

function CoinFaceTail({ uid }) {
  return (
    <svg className="ht-coin-svg" viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <radialGradient id={`${uid}-silver`} cx="34%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="38%" stopColor="#eceff1" />
          <stop offset="75%" stopColor="#90a4ae" />
          <stop offset="100%" stopColor="#546e7a" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${uid}-silver)`} />
      <circle cx="32" cy="32" r="30" stroke="#90a4ae" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="24" stroke="rgba(38, 50, 56, 0.25)" strokeWidth="1" strokeDasharray="3 4" />
      <path
        d="M32 18l2.2 6.8H41l-5.5 4 2.1 6.8L32 31.6l-5.6 4 2.1-6.8-5.5-4h6.8L32 18z"
        fill="rgba(38, 50, 56, 0.4)"
      />
      <text x="32" y="44" textAnchor="middle" fill="#263238" fontFamily="Poppins, sans-serif" fontSize="22" fontWeight="800">
        T
      </text>
      <text x="32" y="52" textAnchor="middle" fill="rgba(38, 50, 56, 0.7)" fontFamily="Poppins, sans-serif" fontSize="6.5" fontWeight="800" letterSpacing="2">
        TAIL
      </text>
      <ellipse cx="24" cy="20" rx="10" ry="6" fill="rgba(255, 255, 255, 0.45)" transform="rotate(-25 24 20)" />
    </svg>
  );
}

function landingRotation(currentY, side) {
  const target = side === 'tail' ? 180 : 0;
  const norm = ((currentY % 360) + 360) % 360;
  let delta = target - norm;
  if (delta <= 0) delta += 360;
  return currentY + 360 * 5 + delta;
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** One flip sequence per flipKey; lands when landOn is known. */
export default function CoinFlipStage({ landOn = null, flipKey = 0, idleSpin = true, onLandComplete }) {
  const uid = useId().replace(/:/g, '');
  const controls = useAnimation();
  const rotationRef = useRef(0);
  const flippingRef = useRef(false);
  const onLandRef = useRef(onLandComplete);
  const landOnRef = useRef(landOn);
  onLandRef.current = onLandComplete;
  landOnRef.current = landOn;

  useEffect(() => {
    if (!flipKey) return undefined;

    let cancelled = false;
    flippingRef.current = true;

    const runFlip = async () => {
      for (let i = 0; i < 3 && !cancelled; i += 1) {
        const from = rotationRef.current;
        await controls.start({
          rotateY: [from, from + 540],
          rotateX: [8, -18, 12, 8],
          y: [0, -16, -6, 0],
          scale: [1, 1.06, 1.02, 1],
          transition: { duration: 0.7, ease: 'easeInOut' },
        });
        if (cancelled) return;
        rotationRef.current = from + 540;
      }

      let outcome = landOnRef.current;
      let waits = 0;
      while (!outcome && waits < 40 && !cancelled) {
        await wait(50);
        waits += 1;
        outcome = landOnRef.current;
      }

      if (cancelled) return;

      if (outcome) {
        const from = rotationRef.current;
        const to = landingRotation(from, outcome);
        await controls.start({
          rotateY: [from, from + 360, to - 72, to],
          rotateX: [10, -14, 8, 6],
          y: [0, -20, -8, 0],
          scale: [1, 1.1, 1.04, 1],
          transition: {
            duration: 2.2,
            times: [0, 0.5, 0.8, 1],
            ease: [0.22, 0.85, 0.25, 1],
          },
        });
        if (cancelled) return;
        rotationRef.current = to;
      }

      flippingRef.current = false;
      onLandRef.current?.();
    };

    runFlip().catch(() => {
      flippingRef.current = false;
      onLandRef.current?.();
    });

    return () => {
      cancelled = true;
      flippingRef.current = false;
    };
  }, [flipKey, controls]);

  useEffect(() => {
    if (flipKey || !idleSpin) return undefined;

    let cancelled = false;
    const idle = async () => {
      while (!cancelled && !flippingRef.current) {
        const from = rotationRef.current;
        const to = from + 360;
        await controls.start({
          rotateY: [from, to],
          rotateX: [8, 10, 8],
          transition: { duration: 5.5, ease: 'easeInOut' },
        });
        if (cancelled) return;
        rotationRef.current = to;
      }
    };
    idle();
    return () => {
      cancelled = true;
    };
  }, [flipKey, idleSpin, controls]);

  return (
    <div className="ht-coin-stage">
      <span className="ht-coin-pedestal" />
      <span className="ht-coin-stage-shadow" />
      <span className="ht-coin-ring ht-coin-ring--1" />
      <span className="ht-coin-ring ht-coin-ring--2" />
      <div className="ht-coin-scene">
        <motion.div
          className="ht-coin-inner"
          initial={{ rotateY: 0, rotateX: 8 }}
          animate={controls}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="ht-coin-rim" />
          <div className="ht-coin-face ht-coin-face--head">
            <CoinFaceHead uid={uid} />
          </div>
          <div className="ht-coin-face ht-coin-face--tail">
            <CoinFaceTail uid={uid} />
          </div>
        </motion.div>
      </div>
      <span className="ht-coin-shine" />
    </div>
  );
}
