-- =================================================================================
-- SovietFit Seeding Script (No Temp Tables Version)
-- Usage: Hardcoded for User ID 5 (Modify '5' in the queries below if needed)
-- Run with: wrangler d1 execute <DATABASE_NAME> --remote --file=seed_data.sql
-- =================================================================================

-- BLOCK 1: Exercise 1 (Siberian Burpees) + Cycle + Sets
-- ---------------------------------------------------------------------------------

-- 1.1 Insert Exercise
INSERT INTO exercises (user_id, name, name_en, icon, color, sort_order)
VALUES (5, 'Siberian Burpees', 'Siberian Burpees', '🔥', '#ef4444', 1);

-- 1.2 Insert Cycle for latest exercise (Burpees)
INSERT INTO cycles (
    exercise_id, 
    max_reps, 
    reps_per_set, 
    sets_per_day, 
    days_per_week, 
    duration_weeks, 
    start_date, 
    is_active
)
VALUES (
    last_insert_rowid(), -- ID of the exercise just inserted
    20, 
    12, 
    5, 
    5, 
    4, 
    DATE('now', '-28 days'), 
    1
);

-- 1.3 Insert Metric Definitions for Burpees
-- We need to find the exercise ID again. Since we just inserted a cycle, last_insert_rowid is the cycle.
-- This is tricky without variables. 
-- However, we can just insert the metric using subquery for the exercise id if needed, 
-- or do it BEFORE the cycle.
-- Let's change order slightly: Ex -> Metric -> Cycle -> Sets.

-- (Retrying order for Block 1 to handle dependencies cleanly without vars)
-- Actually, let's stick to the current flow but be careful. 
-- We just inserted Cycle. last_insert_rowid() is Cycle ID.
-- We can Insert SETS now easily.

-- 1.3 Insert Sets for Cycle 1
INSERT INTO sets (cycle_id, reps_completed, completed_at, day_number, set_number, notes)
WITH RECURSIVE 
  vars(cid, reps_target, sets_target) AS (
    SELECT last_insert_rowid(), 12, 5
  ),
  days(day_offset) AS (
    SELECT 0
    UNION ALL
    SELECT day_offset + 1 FROM days WHERE day_offset < 28
  ),
  dates AS (
    SELECT day_offset, DATE('now', '-' || day_offset || ' days') as cycle_date FROM days
  ),
  target_sets AS (
    SELECT 
       v.cid, v.reps_target, v.sets_target, d.cycle_date, s.seq as set_num
    FROM vars v
    CROSS JOIN dates d
    CROSS JOIN (
        WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n < 10)
        SELECT n as seq FROM seq
    ) s
    WHERE s.seq <= v.sets_target
  )
SELECT 
    cid,
    CASE 
        WHEN ABS(RANDOM() % 10) = 0 THEN 0
        WHEN ABS(RANDOM() % 10) <= 2 THEN MAX(1, reps_target - 2)
        ELSE reps_target
    END,
    DATETIME(cycle_date || ' ' || printf('%02d', 8 + ABS(RANDOM() % 12)) || ':' || printf('%02d', ABS(RANDOM() % 60)) || ':00'),
    (JULIANDAY(cycle_date) - JULIANDAY(DATE('now', '-28 days'))) + 1,
    set_num,
    CASE WHEN ABS(RANDOM() % 20) = 0 THEN 'Tough day, comrade.' ELSE NULL END
FROM target_sets
WHERE ABS(RANDOM() % 10) > 1; 

-- 1.4 NOW Insert Metric for Exercise 1
-- We need Exercise ID. It was inserted 2 inserts ago.
-- We can retrieve it by name and user_id to be safe.
INSERT INTO exercise_metrics (exercise_id, label, unit)
SELECT id, 'Weight', 'kg' FROM exercises WHERE name = 'Siberian Burpees' AND user_id = 5 ORDER BY id DESC LIMIT 1;

-- 1.5 Insert Metric Value for Cycle 1
-- We need Cycle ID (from step 1.2) and Metric ID (from step 1.4).
-- Metric ID is last_insert_rowid().
-- Cycle ID we can find by exercise_id.
INSERT INTO cycle_metric_values (cycle_id, metric_id, value)
SELECT 
    c.id,
    last_insert_rowid(),
    '75.5'
FROM cycles c
JOIN exercises e ON c.exercise_id = e.id
WHERE e.name = 'Siberian Burpees' AND e.user_id = 5 
ORDER BY c.id DESC LIMIT 1;


-- BLOCK 2: Exercise 2 (Gulag Dips)
-- ---------------------------------------------------------------------------------

-- 2.1 Insert Exercise
INSERT INTO exercises (user_id, name, name_en, icon, color, sort_order)
VALUES (5, 'Gulag Dips', 'Gulag Dips', '🪑', '#3b82f6', 2);

-- 2.2 Insert Cycle
INSERT INTO cycles (
    exercise_id, max_reps, reps_per_set, sets_per_day, days_per_week, duration_weeks, start_date, is_active
)
VALUES (
    last_insert_rowid(), 10, 6, 3, 6, 4, DATE('now', '-28 days'), 1
);

-- 2.3 Insert Sets
INSERT INTO sets (cycle_id, reps_completed, completed_at, day_number, set_number)
WITH RECURSIVE 
  vars(cid, reps_target, sets_target) AS (
    SELECT last_insert_rowid(), 6, 3
  ),
  days(day_offset) AS (
    SELECT 0
    UNION ALL
    SELECT day_offset + 1 FROM days WHERE day_offset < 28
  ),
  dates AS (
    SELECT day_offset, DATE('now', '-' || day_offset || ' days') as cycle_date FROM days
  ),
  target_sets AS (
    SELECT 
       v.cid, v.reps_target, v.sets_target, d.cycle_date, s.seq as set_num
    FROM vars v
    CROSS JOIN dates d
    CROSS JOIN (
        WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n < 10)
        SELECT n as seq FROM seq
    ) s
    WHERE s.seq <= v.sets_target
  )
SELECT 
    cid,
    CASE WHEN ABS(RANDOM() % 20) = 0 THEN MAX(0, reps_target - 1) ELSE reps_target END,
    DATETIME(cycle_date || ' ' || printf('%02d', 7 + ABS(RANDOM() % 4)) || ':' || printf('%02d', ABS(RANDOM() % 60)) || ':00'),
    (JULIANDAY(cycle_date) - JULIANDAY(DATE('now', '-28 days'))) + 1,
    set_num
FROM target_sets
WHERE STRFTIME('%w', cycle_date) != '0';
