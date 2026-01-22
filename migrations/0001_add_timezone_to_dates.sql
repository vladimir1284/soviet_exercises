-- Migration: Add timezone to dates and update triggers

-- 1. Update existing data to ISO 8601 with Z
UPDATE users SET 
  created_at = CASE WHEN created_at NOT LIKE '%Z' THEN REPLACE(created_at, ' ', 'T') || 'Z' ELSE created_at END,
  updated_at = CASE WHEN updated_at NOT LIKE '%Z' THEN REPLACE(updated_at, ' ', 'T') || 'Z' ELSE updated_at END;

UPDATE exercises SET 
  created_at = CASE WHEN created_at NOT LIKE '%Z' THEN REPLACE(created_at, ' ', 'T') || 'Z' ELSE created_at END;

UPDATE cycles SET 
  start_date = CASE WHEN start_date NOT LIKE '%Z' AND length(start_date) = 10 THEN start_date || 'T00:00:00Z' 
                    WHEN start_date NOT LIKE '%Z' THEN REPLACE(start_date, ' ', 'T') || 'Z' 
                    ELSE start_date END,
  end_date = CASE WHEN end_date IS NOT NULL AND end_date NOT LIKE '%Z' AND length(end_date) = 10 THEN end_date || 'T00:00:00Z' 
                  WHEN end_date IS NOT NULL AND end_date NOT LIKE '%Z' THEN REPLACE(end_date, ' ', 'T') || 'Z' 
                  ELSE end_date END,
  created_at = CASE WHEN created_at NOT LIKE '%Z' THEN REPLACE(created_at, ' ', 'T') || 'Z' ELSE created_at END;

UPDATE sets SET 
  completed_at = CASE WHEN completed_at NOT LIKE '%Z' THEN REPLACE(completed_at, ' ', 'T') || 'Z' ELSE completed_at END,
  edited_at = CASE WHEN edited_at IS NOT NULL AND edited_at NOT LIKE '%Z' THEN REPLACE(edited_at, ' ', 'T') || 'Z' ELSE edited_at END,
  created_at = CASE WHEN created_at NOT LIKE '%Z' THEN REPLACE(created_at, ' ', 'T') || 'Z' ELSE created_at END;

UPDATE user_settings SET 
  created_at = CASE WHEN created_at NOT LIKE '%Z' THEN REPLACE(created_at, ' ', 'T') || 'Z' ELSE created_at END,
  updated_at = CASE WHEN updated_at NOT LIKE '%Z' THEN REPLACE(updated_at, ' ', 'T') || 'Z' ELSE updated_at END;

-- 2. Update triggers to use ISO 8601 with Z
DROP TRIGGER IF EXISTS update_users_timestamp;
CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

DROP TRIGGER IF EXISTS update_settings_timestamp;
CREATE TRIGGER update_settings_timestamp 
AFTER UPDATE ON user_settings
BEGIN
  UPDATE user_settings SET updated_at = STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;
