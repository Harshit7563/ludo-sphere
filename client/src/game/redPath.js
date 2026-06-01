import { createColorPath } from './colorPathUtils.js';

/** Red — calibrated ✓ (#1 = ★ exit [6,1], #51/R1 = [7,0]) */
export const redPath = createColorPath({
  color: 'red',
  exitCell: [6, 1],
  ringPath: [
    [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6],
    [0, 6], [0, 7], [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 9], [6, 10],
    [6, 11], [6, 12], [6, 13], [6, 14], [7, 14], [8, 14], [8, 13], [8, 12], [8, 11], [8, 10],
    [8, 9], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [14, 7], [14, 6], [13, 6],
    [12, 6], [11, 6], [10, 6], [9, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
    [7, 0],
  ],
  homePath: [
    [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6],
  ],
  homeTagPrefix: 'R',
  calibrated: true,
});

export const RED_EXIT_CELL = redPath.exitCell;
export const RED_FINISH_CELL = redPath.finishCell;
export const RED_RING_PATH = redPath.ringPath;
export const RED_HOME_PATH = redPath.homePath;
export const RED_RING_STEPS = redPath.ringSteps;
export const RED_HOME_STEPS = redPath.homeSteps;
export const RED_WALK_STEPS = redPath.walkSteps;
export const RED_RING_R1_STEP = redPath.ringH1Step;
export const RED_FINISH_STEP = redPath.walkSteps + 1;

export const getRedCellForStep = (step) => redPath.getCellForStep(step);
export const getRedStepLabel = (step) => redPath.getStepLabel(step);
export const getRedHomeTag = (step) => redPath.getHomeTag(step);
