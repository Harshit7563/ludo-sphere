import { createColorPath } from './colorPathUtils.js';

/** Blue — calibrated ✓ */
export const bluePath = createColorPath({
  color: 'blue',
  exitCell: [13, 6],
  ringPath: [
    [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1],
    [8, 0], [7, 0], [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [5, 6], [4, 6],
    [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8], [1, 8], [2, 8], [3, 8], [4, 8],
    [5, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14], [8, 14], [8, 13],
    [8, 12], [8, 11], [8, 10], [8, 9], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
    [14, 7],
  ],
  homePath: [
    [13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7],
  ],
  homeTagPrefix: 'B',
  calibrated: true,
});

export const BLUE_EXIT_CELL = bluePath.exitCell;
export const BLUE_FINISH_CELL = bluePath.finishCell;
export const BLUE_RING_PATH = bluePath.ringPath;
export const BLUE_HOME_PATH = bluePath.homePath;
export const BLUE_RING_STEPS = bluePath.ringSteps;
export const BLUE_HOME_STEPS = bluePath.homeSteps;
export const BLUE_WALK_STEPS = bluePath.walkSteps;
export const BLUE_RING_B1_STEP = bluePath.ringH1Step;
export const BLUE_FINISH_STEP = bluePath.walkSteps + 1;

export const getBlueCellForStep = (step) => bluePath.getCellForStep(step);
export const getBlueStepLabel = (step) => bluePath.getStepLabel(step);
export const getBlueHomeTag = (step) => bluePath.getHomeTag(step);
