import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set in server/.env');
  process.exit(1);
}

const parsed = new URL(url);
const dbName = decodeURIComponent(parsed.pathname.replace(/^\//, ''));

async function setup() {
  const adminUrl = new URL(url);
  adminUrl.pathname = '/postgres';

  const client = new pg.Client({ connectionString: adminUrl.toString() });
  await client.connect();

  const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (!exists.rows.length) {
    await client.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
    console.log(`Created database: ${dbName}`);
  } else {
    console.log(`Database already exists: ${dbName}`);
  }

  await client.end();
}

setup().catch(err => {
  console.error('DB setup failed:', err.message);
  console.error('\nTry manually:');
  console.error(`  createdb ${dbName}`);
  console.error('  npm run db:migrate');
  console.error('  npm run db:seed');
  process.exit(1);
});
