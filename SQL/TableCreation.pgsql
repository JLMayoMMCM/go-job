DROP TABLE IF EXISTS Job_Category_List CASCADE;

DROP TABLE IF EXISTS Job              CASCADE;

DROP TABLE IF EXISTS Job_seeker       CASCADE;


DROP TABLE IF EXISTS Employee         CASCADE;

DROP TABLE IF EXISTS Company          CASCADE;

DROP TABLE IF EXISTS Account          CASCADE;

DROP TABLE IF EXISTS Account_type     CASCADE;

DROP TABLE IF EXISTS Person           CASCADE;

DROP TABLE IF EXISTS Address          CASCADE;

DROP TABLE IF EXISTS Nationality      CASCADE;

DROP TABLE IF EXISTS Job_category     CASCADE;

DROP TABLE IF EXISTS Job_type         CASCADE;

-- Nationality table
CREATE TABLE Nationality (
  nationality_id   INTEGER     PRIMARY KEY,
  nationality_name VARCHAR(24) NOT NULL
);

-- Address table
CREATE TABLE Address (
  address_id    INTEGER       PRIMARY KEY,
  premise_name  VARCHAR(36),
  street_name   VARCHAR(24),
  barangay_name VARCHAR(24),
  city_name     VARCHAR(24)
);

-- Person table
CREATE TABLE Person (
  person_id       INTEGER     PRIMARY KEY,
  first_name      VARCHAR(24) NOT NULL,
  last_name       VARCHAR(24) NOT NULL,
  middle_name     VARCHAR(24),
  address_id      INTEGER     NOT NULL REFERENCES Address(address_id),
  nationality_id  INTEGER     NOT NULL REFERENCES Nationality(nationality_id)
);

-- Account_type table
CREATE TABLE Account_type (
  account_type_id   INTEGER   PRIMARY KEY,
  account_type_name VARCHAR(24) NOT NULL
);

-- Account table
CREATE TABLE Account (
  account_id       INTEGER     PRIMARY KEY,
  account_email    VARCHAR(36) NOT NULL,
  account_username VARCHAR(20) NOT NULL,
  account_number   VARCHAR(20) NOT NULL,
  account_password VARCHAR(24) NOT NULL,
  account_type_id  INTEGER     NOT NULL REFERENCES Account_type(account_type_id),
  sso_user_id      VARCHAR(52)
);

-- Company table
CREATE TABLE Company (
  company_id   INTEGER     PRIMARY KEY,
  company_name VARCHAR(36) NOT NULL,
  address_id   INTEGER     NOT NULL REFERENCES Address(address_id),
  account_id   INTEGER     NOT NULL REFERENCES Account(account_id)
);

-- Employee table
CREATE TABLE Employee (
  employee_id   INTEGER     PRIMARY KEY,
  person_id     INTEGER     NOT NULL REFERENCES Person(person_id),
  account_id    INTEGER     NOT NULL REFERENCES Account(account_id),
  company_id    INTEGER     NOT NULL REFERENCES Company(company_id),
  position_name VARCHAR(36)
);

-- Job_seeker table
CREATE TABLE Job_seeker (
  employee_id INTEGER PRIMARY KEY REFERENCES Employee(employee_id),
  person_id   INTEGER NOT NULL REFERENCES Person(person_id),
  account_id  INTEGER NOT NULL REFERENCES Account(account_id)
);

-- Job_type table
CREATE TABLE Job_type (
  job_type_id   INTEGER   PRIMARY KEY,
  job_type_name VARCHAR(24)   NOT NULL
);

-- Job_category table
CREATE TABLE Job_category (
  job_category_id   INTEGER     PRIMARY KEY,
  job_category_name VARCHAR(24) NOT NULL
);

-- Job table
CREATE TABLE Job (
  job_id        INTEGER     PRIMARY KEY,
  company_id    INTEGER     NOT NULL REFERENCES Company(company_id),
  job_name      VARCHAR(24) NOT NULL,
  job_description TEXT,
  job_type_id   INTEGER     NOT NULL REFERENCES Job_type(job_type_id),
  job_salary    VARCHAR(28),
  job_time      VARCHAR(16)
);

-- Junction table: Job ↔ Job_category
CREATE TABLE Job_Category_List (
  job_id          INTEGER NOT NULL REFERENCES Job(job_id),
  job_category_id INTEGER NOT NULL REFERENCES Job_category(job_category_id),
  PRIMARY KEY (job_id, job_category_id)
);

