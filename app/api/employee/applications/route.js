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

    // Get all job requests for company's jobs
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
        p.first_name || ' ' || p.last_name as applicant_name,
        a.account_email as applicant_email
      FROM Job_requests jr
      JOIN Job j ON jr.job_id = j.job_id
      JOIN Job_seeker js ON jr.job_seeker_id = js.job_seeker_id
      JOIN Person p ON js.person_id = p.person_id
      JOIN Account a ON js.account_id = a.account_id
      WHERE j.company_id = $1
      ORDER BY jr.request_date DESC
    `, [companyId]);

    return NextResponse.json(requestsQuery.rows);

  } catch (error) {
    console.error('Error fetching job requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job requests' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
