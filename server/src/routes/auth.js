import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/pool.js';
import { signToken, authMiddleware } from '../middleware/auth.js';

const router = Router();

function generateReferralCode() {
  return 'LC' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function mapDbError(err, res, action = 'Registration') {
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Username or email already exists' });
  }
  if (err.code === '3D000') {
    return res.status(503).json({
      error: 'Database not found. From project root run: npm run db:setup',
    });
  }
  if (err.code === '42P01') {
    return res.status(503).json({
      error: 'Database tables missing. Run: npm run db:setup',
    });
  }
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: 'Cannot connect to PostgreSQL. Start Postgres, then run: npm run db:setup',
    });
  }
  console.error(`${action} error:`, err);
  return res.status(500).json({ error: `${action} failed. Check server logs.` });
}

router.post('/register', async (req, res) => {
  const client = await pool.connect();
  try {
    const { username, email, password, displayName, referralCode } = req.body;
    const trimmedUsername = String(username || '').trim();
    const trimmedEmail = String(email || '').trim().toLowerCase();

    if (!trimmedUsername || !trimmedEmail || !password) {
      return res.status(400).json({ error: 'Username, email and password required' });
    }
    if (trimmedUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Enter a valid email address' });
    }

    const hash = await bcrypt.hash(password, 12);
    const code = generateReferralCode();

    let referredBy = null;
    if (referralCode?.trim()) {
      const ref = await client.query('SELECT id FROM users WHERE referral_code = $1', [referralCode.trim()]);
      if (ref.rows[0]) referredBy = ref.rows[0].id;
    }

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO users (username, email, password_hash, password_plain, display_name, referral_code, referred_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, display_name, referral_code, role`,
      [trimmedUsername, trimmedEmail, hash, password, (displayName || trimmedUsername).trim(), code, referredBy]
    );

    const user = result.rows[0];
    await client.query(
      'INSERT INTO wallets (user_id, balance, bonus_balance) VALUES ($1, 100, 50)',
      [user.id]
    );
    await client.query('INSERT INTO leaderboard (user_id) VALUES ($1)', [user.id]);

    if (referredBy) {
      const settings = await client.query("SELECT value FROM admin_settings WHERE key = 'referral_bonus'");
      const bonus = settings.rows[0]?.value || { referrer: 50, referred: 25 };
      await client.query(
        'INSERT INTO referrals (referrer_id, referred_id, bonus_amount, status) VALUES ($1, $2, $3, $4)',
        [referredBy, user.id, bonus.referrer, 'pending']
      );
    }

    await client.query('COMMIT');

    const wallet = await pool.query(
      'SELECT balance, bonus_balance FROM wallets WHERE user_id = $1',
      [user.id]
    );
    const token = signToken({ id: user.id, username: user.username, role: user.role });
    res.status(201).json({
      user: { ...user, balance: wallet.rows[0]?.balance, bonus_balance: wallet.rows[0]?.bonus_balance, wallet: wallet.rows[0] },
      token,
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    mapDbError(err, res, 'Registration');
  } finally {
    client.release();
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      'SELECT id, username, email, password_hash, display_name, avatar_url, referral_code, role, is_banned FROM users WHERE email = $1 OR username = $1',
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.is_banned) return res.status(403).json({ error: 'Account banned' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    await pool.query('UPDATE users SET password_plain = $1, updated_at = NOW() WHERE id = $2', [
      password,
      user.id,
    ]);

    const wallet = await pool.query('SELECT balance, bonus_balance FROM wallets WHERE user_id = $1', [user.id]);
    const token = signToken({ id: user.id, username: user.username, role: user.role });

    delete user.password_hash;
    res.json({
      user: { ...user, wallet: wallet.rows[0] },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    if (err.code === 'ECONNREFUSED' || err.code === '3D000' || err.code === '42P01') {
      return res.status(503).json({
        error: 'Database not ready. Run: createdb ludo_sphere && npm run db:migrate && npm run db:seed',
      });
    }
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.display_name, u.avatar_url, u.referral_code, u.role,
              w.balance, w.bonus_balance, w.total_won, w.total_lost,
              l.wins, l.losses, l.rating, l.games_played, l.win_streak
       FROM users u
       LEFT JOIN wallets w ON w.user_id = u.id
       LEFT JOIN leaderboard l ON l.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { displayName, avatarUrl } = req.body;
    const sets = [];
    const params = [];
    let n = 1;

    if (displayName !== undefined) {
      sets.push(`display_name = $${n++}`);
      params.push(displayName === null ? null : String(displayName).trim() || null);
    }

    if (avatarUrl !== undefined) {
      if (typeof avatarUrl === 'string' && avatarUrl.length > 300000) {
        return res.status(400).json({ error: 'Avatar image too large' });
      }
      sets.push(`avatar_url = $${n++}`);
      params.push(avatarUrl || null);
    }

    if (!sets.length) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    sets.push('updated_at = NOW()');
    params.push(req.user.id);

    const result = await pool.query(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${n}
       RETURNING id, username, email, display_name, avatar_url, referral_code, role`,
      params
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Profile update error:', err);
    if (err.code === '42703') {
      return res.status(503).json({ error: 'Database outdated. Run: npm run db:setup' });
    }
    res.status(500).json({ error: 'Update failed' });
  }
});

export default router;
