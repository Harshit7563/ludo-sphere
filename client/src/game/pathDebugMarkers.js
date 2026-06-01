import { getColorPath } from './colorPaths.js';
import { FINISH_CELL } from './colorPathUtils.js';

export function pathDebugAliasList(alias) {
  if (!alias) return [];
  return Array.isArray(alias) ? alias : [alias];
}

function draftHomeAlias(step, prefix) {
  if (step >= 51 && step <= 57) return `${prefix}${step - 50}`;
  return undefined;
}

/** Debug overlay markers for a player color */
export function getPathDebugMarkers(color = 'blue') {
  const path = getColorPath(color);
  if (!path) return [];

  const markers = [];

  if (!path.calibrated && path.calibrationDraft?.length) {
    path.calibrationDraft.forEach(([row, col], i) => {
      const step = i + 1;
      if (step > 57) return;
      markers.push({
        id: `${color}-draft-${step}`,
        row,
        col,
        label: String(step),
        alias: draftHomeAlias(step, path.homeTagPrefix),
        aliasOnly: step >= 52 && step <= 57,
        kind: step <= 51 ? 'ring' : 'extended',
        walkStep: null,
      });
    });

    markers.push({
      id: 'finish',
      row: FINISH_CELL[0],
      col: FINISH_CELL[1],
      label: '★',
      kind: 'finish',
    });

    return markers;
  }

  if (path.calibrated || path.ringPath.length > 0) {
    path.ringPath.forEach(([row, col], i) => {
      const step = i + 1;
      markers.push({
        id: `${color}-ring-${step}`,
        row,
        col,
        label: path.calibrated && step === 1 ? '★' : String(step),
        alias: path.calibrated && step === path.ringH1Step ? `${path.homeTagPrefix}1` : undefined,
        aliasOnly: false,
        kind: 'ring',
        walkStep: path.calibrated ? step : null,
      });
    });
  } else {
    markers.push({
      id: `${color}-exit`,
      row: path.exitCell[0],
      col: path.exitCell[1],
      label: '★',
      title: `${color} exit — ring calibration pending`,
      kind: 'ring',
      walkStep: null,
    });
  }

  path.homePath.forEach(([row, col], i) => {
    const step = path.ringSteps + 1 + i;
    const tag = path.getHomeTag(step);
    markers.push({
      id: `${color}-home-${tag}`,
      row,
      col,
      label: tag,
      alias: tag,
      aliasOnly: path.calibrated,
      kind: 'extended',
      walkStep: path.calibrated ? step : null,
    });
  });

  markers.push({
    id: 'finish',
    row: FINISH_CELL[0],
    col: FINISH_CELL[1],
    label: '★',
    kind: 'finish',
  });

  return markers;
}

export function getPathDebugLegend(color = 'blue') {
  const path = getColorPath(color);
  const prefix = path?.homeTagPrefix ?? '?';
  const name = color.charAt(0).toUpperCase() + color.slice(1);

  if (!path?.calibrated) {
    if (path.calibrationDraft?.length) {
      return [
        `${name} — draft numbers 1–${path.calibrationDraft.length} (correct order step-by-step)`,
        `#1 = ★ exit [${path.exitCell}]`,
        `${prefix}2–${prefix}7 = home lane (final labels after ring done)`,
        '★ = center finish',
        `?pathNums=1&pathColor=${color}`,
      ];
    }
    const ringNote = path.ringSteps > 0
      ? `${name} — calibrating… ${path.ringSteps} ring cell(s) so far`
      : `${name} — ring NOT calibrated yet (★ exit [${path.exitCell}])`;
    return [
      ringNote,
      `#1 = ★ exit [${path.exitCell}]`,
      `${prefix}2–${prefix}7 = home lane cells (known)`,
      '★ = center finish',
      `?pathNums=1&pathColor=${color}`,
    ];
  }

  return [
    `1–${path.ringSteps} = ${color} calibrated ring (#1 = ★ exit [${path.exitCell}])`,
    `${path.ringSteps}/${prefix}1 = last ring cell`,
    `${prefix}2–${prefix}7 = home lane (alias only)`,
    '★ = center finish',
    `Tap numbers 1 → ${prefix}7 to walk pawn (?pathNums=1&pathColor=${color})`,
  ];
}

/** @deprecated use getPathDebugLegend(color) */
export const PATH_DEBUG_LEGEND = getPathDebugLegend('blue');

export const PATH_DEBUG_MAX_VISIBLE = getColorPath('blue')?.ringSteps ?? 51;

/** @deprecated */
export const PATH_RING_AFTER_52 = [];
