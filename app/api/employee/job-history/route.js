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

    // Get employee's company
    const employeeQuery = await client.query(
      'SELECT company_id FROM Employee WHERE account_id = $1',
      [payload.userId]
    );

    if (employeeQuery.rows.length === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const companyId = employeeQuery.rows[0].company_id;

    // Get all jobs for the company with request counts
    const jobsQuery = await client.query(`
      SELECT 
        j.*,
        jt.job_type_name,
        COALESCE(jr_count.request_count, 0) as application_count
      FROM Job j
      JOIN Job_type jt ON j.job_type_id = jt.job_type_id
      LEFT JOIN (
        SELECT job_id, COUNT(*) as request_count
        FROM Job_requests
        GROUP BY job_id
      ) jr_count ON j.job_id = jr_count.job_id
      WHERE j.company_id = $1
      ORDER BY j.job_posted_date DESC
    `, [companyId]);

    return NextResponse.json(jobsQuery.rows);

  } catch (error) {
    console.error('Error fetching job history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job history' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
