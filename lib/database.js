import { Pool } from 'pg';

const pool = new Pool({
  host: 'db.ilmpvvewbpekexxyerhw.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'GoJob227675',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  query_timeout: 60000,
  statement_timeout: 60000,
});

// Test the connection
pool.on('connect', (client) => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit process, just log the error
});

// Add a function to test database connection
export async function testConnection() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  } finally {
    client.release();
  }
}

export default pool;
