import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type = 'global', limit = 50 } = req.query;
    const result = await pool.query(
      `SELECT l.*, u.username, u.display_name, u.avatar_url
       FROM leaderboard l JOIN users u ON u.id = l.user_id
       WHERE u.is_banned = false
       ORDER BY l.rating DESC, l.wins DESC
       LIMIT $1`,
      [limit]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, (
         SELECT COUNT(*) + 1 FROM leaderboard l2 WHERE l2.rating > l.rating
       ) as rank
       FROM leaderboard l WHERE l.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rank' });
  }
});

export default router;
