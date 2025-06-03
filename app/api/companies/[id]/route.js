import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import pool from '@/lib/database';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here'
);

export async function GET(request, { params }) {
  const client = await pool.connect();
  
  try {
    let userId = null;
    let jobSeekerId = null;
    
    // Check if user is authenticated
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
        console.log('Auth token invalid, continuing without authentication');
      }
    }

    const companyId = parseInt(params.id);
    console.log('Fetching company with ID:', companyId);

    if (!companyId || isNaN(companyId)) {
      return NextResponse.json(
        { error: 'Invalid company ID' },
        { status: 400 }
      );
    }

    // Get company details with follow status
    const companyQuery = `
      SELECT 
        c.*,
        a.premise_name,
        a.street_name,
        a.barangay_name,
        a.city_name,
        COUNT(cr.rating_id) as total_ratings,
        COALESCE(AVG(cr.rating), 0) as avg_rating,
        ${jobSeekerId ? `
          CASE WHEN fc.follow_id IS NOT NULL THEN true ELSE false END as is_following
        ` : 'false as is_following'}
      FROM Company c
      LEFT JOIN Address a ON c.address_id = a.address_id
      LEFT JOIN Company_ratings cr ON c.company_id = cr.company_id
      ${jobSeekerId ? `
        LEFT JOIN Followed_companies fc ON c.company_id = fc.company_id AND fc.job_seeker_id = $2
      ` : ''}
      WHERE c.company_id = $1
      GROUP BY c.company_id, a.address_id${jobSeekerId ? ', fc.follow_id' : ''}
    `;

    const queryParams = jobSeekerId ? [companyId, jobSeekerId] : [companyId];
    const companyResult = await client.query(companyQuery, queryParams);

    console.log('Company query result:', companyResult.rows.length);

    if (companyResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const company = companyResult.rows[0];

    // Format company data
    const formattedCompany = {
      ...company,
      company_logo: company.company_logo ? Buffer.from(company.company_logo).toString('base64') : null,
      company_rating: company.avg_rating || company.company_rating || 0,
      total_ratings: parseInt(company.total_ratings) || 0,
      is_following: company.is_following || false
    };

    // Get company jobs
    const jobsQuery = `
      SELECT 
        j.*,
        jt.job_type_name,
        COALESCE(
          json_agg(
            json_build_object(
              'job_category_id', jc.job_category_id,
              'job_category_name', jc.job_category_name,
              'category_field_name', cf.category_field_name
            )
          ) FILTER (WHERE jc.job_category_id IS NOT NULL), 
          '[]'
        ) as categories,
        ${jobSeekerId ? `
          CASE WHEN jr.request_id IS NOT NULL THEN true ELSE false END as has_applied,
          CASE WHEN sj.saved_job_id IS NOT NULL THEN true ELSE false END as is_saved
        ` : 'false as has_applied, false as is_saved'}
      FROM Job j
      LEFT JOIN Job_type jt ON j.job_type_id = jt.job_type_id
      LEFT JOIN Job_Category_List jcl ON j.job_id = jcl.job_id
      LEFT JOIN Job_category jc ON jcl.job_category_id = jc.job_category_id
      LEFT JOIN Category_field cf ON jc.category_field_id = cf.category_field_id
      ${jobSeekerId ? `
        LEFT JOIN Job_requests jr ON j.job_id = jr.job_id AND jr.job_seeker_id = $2
        LEFT JOIN Saved_jobs sj ON j.job_id = sj.job_id AND sj.job_seeker_id = $2
      ` : ''}
      WHERE j.company_id = $1
      GROUP BY j.job_id, jt.job_type_name${jobSeekerId ? ', jr.request_id, sj.saved_job_id' : ''}
      ORDER BY j.job_posted_date DESC
    `;

    const jobsResult = await client.query(jobsQuery, queryParams);
    formattedCompany.jobs = jobsResult.rows;

    console.log('Company data prepared successfully');
    return NextResponse.json(formattedCompany);

  } catch (error) {
    console.error('Error fetching company details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company details' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
