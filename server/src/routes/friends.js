import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, u.username, u.display_name, u.avatar_url
       FROM friendships f JOIN users u ON u.id = f.friend_id
       WHERE f.user_id = $1 AND f.status = 'accepted'
       ORDER BY u.display_name`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, u.username, u.display_name, u.avatar_url
       FROM friendships f JOIN users u ON u.id = f.user_id
       WHERE f.friend_id = $1 AND f.status = 'pending'`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { username } = req.body;
    const user = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (!user.rows[0]) return res.status(404).json({ error: 'User not found' });
    if (user.rows[0].id === req.user.id) return res.status(400).json({ error: 'Cannot add yourself' });

    await pool.query(
      'INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [req.user.id, user.rows[0].id, 'pending']
    );
    res.json({ message: 'Friend request sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send request' });
  }
});

router.post('/accept/:id', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const friendship = await client.query(
      'SELECT * FROM friendships WHERE id = $1 AND friend_id = $2 AND status = $3',
      [req.params.id, req.user.id, 'pending']
    );
    if (!friendship.rows[0]) return res.status(404).json({ error: 'Request not found' });

    await client.query('BEGIN');
    await client.query("UPDATE friendships SET status = 'accepted' WHERE id = $1", [req.params.id]);
    await client.query(
      'INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [req.user.id, friendship.rows[0].user_id, 'accepted']
    );
    await client.query('COMMIT');
    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to accept' });
  } finally {
    client.release();
  }
});

router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    const result = await pool.query(
      'SELECT id, username, display_name, avatar_url FROM users WHERE (username ILIKE $1 OR display_name ILIKE $1) AND id != $2 LIMIT 10',
      [`%${q}%`, req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
