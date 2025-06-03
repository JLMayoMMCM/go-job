import { NextResponse } from 'next/server';
import pool, { getTableName } from '@/lib/database';

export async function GET() {
  try {
    const nationalityTable = getTableName('nationality');
    const nationalitiesQuery = await pool.query(`
      SELECT nationality_id, nationality_name 
      FROM ${nationalityTable} 
      ORDER BY nationality_name ASC
    `);

    const nationalities = nationalitiesQuery.rows.map(row => ({
      id: row.nationality_id,
      name: row.nationality_name
    }));

    return NextResponse.json(nationalities);

  } catch (error) {
    console.error('Error fetching nationalities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nationalities' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}