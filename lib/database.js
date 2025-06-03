import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 5432,
  ssl: false
});

pool.on('connect', async (client) => {
  console.log('Connected to PostgreSQL database');
  const schema = process.env.DB_SCHEMA || 'public';
  try {
    await client.query(`SET search_path TO ${schema}`);
    console.log(`Schema search path set to: ${schema}`);
  } catch (err) {
    console.error('Failed to set search path:', err);
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to get schema-qualified table name
export const getTableName = (tableName) => {
  const schema = process.env.DB_SCHEMA || 'public';
  return `${schema}.${tableName}`;
};

// Test query to ensure nationality table exists (with schema)
const nationalityTable = getTableName('nationality');
pool.query(`SELECT COUNT(*) FROM ${nationalityTable}`)
  .then(() => console.log('Nationality table verified'))
  .catch(err => console.error('Nationality table check failed:', err));

export default pool;
