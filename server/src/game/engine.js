// Standard Ludo: 52-cell ring + 6-cell home stretch + center finish
export const COLORS = ['red', 'green', 'yellow', 'blue'];
export const COLOR_START = { red: 0, green: 13, yellow: 26, blue: 39 };

/** Safe ring indices (clockwise from red entry) — color starts + star cells */
export const SAFE_RING_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

export const AI_2P_COLORS = ['blue', 'green']; // you = blue, AI = green

export function createInitialState(mode = '4p', playerIds = [], colorList = null) {
  const activeColors = colorList ?? (mode === '2p' ? ['red', 'yellow'] : COLORS);
  const players = playerIds.map((id, i) => ({
    id,
    color: activeColors[i] ?? COLORS[i],
    seatIndex: i,
    tokens: [0, 0, 0, 0],
    finishedTokens: 0,
    isConnected: true,
    skips: 0,
  }));

  return {
    mode,
    players,
    currentTurn: 0,
    diceValue: null,
    diceRolled: false,
    canRoll: true,
    movableTokens: [],
    consecutiveSixes: 0,
    phase: 'rolling',
    winner: null,
    winners: [],
    turnStartedAt: Date.now(),
    turnTimerSeconds: 10,
    chat: [],
    lastAction: null,
  };
}

export function getRingIndex(position) {
  if (position < 1 || position > 52) return null;
  return (position - 1) % 52;
}

export function isSafePosition(position) {
  if (position <= 0 || position > 52) return true;
  const idx = getRingIndex(position);
  return idx !== null && SAFE_RING_INDICES.includes(idx);
}

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

export function positionFromSteps(color, steps) {
  const start = COLOR_START[color];
  if (steps < 1 || steps > 58) return null;
  if (steps <= 51) {
    let p = start + steps;
    if (p > 52) p -= 52;
    return p;
  }
  if (steps <= 57) return 52 + (steps - 51);
  return 59;
}

export function calculateNewPosition(color, currentPos, dice) {
  if (currentPos === 0) return dice === 6 ? COLOR_START[color] + 1 : null;
  if (currentPos === 59) return null;

  const steps = getStepsFromStart(color, currentPos);
  if (steps < 0) return null;

  const newSteps = steps + dice;
  if (newSteps > 58) return null;

  return positionFromSteps(color, newSteps);
}

function tokenCountsAt(state, position) {
  const counts = {};
  for (const p of state.players) {
    for (const t of p.tokens) {
      if (t === position) counts[p.color] = (counts[p.color] || 0) + 1;
    }
  }
  return counts;
}

export function isBlockForMover(state, position, moverColor) {
  if (position <= 0 || position > 52 || isSafePosition(position)) return false;
  const counts = tokenCountsAt(state, position);
  for (const [color, n] of Object.entries(counts)) {
    if (n >= 2 && color !== moverColor) return true;
  }
  return false;
}

function isPathBlocked(state, color, fromPos, dice) {
  const fromSteps = getStepsFromStart(color, fromPos);
  if (fromSteps < 0) return true;

  for (let s = fromSteps + 1; s <= fromSteps + dice; s++) {
    const cell = positionFromSteps(color, s);
    if (cell && cell <= 52 && isBlockForMover(state, cell, color)) return true;
  }
  return false;
}

export function getMovableTokens(state) {
  const player = state.players[state.currentTurn];
  const dice = state.diceValue;
  const movable = [];

  for (let i = 0; i < 4; i++) {
    const pos = player.tokens[i];
    if (pos === 59) continue;

    if (pos === 0) {
      if (dice === 6) movable.push(i);
      continue;
    }

    const newPos = calculateNewPosition(player.color, pos, dice);
    if (newPos === null) continue;
    if (isPathBlocked(state, player.color, pos, dice)) continue;
    movable.push(i);
  }
  return movable;
}

export function rollDice(state) {
  if (!state.canRoll || state.diceRolled) return null;
  const value = Math.floor(Math.random() * 6) + 1;
  state.diceValue = value;
  state.diceRolled = true;
  state.canRoll = false;

  if (value === 6) {
    state.consecutiveSixes++;
  } else {
    state.consecutiveSixes = 0;
  }

  if (state.consecutiveSixes >= 3) {
    state.consecutiveSixes = 0;
    state.movableTokens = [];
    state.lastAction = { type: 'three_sixes', value };
    advanceTurn(state);
    return value;
  }

  state.movableTokens = getMovableTokens(state);

  if (state.movableTokens.length === 0) {
    if (value === 6) {
      state.canRoll = true;
      state.diceRolled = false;
      state.diceValue = null;
      state.phase = 'rolling';
    } else {
      advanceTurn(state);
    }
  } else {
    state.phase = 'moving';
  }

  state.turnStartedAt = Date.now();
  if (state.lastAction?.type !== 'three_sixes') {
    state.lastAction = { type: 'dice_roll', value };
  }
  return value;
}

export function moveToken(state, tokenIndex) {
  if (state.phase !== 'moving') return { success: false, error: 'Not in moving phase' };
  if (!state.movableTokens.includes(tokenIndex)) return { success: false, error: 'Invalid token' };

  const player = state.players[state.currentTurn];
  const oldPos = player.tokens[tokenIndex];
  const diceUsed = state.diceValue;
  const wasSix = diceUsed === 6;
  const sixCount = state.consecutiveSixes;

  const newPos = calculateNewPosition(player.color, oldPos, diceUsed);
  if (newPos === null) return { success: false, error: 'Invalid move' };

  const captures = [];
  player.tokens[tokenIndex] = newPos;

  let reachedHome = false;
  if (newPos === 59) {
    player.finishedTokens++;
    reachedHome = true;
    if (player.finishedTokens === 4) {
      state.winners.push(player.id);
      if (!state.winner) state.winner = player.id;
    }
  }

  if (newPos > 0 && newPos <= 52 && !isSafePosition(newPos) && !isBlockForMover(state, newPos, player.color)) {
    for (const opp of state.players) {
      if (opp.color === player.color) continue;
      for (let i = 0; i < 4; i++) {
        if (opp.tokens[i] === newPos) {
          opp.tokens[i] = 0;
          captures.push({ playerId: opp.id, tokenIndex: i });
        }
      }
    }
  }

  const gameOver = state.winners.length >= 1;

  state.lastAction = {
    type: 'token_move',
    playerId: player.id,
    tokenIndex,
    from: oldPos,
    to: newPos,
    captures,
  };

  if (gameOver) {
    state.phase = 'finished';
    return { success: true, captures, gameOver: true };
  }

  state.diceRolled = false;
  state.diceValue = null;
  state.movableTokens = [];

  const extraFromSix = wasSix && sixCount < 3;
  const extraFromCapture = captures.length > 0;
  const extraFromHome = reachedHome;

  if (extraFromSix || extraFromCapture || extraFromHome) {
    state.canRoll = true;
    state.phase = 'rolling';
    if (!extraFromSix) state.consecutiveSixes = 0;
  } else {
    state.consecutiveSixes = 0;
    advanceTurn(state);
  }

  state.turnStartedAt = Date.now();
  return { success: true, captures, gameOver: false };
}

function advanceTurn(state) {
  let next = (state.currentTurn + 1) % state.players.length;
  let attempts = 0;
  while (state.players[next].finishedTokens === 4 && attempts < state.players.length) {
    next = (next + 1) % state.players.length;
    attempts++;
  }
  state.currentTurn = next;
  state.canRoll = true;
  state.diceRolled = false;
  state.diceValue = null;
  state.movableTokens = [];
  state.phase = 'rolling';
  state.turnStartedAt = Date.now();
}

export function handleTurnTimeout(state) {
  const player = state.players[state.currentTurn];
  player.skips = (player.skips || 0) + 1;

  if (player.skips >= 3) {
    player.isConnected = false;
  }

  if (state.phase === 'moving' && state.movableTokens.length > 0) {
    moveToken(state, state.movableTokens[0]);
  } else {
    advanceTurn(state);
  }
}

export function addChatMessage(state, userId, username, message, emoji = null) {
  const msg = {
    id: Date.now().toString(),
    userId,
    username,
    message,
    emoji,
    timestamp: Date.now(),
  };
  state.chat.push(msg);
  if (state.chat.length > 50) state.chat.shift();
  return msg;
}
