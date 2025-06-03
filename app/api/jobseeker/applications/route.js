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

    // Get job seeker ID
    const jobSeekerQuery = await client.query(
      'SELECT job_seeker_id FROM Job_seeker WHERE account_id = $1',
      [payload.userId]
    );

    if (jobSeekerQuery.rows.length === 0) {
      return NextResponse.json(
        { error: 'Job seeker profile not found' },
        { status: 404 }
      );
    }

    const jobSeekerId = jobSeekerQuery.rows[0].job_seeker_id;

    // Get all job requests for this job seeker
    const requestsQuery = await client.query(`
      SELECT 
        jr.request_id,
        jr.request_date,
        jr.request_status,
        jr.cover_letter,
        jr.employee_response,
        jr.response_date,
        j.job_id,
        j.job_name,
        j.job_location,
        j.job_salary,
        c.company_name,
        jt.job_type_name
      FROM Job_requests jr
      JOIN Job j ON jr.job_id = j.job_id
      JOIN Company c ON j.company_id = c.company_id
      JOIN Job_type jt ON j.job_type_id = jt.job_type_id
      WHERE jr.job_seeker_id = $1
      ORDER BY jr.request_date DESC
    `, [jobSeekerId]);

    return NextResponse.json(requestsQuery.rows);

  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job applications' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
