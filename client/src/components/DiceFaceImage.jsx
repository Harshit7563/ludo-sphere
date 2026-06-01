import { getDiceFrameForValue } from '../game/diceAssets';

export default function DiceFaceImage({ value = 1 }) {
  const v = Math.min(6, Math.max(1, Number(value) || 1));

  return (
    <img
      src={getDiceFrameForValue(v)}
      alt=""
      className="dice-render dice-render--settled"
      draggable={false}
    />
  );
}
