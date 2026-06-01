/** Center finish — same for all colors */
export const FINISH_CELL = [7, 7];

/**
 * @typedef {Object} ColorPathConfig
 * @property {string} color
 * @property {[number, number]} exitCell
 * @property {[number, number][]} ringPath
 * @property {[number, number][]} homePath
 * @property {string} homeTagPrefix - e.g. 'B', 'R', 'G', 'Y'
 * @property {boolean} calibrated
 */

/** @param {ColorPathConfig & { calibrationDraft?: [number, number][] }} config */
export function createColorPath(config) {
  const {
    color,
    exitCell,
    ringPath,
    homePath,
    homeTagPrefix,
    calibrated,
    calibrationDraft = [],
  } = config;

  const ringSteps = ringPath.length;
  const homeSteps = homePath.length;
  const walkSteps = ringSteps + homeSteps;
  const ringH1Step = ringSteps;

  return {
    color,
    exitCell,
    finishCell: FINISH_CELL,
    ringPath,
    homePath,
    homeTagPrefix,
    calibrated,
    calibrationDraft,
    ringSteps,
    homeSteps,
    walkSteps,
    ringH1Step,

    getCellForStep(step) {
      if (step >= 1 && step <= ringSteps) return ringPath[step - 1] ?? null;
      if (step >= ringSteps + 1 && step <= walkSteps) {
        return homePath[step - ringSteps - 1] ?? null;
      }
      if (step === walkSteps + 1) return FINISH_CELL;
      return null;
    },

    getStepLabel(step) {
      if (step >= 1 && step <= ringSteps - 1) return String(step);
      if (step === ringH1Step && ringSteps > 0) {
        return `${step}/${homeTagPrefix}1`;
      }
      if (step >= ringSteps + 1 && step <= walkSteps) {
        return `${homeTagPrefix}${step - ringSteps + 1}`;
      }
      if (step === walkSteps + 1) return '★';
      return null;
    },

    getHomeTag(step) {
      if (step >= ringSteps + 1 && step <= walkSteps) {
        return `${homeTagPrefix}${step - ringSteps + 1}`;
      }
      return null;
    },
  };
}
