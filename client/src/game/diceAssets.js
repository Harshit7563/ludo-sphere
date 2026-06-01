/** 3D dice render frames — /public/dice/frame-01.png … frame-32.png */

export const DICE_FRAME_COUNT = 32;

/** Best matching settled pose per pip value (top face) */
export const DICE_SETTLE_FRAMES = {
  1: 8,
  2: 16,
  3: 22,
  4: 20,
  5: 1,
  6: 4,
};

export function getDiceFramePath(frameNumber) {
  const n = Math.max(1, Math.min(DICE_FRAME_COUNT, Number(frameNumber) || 1));
  return `/dice/frame-${String(n).padStart(2, '0')}.png`;
}

export function getDiceFrameForValue(value) {
  const v = Math.min(6, Math.max(1, Number(value) || 1));
  return getDiceFramePath(DICE_SETTLE_FRAMES[v] ?? 1);
}
