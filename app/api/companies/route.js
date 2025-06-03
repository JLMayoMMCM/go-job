import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import pool from '@/lib/database';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here'
);

export async function GET(request) {
  const client = await pool.connect();
  
  try {
    let userId = null;
    let jobSeekerId = null;
    
    // Check if user is authenticated to show follow status
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
        
        // Get job seeker ID if user is a job seeker
        const jobSeekerQuery = await client.query(
          'SELECT job_seeker_id FROM Job_seeker WHERE account_id = $1',
          [userId]
        );
        if (jobSeekerQuery.rows.length > 0) {
          jobSeekerId = jobSeekerQuery.rows[0].job_seeker_id;
        }
      } catch (error) {
        // Continue without authentication
        console.log('Auth token invalid, continuing without authentication');
      }
    }

    // Get companies with job counts and follow status
    const companiesQuery = `
      SELECT 
        c.company_id,
        c.company_name,
        c.company_email,
        c.company_rating,
        c.company_phone,
        c.company_website,
        c.company_description,
        c.company_logo,
        a.premise_name,
        a.street_name,
        a.barangay_name,
        a.city_name,
        COUNT(j.job_id) FILTER (WHERE j.job_is_active = true) as active_jobs_count,
        COUNT(j.job_id) as total_jobs_count,
        COALESCE(AVG(cr.rating), 0) as avg_rating,
        COUNT(cr.rating_id) as total_ratings,
        ${jobSeekerId ? `
          CASE WHEN fc.follow_id IS NOT NULL THEN true ELSE false END as is_followed
        ` : 'false as is_followed'}
      FROM Company c
      LEFT JOIN Address a ON c.address_id = a.address_id
      LEFT JOIN Job j ON c.company_id = j.company_id
      LEFT JOIN Company_ratings cr ON c.company_id = cr.company_id
      ${jobSeekerId ? `
        LEFT JOIN Followed_companies fc ON c.company_id = fc.company_id AND fc.job_seeker_id = $1
      ` : ''}
      GROUP BY c.company_id, c.company_name, c.company_email, c.company_rating, 
               c.company_phone, c.company_website, c.company_description, c.company_logo,
               a.premise_name, a.street_name, a.barangay_name, a.city_name
               ${jobSeekerId ? ', fc.follow_id' : ''}
      ORDER BY c.company_name
    `;

    const params = jobSeekerId ? [jobSeekerId] : [];
    const companiesResult = await client.query(companiesQuery, params);

    // Format the results to ensure consistent data structure
    const companies = companiesResult.rows.map(company => ({
      ...company,
      company_logo: company.company_logo ? Buffer.from(company.company_logo).toString('base64') : null,
      company_rating: company.avg_rating || company.company_rating || 0,
      active_jobs_count: parseInt(company.active_jobs_count) || 0,
      total_jobs_count: parseInt(company.total_jobs_count) || 0,
      total_ratings: parseInt(company.total_ratings) || 0,
      is_followed: company.is_followed || false
    }));

    console.log('Companies fetched:', companies.length); // Debug log

    return NextResponse.json(companies);

  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
