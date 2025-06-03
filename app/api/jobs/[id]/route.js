import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import pool from '@/lib/database';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here'
);

export async function GET(request, { params }) {
  const client = await pool.connect();
  
  try {
    const jobId = params.id;
    let userId = null;

    // Check if user is authenticated (optional for job details)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
      } catch (error) {
        // Token invalid, continue as guest
      }
    }

    // Get job details with company info and categories
    const jobQuery = await client.query(`
      SELECT 
        j.*,
        jt.job_type_name,
        c.company_name,
        c.company_description,
        c.company_website,
        c.company_logo,
        c.company_rating,
        array_agg(
          json_build_object(
            'job_category_id', jcat.job_category_id,
            'job_category_name', jcat.job_category_name
          )
        ) FILTER (WHERE jcat.job_category_id IS NOT NULL) as categories
      FROM Job j
      JOIN Job_type jt ON j.job_type_id = jt.job_type_id
      JOIN Company c ON j.company_id = c.company_id
      LEFT JOIN Job_Category_List jcl ON j.job_id = jcl.job_id
      LEFT JOIN Job_category jcat ON jcl.job_category_id = jcat.job_category_id
      WHERE j.job_id = $1
      GROUP BY j.job_id, jt.job_type_name, c.company_name, c.company_description, 
               c.company_website, c.company_logo, c.company_rating
    `, [jobId]);

    if (jobQuery.rows.length === 0) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const job = jobQuery.rows[0];
    
    // Convert company logo to base64 if exists
    const company = {
      company_name: job.company_name,
      company_description: job.company_description,
      company_website: job.company_website,
      company_rating: job.company_rating,
      company_logo: job.company_logo ? Buffer.from(job.company_logo).toString('base64') : null
    };

    // Remove company fields from job object
    delete job.company_name;
    delete job.company_description;
    delete job.company_website;
    delete job.company_logo;
    delete job.company_rating;

    let hasApplied = false;
    let isSaved = false;

    // Check if user has applied for this job (only for authenticated job seekers)
    if (userId) {
      const applicationQuery = await client.query(`
        SELECT jr.request_id
        FROM Job_requests jr
        JOIN Job_seeker js ON jr.job_seeker_id = js.job_seeker_id
        WHERE jr.job_id = $1 AND js.account_id = $2
      `, [jobId, userId]);
      
      hasApplied = applicationQuery.rows.length > 0;

      // Check if user has saved this job
      const savedJobQuery = await client.query(`
        SELECT 1 FROM Saved_jobs sj
        JOIN Job_seeker js ON sj.job_seeker_id = js.job_seeker_id
        WHERE sj.job_id = $1 AND js.account_id = $2
      `, [jobId, userId]);
      
      isSaved = savedJobQuery.rows.length > 0;
    }

    return NextResponse.json({
      job,
      company,
      hasApplied,
      isSaved
    });

  } catch (error) {
    console.error('Error fetching job details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job details' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
