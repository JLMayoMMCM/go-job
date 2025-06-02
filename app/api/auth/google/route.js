import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
);

export async function GET() {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    );
  }
}
