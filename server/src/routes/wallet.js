import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [walletResult, kycResult] = await Promise.all([
      pool.query(
        'SELECT balance, bonus_balance, total_deposited, total_withdrawn, total_won, total_lost FROM wallets WHERE user_id = $1',
        [req.user.id]
      ),
      pool.query('SELECT status FROM kyc_verifications WHERE user_id = $1', [req.user.id]),
    ]);

    const wallet = walletResult.rows[0] || { balance: 0, bonus_balance: 0 };
    const kycStatus = kycResult.rows[0]?.status || 'none';

    res.json({
      ...wallet,
      kycStatus,
      kycRequiredForWithdraw: kycStatus !== 'verified',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

router.post('/deposit', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    await client.query('BEGIN');
    const wallet = await client.query(
      'UPDATE wallets SET balance = balance + $1, total_deposited = total_deposited + $1, updated_at = NOW() WHERE user_id = $2 RETURNING balance',
      [amount, req.user.id]
    );
    await client.query(
      'INSERT INTO transactions (user_id, type, amount, balance_after, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'deposit', amount, wallet.rows[0].balance, 'Wallet deposit']
    );
    await client.query('COMMIT');
    res.json({ balance: wallet.rows[0].balance, message: 'Deposit successful' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Deposit failed' });
  } finally {
    client.release();
  }
});

router.post('/withdraw', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const walletRow = await client.query(
      'SELECT balance, total_withdrawn FROM wallets WHERE user_id = $1',
      [req.user.id]
    );
    if (!walletRow.rows[0]) return res.status(400).json({ error: 'Wallet not found' });
    if (walletRow.rows[0].balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

    const kyc = await client.query('SELECT status FROM kyc_verifications WHERE user_id = $1', [
      req.user.id,
    ]);
    const kycStatus = kyc.rows[0]?.status;

    if (kycStatus === 'pending') {
      return res.status(403).json({
        code: 'KYC_PENDING',
        error: 'KYC is under review. Withdrawals are allowed after verification (24-48 hrs).',
      });
    }
    if (kycStatus !== 'verified') {
      return res.status(403).json({
        code: 'KYC_REQUIRED',
        error: 'KYC verification is required to withdraw. Please complete verification.',
      });
    }

    await client.query('BEGIN');
    const wallet = await client.query(
      'UPDATE wallets SET balance = balance - $1, total_withdrawn = total_withdrawn + $1, updated_at = NOW() WHERE user_id = $2 RETURNING balance',
      [amount, req.user.id]
    );
    await client.query(
      'INSERT INTO transactions (user_id, type, amount, balance_after, status, description) VALUES ($1, $2, $3, $4, $5, $6)',
      [req.user.id, 'withdraw', amount, wallet.rows[0].balance, 'pending', 'Withdrawal request']
    );
    await client.query('COMMIT');
    res.json({ balance: wallet.rows[0].balance, message: 'Withdrawal request submitted' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Withdrawal failed' });
  } finally {
    client.release();
  }
});

router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user.id, limit, offset]
    );
    const count = await pool.query('SELECT COUNT(*) FROM transactions WHERE user_id = $1', [req.user.id]);
    res.json({ transactions: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;
