import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import pool from '@/lib/database';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here'
);

export async function POST(request) {
  const client = await pool.connect();
  
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    const { categoryIds } = await request.json();
    
    if (!categoryIds || categoryIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one category must be selected' },
        { status: 400 }
      );
    }

    // Get user's person_id
    const userQuery = await client.query(`
      SELECT p.person_id 
      FROM Account a
      JOIN Job_seeker js ON a.account_id = js.account_id
      JOIN Person p ON js.person_id = p.person_id
      WHERE a.account_id = $1
    `, [payload.userId]);

    if (userQuery.rows.length === 0) {
      return NextResponse.json(
        { error: 'Job seeker profile not found' },
        { status: 404 }
      );
    }

    const personId = userQuery.rows[0].person_id;

    await client.query('BEGIN');

    // Delete existing preferences
    await client.query(
      'DELETE FROM Jobseeker_preference WHERE person_id = $1',
      [personId]
    );

    // Insert new preferences
    for (const categoryId of categoryIds) {
      await client.query(
        'INSERT INTO Jobseeker_preference (person_id, preferred_job_category_id) VALUES ($1, $2)',
        [personId, categoryId]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json({ message: 'Preferences saved successfully' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving job preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function GET(request) {
  const client = await pool.connect();
  
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const preferencesQuery = await client.query(`
      SELECT jc.job_category_id, jc.job_category_name
      FROM Jobseeker_preference jp
      JOIN Job_category jc ON jp.preferred_job_category_id = jc.job_category_id
      JOIN Person p ON jp.person_id = p.person_id
      JOIN Job_seeker js ON p.person_id = js.person_id
      JOIN Account a ON js.account_id = a.account_id
      WHERE a.account_id = $1
      ORDER BY jc.job_category_name
    `, [payload.userId]);

    return NextResponse.json(preferencesQuery.rows);

  } catch (error) {
    console.error('Error fetching job preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
