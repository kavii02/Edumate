-- Apply once to the existing notifications table before using the role-aware API.
ALTER TABLE notifications ADD COLUMN tutor_id INT NULL;
ALTER TABLE notifications ADD COLUMN recipient_role VARCHAR(20) NOT NULL DEFAULT 'student';
ALTER TABLE notifications ADD COLUMN sender_id INT NULL;
ALTER TABLE notifications ADD COLUMN sender_role VARCHAR(20) NULL;
ALTER TABLE notifications ADD COLUMN title VARCHAR(200) NULL;
ALTER TABLE notifications ADD COLUMN notification_type VARCHAR(50) NOT NULL DEFAULT 'General';
ALTER TABLE notifications ADD COLUMN related_entity_id INT NULL;
ALTER TABLE notifications ADD COLUMN related_entity_type VARCHAR(50) NULL;
ALTER TABLE notifications ADD COLUMN dedupe_key VARCHAR(255) NULL;
CREATE INDEX idx_notifications_student ON notifications (student_id, created_at);
CREATE INDEX idx_notifications_tutor ON notifications (tutor_id, created_at);
CREATE UNIQUE INDEX uq_notifications_dedupe_key ON notifications (dedupe_key);