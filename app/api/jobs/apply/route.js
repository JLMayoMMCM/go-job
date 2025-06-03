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
    
    const { jobId, coverLetter } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

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

    // Check if job exists and is active
    const jobQuery = await client.query(
      'SELECT job_id, job_name, job_is_active FROM Job WHERE job_id = $1',
      [jobId]
    );

    if (jobQuery.rows.length === 0) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (!jobQuery.rows[0].job_is_active) {
      return NextResponse.json(
        { error: 'This job is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Check if already applied
    const existingRequestQuery = await client.query(
      'SELECT request_id FROM Job_requests WHERE job_id = $1 AND job_seeker_id = $2',
      [jobId, jobSeekerId]
    );

    if (existingRequestQuery.rows.length > 0) {
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 409 }
      );
    }

    // Create job request
    const insertResult = await client.query(`
      INSERT INTO Job_requests (job_id, job_seeker_id, cover_letter)
      VALUES ($1, $2, $3)
      RETURNING request_id, request_date
    `, [jobId, jobSeekerId, coverLetter]);

    return NextResponse.json({
      message: 'Job application submitted successfully',
      requestId: insertResult.rows[0].request_id,
      requestDate: insertResult.rows[0].request_date
    });

  } catch (error) {
    console.error('Error applying for job:', error);
    return NextResponse.json(
      { error: 'Failed to submit job application' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
