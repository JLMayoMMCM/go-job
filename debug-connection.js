import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('=== DATABASE CONNECTION DEBUG ===\n');

console.log('Environment file path: .env.local');
console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD exists:', !!process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 5432,
  ssl: false
};

console.log('\nConnection config:');
console.log('host:', config.host);
console.log('user:', config.user);
console.log('database:', config.database);
console.log('port:', config.port);
console.log('ssl:', config.ssl);

console.log('\nAttempting connection...');

try {
  const pool = new Pool(config);
  const client = await pool.connect();
  console.log('✅ Successfully connected to database!');
  
  const result = await client.query('SELECT NOW() as current_time');
  console.log('Current time from DB:', result.rows[0].current_time);
  
  client.release();
  await pool.end();
  
} catch (error) {
  console.error('❌ Connection failed:', error.message);
  console.error('Error code:', error.code);
}
