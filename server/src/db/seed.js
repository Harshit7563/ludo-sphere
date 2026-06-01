import bcrypt from 'bcryptjs';
import pool from './pool.js';
import { ensureBotUser } from '../game/bot.js';

function generateReferralCode() {
  return 'LC' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function seed() {
  const client = await pool.connect();
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ludosphere.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const hash = await bcrypt.hash(adminPassword, 12);

    const adminResult = await client.query(
      `INSERT INTO users (username, email, password_hash, display_name, referral_code, role)
       VALUES ($1, $2, $3, $4, $5, 'admin')
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         role = 'admin',
         is_banned = false
       RETURNING id`,
      ['admin', adminEmail, hash, 'Royal Admin', 'LCADMIN']
    );

    if (adminResult.rows[0]) {
      await client.query(
        'INSERT INTO wallets (user_id, balance, bonus_balance) VALUES ($1, 10000, 5000) ON CONFLICT DO NOTHING',
        [adminResult.rows[0].id]
      );
      await client.query(
        'INSERT INTO leaderboard (user_id) VALUES ($1) ON CONFLICT DO NOTHING',
        [adminResult.rows[0].id]
      );
    }

    await client.query(
      `INSERT INTO admin_settings (key, value) VALUES
       ('commission', '{"rate": 5, "enabled": true}'),
       ('referral_bonus', '{"referrer": 50, "referred": 25}'),
       ('daily_reward', '{"amount": 10}'),
       ('entry_fees', '{"min": 10, "max": 10000}'),
       ('turn_timer', '{"seconds": 30}'),
       ('head_tail', '{"minBet":10,"maxBet":5000,"betOptions":[10,25,50,100,250,500],"winMultiplier":2,"commissionRate":5,"betSeconds":15,"urgentSeconds":5,"betCloseSeconds":5}'),
       ('scrolling_banner', '{"enabled": true}')
       ON CONFLICT (key) DO NOTHING`
    );

    const tournaments = [
      { name: 'Royal Crown Championship', fee: 100, pool: 5000, max: 32 },
      { name: 'Golden Dice Tournament', fee: 50, pool: 2000, max: 16 },
      { name: 'Diamond League', fee: 200, pool: 10000, max: 64 },
    ];

    for (const t of tournaments) {
      await client.query(
        `INSERT INTO tournaments (name, entry_fee, prize_pool, max_players, status, starts_at, mode)
         SELECT $1::varchar, $2::numeric, $3::numeric, $4::int, 'registration', NOW() + INTERVAL '2 days', '4p'
         WHERE NOT EXISTS (SELECT 1 FROM tournaments WHERE name = $1::varchar)`,
        [t.name, t.fee, t.pool, t.max]
      );
    }

    await ensureBotUser();

    console.log('Seed completed. Admin:', adminEmail, '/', adminPassword);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
