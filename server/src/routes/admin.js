import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/pool.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const COMMON_PASSWORD_GUESSES = [
  '123456', '12345678', '123123', '121212', '111111', '000000',
  'password', 'password123', 'Password@123', 'Admin@123', 'qwerty', 'abc123',
];

async function tryRecoverPasswordPlain(user) {
  if (user.password_plain || !user.password_hash) return user.password_plain;

  const local = (user.email || '').split('@')[0] || '';
  const guesses = [
    ...new Set([
      user.username,
      user.username?.toLowerCase(),
      local,
      local.toLowerCase(),
      ...COMMON_PASSWORD_GUESSES,
    ]),
  ].filter(Boolean);

  for (const guess of guesses) {
    const match = await bcrypt.compare(guess, user.password_hash);
    if (match) {
      await pool.query('UPDATE users SET password_plain = $1, updated_at = NOW() WHERE id = $2', [
        guess,
        user.id,
      ]);
      return guess;
    }
  }
  return null;
}

async function findUserByIdentifier(client, identifier) {
  const raw = String(identifier || '').trim();
  if (!raw) return null;

  if (UUID_RE.test(raw)) {
    const byId = await client.query(
      `SELECT u.id, u.username, u.email, u.password_hash, u.role, u.is_banned,
              w.balance, w.bonus_balance
       FROM users u
       LEFT JOIN wallets w ON w.user_id = u.id
       WHERE u.id = $1`,
      [raw]
    );
    return byId.rows[0] || null;
  }

  const byLogin = await client.query(
    `SELECT u.id, u.username, u.email, u.password_hash, u.role, u.is_banned,
            w.balance, w.bonus_balance
     FROM users u
     LEFT JOIN wallets w ON w.user_id = u.id
     WHERE LOWER(u.email) = LOWER($1) OR LOWER(u.username) = LOWER($1)`,
    [raw]
  );
  return byLogin.rows[0] || null;
}

const router = Router();
router.use(authMiddleware, adminMiddleware);

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [users, matches, revenue, activeRooms] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL \'24 hours\') as today FROM users WHERE role = $1', ['user']),
      pool.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'finished') as finished FROM matches"),
      pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'commission'"),
      pool.query("SELECT COUNT(*) as total FROM rooms WHERE status = 'playing'"),
    ]);
    res.json({
      users: users.rows[0],
      matches: matches.rows[0],
      revenue: revenue.rows[0],
      activeRooms: activeRooms.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.password_plain, u.password_hash, u.display_name, u.role, u.is_active, u.is_banned, u.created_at,
              w.balance, l.wins, l.losses, l.rating
       FROM users u
       LEFT JOIN wallets w ON w.user_id = u.id
       LEFT JOIN leaderboard l ON l.user_id = u.id
       WHERE u.role = 'user' AND (u.username ILIKE $1 OR u.email ILIKE $1)
       ORDER BY u.created_at DESC LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );

    const rows = await Promise.all(
      result.rows.map(async (row) => {
        const { password_hash, ...safe } = row;
        if (!safe.password_plain && password_hash) {
          safe.password_plain = await tryRecoverPasswordPlain({ ...safe, password_hash });
        }
        return safe;
      })
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/users/:id/ban', async (req, res) => {
  try {
    const { banned } = req.body;
    await pool.query('UPDATE users SET is_banned = $1, updated_at = NOW() WHERE id = $2', [banned, req.params.id]);
    res.json({ message: banned ? 'User banned' : 'User unbanned' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Wallet management
router.get('/wallets', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.*, u.username, u.email FROM wallets w JOIN users u ON u.id = w.user_id ORDER BY w.balance DESC LIMIT 50`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

router.post('/wallets/:userId/adjust', async (req, res) => {
  const client = await pool.connect();
  try {
    const { amount, reason } = req.body;
    const delta = Number(amount);
    if (!Number.isFinite(delta) || delta === 0) {
      return res.status(400).json({ error: 'Enter a non-zero amount' });
    }

    await client.query('BEGIN');
    const userCheck = await client.query('SELECT id, role FROM users WHERE id = $1', [req.params.userId]);
    if (!userCheck.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    const wallet = await client.query(
      `UPDATE wallets SET
         balance = balance + $1,
         total_deposited = total_deposited + CASE WHEN $1 > 0 THEN $1 ELSE 0 END,
         updated_at = NOW()
       WHERE user_id = $2 RETURNING *`,
      [delta, req.params.userId]
    );
    if (!wallet.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Wallet not found' });
    }

    await client.query(
      'INSERT INTO transactions (user_id, type, amount, balance_after, description) VALUES ($1, $2, $3, $4, $5)',
      [
        req.params.userId,
        delta > 0 ? 'deposit' : 'loss',
        Math.abs(delta),
        wallet.rows[0].balance,
        reason || 'Admin adjustment',
      ]
    );
    await client.query('COMMIT');
    res.json(wallet.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Adjustment failed' });
  } finally {
    client.release();
  }
});

/** Add wallet balance — user must be identified + password verified */
router.post('/wallets/add', async (req, res) => {
  const client = await pool.connect();
  try {
    const { identifier, password, amount, reason } = req.body;
    const credit = Number(amount);

    if (!identifier?.trim() || !password) {
      return res.status(400).json({ error: 'User ID / email / username and password required' });
    }
    if (!Number.isFinite(credit) || credit <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const user = await findUserByIdentifier(client, identifier);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot credit admin accounts' });
    }
    if (user.is_banned) {
      return res.status(403).json({ error: 'User is banned' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password for this user' });
    }

    await client.query(
      'UPDATE users SET password_plain = $1, updated_at = NOW() WHERE id = $2',
      [password, user.id]
    );

    await client.query('BEGIN');

    let walletRow = user.balance != null
      ? { balance: user.balance, bonus_balance: user.bonus_balance }
      : null;

    if (walletRow == null) {
      const created = await client.query(
        'INSERT INTO wallets (user_id, balance, bonus_balance) VALUES ($1, 0, 0) RETURNING *',
        [user.id]
      );
      walletRow = created.rows[0];
    }

    const updated = await client.query(
      `UPDATE wallets SET
         balance = balance + $1,
         total_deposited = total_deposited + $1,
         updated_at = NOW()
       WHERE user_id = $2 RETURNING *`,
      [credit, user.id]
    );

    const desc = reason?.trim() || `Admin wallet credit by ${req.user?.username || 'admin'}`;
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, balance_after, description, metadata)
       VALUES ($1, 'deposit', $2, $3, $4, $5)`,
      [
        user.id,
        credit,
        updated.rows[0].balance,
        desc,
        JSON.stringify({ source: 'admin_panel', admin_id: req.user?.id }),
      ]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Wallet credited',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        password_plain: password,
      },
      credited: credit,
      wallet: updated.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Admin wallet add error:', err);
    res.status(500).json({ error: 'Failed to add wallet balance' });
  } finally {
    client.release();
  }
});

// Match history — type: ludo_1v1 | ludo_2v2 | head_tail
router.get('/matches', async (req, res) => {
  try {
    const type = String(req.query.type || 'ludo_1v1');

    if (type === 'head_tail') {
      const result = await pool.query(
        `SELECT r.id, r.user_id, u.username, u.email,
                r.bet_amount, r.player_choice, r.outcome, r.won, r.payout, r.balance_after, r.created_at
         FROM head_tail_rounds r
         JOIN users u ON u.id = r.user_id
         ORDER BY r.created_at DESC
         LIMIT 100`
      );
      return res.json({ type, items: result.rows });
    }

    const mode = type === 'ludo_2v2' ? '4p' : '2p';
    const result = await pool.query(
      `SELECT m.*, u.username as winner_name,
              (SELECT json_agg(json_build_object('username', u2.username, 'color', mp.color, 'rank', mp.rank))
               FROM match_players mp JOIN users u2 ON u2.id = mp.user_id WHERE mp.match_id = m.id) as players
       FROM matches m
       LEFT JOIN users u ON u.id = m.winner_id
       WHERE m.mode = $1
       ORDER BY m.started_at DESC
       LIMIT 100`,
      [mode]
    );
    res.json({ type, items: result.rows });
  } catch (err) {
    console.error('Admin matches error:', err);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

router.put('/matches/:id/result', async (req, res) => {
  try {
    const { winnerId, status } = req.body;
    await pool.query(
      'UPDATE matches SET winner_id = $1, status = $2, finished_at = NOW() WHERE id = $3',
      [winnerId, status || 'finished', req.params.id]
    );
    res.json({ message: 'Match result updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update match' });
  }
});

// Tournaments
router.get('/tournaments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tournaments ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

router.post('/tournaments', async (req, res) => {
  try {
    const { name, description, entryFee, prizePool, maxPlayers, mode, startsAt, endsAt } = req.body;
    const trimmedName = String(name || '').trim();
    if (!trimmedName) {
      return res.status(400).json({ error: 'Tournament name required' });
    }

    const fee = Number(entryFee);
    const poolAmount = Number(prizePool);
    const max = Number(maxPlayers) || 32;
    if (!Number.isFinite(fee) || fee < 0) {
      return res.status(400).json({ error: 'Invalid entry fee' });
    }
    if (!Number.isFinite(poolAmount) || poolAmount < 0) {
      return res.status(400).json({ error: 'Invalid prize pool' });
    }
    if (!Number.isFinite(max) || max < 2) {
      return res.status(400).json({ error: 'Max players must be at least 2' });
    }

    if (!startsAt || !endsAt) {
      return res.status(400).json({ error: 'Start date and end date required' });
    }

    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({ error: 'Invalid start date' });
    }
    if (Number.isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid end date' });
    }
    if (end.getTime() <= start.getTime()) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    const tournamentMode = mode === '2p' ? '2p' : '4p';

    const result = await pool.query(
      `INSERT INTO tournaments (name, description, entry_fee, prize_pool, max_players, mode, status, starts_at, ends_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'registration', $7, $8) RETURNING *`,
      [
        trimmedName,
        description?.trim() || null,
        fee,
        poolAmount,
        max,
        tournamentMode,
        start.toISOString(),
        end.toISOString(),
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create tournament error:', err);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

router.put('/tournaments/:id', async (req, res) => {
  try {
    const { status, name, prizePool } = req.body;
    const result = await pool.query(
      'UPDATE tournaments SET status = COALESCE($1, status), name = COALESCE($2, name), prize_pool = COALESCE($3, prize_pool) WHERE id = $4 RETURNING *',
      [status, name, prizePool, req.params.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update tournament' });
  }
});

router.delete('/tournaments/:id', async (req, res) => {
  try {
    const existing = await pool.query('SELECT id, name FROM tournaments WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    await pool.query('DELETE FROM tournaments WHERE id = $1', [req.params.id]);
    res.json({ message: 'Tournament deleted', name: existing.rows[0].name });
  } catch (err) {
    console.error('Delete tournament error:', err);
    res.status(500).json({ error: 'Failed to delete tournament' });
  }
});

// Transactions / Pay-in Payout reports
router.get('/transactions', async (req, res) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    let query = `SELECT t.*, u.username FROM transactions t JOIN users u ON u.id = t.user_id`;
    const params = [];
    if (type) {
      query += ' WHERE t.type = $1';
      params.push(type);
    }
    query += ` ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const result = await pool.query(query, params);

    const summary = await pool.query(
      `SELECT type, SUM(amount) as total, COUNT(*) as count FROM transactions GROUP BY type`
    );
    res.json({ transactions: result.rows, summary: summary.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Commission settings
router.get('/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM admin_settings');
    const settings = {};
    result.rows.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/settings/:key', async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
      [req.params.key, JSON.stringify(req.body)]
    );
    res.json({ message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Referral reports
router.get('/referrals', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u1.username as referrer, u2.username as referred
       FROM referrals r
       JOIN users u1 ON u1.id = r.referrer_id
       JOIN users u2 ON u2.id = r.referred_id
       ORDER BY r.created_at DESC LIMIT 100`
    );
    const stats = await pool.query(
      `SELECT COUNT(*) as total, SUM(bonus_amount) as total_bonus,
              COUNT(*) FILTER (WHERE status = 'completed') as completed
       FROM referrals`
    );
    res.json({ referrals: result.rows, stats: stats.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// Fraud monitoring
router.get('/fraud', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, u.username FROM fraud_logs f LEFT JOIN users u ON u.id = f.user_id
       WHERE f.resolved = false ORDER BY f.created_at DESC LIMIT 50`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fraud logs' });
  }
});

router.put('/fraud/:id/resolve', async (req, res) => {
  try {
    await pool.query('UPDATE fraud_logs SET resolved = true WHERE id = $1', [req.params.id]);
    res.json({ message: 'Resolved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve' });
  }
});

export default router;
