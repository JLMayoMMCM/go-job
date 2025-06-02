import { NextResponse } from 'next/server';
import pool from '@/lib/database';

export async function GET() {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT job_category_id, job_category_name FROM Job_category ORDER BY job_category_name ASC'
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching job categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job categories' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
