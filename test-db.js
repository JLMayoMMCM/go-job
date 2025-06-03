// Test database connection with schema
import dotenv from 'dotenv';
import pool, { getTableName } from './lib/database.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected successfully');
    console.log('Current time from DB:', result.rows[0].current_time);
    
    // Test schema access
    const schema = process.env.DB_SCHEMA || 'public';
    console.log(`Testing schema: ${schema}`);
    
    // Test nationality table with schema
    const nationalityTable = getTableName('nationality');
    console.log(`Testing table: ${nationalityTable}`);
    
    const nationalityTest = await pool.query(`SELECT COUNT(*) as count FROM ${nationalityTable}`);
    console.log('✅ Nationality table accessible');
    console.log('Nationality count:', nationalityTest.rows[0].count);
    
    // Test search_path
    const searchPathResult = await pool.query('SHOW search_path');
    console.log('Current search_path:', searchPathResult.rows[0].search_path);
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

testConnection();
