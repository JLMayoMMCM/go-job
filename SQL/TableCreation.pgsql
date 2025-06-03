-- SQL DOCUMENTATION BY JONATHAN LANCE MAYO --
-- This script creates the necessary tables for a job portal system.

-- Drop existing tables if they exist to avoid conflicts with existing data
DROP TABLE IF EXISTS Job_requests CASCADE;
DROP TABLE IF EXISTS Job_applications CASCADE;
DROP TABLE IF EXISTS Job_Category_List CASCADE;
DROP TABLE IF EXISTS Job CASCADE;
DROP TABLE IF EXISTS Job_category CASCADE;
DROP TABLE IF EXISTS Job_type CASCADE;
DROP TABLE IF EXISTS Job_seeker CASCADE;
DROP TABLE IF EXISTS Employee CASCADE;
DROP TABLE IF EXISTS Company CASCADE;
DROP TABLE IF EXISTS Notifications CASCADE;
DROP TABLE IF EXISTS Account CASCADE;
DROP TABLE IF EXISTS Account_type CASCADE;
DROP TABLE IF EXISTS Person_resume CASCADE;
DROP TABLE IF EXISTS jobseeker_preference CASCADE;
DROP TABLE IF EXISTS Person CASCADE;
DROP TABLE IF EXISTS Address CASCADE;
DROP TABLE IF EXISTS Nationality CASCADE;

-- Nationality table - to store different nationalities
CREATE TABLE Nationality (
  nationality_id   SERIAL      PRIMARY KEY,
  nationality_name VARCHAR(50) NOT NULL UNIQUE
);

-- Address table - to store addresses of employee, job seekers, and companies
CREATE TABLE Address (
  address_id    SERIAL      PRIMARY KEY,
  premise_name  VARCHAR(50),
  street_name   VARCHAR(50),
  barangay_name VARCHAR(50),
  city_name     VARCHAR(50)
);

-- Person table - to store personal information of employees and job seekers
CREATE TABLE Person (
  person_id       SERIAL      PRIMARY KEY,
  first_name      VARCHAR(50) NOT NULL,
  last_name       VARCHAR(50) NOT NULL,
  middle_name     VARCHAR(50),
  address_id      INTEGER     NOT NULL REFERENCES Address(address_id) ON DELETE CASCADE,
  nationality_id  INTEGER     NOT NULL REFERENCES Nationality(nationality_id) ON DELETE CASCADE
);

-- Person_skills table - to store resume of employees and job seekers
CREATE TABLE Person_resume (
  person_id    INTEGER NOT NULL REFERENCES Person(person_id) ON DELETE CASCADE,
  PRIMARY KEY (person_id)
);

-- Account type table - to store different types of accounts (e.g., Employer, Job Seeker)
CREATE TABLE Account_type (
  account_type_id   SERIAL      PRIMARY KEY,
  account_type_name VARCHAR(50) NOT NULL
);

-- Account table
CREATE TABLE Account (
  account_id       SERIAL      PRIMARY KEY,
  account_email    VARCHAR(100) NOT NULL UNIQUE,
  account_username VARCHAR(50) NOT NULL UNIQUE,
  account_photo BYTEA,
  account_resume BYTEA,
  account_phone VARCHAR(20),
  account_number   VARCHAR(20) NOT NULL UNIQUE,
  account_password VARCHAR(100) NOT NULL,
  account_type_id  INTEGER     NOT NULL REFERENCES Account_type(account_type_id) ON DELETE CASCADE,
  account_is_verified BOOLEAN DEFAULT FALSE,
  sso_user_id      VARCHAR(100)
);

CREATE TABLE Notifications (
  account_id         INTEGER NOT NULL REFERENCES Account(account_id) ON DELETE CASCADE,
  notification_id    SERIAL PRIMARY KEY,
  notification_text  TEXT NOT NULL,
  notification_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sender_account_id INTEGER REFERENCES Account(account_id) ON DELETE SET NULL,
  is_read            BOOLEAN DEFAULT FALSE
);

-- Company table
CREATE TABLE Company (
  company_id   SERIAL      PRIMARY KEY,
  company_name VARCHAR(100) NOT NULL,
  company_email VARCHAR(100) NOT NULL UNIQUE,
  company_rating NUMERIC(3, 2) DEFAULT 0.00,
  company_phone VARCHAR(20),
  company_website VARCHAR(100),
  company_description TEXT,
  company_logo BYTEA,
  address_id   INTEGER     NOT NULL REFERENCES Address(address_id) ON DELETE CASCADE
);

-- Employee table
CREATE TABLE Employee (
  employee_id   SERIAL      PRIMARY KEY,
  person_id     INTEGER     NOT NULL REFERENCES Person(person_id) ON DELETE CASCADE,
  employee_photo BYTEA,
  account_id    INTEGER     NOT NULL REFERENCES Account(account_id) ON DELETE CASCADE,
  company_id    INTEGER     REFERENCES Company(company_id) ON DELETE CASCADE,
  position_name VARCHAR(100)
);

-- Job_seeker table
CREATE TABLE Job_seeker (
  job_seeker_id SERIAL PRIMARY KEY,
  person_id     INTEGER NOT NULL REFERENCES Person(person_id) ON DELETE CASCADE,
  account_id    INTEGER NOT NULL REFERENCES Account(account_id) ON DELETE CASCADE
);

-- Job_type table
CREATE TABLE Job_type (
  job_type_id   SERIAL      PRIMARY KEY,
  job_type_name VARCHAR(50) NOT NULL
);

-- Job_category table
CREATE TABLE Job_category (
  job_category_id   SERIAL      PRIMARY KEY,
  job_category_name VARCHAR(50) NOT NULL
);

-- Job table
CREATE TABLE Job (
  job_id          SERIAL      PRIMARY KEY,
  company_id      INTEGER     NOT NULL REFERENCES Company(company_id) ON DELETE CASCADE,
  job_name        VARCHAR(100) NOT NULL,
  job_description TEXT,
  job_location   VARCHAR(100),
  job_quantity     INTEGER DEFAULT 1,
  job_requirements TEXT,
  job_benefits    TEXT,
  job_type_id     INTEGER     NOT NULL REFERENCES Job_type(job_type_id) ON DELETE CASCADE,
  job_salary      NUMERIC(10, 2),
  job_time        VARCHAR(50),
  job_rating      NUMERIC(3, 2) DEFAULT 0.00,
  job_posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  job_hiring_date TIMESTAMP,
  job_closing_date TIMESTAMP,
  job_is_active   BOOLEAN DEFAULT TRUE
);

-- Job_Category_List table - to link jobs with their categories
CREATE TABLE Job_Category_List (
  job_id          INTEGER NOT NULL REFERENCES Job(job_id) ON DELETE CASCADE,
  job_category_id INTEGER NOT NULL REFERENCES Job_category(job_category_id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, job_category_id)
);

-- Job Requests table - to store applications from job seekers (renamed from Job_applications)
CREATE TABLE Job_requests (
  request_id       SERIAL      PRIMARY KEY,
  job_id           INTEGER     NOT NULL REFERENCES Job(job_id) ON DELETE CASCADE,
  job_seeker_id    INTEGER     NOT NULL REFERENCES Job_seeker(job_seeker_id) ON DELETE CASCADE,
  request_date     TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  request_status   VARCHAR(20) DEFAULT 'pending',
  cover_letter     TEXT,
  employee_response TEXT,
  response_date    TIMESTAMP,
  UNIQUE(job_id, job_seeker_id)
);

-- Saved Jobs table - to store jobs saved by job seekers
CREATE TABLE Saved_jobs (
  saved_job_id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES Job(job_id) ON DELETE CASCADE,
  job_seeker_id INTEGER NOT NULL REFERENCES Job_seeker(job_seeker_id) ON DELETE CASCADE,
  saved_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, job_seeker_id)
);

-- Insert data for categories and types
INSERT INTO Account_type (account_type_id, account_type_name) 
VALUES (1, 'Company'), (2, 'Job Seeker') 
ON CONFLICT (account_type_id) DO NOTHING;

INSERT INTO Nationality (nationality_name) 
VALUES ('Filipino'), ('American'), ('British'), ('Chinese'), ('Japanese'), ('Korean')
ON CONFLICT (nationality_name) DO NOTHING;

-- Jobseeker preference table - to store preferences of job seekers for algorithmic matching
CREATE TABLE Jobseeker_preference(
  person_id INTEGER NOT NULL REFERENCES Person(person_id) ON DELETE CASCADE,
  preferred_job_category_id INTEGER NOT NULL REFERENCES Job_category(job_category_id) ON DELETE CASCADE
);

INSERT INTO Job_category (job_category_name) VALUES
  ('Information Technology'),
  ('Information Systems'),
  ('Software Development'),
  ('Data Science'),
  ('Cybersecurity'),
  ('Web Development'),
  ('Mobile Development'),
  ('Network Engineering'),
  ('Cloud Computing'),
  ('Artificial Intelligence'),
  ('Machine Learning'),
  ('Business Intelligence'),
  ('Project Management'),
  ('Quality Assurance'),
  ('DevOps'),
  ('Game Development'),
  ('Graphic Design'),
  ('Content Creation'),
  ('Digital Marketing'),
  ('E-commerce Management'),
  ('Human Resources Management'),
  ('Legal Services'),
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

  -- Namsung sample Company
INSERT INTO Address (premise_name, street_name, barangay_name, city_name) VALUES
  ('Namsung Tower', 'Rizal St', 'Poblacion District', 'Davao City');

INSERT INTO Company (company_name, company_email, company_phone, company_website, company_description, address_id) VALUES
  ('Namsung Corporation', 'contact@namsung.com', '09123456789', 'www.namsung.com', 'Leading electronics manufacturer', 
  (SELECT address_id FROM Address WHERE premise_name = 'Namsung Tower'));

-- Pear sample Company
INSERT INTO Address (premise_name, street_name, barangay_name, city_name) VALUES
  ('Pear HQ', 'Innovation Ave', 'Tech District', 'Cebu City');

INSERT INTO Company (company_name, company_email, company_phone, company_website, company_description, address_id) VALUES
  ('Pear Technologies', 'info@peartech.com', '09234567890', 'www.peartech.com', 'Innovative software solutions provider', 
  (SELECT address_id FROM Address WHERE premise_name = 'Pear HQ'));

-- AirTruck sample Company
INSERT INTO Address (premise_name, street_name, barangay_name, city_name) VALUES
  ('AirTruck Logistics Center', 'Cargo St', 'Industrial Zone', 'Manila');

INSERT INTO Company (company_name, company_email, company_phone, company_website, company_description, address_id) VALUES
  ('AirTruck Logistics', 'support@airtruck.com', '09345678901', 'www.airtruck.com', 'Reliable logistics and transportation services', 
  (SELECT address_id FROM Address WHERE premise_name = 'AirTruck Logistics Center'));

-- Sample job postings for Namsung Corporation
INSERT INTO Job (company_id, job_name, job_description, job_location, job_type_id, job_salary, job_quantity, job_requirements, job_benefits) VALUES
  ((SELECT company_id FROM Company WHERE company_name = 'Namsung Corporation'), 
   'Software Engineer', 
   'Develop and maintain software applications for our electronics products.',
   'Davao City',
   1, -- Full Time
   45000.00,
   2,
   'Bachelor''s degree in Computer Science or related field. 2+ years experience in software development.',
   'Health insurance, 13th month pay, performance bonus, training opportunities'),
  
  ((SELECT company_id FROM Company WHERE company_name = 'Namsung Corporation'), 
   'Quality Assurance Specialist', 
   'Ensure product quality meets company standards through testing and analysis.',
   'Davao City',
   1, -- Full Time
   35000.00,
   1,
   'Bachelor''s degree in Engineering or related field. Experience in quality control.',
   'Health insurance, 13th month pay, overtime pay');

-- Sample job postings for Pear Technologies
INSERT INTO Job (company_id, job_name, job_description, job_location, job_type_id, job_salary, job_quantity, job_requirements, job_benefits) VALUES
  ((SELECT company_id FROM Company WHERE company_name = 'Pear Technologies'), 
   'Full Stack Developer', 
   'Build modern web applications using latest technologies.',
   'Cebu City',
   1, -- Full Time
   55000.00,
   3,
   'Bachelor''s degree in Computer Science. Experience with React, Node.js, and databases.',
   'Flexible working hours, health insurance, stock options, latest equipment'),
  
  ((SELECT company_id FROM Company WHERE company_name = 'Pear Technologies'), 
   'UI/UX Designer', 
   'Design beautiful and intuitive user interfaces for our software products.',
   'Cebu City',
   1, -- Full Time
   40000.00,
   1,
   'Bachelor''s degree in Design or related field. Portfolio of design work required.',
   'Creative workspace, design tools provided, health insurance');

-- Sample job postings for AirTruck Logistics
INSERT INTO Job (company_id, job_name, job_description, job_location, job_type_id, job_salary, job_quantity, job_requirements, job_benefits) VALUES
  ((SELECT company_id FROM Company WHERE company_name = 'AirTruck Logistics'), 
   'Logistics Coordinator', 
   'Coordinate shipments and manage logistics operations.',
   'Manila',
   1, -- Full Time
   30000.00,
   2,
   'Bachelor''s degree preferred. Experience in logistics or supply chain management.',
   'Transportation allowance, health insurance, 13th month pay'),
  
  ((SELECT company_id FROM Company WHERE company_name = 'AirTruck Logistics'), 
   'Truck Driver', 
   'Safely transport goods to various destinations.',
   'Manila',
   1, -- Full Time
   25000.00,
   5,
   'Valid professional driver''s license. Clean driving record. 2+ years experience.',
   'Vehicle maintenance covered, overtime pay, health insurance');

-- Link jobs with categories
INSERT INTO Job_Category_List (job_id, job_category_id) VALUES
  -- Namsung jobs
  ((SELECT job_id FROM Job WHERE job_name = 'Software Engineer' AND company_id = (SELECT company_id FROM Company WHERE company_name = 'Namsung Corporation')), 
   (SELECT job_category_id FROM Job_category WHERE job_category_name = 'Software Development')),
  ((SELECT job_id FROM Job WHERE job_name = 'Quality Assurance Specialist' AND company_id = (SELECT company_id FROM Company WHERE company_name = 'Namsung Corporation')), 
   (SELECT job_category_id FROM Job_category WHERE job_category_name = 'Quality Assurance')),
  
  -- Pear jobs
  ((SELECT job_id FROM Job WHERE job_name = 'Full Stack Developer' AND company_id = (SELECT company_id FROM Company WHERE company_name = 'Pear Technologies')), 
   (SELECT job_category_id FROM Job_category WHERE job_category_name = 'Web Development')),
  ((SELECT job_id FROM Job WHERE job_name = 'UI/UX Designer' AND company_id = (SELECT company_id FROM Company WHERE company_name = 'Pear Technologies')), 
   (SELECT job_category_id FROM Job_category WHERE job_category_name = 'Graphic Design')),
  
  -- AirTruck jobs - using existing categories or closest matches
  ((SELECT job_id FROM Job WHERE job_name = 'Logistics Coordinator' AND company_id = (SELECT company_id FROM Company WHERE company_name = 'AirTruck Logistics')), 
   (SELECT job_category_id FROM Job_category WHERE job_category_name = 'Project Management')),
  ((SELECT job_id FROM Job WHERE job_name = 'Truck Driver' AND company_id = (SELECT company_id FROM Company WHERE company_name = 'AirTruck Logistics')), 
   (SELECT job_category_id FROM Job_category WHERE job_category_name = 'Sales')); -- Using Sales as closest match for now
