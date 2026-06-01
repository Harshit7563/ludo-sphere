import { createColorPath } from './colorPathUtils.js';

/** Yellow — calibrated ✓ (#1 = ★ exit [8,13], #51/Y1 = [7,14]) */
export const yellowPath = createColorPath({
  color: 'yellow',
  exitCell: [8, 13],
  ringPath: [
    [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8],
    [14, 8], [14, 7], [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 5], [8, 4],
    [8, 3], [8, 2], [8, 1], [8, 0], [7, 0], [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
    [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8], [1, 8], [2, 8], [3, 8],
    [4, 8], [5, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14],
  ],
  homePath: [
    [7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8],
  ],
  homeTagPrefix: 'Y',
  calibrated: true,
});

export const YELLOW_EXIT_CELL = yellowPath.exitCell;
export const YELLOW_FINISH_CELL = yellowPath.finishCell;
export const YELLOW_RING_PATH = yellowPath.ringPath;
export const YELLOW_HOME_PATH = yellowPath.homePath;
export const YELLOW_RING_STEPS = yellowPath.ringSteps;
export const YELLOW_HOME_STEPS = yellowPath.homeSteps;
export const YELLOW_WALK_STEPS = yellowPath.walkSteps;
export const YELLOW_RING_Y1_STEP = yellowPath.ringH1Step;
export const YELLOW_FINISH_STEP = yellowPath.walkSteps + 1;

export const getYellowCellForStep = (step) => yellowPath.getCellForStep(step);
export const getYellowStepLabel = (step) => yellowPath.getStepLabel(step);
export const getYellowHomeTag = (step) => yellowPath.getHomeTag(step);
