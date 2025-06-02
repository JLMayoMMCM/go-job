import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import pool from '@/lib/database';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here'
);

export async function POST(request) {
  const client = await pool.connect();
  
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    console.log('Verifying code:', code, 'for email:', email);

    // First, check if the verification code exists and is valid
    const codeCheck = await client.query(`
      SELECT vc.*, a.account_id, a.account_email, at.account_type_name
      FROM Verification_codes vc
      JOIN Account a ON vc.account_id = a.account_id
      JOIN Account_type at ON a.account_type_id = at.account_type_id
      WHERE a.account_email = $1 AND vc.code = $2
    `, [email, code]);

    if (codeCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      );
    }

    const codeData = codeCheck.rows[0];

    // Check if code is expired
    if (new Date() > new Date(codeData.expires_at)) {
      // Delete expired code
      await client.query('DELETE FROM Verification_codes WHERE account_id = $1', [codeData.account_id]);
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 401 }
      );
    }

    // Get user details based on account type
    let userQuery;
    
    if (codeData.account_type_name === 'Job Seeker') {
      userQuery = await client.query(`
        SELECT 
          a.account_id, a.account_username, a.account_email, 
          at.account_type_name,
          p.first_name, p.last_name,
          js.job_seeker_id,
          CASE WHEN COUNT(jp.person_id) > 0 THEN true ELSE false END as has_preferences
        FROM Account a
        JOIN Account_type at ON a.account_type_id = at.account_type_id
        JOIN Job_seeker js ON a.account_id = js.account_id
        JOIN Person p ON js.person_id = p.person_id
        LEFT JOIN Jobseeker_preference jp ON p.person_id = jp.person_id
        WHERE a.account_id = $1
        GROUP BY a.account_id, a.account_username, a.account_email, at.account_type_name, p.first_name, p.last_name, js.job_seeker_id
      `, [codeData.account_id]);
    } else if (codeData.account_type_name === 'Company') {
      userQuery = await client.query(`
        SELECT 
          a.account_id, a.account_username, a.account_email, 
          at.account_type_name,
          p.first_name, p.last_name,
          c.company_name,
          e.position_name,
          e.employee_id
        FROM Account a
        JOIN Account_type at ON a.account_type_id = at.account_type_id
        JOIN Employee e ON a.account_id = e.account_id
        JOIN Person p ON e.person_id = p.person_id
        JOIN Company c ON e.company_id = c.company_id
        WHERE a.account_id = $1
      `, [codeData.account_id]);
    }

    if (!userQuery || userQuery.rows.length === 0) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const user = userQuery.rows[0];

    await client.query('BEGIN');

    // Mark account as verified
    await client.query(
      'UPDATE Account SET account_is_verified = true WHERE account_id = $1',
      [user.account_id]
    );

    // Delete used verification code
    await client.query(
      'DELETE FROM Verification_codes WHERE account_id = $1',
      [user.account_id]
    );

    await client.query('COMMIT');

    console.log('Account verified successfully for user:', user.account_id);

    // Generate JWT token
    const token = await new SignJWT({ 
      userId: user.account_id, 
      username: user.account_username,
      accountType: user.account_type_name,
      userType: user.account_type_name === 'Company' ? 'employer' : 'job-seeker'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    return NextResponse.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user.account_id,
        username: user.account_username,
        email: user.account_email,
        firstName: user.first_name,
        lastName: user.last_name,
        companyName: user.company_name || null,
        position: user.position_name || null,
        accountType: user.account_type_name,
        userType: user.account_type_name === 'Company' ? 'employer' : 'job-seeker',
        isJobSeeker: !!user.job_seeker_id,
        isEmployee: !!user.employee_id,
        hasPreferences: user.has_preferences || false
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error during verification' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// Export other HTTP methods to satisfy Next.js requirements
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
