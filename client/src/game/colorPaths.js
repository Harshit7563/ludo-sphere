import { bluePath } from './bluePath.js';
import { greenPath } from './greenPath.js';
import { redPath } from './redPath.js';
import { yellowPath } from './yellowPath.js';

export const COLOR_PATHS = {
  blue: bluePath,
  red: redPath,
  green: greenPath,
  yellow: yellowPath,
};

export const CALIBRATED_COLORS = Object.keys(COLOR_PATHS).filter(
  (c) => COLOR_PATHS[c].calibrated,
);

export function getColorPath(color) {
  return COLOR_PATHS[color] ?? null;
}

export function isColorPathCalibrated(color) {
  return Boolean(getColorPath(color)?.calibrated);
}
