import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { SignJWT } from 'jose';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
);

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here'
);

// Mock database functions
async function findOrCreateGoogleUser(googleUser) {
  // Check if user exists by email or Google ID
  // If not, create new user
  console.log('Finding or creating Google user:', googleUser);
  return {
    account_id: 1,
    account_username: googleUser.email.split('@')[0],
    account_email: googleUser.email,
    firstName: googleUser.given_name,
    lastName: googleUser.family_name,
    sso_user_id: googleUser.id
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect('/Login?error=google_oauth_cancelled');
    }

    if (!code) {
      return NextResponse.redirect('/Login?error=missing_authorization_code');
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    // Find or create user in database
    const user = await findOrCreateGoogleUser(googleUser);

    // Generate JWT token
    const token = await new SignJWT({ 
      userId: user.account_id, 
      username: user.account_username 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // Redirect to dashboard with token
    const response = NextResponse.redirect('/dashboard');
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect('/Login?error=google_oauth_failed');
  }
}
