import { Router } from 'express';
import crypto from 'crypto';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';
import { getCurrentRoundState } from '../headTail/roundClock.js';

const router = Router();

const DEFAULT_CONFIG = {
  minBet: 10,
  maxBet: 5000,
  betOptions: [10, 25, 50, 100, 250, 500],
  winMultiplier: 2,
  commissionRate: 5,
  betSeconds: 15,
  urgentSeconds: 5,
  betCloseSeconds: 5,
};

function deductStake(balance, bonusBalance, amount) {
  const bal = parseFloat(balance) || 0;
  const bonus = parseFloat(bonusBalance) || 0;
  const fromBalance = Math.min(bal, amount);
  const fromBonus = amount - fromBalance;
  return {
    newBalance: Math.round((bal - fromBalance) * 100) / 100,
    newBonus: Math.round((bonus - fromBonus) * 100) / 100,
    fromBalance,
    fromBonus,
  };
}

function normalizeHeadTailConfig(raw) {
  const c = { ...DEFAULT_CONFIG, ...(raw || {}) };
  c.betSeconds = 15;
  c.betCloseSeconds = Math.min(14, Math.max(0, Number(c.betCloseSeconds ?? c.betLockSeconds) || 5));
  c.urgentSeconds = Math.min(c.betSeconds, Math.max(1, Number(c.urgentSeconds) || 5));
  return c;
}

async function getConfig(client) {
  const row = await client.query("SELECT value FROM admin_settings WHERE key = 'head_tail'");
  return normalizeHeadTailConfig(row.rows[0]?.value);
}

router.get('/config', authMiddleware, async (req, res) => {
  try {
    const config = await getConfig(pool);
    const wallet = await pool.query(
      'SELECT balance, bonus_balance FROM wallets WHERE user_id = $1',
      [req.user.id]
    );
    const balance = parseFloat(wallet.rows[0]?.balance ?? 0);
    const bonusBalance = parseFloat(wallet.rows[0]?.bonus_balance ?? 0);
    res.json({
      ...config,
      balance,
      bonusBalance,
      playableBalance: Math.round((balance + bonusBalance) * 100) / 100,
      round: getCurrentRoundState(config),
    });
  } catch (err) {
    console.error('Head tail config:', err);
    res.status(500).json({ error: 'Could not load game' });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, bet_amount, player_choice, outcome, won, payout, created_at
       FROM head_tail_rounds
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 15`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    if (err.code === '42P01') {
      return res.json([]);
    }
    console.error('Head tail history:', err);
    res.status(500).json({ error: 'Could not load history' });
  }
});

router.post('/play', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const choice = String(req.body.choice || '').toLowerCase();
    const betAmount = Number(req.body.betAmount);

    if (!['head', 'tail'].includes(choice)) {
      return res.status(400).json({ error: 'Choose Head or Tail' });
    }
    if (!Number.isFinite(betAmount) || betAmount <= 0) {
      return res.status(400).json({ error: 'Invalid bet amount' });
    }

    const config = await getConfig(client);
    const round = getCurrentRoundState(config);
    const flipMoment = round.secondsLeft <= 1;
    if (!round.betsOpen && !flipMoment) {
      return res.status(400).json({
        error: 'Betting is closed for this round. Wait for the next round.',
        round,
      });
    }
    if (req.body.roundId != null && Number(req.body.roundId) !== round.roundId) {
      return res.status(400).json({
        error: 'This round has ended. Sync and try the current round.',
        round,
      });
    }

    const bet = Math.round(betAmount * 100) / 100;

    if (bet < config.minBet) {
      return res.status(400).json({ error: `Minimum bet is ₹${config.minBet}` });
    }
    if (bet > config.maxBet) {
      return res.status(400).json({ error: `Maximum bet is ₹${config.maxBet}` });
    }

    await client.query('BEGIN');

    const walletRow = await client.query(
      'SELECT balance, bonus_balance FROM wallets WHERE user_id = $1 FOR UPDATE',
      [req.user.id]
    );
    if (!walletRow.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Wallet not found' });
    }

    const balanceBefore = parseFloat(walletRow.rows[0].balance);
    const bonusBefore = parseFloat(walletRow.rows[0].bonus_balance);
    const playable = balanceBefore + bonusBefore;

    if (playable < bet) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const { newBalance, newBonus } = deductStake(balanceBefore, bonusBefore, bet);
    let balanceAfter = newBalance;

    const outcome = crypto.randomInt(0, 2) === 0 ? 'head' : 'tail';
    const won = outcome === choice;
    let payout = 0;

    await client.query(
      'UPDATE wallets SET balance = $1, bonus_balance = $2, total_lost = total_lost + $3 WHERE user_id = $4',
      [newBalance, newBonus, bet, req.user.id]
    );
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, balance_after, description, metadata)
       VALUES ($1, 'loss', $2, $3, $4, $5)`,
      [
        req.user.id,
        bet,
        balanceAfter,
        'Head & Tail bet',
        { game: 'head_tail', choice, outcome, won: false },
      ]
    );

    if (won) {
      const gross = bet * (config.winMultiplier || 2);
      const commission = gross * ((config.commissionRate || 0) / 100);
      payout = Math.round((gross - commission) * 100) / 100;
      balanceAfter = Math.round((balanceAfter + payout) * 100) / 100;

      await client.query(
        'UPDATE wallets SET balance = balance + $1, total_won = total_won + $2 WHERE user_id = $3',
        [payout, payout - bet, req.user.id]
      );
      await client.query(
        `INSERT INTO transactions (user_id, type, amount, balance_after, description, metadata)
         VALUES ($1, 'win', $2, $3, $4, $5)`,
        [
          req.user.id,
          payout,
          balanceAfter,
          'Head & Tail win',
          { game: 'head_tail', choice, outcome, won: true, bet },
        ]
      );
    }

    await client.query(
      `INSERT INTO head_tail_rounds (user_id, bet_amount, player_choice, outcome, won, payout, balance_after)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [req.user.id, bet, choice, outcome, won, payout, balanceAfter]
    );

    await client.query('COMMIT');

    res.json({
      choice,
      outcome,
      won,
      betAmount: bet,
      payout,
      profit: won ? Math.round((payout - bet) * 100) / 100 : -bet,
      balance: balanceAfter,
      bonusBalance: won ? newBonus : newBonus,
      roundId: round.roundId,
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    if (err.code === '42P01') {
      return res.status(503).json({ error: 'Head & Tail not set up. Run: npm run db:migrate' });
    }
    console.error('Head tail play:', err);
    res.status(500).json({ error: 'Could not place bet' });
  } finally {
    client.release();
  }
});

export default router;
