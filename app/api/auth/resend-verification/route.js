import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import pool from '@/lib/database';
import { sendVerificationEmail } from '@/lib/email';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here'
);

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
    
    const { email } = await request.json();

    // Verify the email belongs to the authenticated user
    const userQuery = await client.query(
      'SELECT account_id, account_email, account_is_verified FROM Account WHERE account_id = $1',
      [payload.userId]
    );

    if (userQuery.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userQuery.rows[0];

    if (user.account_email !== email) {
      return NextResponse.json(
        { error: 'Email does not match account' },
        { status: 400 }
      );
    }

    if (user.account_is_verified) {
      return NextResponse.json(
        { error: 'Account is already verified' },
        { status: 400 }
      );
    }

    // Generate and store verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await client.query(
      'INSERT INTO Verification_codes (account_id, code, expires_at) VALUES ($1, $2, $3) ON CONFLICT (account_id) DO UPDATE SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at, created_at = CURRENT_TIMESTAMP',
      [user.account_id, verificationCode, expiresAt]
    );

    // Send verification email
    let emailSent = false;
    try {
      emailSent = await sendVerificationEmail(email, verificationCode);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
