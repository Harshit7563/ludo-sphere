import pg from 'pg';
import '../loadEnv.js';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
