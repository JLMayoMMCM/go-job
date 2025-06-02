import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import pool from '@/lib/database';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here'
);

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
    
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '20';

    // Get recommended jobs based on user preferences and company ratings
    const jobsQuery = await client.query(`
      SELECT DISTINCT
        j.job_id, j.job_name, j.job_description, j.job_location, 
        j.job_salary, j.job_time, j.job_rating, j.job_posted_date,
        c.company_name, c.company_rating,
        jt.job_type_name,
        CASE 
          WHEN jp.person_id IS NOT NULL THEN 10 
          ELSE 0 
        END as preference_score
      FROM Job j
      JOIN Company c ON j.company_id = c.company_id
      JOIN Job_type jt ON j.job_type_id = jt.job_type_id
      JOIN Job_Category_List jcl ON j.job_id = jcl.job_id
      LEFT JOIN (
        SELECT jp.preferred_job_category_id, p.person_id
        FROM Jobseeker_preference jp
        JOIN Person p ON jp.person_id = p.person_id
        JOIN Job_seeker js ON p.person_id = js.person_id
        JOIN Account a ON js.account_id = a.account_id
        WHERE a.account_id = $1
      ) jp ON jcl.job_category_id = jp.preferred_job_category_id
      WHERE j.job_is_active = true 
        AND (j.job_closing_date IS NULL OR j.job_closing_date > NOW())
      ORDER BY 
        preference_score DESC,
        COALESCE(c.company_rating, 0) DESC,
        j.job_posted_date DESC
      LIMIT $2
    `, [payload.userId, limit]);

    return NextResponse.json(jobsQuery.rows);

  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommended jobs' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
