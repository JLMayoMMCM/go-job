import { NextResponse } from 'next/server';
import pool from '@/lib/database';
import { sendVerificationEmail } from '@/lib/email';

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    // Find user by email
    const userQuery = await client.query(
      'SELECT account_id, account_email, account_is_verified FROM Account WHERE account_email = $1',
      [email]
    );
    
    if (userQuery.rows.length === 0) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    const user = userQuery.rows[0];

    if (user.account_is_verified) {
      return NextResponse.json(
        { error: 'Account is already verified' },
        { status: 400 }
      );
    }

    // Check if there's a recent code (rate limiting)
    const recentCodeQuery = await client.query(
      'SELECT created_at FROM Verification_codes WHERE account_id = $1 AND created_at > NOW() - INTERVAL \'1 minute\'',
      [user.account_id]
    );

    if (recentCodeQuery.rows.length > 0) {
      return NextResponse.json(
        { error: 'Please wait at least 1 minute before requesting a new code' },
        { status: 429 }
      );
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store new verification code (replace existing one)
    await client.query(
      'INSERT INTO Verification_codes (account_id, code, expires_at) VALUES ($1, $2, $3) ON CONFLICT (account_id) DO UPDATE SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at, created_at = CURRENT_TIMESTAMP',
      [user.account_id, verificationCode, expiresAt]
    );

    console.log(`Resending verification code to ${email}`);

    // Send verification code
    let emailSent = false;
    try {
      emailSent = await sendVerificationEmail(email, verificationCode);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification code sent successfully',
      emailSent: emailSent
    });

  } catch (error) {
    console.error('Resend code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
