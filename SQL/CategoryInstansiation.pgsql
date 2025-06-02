-- Remove invalid CREATE DATABASE statement
-- CREATE DATABASE dbMayo;

-- Job Categories filler
-- Remove all data from tables in correct order to avoid FK constraint issues
TRUNCATE TABLE Job_Category_List RESTART IDENTITY CASCADE;
TRUNCATE TABLE Job RESTART IDENTITY CASCADE;
TRUNCATE TABLE Company RESTART IDENTITY CASCADE;
TRUNCATE TABLE Account RESTART IDENTITY CASCADE;
TRUNCATE TABLE Address RESTART IDENTITY CASCADE;
TRUNCATE TABLE Nationality RESTART IDENTITY CASCADE;
TRUNCATE TABLE Account_type RESTART IDENTITY CASCADE;
TRUNCATE TABLE Job_type RESTART IDENTITY CASCADE;
TRUNCATE TABLE Job_category RESTART IDENTITY CASCADE;



INSERT INTO Job_category (job_category_name) VALUES
  ('Information Technology'),
  ('Business Analyst'),
  ('Civil Engineering'),
  ('Accounting'),
  ('Marketing'),
  ('Education'),
  ('Healthcare'),
  ('Finance'),
  ('Sales'),
  ('Human Resources');

-- Job Types filler
INSERT INTO Job_type (job_type_name) VALUES
  ('Full Time'),
  ('Part Time'),
  ('Contract'),
  ('Internship'),
  ('Temporary');

-- Account Types filler
INSERT INTO Account_type (account_type_name) VALUES
  ('Company'),
  ('Job Seeker');

-- Sample Nationalities
INSERT INTO Nationality (nationality_name) VALUES
  ('Filipino'),
  ('American'),
  ('Japanese');

-- Sample Addresses
INSERT INTO Address (premise_name, street_name, barangay_name, city_name) VALUES
  ('Alpha Tower', 'Rizal St', 'Poblacion District', 'Davao City'),
  ('Beta Plaza', 'C.M. Recto St', 'Talomo District', 'Davao City'),
  ('Gamma Building', 'J.P. Laurel Ave', 'Buhangin District', 'Davao City');

-- Sample Accounts
INSERT INTO Account (account_email, account_username, account_number, account_password, account_type_id, sso_user_id) VALUES
  ('alpha@company.com', 'alphauser', 'ACC1001', 'passAlpha', 1, NULL),
  ('beta@company.com', 'betauser', 'ACC1002', 'passBeta', 1, NULL),
  ('gamma@company.com', 'gammauser', 'ACC1003', 'passGamma', 1, NULL);

-- Sample Companies
INSERT INTO Company (company_name, address_id, account_id) VALUES
  ('Alpha Solutions', 1, 1),
  ('Beta Innovations', 2, 2),
  ('Gamma Enterprises', 3, 3);

-- Sample Jobs for Alpha Solutions
INSERT INTO Job (company_id, job_name, job_type_id, job_salary, job_time, job_description) VALUES
  (1, 'Software Engineer', 1, 60000.00, '40 hours/week', 'Develop and maintain software applications using modern programming languages and frameworks. Collaborate with cross-functional teams to design and implement solutions.'),
  (1, 'Business Analyst', 2, 40000.00, '20 hours/week', 'Analyze business requirements and translate them into technical specifications. Work with stakeholders to improve business processes and systems.'),
  (1, 'QA Tester', 3, 35000.00, '30 hours/week', 'Design and execute test plans to ensure software quality. Identify and document bugs, and verify fixes.'),
  (1, 'IT Support', 1, 30000.00, '40 hours/week', 'Provide technical assistance and support for computer systems, hardware, and software. Troubleshoot and resolve IT issues.'),
  (1, 'HR Specialist', 5, 32000.00, '25 hours/week', 'Manage recruitment processes, employee relations, and HR administrative functions. Support company culture and employee engagement initiatives.');

-- Sample Jobs for Beta Innovations
INSERT INTO Job (company_id, job_name, job_type_id, job_salary, job_time, job_description) VALUES
  (2, 'Civil Engineer', 1, 70000.00, '40 hours/week', 'Design and supervise infrastructure projects. Prepare plans, specifications, and cost estimates for construction projects.'),
  (2, 'Accountant', 1, 50000.00, '40 hours/week', 'Prepare financial statements, analyze financial information, and ensure compliance with financial regulations and standards.'),
  (2, 'Marketing Lead', 2, 45000.00, '25 hours/week', 'Develop and implement marketing strategies to promote products and services. Analyze market trends and competitor activities.'),
  (2, 'Sales Executive', 3, 40000.00, '30 hours/week', 'Generate leads, build client relationships, and meet sales targets. Represent the company at industry events and trade shows.'),
  (2, 'Finance Analyst', 1, 55000.00, '40 hours/week', 'Conduct financial analysis, prepare reports, and provide recommendations to support business.');

-- Sample Jobs for Gamma Enterprises
INSERT INTO Job (company_id, job_name, job_type_id, job_salary, job_time, job_description) VALUES
  (3, 'Teacher', 4, 25000.00, '15 hours/week', 'Educate students and prepare lesson plans.'),
  (3, 'Nurse', 1, 48000.00, '40 hours/week', 'Provide healthcare services and patient care.'),
  (3, 'Sales Associate', 5, 22000.00, '20 hours/week', 'Assist customers and promote sales.'),
  (3, 'HR Manager', 1, 52000.00, '40 hours/week', 'Oversee HR functions and manage employee relations.'),
  (3, 'IT Consultant', 3, 65000.00, '30 hours/week', 'Provide IT solutions and consultancy services.');

-- Job_Category_List for Alpha Solutions Jobs
INSERT INTO Job_Category_List (job_id, job_category_id) VALUES
  (1, 1), -- Software Engineer: IT
  (1, 8), -- Software Engineer: Finance
  (2, 2), -- Business Analyst: Business Analyst
  (2, 1), -- Business Analyst: IT
  (3, 1), -- QA Tester: IT
  (4, 1), -- IT Support: IT
  (5, 10); -- HR Specialist: Human Resources

-- Job_Category_List for Beta Innovations Jobs
INSERT INTO Job_Category_List (job_id, job_category_id) VALUES
  (6, 3), -- Civil Engineer: Civil Engineering
  (7, 4), -- Accountant: Accounting
  (8, 5), -- Marketing Lead: Marketing
  (8, 9), -- Marketing Lead: Sales
  (9, 9), -- Sales Executive: Sales
  (10, 8); -- Finance Analyst: Finance

-- Job_Category_List for Gamma Enterprises Jobs
INSERT INTO Job_Category_List (job_id, job_category_id) VALUES
  (11, 6), -- Teacher: Education
  (12, 7), -- Nurse: Healthcare
  (13, 9), -- Sales Associate: Sales
  (14, 10), -- HR Manager: Human Resources
  (15, 1), -- IT Consultant: IT
  (15, 2); -- IT Consultant: Business Analyst

-- Add random notifications
DO $$
DECLARE
  i INTEGER;
  notification_texts TEXT[] := ARRAY[
    'Your account has been updated.',
    'New job posting available.',
    'Your application has been reviewed.',
    'Password change request.',
    'Company profile updated.',
    'New message from HR.',
    'Job interview scheduled.',
    'Application status updated.',
    'New job recommendations.',
    'Account verification required.',
    'Reminder: Update your profile.',
    'New connection request.',
    'Job offer received.',
    'Your subscription has been renewed.',
    'Feedback request for recent application.',
    'Upcoming event notification.',
    'Your resume has been viewed.',
    'New training session available.',
    'Important security update.',
    'Your account has been flagged for review.'
  ];
BEGIN
  FOR i IN 1..20 LOOP
    INSERT INTO Notifications (account_id, notification_text, sender_account_id, is_read)
    VALUES (
      (SELECT account_id FROM Account ORDER BY RANDOM() LIMIT 1), 
      notification_texts[i],
      (SELECT account_id FROM Account ORDER BY RANDOM() LIMIT 1),
      FALSE
    );
  END LOOP;
END $$;

-- Sample Queries

-- Query to get jobs data based on company name
SELECT 
  j.job_id, 
  c.company_name,
  j.job_name, 
  j.job_description,
  jt.job_type_name,
  j.job_salary,
  j.job_time,
  string_agg(jc.job_category_name, ', ' ORDER BY jc.job_category_name) AS categories
FROM 
  Job j
JOIN 
  Company c ON j.company_id = c.company_id
JOIN 
  Job_type jt ON j.job_type_id = jt.job_type_id
JOIN 
  Job_Category_List jcl ON j.job_id = jcl.job_id
JOIN 
  Job_category jc ON jcl.job_category_id = jc.job_category_id
WHERE 
  c.company_name = 'Alpha Solutions'
GROUP BY
  j.job_id, c.company_name, j.job_name, j.job_description, jt.job_type_name, j.job_salary, j.job_time
ORDER BY 
  j.job_id;

-- Query to get accounts based on account type
SELECT 
  a.account_id,
  a.account_email,
  a.account_username,
  a.account_number,
  at.account_type_name,
  a.account_is_verified
FROM 
  Account a
JOIN 
  Account_type at ON a.account_type_id = at.account_type_id
WHERE 
  at.account_type_name = 'Company'
ORDER BY 
  a.account_id;

-- Query to get notifications based on account ID
SELECT 
  n.notification_id,
  n.notification_text,
  n.notification_date,
  n.is_read,
  n.sender_account_id,
  a.account_username AS account_name,
  c.company_name AS company_name
FROM 
  Notifications n
LEFT JOIN 
  Account a ON n.account_id = a.account_id
LEFT JOIN 
  Company c ON a.account_id = c.account_id
WHERE 
  n.account_id = 3
ORDER BY 
  n.notification_date DESC;

