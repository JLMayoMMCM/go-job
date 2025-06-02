CREATE Databbase dbMayo;

-- Job Categories filler
INSERT INTO Job_category (job_category_id, job_category_name) VALUES
  (10000001, 'Information Technology'),
  (10000002, 'Business Analyst'),
  (10000003, 'Civil Engineering'),
  (10000004, 'Accounting'),
  (10000005, 'Marketing'),
  (10000006, 'Education'),
  (10000007, 'Healthcare'),
  (10000008, 'Finance'),
  (10000009, 'Sales'),
  (10000010, 'Human Resources');

-- Job Types filler
INSERT INTO Job_type (job_type_id, job_type_name) VALUES
  (20000001, 'Full Time'),
  (20000002, 'Part Time'),
  (20000003, 'Contract'),
  (20000004, 'Internship'),
  (20000005, 'Temporary');


INSERT INTO account_type (account_type_id, account_type_name) VALUES
  (10000001, 'Company'),
  (10000002, 'Job Seeker');

select * from job_category;

 
-- Sample Addresses
INSERT INTO Address (address_id, premise_name, street_name, barangay_name, city_name) VALUES
  (30000001, 'Alpha Tower', 'Rizal St', 'Poblacion District', 'Davao City'),
  (30000002, 'Beta Plaza', 'C.M. Recto St', 'Talomo District', 'Davao City'),
  (30000003, 'Gamma Building', 'J.P. Laurel Ave', 'Buhangin District', 'Davao City');

-- Sample Accounts
INSERT INTO Account (account_id, account_email, account_username, account_number, account_password, account_type_id, sso_user_id) VALUES
  (40000001, 'alpha@company.com', 'alphauser', 'ACC1001', 'passAlpha', 10000001, NULL),
  (40000002, 'beta@company.com', 'betauser', 'ACC1002', 'passBeta', 10000001, NULL),
  (40000003, 'gamma@company.com', 'gammauser', 'ACC1003', 'passGamma', 10000001, NULL);

-- Sample Companies
INSERT INTO Company (company_id, company_name, address_id, account_id) VALUES
  (50000001, 'Alpha Solutions', 30000001, 40000001),
  (50000002, 'Beta Innovations', 30000002, 40000002),
  (50000003, 'Gamma Enterprises', 30000003, 40000003);

-- Sample Jobs for Alpha Solutions
INSERT INTO Job (job_id, company_id, job_name, job_type_id, job_salary, job_time, job_description) VALUES
  (60000001, 50000001, 'Software Engineer', 20000001, '60000', '40 hours/week', 'Develop and maintain software applications using modern programming languages and frameworks. Collaborate with cross-functional teams to design and implement solutions.'),
  (60000002, 50000001, 'Business Analyst', 20000002, '40000', '20 hours/week', 'Analyze business requirements and translate them into technical specifications. Work with stakeholders to improve business processes and systems.'),
  (60000003, 50000001, 'QA Tester', 20000003, '35000', '30 hours/week', 'Design and execute test plans to ensure software quality. Identify and document bugs, and verify fixes.'),
  (60000004, 50000001, 'IT Support', 20000001, '30000', '40 hours/week', 'Provide technical assistance and support for computer systems, hardware, and software. Troubleshoot and resolve IT issues.'),
  (60000005, 50000001, 'HR Specialist', 20000005, '32000', '25 hours/week', 'Manage recruitment processes, employee relations, and HR administrative functions. Support company culture and employee engagement initiatives.');

-- Sample Jobs for Beta Innovations
INSERT INTO Job (job_id, company_id, job_name, job_type_id, job_salary, job_time, job_description) VALUES
  (60000006, 50000002, 'Civil Engineer', 20000001, '70000', '40 hours/week', 'Design and supervise infrastructure projects. Prepare plans, specifications, and cost estimates for construction projects.'),
  (60000007, 50000002, 'Accountant', 20000001, '50000', '40 hours/week', 'Prepare financial statements, analyze financial information, and ensure compliance with financial regulations and standards.'),
  (60000008, 50000002, 'Marketing Lead', 20000002, '45000', '25 hours/week', 'Develop and implement marketing strategies to promote products and services. Analyze market trends and competitor activities.'),
  (60000009, 50000002, 'Sales Executive', 20000003, '40000', '30 hours/week', 'Generate leads, build client relationships, and meet sales targets. Represent the company at industry events and trade shows.'),
  (60000010, 50000002, 'Finance Analyst', 20000001, '55000', '40 hours/week', 'Conduct financial analysis, prepare reports, and provide recommendations to support business.');

-- Sample Jobs for Gamma Enterprises
INSERT INTO Job (job_id, company_id, job_name, job_type_id, job_salary, job_time) VALUES
  (60000011, 50000003, 'Teacher', 20000004, '25000', '15 hours/week'),
  (60000012, 50000003, 'Nurse', 20000001, '48000', '40 hours/week'),
  (60000013, 50000003, 'Sales Associate', 20000005, '22000', '20 hours/week'),
  (60000014, 50000003, 'HR Manager', 20000001, '52000', '40 hours/week'),
  (60000015, 50000003, 'IT Consultant', 20000003, '65000', '30 hours/week');

-- Job_Category_List for Alpha Solutions Jobs
INSERT INTO Job_Category_List (job_id, job_category_id) VALUES
  (60000001, 10000001), -- Software Engineer: IT
  (60000001, 10000008), -- Software Engineer: Finance
  (60000002, 10000002), -- Business Analyst: Business Analyst
  (60000002, 10000001), -- Business Analyst: IT
  (60000003, 10000001), -- QA Tester: IT
  (60000004, 10000001), -- IT Support: IT
  (60000005, 10000010); -- HR Specialist: Human Resources

-- Job_Category_List for Beta Innovations Jobs
INSERT INTO Job_Category_List (job_id, job_category_id) VALUES
  (60000006, 10000003), -- Civil Engineer: Civil Engineering
  (60000007, 10000004), -- Accountant: Accounting
  (60000008, 10000005), -- Marketing Lead: Marketing
  (60000008, 10000009), -- Marketing Lead: Sales
  (60000009, 10000009), -- Sales Executive: Sales
  (60000010, 10000008); -- Finance Analyst: Finance

-- Job_Category_List for Gamma Enterprises Jobs
INSERT INTO Job_Category_List (job_id, job_category_id) VALUES
  (60000011, 10000006), -- Teacher: Education
  (60000012, 10000007), -- Nurse: Healthcare
  (60000013, 10000009), -- Sales Associate: Sales
  (60000014, 10000010), -- HR Manager: Human Resources
  (60000015, 10000001), -- IT Consultant: IT
  (60000015, 10000002); -- IT Consultant: Business Analyst



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
    j.job_id, c.company_name, j.job_name, jt.job_type_name, j.job_salary, j.job_time
  ORDER BY 
    j.job_id;