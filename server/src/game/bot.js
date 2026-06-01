import bcrypt from 'bcryptjs';
import pool from '../db/pool.js';
import { pickBestMove, normalizeDifficulty } from './aiEngine.js';

const BOT_EMAIL = 'bot@ludosphere.internal';
const BOT_USERNAME = 'ludo_ai';

let BOT_USER_ID = null;

export function getBotUserId() {
  return BOT_USER_ID;
}

export async function initBotUser() {
  const bot = await ensureBotUser();
  BOT_USER_ID = bot.id;
  return bot;
}

export function isBotUser(userId) {
  if (userId == null || BOT_USER_ID == null) return false;
  return String(userId) === String(BOT_USER_ID);
}

/** Prefer per-game bot id (AI matches) when BOT_USER_ID cache is stale */
export function isGameBotUser(game, userId) {
  if (userId == null) return false;
  if (game?.botUserId && String(game.botUserId) === String(userId)) return true;
  return isBotUser(userId);
}

export async function ensureBotUser() {
  const existing = await pool.query(
    'SELECT id, username, display_name FROM users WHERE email = $1 OR username = $2 LIMIT 1',
    [BOT_EMAIL, BOT_USERNAME]
  );
  if (existing.rows[0]) {
    BOT_USER_ID = existing.rows[0].id;
    return {
      id: existing.rows[0].id,
      username: existing.rows[0].display_name || 'Ludo AI',
    };
  }

  const hash = await bcrypt.hash('bot-no-login', 12);
  const created = await pool.query(
    `INSERT INTO users (username, email, password_hash, display_name, referral_code, role)
     VALUES ($1, $2, $3, $4, $5, 'user')
     RETURNING id, username, display_name`,
    [BOT_USERNAME, BOT_EMAIL, hash, 'Ludo AI', 'LCAIBOT']
  );

  const botId = created.rows[0].id;
  BOT_USER_ID = botId;
  await pool.query('INSERT INTO wallets (user_id, balance) VALUES ($1, 0) ON CONFLICT DO NOTHING', [botId]);
  await pool.query('INSERT INTO leaderboard (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [botId]);

  return { id: botId, username: 'Ludo AI' };
}

/** @deprecated use pickBestMove from aiEngine — kept for botTurn */
export function pickBotMove(state, difficulty = 'medium') {
  const idx = pickBestMove(state, normalizeDifficulty(difficulty));
  return idx ?? state.movableTokens[0] ?? 0;
}

export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
