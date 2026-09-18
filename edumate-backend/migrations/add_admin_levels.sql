-- Admin hierarchy migration. Apply once to an existing EduMate database.
ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS admin_level INT NOT NULL DEFAULT 2;

UPDATE admins
SET admin_level = 1,
    email = 'kaviwijesekare@gmail.com'
WHERE admin_id = 2;
