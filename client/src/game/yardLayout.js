/**
 * Home-yard pawn positions — measured from board.png dot centers
 * Order per color: TL, TR, BL, BR (tokenIndex 0–3)
 */

/** Pin tip sits on dot center — same anchor for all home yards */
const YARD = { anchorY: 82, scale: 1 };

function slot(top, left) {
  return { top, left, ...YARD };
}

export const YARD_SLOTS = {
  red: [
    slot(15.16, 15.84),
    slot(15.16, 24.76),
    slot(24.81, 15.84),
    slot(24.81, 24.76),
  ],
  green: [
    slot(15.15, 75.13),
    slot(15.16, 84.06),
    slot(24.80, 75.14),
    slot(24.81, 84.07),
  ],
  blue: [
    slot(75.10, 15.84),
    slot(75.09, 24.76),
    slot(84.74, 15.84),
    slot(84.73, 24.76),
  ],
  yellow: [
    slot(75.09, 75.15),
    slot(75.09, 84.07),
    slot(84.74, 75.15),
    slot(84.74, 84.06),
  ],
};

/** Path / home-stretch tokens — 15×15 grid overlay */
export const BOARD_INSET_PCT = 2.85;

export function boardPercent(row, col) {
  const span = 100 - BOARD_INSET_PCT * 2;
  return {
    left: `${BOARD_INSET_PCT + (col / 15) * span}%`,
    top: `${BOARD_INSET_PCT + (row / 15) * span}%`,
  };
}

/** Center of a 15×15 grid cell — matches path debug number overlay */
export function boardCellCenterPercent(row, col) {
  return boardPercent(row + 0.5, col + 0.5);
}

export function yardPercent(slot) {
  return {
    left: `${slot.left}%`,
    top: `${slot.top}%`,
    anchorY: slot.anchorY ?? YARD.anchorY,
    scale: slot.scale ?? YARD.scale,
  };
}
