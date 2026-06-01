import { useState } from 'react';
import '../styles/money-rain.css';

const LAYERS = ['back', 'mid', 'front'];
const TYPES = ['coin', 'coin', 'rupee', 'spark'];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createParticles() {
  const back = Array.from({ length: 18 }, (_, i) => makeParticle(i, 'back'));
  const mid = Array.from({ length: 22 }, (_, i) => makeParticle(i + 18, 'mid'));
  const front = Array.from({ length: 16 }, (_, i) => makeParticle(i + 40, 'front'));
  return [...back, ...mid, ...front];
}

function makeParticle(id, layer) {
  const type = layer === 'back' ? pick(['spark', 'spark', 'coin']) : pick(TYPES);
  const sizeBase = layer === 'front' ? 22 : layer === 'mid' ? 18 : 12;

  return {
    id,
    layer,
    type,
    left: randomBetween(-4, 104),
    delay: randomBetween(0, 0.45),
    duration: randomBetween(0.95, 1.35),
    size: randomBetween(sizeBase, sizeBase + 14),
    spin: randomBetween(-540, 540),
    drift: randomBetween(-55, 55),
    wobble: randomBetween(8, 22),
  };
}

function createBursts() {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i,
    angle: i * 36 + randomBetween(-12, 12),
    distance: randomBetween(60, 140),
    delay: randomBetween(0, 0.08),
    size: randomBetween(14, 22),
  }));
}

export default function MoneyRain({ bannerIcon = '🏆', bannerText = 'Money Shower' }) {
  const [particles] = useState(createParticles);
  const [bursts] = useState(createBursts);

  return (
    <div className="money-rain" aria-hidden>
      <div className="money-rain-flash" />
      <div className="money-rain-glow" />

      <div className="money-rain-banner">
        <span className="money-rain-banner-icon">{bannerIcon}</span>
        <span className="money-rain-banner-text">{bannerText}</span>
      </div>

      <div className="money-rain-burst">
        {bursts.map((b) => (
          <span
            key={b.id}
            className="money-rain-burst-coin"
            style={{
              '--angle': `${b.angle}deg`,
              '--dist': `${b.distance}px`,
              animationDelay: `${b.delay}s`,
              width: `${b.size}px`,
              height: `${b.size}px`,
            }}
          />
        ))}
      </div>

      {LAYERS.map((layer) => (
        <div key={layer} className={`money-rain-layer money-rain-layer--${layer}`}>
          {particles
            .filter((p) => p.layer === layer)
            .map((p) => (
              <span
                key={p.id}
                className={`money-rain-item money-rain-item--${p.type}`}
                style={{
                  left: `${p.left}%`,
                  fontSize: `${p.size}px`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                  '--spin': `${p.spin}deg`,
                  '--drift': `${p.drift}px`,
                  '--wobble': `${p.wobble}px`,
                }}
              />
            ))}
        </div>
      ))}
    </div>
  );
}
