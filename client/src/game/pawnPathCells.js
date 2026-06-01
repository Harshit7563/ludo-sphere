import { getColorPath, isColorPathCalibrated } from './colorPaths.js';
import { FINISH_CELL, getStepsFromStart, gridForToken } from './pathCoords.js';

function cellForStep(color, step) {
  const path = getColorPath(color);
  if (!path?.calibrated) return null;
  if (step === path.walkSteps + 1) return FINISH_CELL;
  return path.getCellForStep(step) ?? null;
}

/** Grid cells to visit when a token moves from `fromPos` → `toPos` (hop per cell). */
export function getHopCellsBetween(color, fromPos, toPos) {
  if (fromPos === toPos) {
    if (toPos === 0) return [];
    const g = gridForToken(color, toPos);
    return g ? [g] : [];
  }

  if (fromPos === 0 && toPos > 0) {
    const end = gridForToken(color, toPos);
    return end ? [end] : [];
  }

  if (toPos === 0 && fromPos > 0) {
    const start = gridForToken(color, fromPos);
    return start ? [start] : [];
  }

  if (!isColorPathCalibrated(color)) {
    const end = gridForToken(color, toPos);
    return end ? [end] : [];
  }

  const fromStep = getStepsFromStart(color, fromPos);
  const toStep = getStepsFromStart(color, toPos);

  if (fromStep < 1 || toStep < 1) {
    const end = gridForToken(color, toPos);
    return end ? [end] : [];
  }

  const cells = [];
  if (toStep > fromStep) {
    for (let s = fromStep + 1; s <= toStep; s++) {
      const c = cellForStep(color, s);
      if (c) cells.push(c);
    }
    return cells;
  }

  const end = gridForToken(color, toPos);
  return end ? [end] : [];
}

/** Per-cell dwell — tuned to match hop spring settle in BoardPawn */
export const PAWN_HOP_MS = 1800;
