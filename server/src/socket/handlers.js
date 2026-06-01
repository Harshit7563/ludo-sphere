import pool from '../db/pool.js';
import {
  createInitialState,
  rollDice,
  moveToken,
  handleTurnTimeout,
  addChatMessage,
  AI_2P_COLORS,
} from '../game/engine.js';
import { ensureBotUser, isBotUser, isGameBotUser, generateRoomCode, initBotUser } from '../game/bot.js';
import { normalizeDifficulty } from '../game/aiEngine.js';
import { scheduleBotTurn } from '../game/botTurn.js';
import {
  pickRandomIndianName,
  pickRandomAiAvatar,
  buildPlayerProfiles,
} from '../game/indianNames.js';
import { winnerPrizeAmount } from '../utils/matchPrize.js';
import { emitRoundStateToSocket } from '../headTail/roundClock.js';

export { initBotUser };

const activeGames = new Map(); // roomCode -> { state, roomId, matchId, timers, sockets }
const playerRooms = new Map(); // userId -> roomCode
const matchmakingQueue = { '2p': [], '4p': [] };
const matchmakingTimers = new Map(); // userId -> timeout id

const MATCHMAKING_MIN_MS = 5000;
const MATCHMAKING_MAX_MS = 18000;

function randomMatchDelayMs() {
  return (
    MATCHMAKING_MIN_MS
    + Math.floor(Math.random() * (MATCHMAKING_MAX_MS - MATCHMAKING_MIN_MS + 1))
  );
}

function cancelMatchmakingTimer(userId) {
  const timerId = matchmakingTimers.get(userId);
  if (timerId != null) clearTimeout(timerId);
  matchmakingTimers.delete(userId);
}

function clearUserFromMatchmaking(userId) {
  cancelMatchmakingTimer(userId);
  for (const mode of ['2p', '4p']) {
    matchmakingQueue[mode] = matchmakingQueue[mode].filter((p) => p.userId !== userId);
  }
}

function removePlayersFromQueue(mode, players) {
  const ids = new Set(players.map((p) => p.userId));
  matchmakingQueue[mode] = matchmakingQueue[mode].filter((p) => !ids.has(p.userId));
}

function scheduleDelayedMatch(io, mode, players, entryFee, delayMs) {
  for (const p of players) cancelMatchmakingTimer(p.userId);

  const timerId = setTimeout(() => {
    for (const p of players) matchmakingTimers.delete(p.userId);
    createMatchFromQueue(io, mode, players, entryFee).catch((err) => {
      console.error('Delayed match error:', err);
    });
  }, delayMs);

  for (const p of players) {
    matchmakingTimers.set(p.userId, timerId);
  }
}

function scheduleSoloMatchmaking(io, player, mode, entryFee) {
  const delayMs = randomMatchDelayMs();
  cancelMatchmakingTimer(player.userId);

  const timerId = setTimeout(() => {
    matchmakingTimers.delete(player.userId);
    fulfillSoloMatchmaking(io, mode, entryFee, player.userId).catch((err) => {
      console.error('Solo matchmaking error:', err);
    });
  }, delayMs);

  matchmakingTimers.set(player.userId, timerId);
}

async function fulfillSoloMatchmaking(io, mode, entryFee, userId) {
  const queue = matchmakingQueue[mode];
  const waiting = queue.filter((p) => p.entryFee === entryFee);
  const self = waiting.find((p) => p.userId === userId);
  if (!self) return;

  if (mode === '2p') {
    const partner = waiting.find((p) => p.userId !== userId);
    if (partner) {
      removePlayersFromQueue(mode, [self, partner]);
      cancelMatchmakingTimer(partner.userId);
      await createMatchFromQueue(io, mode, [self, partner], entryFee);
      return;
    }
    removePlayersFromQueue(mode, [self]);
    await createBotMatchFromQueue(io, self, entryFee);
    return;
  }

  if (waiting.length >= 4) {
    const group = waiting.slice(0, 4);
    removePlayersFromQueue(mode, group);
    for (const p of group) cancelMatchmakingTimer(p.userId);
    await createMatchFromQueue(io, mode, group, entryFee);
    return;
  }

  removePlayersFromQueue(mode, [self]);
  const sock = io.sockets.sockets.get(self.socketId);
  sock?.emit('matchmaking:failed', {
    message: 'Not enough players for 4-player match. Try again or play 1v1.',
  });
}

async function createBotMatchFromQueue(io, human, entryFee) {
  const bot = await ensureBotUser();
  if (!bot?.id) {
    const sock = io.sockets.sockets.get(human.socketId);
    sock?.emit('error', { message: 'Opponent unavailable. Please try again.' });
    return;
  }
  await createMatchFromQueue(
    io,
    '2p',
    [
      human,
      { userId: bot.id, username: bot.username, socketId: null, entryFee },
    ],
    entryFee,
    { aiDifficulty: 'medium', botUserId: bot.id },
  );
}

function botTurnHelpers() {
  return { finishGame, resetTurnTimer, sanitizeState };
}

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    const userId = socket.user.id;
    const username = socket.user.username;

    socket.emit('socket:ready', { userId, ok: true });
    emitRoundStateToSocket(socket);

    socket.on('headtail:sync', () => {
      emitRoundStateToSocket(socket);
    });

    socket.on('matchmaking:join', ({ mode = '4p', entryFee = 0 }) => {
      clearUserFromMatchmaking(userId);

      const fee = Number(entryFee) || 0;
      const player = { userId, username, socketId: socket.id, entryFee: fee };
      const queue = matchmakingQueue[mode];
      const partner = queue.find((p) => p.entryFee === fee && p.userId !== userId);

      if (partner) {
        removePlayersFromQueue(mode, [partner]);
        cancelMatchmakingTimer(partner.userId);
        const delayMs = randomMatchDelayMs();
        scheduleDelayedMatch(io, mode, [partner, player], fee, delayMs);
      } else {
        matchmakingQueue[mode].push(player);
        scheduleSoloMatchmaking(io, player, mode, fee);
      }

      socket.emit('matchmaking:waiting', { mode, entryFee: fee });
    });

    socket.on('matchmaking:leave', () => {
      clearUserFromMatchmaking(userId);
    });

    socket.on('ai:start', async ({ mode = '2p', difficulty = 'medium' }) => {
      try {
        const roomCode = await createAiGame(io, socket, { mode, difficulty });
        if (roomCode) {
          socket.emit('ai:ready', { roomCode });
        }
      } catch (err) {
        console.error('AI game error:', err);
        socket.emit('error', {
          message: err.message || 'Could not start AI game. Run: npm run db:setup',
        });
      }
    });

    socket.on('room:join', async ({ roomCode }) => {
      const game = activeGames.get(roomCode);
      if (game) {
        socket.join(roomCode);
        playerRooms.set(userId, roomCode);
        const player = game.state.players.find(p => p.id === userId);
        if (player) player.isConnected = true;
        socket.emit('game:state', sanitizeState(game.state, userId));
        io.to(roomCode).emit('player:reconnected', { userId, username });
        return;
      }

      try {
        const room = await pool.query('SELECT * FROM rooms WHERE room_code = $1', [roomCode]);
        if (!room.rows[0]) return socket.emit('error', { message: 'Room not found' });

        socket.join(roomCode);
        playerRooms.set(userId, roomCode);

        const players = await pool.query(
          `SELECT rp.user_id, rp.seat_index, rp.color, u.username
           FROM room_players rp JOIN users u ON u.id = rp.user_id
           WHERE rp.room_id = $1 ORDER BY rp.seat_index`,
          [room.rows[0].id]
        );

        io.to(roomCode).emit('room:updated', {
          room: room.rows[0],
          players: players.rows.map(p => ({
            userId: p.user_id,
            seatIndex: p.seat_index,
            color: p.color,
            username: p.username,
          })),
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    socket.on('room:ready', async ({ roomCode }) => {
      try {
        const room = await pool.query('SELECT * FROM rooms WHERE room_code = $1', [roomCode]);
        if (!room.rows[0]) return;

        await pool.query(
          'UPDATE room_players SET is_ready = true WHERE room_id = $1 AND user_id = $2',
          [room.rows[0].id, userId]
        );

        const ready = await pool.query(
          'SELECT COUNT(*) as ready, (SELECT COUNT(*) FROM room_players WHERE room_id = $1) as total FROM room_players WHERE room_id = $1 AND is_ready = true',
          [room.rows[0].id]
        );

        io.to(roomCode).emit('room:ready_update', {
          ready: parseInt(ready.rows[0].ready),
          total: parseInt(ready.rows[0].total),
        });

        if (parseInt(ready.rows[0].ready) === parseInt(ready.rows[0].total) &&
            parseInt(ready.rows[0].total) >= (room.rows[0].mode === '2p' ? 2 : 2)) {
          await startGame(io, room.rows[0]);
        }
      } catch (err) {
        socket.emit('error', { message: 'Ready failed' });
      }
    });

    socket.on('game:roll', ({ roomCode }) => {
      const game = activeGames.get(roomCode);
      if (!game) return socket.emit('error', { message: 'Game not found' });

      const currentPlayer = game.state.players[game.state.currentTurn];
      if (String(currentPlayer.id) !== String(userId)) {
        return socket.emit('error', { message: 'Not your turn' });
      }

      const value = rollDice(game.state);
      if (value === null) return socket.emit('error', { message: 'Cannot roll now' });

      io.to(roomCode).emit('game:dice', { value, playerId: userId });
      io.to(roomCode).emit('game:state', sanitizeState(game.state));

      resetTurnTimer(io, game, roomCode);
      scheduleBotTurn(io, game, roomCode, botTurnHelpers());
    });

    socket.on('game:move', ({ roomCode, tokenIndex }) => {
      const game = activeGames.get(roomCode);
      if (!game) return;

      const currentPlayer = game.state.players[game.state.currentTurn];
      if (String(currentPlayer.id) !== String(userId)) return;

      const result = moveToken(game.state, tokenIndex);
      if (!result.success) return socket.emit('error', { message: result.error });

      io.to(roomCode).emit('game:move_result', {
        playerId: userId,
        tokenIndex,
        captures: result.captures,
      });
      io.to(roomCode).emit('game:state', sanitizeState(game.state));

      if (result.gameOver) {
        finishGame(io, game, roomCode);
      } else {
        resetTurnTimer(io, game, roomCode);
        scheduleBotTurn(io, game, roomCode, botTurnHelpers());
      }
    });

    socket.on('chat:message', ({ roomCode, message, emoji }) => {
      const game = activeGames.get(roomCode);
      if (!game) return;
      const text = (message || '').trim();
      if (!text && !emoji) return;
      addChatMessage(game.state, userId, username, text || null, emoji || null);
      io.to(roomCode).emit('game:state', sanitizeState(game.state));
    });

    socket.on('emoji:send', ({ roomCode, emoji }) => {
      const game = activeGames.get(roomCode);
      if (!game || !emoji) return;
      addChatMessage(game.state, userId, username, null, emoji);
      io.to(roomCode).emit('game:state', sanitizeState(game.state));
    });

    socket.on('disconnect', () => {
      clearUserFromMatchmaking(userId);

      const roomCode = playerRooms.get(userId);
      if (roomCode) {
        const game = activeGames.get(roomCode);
        if (game) {
          const player = game.state.players.find(p => p.id === userId);
          if (player) player.isConnected = false;
          io.to(roomCode).emit('player:disconnected', { userId, username });
        }
        playerRooms.delete(userId);
      }
    });
  });
}

async function createAiGame(io, socket, { mode = '2p', difficulty = 'medium' }) {
  if (mode !== '2p') {
    socket.emit('error', { message: 'AI games are available in 2 player mode only' });
    return null;
  }

  const aiDifficulty = normalizeDifficulty(difficulty);
  const userId = socket.user.id;
  const username = socket.user.username;

  const bot = await ensureBotUser();
  if (!bot?.id) {
    throw new Error('AI bot is not ready. Restart server after: npm run db:setup');
  }

  const roomCode = generateRoomCode();

  const room = await pool.query(
    `INSERT INTO rooms (room_code, host_id, mode, entry_fee, max_players, is_private, status, prize_pool)
     VALUES ($1, $2, '2p', 0, 2, true, 'playing', 0) RETURNING *`,
    [roomCode, userId]
  );

  await pool.query(
    'INSERT INTO room_players (room_id, user_id, seat_index, color, is_ready) VALUES ($1, $2, 0, $3, true)',
    [room.rows[0].id, userId, AI_2P_COLORS[0]]
  );
  await pool.query(
    'INSERT INTO room_players (room_id, user_id, seat_index, color, is_ready) VALUES ($1, $2, 1, $3, true)',
    [room.rows[0].id, bot.id, AI_2P_COLORS[1]]
  );

  await socket.join(roomCode);
  playerRooms.set(userId, roomCode);

  await startGame(io, room.rows[0], [
    { userId, username },
    { userId: bot.id, username: bot.username },
  ], { aiDifficulty, botUserId: bot.id, playerColors: AI_2P_COLORS });

  return roomCode;
}

async function createMatchFromQueue(io, mode, players, entryFee, extraOptions = {}) {
  const roomCode = generateRoomCode();
  try {
    const hostId = players[0].userId;
    const maxPlayers = mode === '2p' ? 2 : 4;
    const room = await pool.query(
      `INSERT INTO rooms (room_code, host_id, mode, entry_fee, max_players, is_private, status, prize_pool)
       VALUES ($1, $2, $3, $4, $5, false, 'playing', $6) RETURNING *`,
      [roomCode, hostId, mode, entryFee, maxPlayers, entryFee * players.length]
    );

    const colors = mode === '2p' ? ['red', 'yellow'] : ['red', 'green', 'yellow', 'blue'];
    for (let i = 0; i < players.length; i++) {
      await pool.query(
        'INSERT INTO room_players (room_id, user_id, seat_index, color, is_ready) VALUES ($1, $2, $3, $4, true)',
        [room.rows[0].id, players[i].userId, i, colors[i]]
      );
    }

    for (const p of players) {
      if (!p.socketId) continue;
      const sock = io.sockets.sockets.get(p.socketId);
      if (sock) {
        await sock.join(roomCode);
        playerRooms.set(p.userId, roomCode);
      }
    }

    const botId = extraOptions.botUserId || players.find((p) => isBotUser(p.userId))?.userId;
    const startOptions = {
      ...extraOptions,
      ...(botId
        ? {
            botUserId: botId,
            aiDifficulty: extraOptions.aiDifficulty || 'medium',
            playerColors: mode === '2p' ? AI_2P_COLORS : undefined,
          }
        : {}),
    };

    await startGame(io, room.rows[0], players, startOptions);
  } catch (err) {
    console.error('Matchmaking error:', err);
    for (const p of players) {
      if (!p.socketId) continue;
      io.sockets.sockets.get(p.socketId)?.emit('error', {
        message: 'Could not start match. Please try again.',
      });
    }
  }
}

async function startGame(io, room, queuePlayers = null, options = {}) {
  const roomCode = room.room_code;
  const default4p = ['red', 'green', 'yellow', 'blue'];
  const default2p = ['red', 'yellow'];

  let playerData;
  if (queuePlayers) {
    playerData = queuePlayers.map((p, i) => ({
      user_id: p.userId,
      username: p.username,
      seat_index: i,
      color: options.playerColors?.[i]
        ?? (room.mode === '2p' ? default2p : default4p)[i],
    }));
  } else {
    const result = await pool.query(
      `SELECT rp.*, u.username FROM room_players rp JOIN users u ON u.id = rp.user_id
       WHERE rp.room_id = $1 ORDER BY rp.seat_index`,
      [room.id]
    );
    playerData = result.rows;
  }

  const playerIds = playerData.map(p => p.user_id);
  const state = createInitialState(
    room.mode,
    playerIds,
    playerData.map(p => p.color)
  );
  state.aiDifficulty = options.aiDifficulty || 'medium';

  const botId = options.botUserId || playerIds.find(id => isBotUser(id));
  const botOverrides = botId
    ? { botId, displayName: pickRandomIndianName(), avatarUrl: pickRandomAiAvatar() }
    : null;
  state.playerProfiles = await buildPlayerProfiles(pool, playerIds, botOverrides);

  const match = await pool.query(
    `INSERT INTO matches (room_id, mode, entry_fee, prize_pool, player_ids, status)
     VALUES ($1, $2, $3, $4, $5, 'active') RETURNING id`,
    [room.id, room.mode, room.entry_fee, room.prize_pool, playerIds]
  );

  for (const p of playerData) {
    await pool.query(
      'INSERT INTO match_players (match_id, user_id, color, seat_index) VALUES ($1, $2, $3, $4)',
      [match.rows[0].id, p.user_id, p.color, p.seat_index]
    );
  }

  await pool.query("UPDATE rooms SET status = 'playing', started_at = NOW() WHERE id = $1", [room.id]);

  const game = {
    state,
    roomId: room.id,
    matchId: match.rows[0].id,
    roomCode,
    timer: null,
    aiDifficulty: options.aiDifficulty || 'medium',
    botUserId: botId || null,
    botTimer: null,
    botActionCount: 0,
    botTurnStartedAt: null,
    _botTurnSeat: null,
  };
  activeGames.set(roomCode, game);

  for (const p of playerData) {
    playerRooms.set(p.user_id, roomCode);
  }

  const startedPayload = {
    roomCode,
    aiDifficulty: game.aiDifficulty,
    players: playerData.map(p => ({
      id: p.user_id,
      username: p.username,
      color: p.color,
      seatIndex: p.seat_index,
      displayName: state.playerProfiles?.[p.user_id]?.displayName,
      avatarUrl: state.playerProfiles?.[p.user_id]?.avatarUrl,
      isBot: state.playerProfiles?.[p.user_id]?.isBot || false,
    })),
  };

  io.to(roomCode).emit('game:started', startedPayload);
  io.to(roomCode).emit('game:state', sanitizeState(state));
  resetTurnTimer(io, game, roomCode);
  scheduleBotTurn(io, game, roomCode, botTurnHelpers());
}

function resetTurnTimer(io, game, roomCode) {
  if (game.timer) clearTimeout(game.timer);

  const current = game.state.players[game.state.currentTurn];
  if (current && isGameBotUser(game, current.id)) {
    scheduleBotTurn(io, game, roomCode, botTurnHelpers());
    return;
  }

  game.timer = setTimeout(() => {
    handleTurnTimeout(game.state);
    io.to(roomCode).emit('game:state', sanitizeState(game.state));
    if (game.state.phase === 'finished') {
      finishGame(io, game, roomCode);
    } else {
      resetTurnTimer(io, game, roomCode);
      scheduleBotTurn(io, game, roomCode, botTurnHelpers());
    }
  }, (game.state.turnTimerSeconds || 10) * 1000);
}

async function finishGame(io, game, roomCode) {
  if (game.timer) clearTimeout(game.timer);
  if (game.botTimer) clearTimeout(game.botTimer);

  const winnerId = game.state.winner;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const commissionSetting = await client.query("SELECT value FROM admin_settings WHERE key = 'commission'");
    const adminCommissionRate = commissionSetting.rows[0]?.value?.rate || 5;
    const room = await client.query('SELECT prize_pool, entry_fee, mode FROM rooms WHERE id = $1', [game.roomId]);
    const prizePool = parseFloat(room.rows[0]?.prize_pool || 0);
    const mode = room.rows[0]?.mode || '4p';
    const winnerPrize = winnerPrizeAmount(prizePool, mode, adminCommissionRate);

    if (winnerId && winnerPrize > 0 && !isBotUser(winnerId)) {
      const wallet = await client.query(
        'UPDATE wallets SET balance = balance + $1, total_won = total_won + $1 WHERE user_id = $2 RETURNING balance',
        [winnerPrize, winnerId]
      );
      await client.query(
        'INSERT INTO transactions (user_id, type, amount, balance_after, description) VALUES ($1, $2, $3, $4, $5)',
        [winnerId, 'win', winnerPrize, wallet.rows[0].balance, `Won match in room ${roomCode}`]
      );
      await client.query(
        'UPDATE leaderboard SET wins = wins + 1, games_played = games_played + 1, rating = rating + 25, win_streak = win_streak + 1, best_streak = GREATEST(best_streak, win_streak + 1), total_earnings = total_earnings + $1, updated_at = NOW() WHERE user_id = $2',
        [winnerPrize, winnerId]
      );
      await client.query(
        'UPDATE match_players SET rank = 1, prize_amount = $1, tokens_finished = 4 WHERE match_id = $2 AND user_id = $3',
        [winnerPrize, game.matchId, winnerId]
      );
    }

    for (const p of game.state.players) {
      if (p.id !== winnerId) {
        if (isBotUser(p.id)) continue;
        await client.query(
          'UPDATE leaderboard SET losses = losses + 1, games_played = games_played + 1, rating = GREATEST(rating - 15, 100), win_streak = 0, updated_at = NOW() WHERE user_id = $1',
          [p.id]
        );
        await client.query(
          'UPDATE wallets SET total_lost = total_lost + $1 WHERE user_id = $2',
          [room.rows[0]?.entry_fee || 0, p.id]
        );
      }
    }

    await client.query(
      "UPDATE matches SET winner_id = $1, status = 'finished', finished_at = NOW(), game_state = $2 WHERE id = $3",
      [winnerId, JSON.stringify(game.state), game.matchId]
    );
    await client.query("UPDATE rooms SET status = 'finished', finished_at = NOW() WHERE id = $1", [game.roomId]);
    await client.query('COMMIT');

    io.to(roomCode).emit('game:finished', {
      winnerId,
      winners: game.state.winners,
      prize: winnerPrize,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Finish game error:', err);
  } finally {
    client.release();
    activeGames.delete(roomCode);
    for (const p of game.state.players) playerRooms.delete(p.id);
  }
}

function sanitizeState(state, userId = null) {
  return {
    mode: state.mode,
    players: state.players.map(p => {
      const profile = state.playerProfiles?.[p.id] || {};
      return {
        id: p.id,
        color: p.color,
        seatIndex: p.seatIndex,
        tokens: [...p.tokens],
        finishedTokens: p.finishedTokens,
        isConnected: p.isConnected,
        displayName: profile.displayName || 'Player',
        avatarUrl: profile.avatarUrl || null,
        isBot: profile.isBot || false,
      };
    }),
    currentTurn: state.currentTurn,
    diceValue: state.diceValue,
    diceRolled: state.diceRolled,
    canRoll: state.canRoll,
    movableTokens: state.movableTokens,
    phase: state.phase,
    winner: state.winner,
    winners: state.winners,
    turnStartedAt: state.turnStartedAt,
    turnTimerSeconds: state.turnTimerSeconds,
    chat: state.chat.slice(-20),
    lastAction: state.lastAction,
    aiDifficulty: state.aiDifficulty,
    isMyTurn: userId ? String(state.players[state.currentTurn]?.id) === String(userId) : undefined,
  };
}

export { activeGames, playerRooms };
