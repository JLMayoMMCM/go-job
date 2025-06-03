import { NextResponse } from 'next/server';
import pool from '@/lib/database';

export async function POST(request) {
  const client = await pool.connect();
  
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userQuery = await client.query(
      'SELECT account_id, account_is_verified FROM Account WHERE account_email = $1',
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

    // Generate new verification code (6 digits)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // In production, you would:
    // 1. Send the code via email service
    // 2. Store it temporarily in Redis or similar cache
    // 3. Set an expiration time
    
    console.log(`Verification code for ${email}: ${verificationCode}`);

    // For demo purposes, we'll just return success
    // In production, you would send the email here
    
    return NextResponse.json({
      message: 'Verification code sent successfully',
      // Remove this in production - only for demo
      code: verificationCode
    });

  } catch (error) {
    console.error('Error resending verification code:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification code' },
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
