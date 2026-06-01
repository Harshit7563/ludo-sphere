import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

router.post('/create', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { mode = '4p', entryFee = 0, isPrivate = true } = req.body;
    const maxPlayers = mode === '2p' ? 2 : 4;

    if (entryFee > 0) {
      const wallet = await client.query('SELECT balance FROM wallets WHERE user_id = $1', [req.user.id]);
      if (wallet.rows[0].balance < entryFee) {
        return res.status(400).json({ error: 'Insufficient balance for entry fee' });
      }
    }

    await client.query('BEGIN');
    const roomCode = generateRoomCode();
    const room = await client.query(
      `INSERT INTO rooms (room_code, host_id, mode, entry_fee, max_players, is_private, prize_pool)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [roomCode, req.user.id, mode, entryFee, maxPlayers, isPrivate, entryFee * maxPlayers]
    );

    const colors = mode === '2p' ? ['red', 'yellow'] : ['red', 'green', 'yellow', 'blue'];
    await client.query(
      'INSERT INTO room_players (room_id, user_id, seat_index, color, is_ready) VALUES ($1, $2, 0, $3, true)',
      [room.rows[0].id, req.user.id, colors[0]]
    );

    if (entryFee > 0) {
      await client.query('UPDATE wallets SET balance = balance - $1 WHERE user_id = $2', [entryFee, req.user.id]);
      await client.query(
        'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'loss', entryFee, `Entry fee for room ${roomCode}`]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(room.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create room' });
  } finally {
    client.release();
  }
});

router.post('/join/:code', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const room = await client.query('SELECT * FROM rooms WHERE room_code = $1 AND status = $2', [req.body.code || req.params.code, 'waiting']);
    if (!room.rows[0]) return res.status(404).json({ error: 'Room not found or already started' });

    const r = room.rows[0];
    const existing = await client.query('SELECT id FROM room_players WHERE room_id = $1 AND user_id = $2', [r.id, req.user.id]);
    if (existing.rows[0]) return res.json(r);

    const players = await client.query('SELECT COUNT(*) FROM room_players WHERE room_id = $1', [r.id]);
    if (parseInt(players.rows[0].count) >= r.max_players) {
      return res.status(400).json({ error: 'Room is full' });
    }

    if (r.entry_fee > 0) {
      const wallet = await client.query('SELECT balance FROM wallets WHERE user_id = $1', [req.user.id]);
      if (wallet.rows[0].balance < r.entry_fee) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
    }

    await client.query('BEGIN');
    const seatIndex = parseInt(players.rows[0].count);
    const colors = r.mode === '2p' ? ['red', 'yellow'] : ['red', 'green', 'yellow', 'blue'];

    await client.query(
      'INSERT INTO room_players (room_id, user_id, seat_index, color) VALUES ($1, $2, $3, $4)',
      [r.id, req.user.id, seatIndex, colors[seatIndex]]
    );

    if (r.entry_fee > 0) {
      await client.query('UPDATE wallets SET balance = balance - $1 WHERE user_id = $2', [r.entry_fee, req.user.id]);
      await client.query(
        'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'loss', r.entry_fee, `Entry fee for room ${r.room_code}`]
      );
      await client.query('UPDATE rooms SET prize_pool = prize_pool + $1 WHERE id = $2', [r.entry_fee, r.id]);
    }

    await client.query('COMMIT');
    const updated = await client.query('SELECT * FROM rooms WHERE id = $1', [r.id]);
    res.json(updated.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to join room' });
  } finally {
    client.release();
  }
});

router.get('/:code', authMiddleware, async (req, res) => {
  try {
    const room = await pool.query('SELECT * FROM rooms WHERE room_code = $1', [req.params.code]);
    if (!room.rows[0]) return res.status(404).json({ error: 'Room not found' });

    const players = await pool.query(
      `SELECT rp.*, u.username, u.display_name, u.avatar_url
       FROM room_players rp JOIN users u ON u.id = rp.user_id
       WHERE rp.room_id = $1 ORDER BY rp.seat_index`,
      [room.rows[0].id]
    );
    res.json({ ...room.rows[0], players: players.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

router.get('/public/list', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.username as host_name,
              (SELECT COUNT(*) FROM room_players rp WHERE rp.room_id = r.id) as player_count
       FROM rooms r JOIN users u ON u.id = r.host_id
       WHERE r.status = 'waiting' AND r.is_private = false
       ORDER BY r.created_at DESC LIMIT 20`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list rooms' });
  }
});

export default router;
