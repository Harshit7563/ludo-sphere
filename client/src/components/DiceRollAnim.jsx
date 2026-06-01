import { useEffect, useState } from 'react';
import { DICE_FRAME_COUNT, getDiceFramePath } from '../game/diceAssets';

const FPS = 26;

export default function DiceRollAnim() {
  const [frame, setFrame] = useState(1);

  useEffect(() => {
    let raf = 0;
    let last = 0;

    const tick = (now) => {
      if (!last) last = now;
      if (now - last >= 1000 / FPS) {
        setFrame((f) => (f % DICE_FRAME_COUNT) + 1);
        last = now;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <img
      src={getDiceFramePath(frame)}
      alt=""
      className="dice-render dice-render--rolling"
      draggable={false}
    />
  );
}
