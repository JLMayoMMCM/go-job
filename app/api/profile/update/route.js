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

    const formData = await request.formData();
    
    // Extract text fields
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const middleName = formData.get('middleName') || '';
    const phone = formData.get('phone') || '';
    const premiseName = formData.get('premiseName') || '';
    const streetName = formData.get('streetName') || '';
    const barangayName = formData.get('barangayName') || '';
    const cityName = formData.get('cityName') || '';
    const nationality = formData.get('nationality') || 'Filipino';
    
    // Extract files
    const profilePhoto = formData.get('profilePhoto');
    const resume = formData.get('resume');

    await client.query('BEGIN');

    // Get user's person_id and current data
    const userQuery = await client.query(`
      SELECT 
        a.account_id,
        COALESCE(js.person_id, e.person_id) as person_id,
        COALESCE(p_js.address_id, p_e.address_id) as address_id,
        COALESCE(p_js.nationality_id, p_e.nationality_id) as nationality_id,
        js.job_seeker_id,
        e.employee_id
      FROM Account a
      LEFT JOIN Job_seeker js ON a.account_id = js.account_id
      LEFT JOIN Employee e ON a.account_id = e.account_id
      LEFT JOIN Person p_js ON js.person_id = p_js.person_id
      LEFT JOIN Person p_e ON e.person_id = p_e.person_id
      WHERE a.account_id = $1
    `, [payload.userId]);

    if (userQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userQuery.rows[0];

    // Update nationality if provided
    let nationalityId = userData.nationality_id;
    if (nationality) {
      let nationalityResult = await client.query(
        'SELECT nationality_id FROM Nationality WHERE nationality_name = $1',
        [nationality]
      );

      if (nationalityResult.rows.length === 0) {
        nationalityResult = await client.query(
          'INSERT INTO Nationality (nationality_name) VALUES ($1) RETURNING nationality_id',
          [nationality]
        );
      }
      nationalityId = nationalityResult.rows[0].nationality_id;
    }

    // Update address
    if (userData.address_id) {
      await client.query(`
        UPDATE Address 
        SET premise_name = $1, street_name = $2, barangay_name = $3, city_name = $4
        WHERE address_id = $5
      `, [premiseName, streetName, barangayName, cityName, userData.address_id]);
    }

    // Update person
    if (userData.person_id) {
      await client.query(`
        UPDATE Person 
        SET first_name = $1, last_name = $2, middle_name = $3, nationality_id = $4
        WHERE person_id = $5
      `, [firstName, lastName, middleName, nationalityId, userData.person_id]);
    }

    // Update account phone
    await client.query(
      'UPDATE Account SET account_phone = $1 WHERE account_id = $2',
      [phone, payload.userId]
    );

    // Handle profile photo upload
    if (profilePhoto && profilePhoto.size > 0) {
      const photoBuffer = Buffer.from(await profilePhoto.arrayBuffer());
      await client.query(
        'UPDATE Account SET account_photo = $1 WHERE account_id = $2',
        [photoBuffer, payload.userId]
      );
    }

    // Handle resume upload (job seekers only)
    if (resume && resume.size > 0 && userData.job_seeker_id) {
      const resumeBuffer = Buffer.from(await resume.arrayBuffer());
      await client.query(
        'UPDATE Account SET account_resume = $1 WHERE account_id = $2',
        [resumeBuffer, payload.userId]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json({
      message: 'Profile updated successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
