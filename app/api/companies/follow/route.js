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
    const { companyId } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Check if user is a job seeker
    const jobSeekerQuery = await client.query(
      'SELECT job_seeker_id FROM Job_seeker WHERE account_id = $1',
      [payload.userId]
    );

    if (jobSeekerQuery.rows.length === 0) {
      return NextResponse.json(
        { error: 'Only job seekers can follow companies' },
        { status: 403 }
      );
    }

    const jobSeekerId = jobSeekerQuery.rows[0].job_seeker_id;

    // Check if already following
    const existingFollow = await client.query(
      'SELECT follow_id FROM Followed_companies WHERE company_id = $1 AND job_seeker_id = $2',
      [companyId, jobSeekerId]
    );

    if (existingFollow.rows.length > 0) {
      // Unfollow
      await client.query(
        'DELETE FROM Followed_companies WHERE company_id = $1 AND job_seeker_id = $2',
        [companyId, jobSeekerId]
      );

      return NextResponse.json({
        message: 'Company unfollowed successfully',
        isFollowing: false
      });
    } else {
      // Follow
      await client.query(
        'INSERT INTO Followed_companies (company_id, job_seeker_id) VALUES ($1, $2)',
        [companyId, jobSeekerId]
      );

      return NextResponse.json({
        message: 'Company followed successfully',
        isFollowing: true
      });
    }

  } catch (error) {
    console.error('Error following/unfollowing company:', error);
    return NextResponse.json(
      { error: 'Failed to follow/unfollow company' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
