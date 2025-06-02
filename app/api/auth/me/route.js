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

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Get user data - separate queries for job seekers and employers
    const userQuery = await client.query(`
      SELECT 
        a.account_id, a.account_username, a.account_email, a.account_is_verified,
        at.account_type_name,
        COALESCE(p_js.first_name, p_emp.first_name) as first_name,
        COALESCE(p_js.last_name, p_emp.last_name) as last_name,
        COALESCE(p_js.middle_name, p_emp.middle_name) as middle_name,
        COALESCE(addr_js.premise_name, addr_emp.premise_name) as premise_name,
        COALESCE(addr_js.street_name, addr_emp.street_name) as street_name,
        COALESCE(addr_js.barangay_name, addr_emp.barangay_name) as barangay_name,
        COALESCE(addr_js.city_name, addr_emp.city_name) as city_name,
        COALESCE(n_js.nationality_name, n_emp.nationality_name) as nationality_name,
        c.company_name,
        e.position_name,
        e.employee_id,
        js.job_seeker_id
      FROM Account a
      JOIN Account_type at ON a.account_type_id = at.account_type_id
      LEFT JOIN Job_seeker js ON a.account_id = js.account_id
      LEFT JOIN Person p_js ON js.person_id = p_js.person_id
      LEFT JOIN Address addr_js ON p_js.address_id = addr_js.address_id
      LEFT JOIN Nationality n_js ON p_js.nationality_id = n_js.nationality_id
      LEFT JOIN Employee e ON a.account_id = e.account_id
      LEFT JOIN Person p_emp ON e.person_id = p_emp.person_id
      LEFT JOIN Address addr_emp ON p_emp.address_id = addr_emp.address_id
      LEFT JOIN Nationality n_emp ON p_emp.nationality_id = n_emp.nationality_id
      LEFT JOIN Company c ON e.company_id = c.company_id
      WHERE a.account_id = $1
    `, [payload.userId]);
    
    if (userQuery.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userQuery.rows[0];

    return NextResponse.json({
      id: user.account_id,
      username: user.account_username,
      email: user.account_email,
      firstName: user.first_name,
      lastName: user.last_name,
      middleName: user.middle_name,
      companyName: user.company_name,
      position: user.position_name,
      employeeId: user.employee_id,
      accountType: user.account_type_name,
      userType: user.account_type_name === 'Company' ? 'employer' : 'job-seeker',
      isVerified: user.account_is_verified,
      isJobSeeker: !!user.job_seeker_id,
      isEmployee: !!user.employee_id,
      address: {
        premise: user.premise_name,
        street: user.street_name,
        barangay: user.barangay_name,
        city: user.city_name
      },
      nationality: user.nationality_name
    });

  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  } finally {
    client.release();
  }
}

// Export other HTTP methods to satisfy Next.js requirements
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
