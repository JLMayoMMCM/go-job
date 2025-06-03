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

    // For demo purposes, accept any 6-digit code
    // In production, you would validate against a secure service
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid verification code format' },
        { status: 400 }
      );
    }

    // Get user by email
    const userQuery = await client.query(
      'SELECT account_id, account_username, account_email, account_is_verified FROM Account WHERE account_email = $1',
      [email]
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

    // Mark account as verified
    await client.query(
      'UPDATE Account SET account_is_verified = true WHERE account_id = $1',
      [user.account_id]
    );

    // Generate JWT token
    const token = await new SignJWT({ 
      userId: user.account_id,
      email: user.account_email,
      username: user.account_username 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    return NextResponse.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user.account_id,
        email: user.account_email,
        username: user.account_username,
        isVerified: true
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
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
