-- =============================================================================
-- SRIT Alumni Website - Complete MySQL Database Schema
-- Database: alumni_db
-- =============================================================================

CREATE DATABASE IF NOT EXISTS alumni_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alumni_db;

-- -----------------------------------------------------------------------------
-- Table: users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL, -- Nullable for OAuth accounts
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    google_id VARCHAR(255) NULL UNIQUE,
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'local',
    phone VARCHAR(20) NULL,
    department VARCHAR(100) NULL,
    batch_year INT NULL,
    current_company VARCHAR(255) NULL,
    job_title VARCHAR(255) NULL,
    bio TEXT NULL,
    photo_url VARCHAR(500) NULL,
    INDEX idx_users_role (role),
    INDEX idx_users_google_id (google_id),
    INDEX idx_users_auth_provider (auth_provider)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: events
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    date VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    event_type VARCHAR(20) NOT NULL DEFAULT 'Offline',
    image_url VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_events_date (date),
    INDEX idx_events_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: event_images
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    image_url VARCHAR(500) NULL,
    image_data LONGTEXT NULL,
    INDEX idx_event_images_event_id (event_id),
    CONSTRAINT fk_event_images_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: gallery
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NULL,
    uploaded_by VARCHAR(255) NULL,
    image_url VARCHAR(500) NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_gallery_uploaded_at (uploaded_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: gallery_images
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gallery_item_id INT NOT NULL,
    image_data LONGTEXT NOT NULL,
    INDEX idx_gallery_images_item_id (gallery_item_id),
    CONSTRAINT fk_gallery_images_item FOREIGN KEY (gallery_item_id) REFERENCES gallery (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: jobs
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Table: admin_otps (Administrator Registration Verification)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_admin_otps_email (email),
    INDEX idx_admin_otps_code (otp_code),
    INDEX idx_admin_otps_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

