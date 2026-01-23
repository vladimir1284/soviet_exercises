-- FlexFit Database Schema
-- Cloudflare D1 (SQLite)

-- Users table (linked to Clerk)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  locale TEXT DEFAULT 'es',
  theme TEXT DEFAULT 'system',
  created_at DATETIME DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at DATETIME DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Exercises configured by user
CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT,
  icon TEXT DEFAULT '💪',
  color TEXT DEFAULT '#6366f1',
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Training cycles (each recalibration starts a new cycle)
CREATE TABLE IF NOT EXISTS cycles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_id INTEGER NOT NULL,
  max_reps INTEGER NOT NULL,
  reps_per_set INTEGER NOT NULL,
  sets_per_day INTEGER DEFAULT 10,
  days_per_week INTEGER DEFAULT 5,
  duration_weeks INTEGER DEFAULT 2,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active INTEGER DEFAULT 1,
  notes TEXT,
  created_at DATETIME DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- Individual sets logged
CREATE TABLE IF NOT EXISTS sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cycle_id INTEGER NOT NULL,
  reps_completed INTEGER NOT NULL,
  completed_at DATETIME NOT NULL,
  edited_at DATETIME,
  day_number INTEGER,
  set_number INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (cycle_id) REFERENCES cycles(id) ON DELETE CASCADE
);

-- Exercise metrics definitions
CREATE TABLE IF NOT EXISTS exercise_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_id INTEGER NOT NULL,
  label TEXT NOT NULL,
  unit TEXT,
  created_at DATETIME DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- Values for metrics recorded in each cycle
CREATE TABLE IF NOT EXISTS cycle_metric_values (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cycle_id INTEGER NOT NULL,
  metric_id INTEGER NOT NULL,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (cycle_id) REFERENCES cycles(id) ON DELETE CASCADE,
  FOREIGN KEY (metric_id) REFERENCES exercise_metrics(id) ON DELETE CASCADE
);

-- User settings/preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  default_sets_per_day INTEGER DEFAULT 10,
  default_days_per_week INTEGER DEFAULT 5,
  default_cycle_weeks INTEGER DEFAULT 2,
  rest_days TEXT DEFAULT '[]',
  notification_enabled INTEGER DEFAULT 1,
  notification_time TEXT DEFAULT '09:00',
  created_at DATETIME DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at DATETIME DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_exercises_user ON exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_cycles_exercise ON cycles(exercise_id);
CREATE INDEX IF NOT EXISTS idx_cycles_active ON cycles(is_active);
CREATE INDEX IF NOT EXISTS idx_sets_cycle ON sets(cycle_id);
CREATE INDEX IF NOT EXISTS idx_sets_completed ON sets(completed_at);
CREATE INDEX IF NOT EXISTS idx_metrics_exercise ON exercise_metrics(exercise_id);
CREATE INDEX IF NOT EXISTS idx_metric_values_cycle ON cycle_metric_values(cycle_id);

-- Trigger to update updated_at
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_settings_timestamp 
AFTER UPDATE ON user_settings
BEGIN
  UPDATE user_settings SET updated_at = STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;
