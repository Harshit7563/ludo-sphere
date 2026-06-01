import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM rewards WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

router.post('/daily', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const today = await client.query(
      "SELECT id FROM rewards WHERE user_id = $1 AND type = 'daily' AND created_at > CURRENT_DATE",
      [req.user.id]
    );
    if (today.rows[0]) return res.status(400).json({ error: 'Daily reward already claimed' });

    const settings = await client.query("SELECT value FROM admin_settings WHERE key = 'daily_reward'");
    const amount = settings.rows[0]?.value?.amount || 10;

    await client.query('BEGIN');
    await client.query(
      "INSERT INTO rewards (user_id, type, title, amount, claimed) VALUES ($1, 'daily', 'Daily Login Bonus', $2, true)",
      [req.user.id, amount]
    );
    const wallet = await client.query(
      'UPDATE wallets SET balance = balance + $1, bonus_balance = bonus_balance + $1 WHERE user_id = $2 RETURNING balance',
      [amount, req.user.id]
    );
    await client.query(
      'INSERT INTO transactions (user_id, type, amount, balance_after, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'bonus', amount, wallet.rows[0].balance, 'Daily login reward']
    );
    await client.query('COMMIT');
    res.json({ amount, balance: wallet.rows[0].balance });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Claim failed' });
  } finally {
    client.release();
  }
});

router.post('/claim/:id', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const reward = await client.query(
      'SELECT * FROM rewards WHERE id = $1 AND user_id = $2 AND claimed = false',
      [req.params.id, req.user.id]
    );
    if (!reward.rows[0]) return res.status(404).json({ error: 'Reward not found' });

    await client.query('BEGIN');
    await client.query('UPDATE rewards SET claimed = true WHERE id = $1', [req.params.id]);
    const wallet = await client.query(
      'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 RETURNING balance',
      [reward.rows[0].amount, req.user.id]
    );
    await client.query('COMMIT');
    res.json({ amount: reward.rows[0].amount, balance: wallet.rows[0].balance });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Claim failed' });
  } finally {
    client.release();
  }
});

router.get('/referral', authMiddleware, async (req, res) => {
  try {
    const user = await pool.query('SELECT referral_code FROM users WHERE id = $1', [req.user.id]);
    const referrals = await pool.query(
      `SELECT r.*, u.username, u.display_name, u.created_at as joined_at
       FROM referrals r JOIN users u ON u.id = r.referred_id
       WHERE r.referrer_id = $1 ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    const settings = await pool.query("SELECT value FROM admin_settings WHERE key = 'referral_bonus'");
    res.json({
      referralCode: user.rows[0]?.referral_code,
      referrals: referrals.rows,
      bonus: settings.rows[0]?.value || { referrer: 50, referred: 25 },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch referral data' });
  }
});

export default router;
