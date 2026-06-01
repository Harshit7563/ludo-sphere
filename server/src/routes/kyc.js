import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

function maskPan(pan) {
  if (!pan || pan.length < 4) return null;
  return `XXXXX${pan.slice(-4)}`;
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT full_name, pan_number, aadhaar_last4, date_of_birth, status, rejection_reason, submitted_at, verified_at
       FROM kyc_verifications WHERE user_id = $1`,
      [req.user.id]
    );
    const row = result.rows[0];
    if (!row) {
      return res.json({ status: 'none' });
    }
    res.json({
      status: row.status,
      fullName: row.full_name,
      panMasked: maskPan(row.pan_number),
      aadhaarLast4: row.aadhaar_last4,
      dateOfBirth: row.date_of_birth,
      rejectionReason: row.rejection_reason,
      submittedAt: row.submitted_at,
      verifiedAt: row.verified_at,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch KYC status' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { fullName, panNumber, aadhaarNumber, dateOfBirth } = req.body;

    if (!fullName?.trim() || !panNumber?.trim() || !aadhaarNumber?.trim()) {
      return res.status(400).json({ error: 'Full name, PAN and Aadhaar are required' });
    }

    const pan = panNumber.trim().toUpperCase();
    const aadhaar = aadhaarNumber.replace(/\D/g, '');

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
      return res.status(400).json({ error: 'Invalid PAN format (e.g. ABCDE1234F)' });
    }
    if (aadhaar.length !== 12) {
      return res.status(400).json({ error: 'Aadhaar must be 12 digits' });
    }

    const existing = await pool.query(
      'SELECT status FROM kyc_verifications WHERE user_id = $1',
      [req.user.id]
    );

    if (existing.rows[0]?.status === 'verified') {
      return res.status(400).json({ error: 'KYC already verified' });
    }
    if (existing.rows[0]?.status === 'pending') {
      return res.status(400).json({ error: 'KYC verification is already under review' });
    }

    const dob = dateOfBirth || null;

    if (existing.rows[0]) {
      await pool.query(
        `UPDATE kyc_verifications
         SET full_name = $1, pan_number = $2, aadhaar_last4 = $3, date_of_birth = $4,
             status = 'pending', rejection_reason = NULL, submitted_at = NOW(), updated_at = NOW()
         WHERE user_id = $5`,
        [fullName.trim(), pan, aadhaar.slice(-4), dob, req.user.id]
      );
    } else {
      await pool.query(
        `INSERT INTO kyc_verifications (user_id, full_name, pan_number, aadhaar_last4, date_of_birth, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')`,
        [req.user.id, fullName.trim(), pan, aadhaar.slice(-4), dob]
      );
    }

    res.json({ status: 'pending', message: 'KYC submitted successfully. Review within 24-48 hours.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit KYC' });
  }
});

export default router;
