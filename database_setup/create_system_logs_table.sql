-- SQL Script to create system_logs table
-- Run this in your MySQL database to enable system logging

CREATE TABLE IF NOT EXISTS `system_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `level` varchar(50) NOT NULL DEFAULT 'INFO' COMMENT 'INFO, WARNING, ERROR, CRITICAL',
  `user_email` varchar(255) DEFAULT NULL COMMENT 'Email of the user performing the action',
  `user_name` varchar(255) DEFAULT NULL COMMENT 'Full name of the user',
  `user_role` varchar(50) DEFAULT NULL COMMENT 'Admin, Student, Tutor, System',
  `action` varchar(255) NOT NULL COMMENT 'Description of the action',
  `module` varchar(100) DEFAULT NULL COMMENT 'Auth, Course, Skill, UserManagement, etc.',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'User IP address',
  `additional_data` json DEFAULT NULL COMMENT 'Extra details in JSON format',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_level` (`level`),
  KEY `idx_user_email` (`user_email`),
  KEY `idx_module` (`module`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
