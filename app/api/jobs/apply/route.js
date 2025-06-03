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

    await client.query('BEGIN');

    // Verify user is a job seeker
    const jobSeekerQuery = await client.query(
      'SELECT job_seeker_id FROM Job_seeker WHERE account_id = $1',
      [payload.userId]
    );

    if (jobSeekerQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Only job seekers can apply for jobs' },
        { status: 403 }
      );
    }

    const jobSeekerId = jobSeekerQuery.rows[0].job_seeker_id;

    // Verify job exists and is active
    const jobQuery = await client.query(
      'SELECT job_id, job_name, job_is_active FROM Job WHERE job_id = $1',
      [jobId]
    );

    if (jobQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const job = jobQuery.rows[0];

    if (!job.job_is_active) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'This job is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Check if user has already applied
    const existingApplicationQuery = await client.query(
      'SELECT request_id FROM Job_requests WHERE job_id = $1 AND job_seeker_id = $2',
      [jobId, jobSeekerId]
    );

    if (existingApplicationQuery.rows.length > 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 400 }
      );
    }

    // Create job application
    const applicationResult = await client.query(`
      INSERT INTO Job_requests (job_id, job_seeker_id, cover_letter)
      VALUES ($1, $2, $3)
      RETURNING request_id
    `, [jobId, jobSeekerId, coverLetter || null]);

    // Create notification for company employees
    const companyEmployeesQuery = await client.query(`
      SELECT e.account_id
      FROM Employee e
      JOIN Job j ON e.company_id = j.company_id
      WHERE j.job_id = $1
    `, [jobId]);

    // Get applicant name for notification
    const applicantQuery = await client.query(`
      SELECT p.first_name || ' ' || p.last_name as full_name
      FROM Person p
      JOIN Job_seeker js ON p.person_id = js.person_id
      WHERE js.job_seeker_id = $1
    `, [jobSeekerId]);

    const applicantName = applicantQuery.rows[0]?.full_name || 'A job seeker';

    // Send notifications to all company employees
    for (const employee of companyEmployeesQuery.rows) {
      await client.query(`
        INSERT INTO Notifications (account_id, notification_text, sender_account_id)
        VALUES ($1, $2, $3)
      `, [
        employee.account_id,
        `New job application received from ${applicantName} for ${job.job_name}`,
        payload.userId
      ]);
    }

    await client.query('COMMIT');

    return NextResponse.json({
      message: 'Application submitted successfully',
      applicationId: applicationResult.rows[0].request_id
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting job application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
