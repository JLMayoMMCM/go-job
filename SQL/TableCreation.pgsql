-- SQL DOCUMENTATION BY JONATHAN LANCE MAYO --
-- This script creates the necessary tables for a job portal system.

-- Drop existing tables if they exist to avoid conflicts with existing data
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
  resume       BYTEA,
  resume_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
  company_photo BYTEA,
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