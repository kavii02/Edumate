CREATE TABLE IF NOT EXISTS announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    course_id INT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_announcements_tutor
        FOREIGN KEY (tutor_id) REFERENCES tutors(tutor_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_announcements_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id)
        ON DELETE SET NULL,
    INDEX idx_announcements_tutor_created (tutor_id, created_at),
    INDEX idx_announcements_course_created (course_id, created_at)
);