CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    dob DATE NOT NULL
);

-- IF NOT EXISTS for TYPE is only available in Postgre > v14
CREATE TYPE IF NOT EXISTS workout_types AS ENUM (
    'pull',
    'push',
    'legs',
    'cardio',
    'core'
);

CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS routines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    notes TEXT,
    active BOOL NOT NULL DEFAULT true,
    workout_type workout_types NOT NULL
);

CREATE TABLE IF NOT EXISTS workouts (
    id SERIAL PRIMARY KEY,
    workout_type workout_types NOT NULL,
    workout_start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    workout_end_time TIMESTAMPTZ,
    user_id INTEGER NOT NULL REFERENCES users(id),
    routine_id INTEGER REFERENCES routines(id)
);

CREATE TABLE IF NOT EXISTS exercise_entries (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER NOT NULL REFERENCES workouts(id),
    exercise_id INTEGER NOT NULL REFERENCES exercises(id)
);

CREATE TABLE IF NOT EXISTS completed_set_entries (
    id SERIAL PRIMARY KEY,
    weight_in_lbs INTEGER DEFAULT 0,
    rep_count INTEGER DEFAULT 0,
    duration_in_seconds INTEGER DEFAULT 0,
    exercise_entry_id INTEGER NOT NULL REFERENCES exercise_entries(id),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS routine_exercises (
    id SERIAL PRIMARY KEY,
    routine_id INTEGER NOT NULL REFERENCES routines(id),
    exercise_id INTEGER NOT NULL REFERENCES exercises(id)
);

CREATE TABLE IF NOT EXISTS planned_sets (
    id SERIAL PRIMARY KEY,
    planned_weight INTEGER,
    planned_reps INTEGER,
    planned_durations_in_seconds INTEGER,
    routine_exercise_id  INTEGER NOT NULL REFERENCES routine_exercises(id)
);