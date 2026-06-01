import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT value FROM admin_settings WHERE key = 'scrolling_banner'"
    );
    const value = row.rows[0]?.value;
    const enabled = value == null ? true : value.enabled !== false;
    res.json({ scrollingBanner: enabled });
  } catch (err) {
    console.error('App config:', err);
    res.json({ scrollingBanner: true });
  }
});

export default router;
