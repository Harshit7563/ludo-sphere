import { getColorPath } from './colorPaths.js';

export function getColorWalkMaxStep(color) {
  const path = getColorPath(color);
  if (!path?.calibrated) return 0;
  return path.walkSteps;
}

export function getColorWalkCell(color, step) {
  const path = getColorPath(color);
  if (!path?.calibrated) return null;

  const cell = path.getCellForStep(step);
  if (!cell) return null;

  return {
    step,
    row: cell[0],
    col: cell[1],
    label: path.getStepLabel(step),
  };
}

/** Map a debug overlay marker to walk step */
export function getWalkStepFromMarker(marker, aliases = [], color = 'blue') {
  if (marker.kind === 'finish') return null;
  if (marker.walkStep != null) return marker.walkStep;

  const path = getColorPath(color);
  if (!path?.calibrated) return null;

  if (marker.aliasOnly && aliases.length === 1) {
    const match = aliases[0].match(new RegExp(`^${path.homeTagPrefix}([2-7])$`));
    if (match) return path.ringSteps + Number(match[1]) - 1;
  }

  if (marker.kind === 'ring' && marker.label === '★') return 1;

  const num = Number(marker.label);
  if (num >= 1 && num <= path.ringSteps) return num;

  return null;
}

export function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export const BLUE_WALK_MAX_STEP = getColorWalkMaxStep('blue');
export const getBlueWalkCell = (step) => getColorWalkCell('blue', step);
