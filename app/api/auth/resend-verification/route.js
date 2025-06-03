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
    const { email } = await request.json();

    let userEmail = email;

    // If authenticated, get email from token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userEmail = payload.email;
      } catch (error) {
        // If token is invalid, fall back to email from request body
      }
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userQuery = await client.query(
      'SELECT account_id, account_is_verified FROM Account WHERE account_email = $1',
      [userEmail]
    );

    if (userQuery.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userQuery.rows[0];

    if (user.account_is_verified) {
      return NextResponse.json(
        { error: 'Account already verified' },
        { status: 400 }
      );
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`New verification code for ${userEmail}: ${verificationCode}`);

    // In production, send email with verification code
    
    return NextResponse.json({
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Error resending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
