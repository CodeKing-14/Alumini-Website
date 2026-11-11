-- =============================================================================
-- SRIT Alumni Website - Jobs Table Schema for MySQL
-- Database: alumni_db
-- =============================================================================
-- This table stores all job opportunities posted by administrators for SRIT
-- alumni and students.
-- =============================================================================

USE alumni_db;

CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    job_type VARCHAR(50) NOT NULL DEFAULT 'Full-time',
    experience_level VARCHAR(50) NULL,
    salary_range VARCHAR(100) NULL,
    description TEXT NOT NULL,
    requirements TEXT NULL,
    application_email VARCHAR(255) NOT NULL DEFAULT 'sritalumni@sritcbe',
    deadline VARCHAR(100) NULL,
    posted_by VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_jobs_created_at (created_at DESC),
    INDEX idx_jobs_job_type (job_type),
    INDEX idx_jobs_company (company)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Sample Initial Jobs (Seed Data)
-- =============================================================================

INSERT IGNORE INTO jobs (id, title, company, location, job_type, experience_level, salary_range, description, requirements, application_email, deadline, posted_by)
VALUES 
(
    1,
    'Software Development Engineer (SDE-1)',
    'Zoho Corporation',
    'Chennai / Coimbatore, India',
    'Full-time',
    '0 - 2 Years',
    '₹6.5 - ₹9.5 LPA',
    'We are seeking high-caliber software engineers from SRIT to join our core product engineering team. You will build and scale reliable cloud applications used by millions of global users.',
    'Proficiency in Java, Python, or C++. Strong understanding of data structures, algorithms, and SQL database design.',
    'sritalumni@sritcbe',
    'Open until filled',
    'SRIT Alumni Cell'
),
(
    2,
    'Full Stack React & Python Developer',
    'Cognizant Technology Solutions',
    'Coimbatore (Hybrid), India',
    'Full-time',
    '1 - 3 Years',
    '₹7.0 - ₹11.0 LPA',
    'Work alongside cross-functional teams developing next-generation web applications. Opportunity specifically open for SRIT alumni looking to advance in modern web technologies.',
    'Hands-on experience with React, TypeScript, FastAPI/Node.js, MySQL, and REST APIs.',
    'sritalumni@sritcbe',
    '30 Nov 2026',
    'SRIT Alumni Cell'
),
(
    3,
    'Associate Cloud & DevOps Engineer',
    'Amazon Web Services (AWS)',
    'Bengaluru, India',
    'Full-time',
    'Fresher / 0-2 Years',
    '₹12.0 - ₹16.0 LPA',
    'Support infrastructure automation, containerized deployments, and cloud scalability across mission-critical services.',
    'Knowledge of AWS services (EC2, S3, RDS), Docker, CI/CD pipelines, and Linux administration.',
    'sritalumni@sritcbe',
    'Rolling Application',
    'SRIT Alumni Cell'
);

