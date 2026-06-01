import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*,
              (SELECT COUNT(*) FROM tournament_entries te WHERE te.tournament_id = t.id) as registered_count,
              EXISTS(SELECT 1 FROM tournament_entries te WHERE te.tournament_id = t.id AND te.user_id = $1) as is_registered
       FROM tournaments t
       WHERE t.status IN ('upcoming', 'registration', 'active')
       ORDER BY t.starts_at ASC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

router.post('/:id/join', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const tournament = await client.query('SELECT * FROM tournaments WHERE id = $1', [req.params.id]);
    if (!tournament.rows[0]) return res.status(404).json({ error: 'Tournament not found' });
    const t = tournament.rows[0];

    if (t.status !== 'registration' && t.status !== 'upcoming') {
      return res.status(400).json({ error: 'Registration closed' });
    }

    const wallet = await client.query('SELECT balance FROM wallets WHERE user_id = $1', [req.user.id]);
    if (wallet.rows[0].balance < t.entry_fee) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    await client.query('BEGIN');
    await client.query(
      'INSERT INTO tournament_entries (tournament_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [t.id, req.user.id]
    );
    await client.query('UPDATE wallets SET balance = balance - $1 WHERE user_id = $2', [t.entry_fee, req.user.id]);
    await client.query('UPDATE tournaments SET current_players = current_players + 1, prize_pool = prize_pool + $1 WHERE id = $2', [t.entry_fee, t.id]);
    await client.query(
      'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'loss', t.entry_fee, `Tournament entry: ${t.name}`]
    );
    await client.query('COMMIT');
    res.json({ message: 'Registered successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    client.release();
  }
});

router.get('/:id/players', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT te.*, u.username, u.display_name, u.avatar_url
       FROM tournament_entries te JOIN users u ON u.id = te.user_id
       WHERE te.tournament_id = $1 ORDER BY te.joined_at`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

export default router;
