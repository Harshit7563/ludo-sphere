import { rollDice, moveToken, handleTurnTimeout } from './engine.js';
import { isGameBotUser, pickBotMove } from './bot.js';
import { getDifficultyConfig, randomDelay } from './aiEngine.js';

const ANTI_STUCK_MAX_ACTIONS = 24;
const ANTI_STUCK_MS = 22000;

/** @typedef {import('./aiEngine.js').AiDifficulty} AiDifficulty */

function getAiDifficulty(game) {
  return game?.aiDifficulty || 'medium';
}

function clearBotTimers(game) {
  if (game.botTimer) {
    clearTimeout(game.botTimer);
    game.botTimer = null;
  }
}

function resetBotTurnSession(game) {
  game.botTurnStartedAt = Date.now();
  game.botActionCount = 0;
}

function scheduleDelay(game, ms, fn) {
  clearBotTimers(game);
  game.botTimer = setTimeout(fn, ms);
}

/**
 * AI Turn Manager — auto dice, auto move, human-like delay, anti-stuck.
 */
export function scheduleBotTurn(io, game, roomCode, helpers) {
  if (game.state.phase === 'finished') return;

  const current = game.state.players[game.state.currentTurn];
  if (!current || !isGameBotUser(game, current.id)) return;

  if (!game.botTurnStartedAt || game._botTurnSeat !== game.state.currentTurn) {
    resetBotTurnSession(game);
    game._botTurnSeat = game.state.currentTurn;
  }

  const cfg = getDifficultyConfig(getAiDifficulty(game));
  const delay = randomDelay(cfg.thinkMinMs, cfg.thinkMaxMs);

  scheduleDelay(game, delay, () => {
    runBotStep(io, game, roomCode, helpers);
  });
}

function runBotStep(io, game, roomCode, helpers) {
  if (game.state.phase === 'finished') return;

  const current = game.state.players[game.state.currentTurn];
  if (!isGameBotUser(game, current?.id)) return;

  game.botActionCount = (game.botActionCount || 0) + 1;

  if (isAntiStuckTriggered(game)) {
    forceUnstickBot(io, game, roomCode, helpers);
    return;
  }

  if (game.timer) clearTimeout(game.timer);

  const cfg = getDifficultyConfig(getAiDifficulty(game));

  // —— Auto dice roll ——
  if (game.state.canRoll && game.state.phase === 'rolling') {
    const diceDelay = randomDelay(cfg.dicePauseMinMs, cfg.dicePauseMaxMs);
    scheduleDelay(game, diceDelay, () => {
      executeBotRoll(io, game, roomCode, helpers);
    });
    return;
  }

  // —— Auto move ——
  if (game.state.phase === 'moving' && game.state.movableTokens.length) {
    const moveDelay = randomDelay(cfg.moveMinMs, cfg.moveMaxMs);
    scheduleDelay(game, moveDelay, () => {
      executeBotMove(io, game, roomCode, helpers);
    });
    return;
  }

  // Nothing to do — resync timer / next bot turn
  helpers.resetTurnTimer(io, game, roomCode);
  scheduleBotTurn(io, game, roomCode, helpers);
}

function executeBotRoll(io, game, roomCode, helpers) {
  if (game.state.phase === 'finished') return;
  const current = game.state.players[game.state.currentTurn];
  if (!isGameBotUser(game, current?.id) || !game.state.canRoll) return;

  const value = rollDice(game.state);
  if (value === null) {
    helpers.resetTurnTimer(io, game, roomCode);
    return;
  }

  io.to(roomCode).emit('game:dice', { value, playerId: current.id });
  io.to(roomCode).emit('game:state', helpers.sanitizeState(game.state));

  if (game.state.phase === 'finished') {
    helpers.finishGame(io, game, roomCode);
    return;
  }

  if (game.state.lastAction?.type === 'three_sixes') {
    game._botTurnSeat = null;
    helpers.resetTurnTimer(io, game, roomCode);
    scheduleBotTurn(io, game, roomCode, helpers);
    return;
  }

  if (game.state.phase === 'moving') {
    runBotStep(io, game, roomCode, helpers);
    return;
  }

  if (game.state.canRoll && game.state.phase === 'rolling') {
    runBotStep(io, game, roomCode, helpers);
    return;
  }

  game._botTurnSeat = null;
  helpers.resetTurnTimer(io, game, roomCode);
  scheduleBotTurn(io, game, roomCode, helpers);
}

function executeBotMove(io, game, roomCode, helpers) {
  if (game.state.phase === 'finished') return;
  const current = game.state.players[game.state.currentTurn];
  if (!isGameBotUser(game, current?.id)) return;

  const tokenIndex = pickBotMove(game.state, getAiDifficulty(game));
  if (tokenIndex === null) {
    helpers.resetTurnTimer(io, game, roomCode);
    return;
  }

  const result = moveToken(game.state, tokenIndex);
  if (!result.success) {
    game.botActionCount = ANTI_STUCK_MAX_ACTIONS;
    forceUnstickBot(io, game, roomCode, helpers);
    return;
  }

  io.to(roomCode).emit('game:move_result', {
    playerId: current.id,
    tokenIndex,
    captures: result.captures,
  });
  io.to(roomCode).emit('game:state', helpers.sanitizeState(game.state));

  if (result.gameOver) {
    clearBotTimers(game);
    helpers.finishGame(io, game, roomCode);
    return;
  }

  if (game.state.canRoll && game.state.phase === 'rolling') {
    runBotStep(io, game, roomCode, helpers);
    return;
  }

  game._botTurnSeat = null;
  helpers.resetTurnTimer(io, game, roomCode);
  scheduleBotTurn(io, game, roomCode, helpers);
}

function isAntiStuckTriggered(game) {
  const elapsed = Date.now() - (game.botTurnStartedAt || Date.now());
  return (
    game.botActionCount >= ANTI_STUCK_MAX_ACTIONS ||
    elapsed >= ANTI_STUCK_MS
  );
}

function forceUnstickBot(io, game, roomCode, helpers) {
  console.warn('[AI] Anti-stuck triggered for room', roomCode);

  if (game.state.phase === 'moving' && game.state.movableTokens.length) {
    const idx = game.state.movableTokens[0];
    const result = moveToken(game.state, idx);
    if (result.success) {
      const current = game.state.players[game.state.currentTurn];
      io.to(roomCode).emit('game:move_result', {
        playerId: current.id,
        tokenIndex: idx,
        captures: result.captures,
      });
      io.to(roomCode).emit('game:state', helpers.sanitizeState(game.state));
      if (result.gameOver) {
        helpers.finishGame(io, game, roomCode);
        return;
      }
      game._botTurnSeat = null;
      resetBotTurnSession(game);
      helpers.resetTurnTimer(io, game, roomCode);
      scheduleBotTurn(io, game, roomCode, helpers);
      return;
    }
  }

  game.state.consecutiveSixes = 0;
  handleTurnTimeout(game.state);
  io.to(roomCode).emit('game:state', helpers.sanitizeState(game.state));

  if (game.state.phase === 'finished') {
    helpers.finishGame(io, game, roomCode);
    return;
  }

  game._botTurnSeat = null;
  resetBotTurnSession(game);
  helpers.resetTurnTimer(io, game, roomCode);
  scheduleBotTurn(io, game, roomCode, helpers);
}
