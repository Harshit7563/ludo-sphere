import {
  calculateNewPosition,
  getStepsFromStart,
  isSafePosition,
  isBlockForMover,
  getMovableTokens,
} from './engine.js';

/** @typedef {'easy'|'medium'|'hard'|'expert'} AiDifficulty */

export const AI_DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'];

export const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Easy',
    thinkMinMs: 1300,
    thinkMaxMs: 2400,
    moveMinMs: 950,
    moveMaxMs: 1700,
    mistakeRate: 0.38,
    suboptimalRate: 0.55,
    dicePauseMinMs: 400,
    dicePauseMaxMs: 900,
  },
  medium: {
    label: 'Medium',
    thinkMinMs: 850,
    thinkMaxMs: 1600,
    moveMinMs: 650,
    moveMaxMs: 1150,
    mistakeRate: 0.16,
    suboptimalRate: 0.28,
    dicePauseMinMs: 280,
    dicePauseMaxMs: 650,
  },
  hard: {
    label: 'Hard',
    thinkMinMs: 550,
    thinkMaxMs: 1100,
    moveMinMs: 420,
    moveMaxMs: 820,
    mistakeRate: 0.06,
    suboptimalRate: 0.12,
    dicePauseMinMs: 200,
    dicePauseMaxMs: 480,
  },
  expert: {
    label: 'Expert',
    thinkMinMs: 380,
    thinkMaxMs: 780,
    moveMinMs: 320,
    moveMaxMs: 620,
    mistakeRate: 0,
    suboptimalRate: 0,
    dicePauseMinMs: 150,
    dicePauseMaxMs: 380,
  },
};

const PRIORITY = {
  REACH_HOME: 100000,
  CUT_OPPONENT: 50000,
  ESCAPE_DANGER: 32000,
  MOVE_TO_SAFE: 22000,
  ADVANCE_CLOSEST: 18000,
  CREATE_BLOCK: 14000,
  OPEN_TOKEN: 9000,
  NORMAL: 1,
};

export function normalizeDifficulty(raw) {
  const d = String(raw || 'medium').toLowerCase();
  return AI_DIFFICULTIES.includes(d) ? d : 'medium';
}

export function getDifficultyConfig(difficulty) {
  return DIFFICULTY_CONFIG[normalizeDifficulty(difficulty)];
}

export function randomDelay(minMs, maxMs) {
  return minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
}

function countAtPosition(state, position, color = null) {
  let total = 0;
  let sameColor = 0;
  for (const p of state.players) {
    for (const t of p.tokens) {
      if (t === position) {
        total++;
        if (p.color === color) sameColor++;
      }
    }
  }
  return { total, sameColor };
}

/** Opponent can land on `targetPos` with one dice roll (1–6) */
function isReachableByOpponent(state, targetPos, moverColor) {
  if (targetPos <= 0 || targetPos > 52 || isSafePosition(targetPos)) return false;

  for (const opp of state.players) {
    if (opp.color === moverColor) continue;
    for (const oppPos of opp.tokens) {
      if (oppPos <= 0 || oppPos >= 53) continue;
      for (let dice = 1; dice <= 6; dice++) {
        const land = calculateNewPosition(opp.color, oppPos, dice);
        if (land === targetPos) return true;
      }
    }
  }
  return false;
}

function getCapturesOnLand(state, moverColor, newPos) {
  if (newPos <= 0 || newPos > 52 || isSafePosition(newPos)) return 0;
  if (isBlockForMover(state, newPos, moverColor)) return 0;

  let n = 0;
  for (const opp of state.players) {
    if (opp.color === moverColor) continue;
    for (const t of opp.tokens) {
      if (t === newPos) n++;
    }
  }
  return n;
}

function closestToHomeTokenIndex(player) {
  let best = -1;
  let bestSteps = -1;
  for (let i = 0; i < 4; i++) {
    const pos = player.tokens[i];
    if (pos === 0 || pos === 59) continue;
    const steps = getStepsFromStart(player.color, pos);
    if (steps > bestSteps) {
      bestSteps = steps;
      best = i;
    }
  }
  return best;
}

/**
 * Score a candidate move — higher is better.
 * Priority order matches standard competitive Ludo AI heuristics.
 */
export function scoreMove(state, tokenIndex, difficulty = 'medium') {
  const player = state.players[state.currentTurn];
  const dice = state.diceValue;
  const oldPos = player.tokens[tokenIndex];
  const newPos = calculateNewPosition(player.color, oldPos, dice);
  if (newPos === null) return -Infinity;

  let score = 0;
  const cfg = getDifficultyConfig(difficulty);

  // 1. Reach home (center)
  if (newPos === 59) {
    score += PRIORITY.REACH_HOME;
  }

  // 2. Cut opponent
  const cuts = getCapturesOnLand(state, player.color, newPos);
  if (cuts > 0) {
    score += PRIORITY.CUT_OPPONENT * cuts;
    if (oldPos === 0) score += 2000;
  }

  // 3. Escape danger
  const wasInDanger = oldPos > 0 && oldPos <= 52 && isReachableByOpponent(state, oldPos, player.color);
  const stillInDanger = newPos > 0 && newPos <= 52 && isReachableByOpponent(state, newPos, player.color);
  if (wasInDanger && !stillInDanger) {
    score += PRIORITY.ESCAPE_DANGER;
  } else if (stillInDanger && !wasInDanger) {
    score -= PRIORITY.ESCAPE_DANGER * 0.6;
  }

  // 4. Move to safe zone
  if (newPos > 0 && newPos <= 52 && isSafePosition(newPos)) {
    score += PRIORITY.MOVE_TO_SAFE;
    if (wasInDanger) score += 4000;
  }

  // 5. Advance token closest to home
  const leaderIdx = closestToHomeTokenIndex(player);
  if (leaderIdx === tokenIndex && newPos > oldPos) {
    score += PRIORITY.ADVANCE_CLOSEST;
    score += getStepsFromStart(player.color, newPos) * 40;
  }

  // Progress all tokens
  if (oldPos > 0 && newPos > oldPos) {
    score += (getStepsFromStart(player.color, newPos) - getStepsFromStart(player.color, oldPos)) * 25;
  }

  // 6. Create block (stack on own token)
  if (newPos > 0 && newPos <= 52) {
    const { sameColor } = countAtPosition(state, newPos, player.color);
    if (sameColor >= 1 && oldPos !== newPos) {
      score += PRIORITY.CREATE_BLOCK;
    }
  }

  // 7. Open new token on 6
  if (oldPos === 0 && dice === 6) {
    score += PRIORITY.OPEN_TOKEN;
    const onBoard = player.tokens.filter(t => t > 0 && t < 59).length;
    if (onBoard === 0) score += 5000;
  }

  // 8. Normal forward move
  score += getStepsFromStart(player.color, newPos) * PRIORITY.NORMAL;

  // Home stretch preference
  if (newPos >= 53 && newPos <= 58) {
    score += 8000 + newPos * 100;
  }

  // Expert: small lookahead — penalize landing where cut back is likely next turn
  if (normalizeDifficulty(difficulty) === 'expert' && stillInDanger) {
    score -= 8000;
  }

  // Easy: add noise
  if (cfg.mistakeRate > 0) {
    score += (Math.random() - 0.5) * 12000 * cfg.mistakeRate;
  }

  return score;
}

/** Pick best token index for current dice roll */
export function pickBestMove(state, difficulty = 'medium') {
  const movable = state.movableTokens?.length
    ? state.movableTokens
    : getMovableTokens(state);

  if (!movable.length) return null;

  const cfg = getDifficultyConfig(difficulty);
  const ranked = movable
    .map(idx => ({ idx, score: scoreMove(state, idx, difficulty) }))
    .sort((a, b) => b.score - a.score);

  if (cfg.mistakeRate > 0 && Math.random() < cfg.mistakeRate) {
    return movable[Math.floor(Math.random() * movable.length)];
  }

  if (cfg.suboptimalRate > 0 && Math.random() < cfg.suboptimalRate && ranked.length > 1) {
    const poolSize = Math.min(3, ranked.length);
    const pick = ranked[Math.floor(Math.random() * poolSize)];
    return pick.idx;
  }

  return ranked[0].idx;
}

export function explainMove(state, tokenIndex, difficulty = 'medium') {
  return {
    tokenIndex,
    score: scoreMove(state, tokenIndex, difficulty),
    difficulty: normalizeDifficulty(difficulty),
  };
}
