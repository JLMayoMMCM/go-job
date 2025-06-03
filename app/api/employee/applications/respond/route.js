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
    
    const { applicationId, status, response } = await request.json();

    if (!applicationId || !status || !['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid application ID and status are required' },
        { status: 400 }
      );
    }

    // Verify employee has permission to respond to this request
    const permissionQuery = await client.query(`
      SELECT jr.request_id
      FROM Job_requests jr
      JOIN Job j ON jr.job_id = j.job_id
      JOIN Employee e ON j.company_id = e.company_id
      WHERE jr.request_id = $1 AND e.account_id = $2
    `, [applicationId, payload.userId]);

    if (permissionQuery.rows.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized to respond to this request' },
        { status: 403 }
      );
    }

    // Update the job request status
    await client.query(`
      UPDATE Job_requests 
      SET request_status = $1, employee_response = $2, response_date = CURRENT_TIMESTAMP
      WHERE request_id = $3
    `, [status, response, applicationId]);

    return NextResponse.json({ 
      message: `Job request ${status} successfully`,
      status: status 
    });

  } catch (error) {
    console.error('Error responding to job request:', error);
    return NextResponse.json(
      { error: 'Failed to respond to job request' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
