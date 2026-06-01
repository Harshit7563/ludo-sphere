/**
 * Maps server token positions to [row, col] on board.png (15×15).
 */
import { getColorPath, isColorPathCalibrated } from './colorPaths.js';
import { FINISH_CELL } from './colorPathUtils.js';

export { FINISH_CELL };
export {
  BLUE_RING_PATH,
  BLUE_HOME_PATH,
  BLUE_EXIT_CELL,
  BLUE_FINISH_CELL,
  getBlueCellForStep,
  getBlueStepLabel,
} from './bluePath.js';
export {
  RED_RING_PATH,
  RED_HOME_PATH,
  RED_EXIT_CELL,
  RED_FINISH_CELL,
  getRedCellForStep,
  getRedStepLabel,
} from './redPath.js';
export {
  GREEN_RING_PATH,
  GREEN_HOME_PATH,
  GREEN_EXIT_CELL,
  GREEN_FINISH_CELL,
  getGreenCellForStep,
  getGreenStepLabel,
} from './greenPath.js';
export {
  YELLOW_RING_PATH,
  YELLOW_HOME_PATH,
  YELLOW_EXIT_CELL,
  YELLOW_FINISH_CELL,
  getYellowCellForStep,
  getYellowStepLabel,
} from './yellowPath.js';

/** Legacy 52-cell ring — fallback for uncalibrated colors */
export const PATH_RING_52 = [
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1],
  [8, 0], [7, 0], [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [5, 6], [4, 6],
  [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8], [1, 8], [2, 8], [3, 8], [4, 8],
  [5, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [8, 7], [8, 6], [6, 8],
  [7, 8], [8, 8], [9, 8], [10, 8], [11, 8], [11, 7], [12, 7], [12, 8], [13, 8], [14, 8],
  [14, 7], [14, 6],
];

export const COLOR_START = { red: 0, green: 13, yellow: 26, blue: 39 };

export const HOME_STRETCH = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
};

const PLAYER_RING_OFFSET = {
  red: 13,
  green: 13,
  yellow: 23,
  blue: 13,
};

/** Mirrors server engine.js step counting */
export function getStepsFromStart(color, position) {
  const start = COLOR_START[color];
  if (position === 0) return -1;
  if (position === 59) return 58;
  if (position >= 53 && position <= 58) return 51 + (position - 52);
  if (position >= 1 && position <= 52) {
    let steps = position - start;
    if (steps <= 0) steps += 52;
    return steps;
  }
  return -1;
}

function gridFromCalibratedPath(color, position) {
  if (!isColorPathCalibrated(color)) return null;

  const path = getColorPath(color);
  const steps = getStepsFromStart(color, position);
  if (steps < 1) return null;

  if (steps >= 1 && steps <= path.ringSteps) {
    return path.ringPath[steps - 1] ?? null;
  }
  if (steps >= path.ringSteps + 1 && steps <= path.walkSteps) {
    return path.homePath[steps - path.ringSteps - 1] ?? null;
  }
  return null;
}

function gridFromLegacy(color, position) {
  if (position >= 53 && position <= 58) {
    return HOME_STRETCH[color]?.[position - 53] ?? null;
  }
  if (position >= 1 && position <= 52) {
    const offset = PLAYER_RING_OFFSET[color] ?? 0;
    const idx = ((position - 1) + offset) % 52;
    return PATH_RING_52[idx] ?? null;
  }
  return null;
}

export function gridForToken(color, position) {
  if (position === 0) return null;
  if (position === 59) return FINISH_CELL;

  return gridFromCalibratedPath(color, position) ?? gridFromLegacy(color, position);
}
