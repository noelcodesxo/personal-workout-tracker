// ── Domain types (aligned to server/data/models/table_models.py) ──────────────

export type WorkoutType = "pull" | "push" | "legs" | "cardio" | "core";

// Exercise
// Note: the API intentionally does not expose id or active — name is the identifier.
// GET /exercise/ returns active exercises only.
export interface Exercise {
  name: string;
}

// Routine
// Note: field name is plural "durations" — matches the server model exactly.
export interface PlannedSet {
  planned_weight?: number | null;
  planned_reps?: number | null;
  planned_durations_in_seconds?: number | null;
}

export interface RoutineExercise {
  name: string;
  planned_sets: PlannedSet[];
}

export interface Routine {
  name: string;
  notes: string;
  workout_type: WorkoutType;
  routine_exercises: RoutineExercise[];
}

// Same shape for create and update (PUT matches by name, name cannot be changed via PUT).
export interface RoutinePayload {
  name: string;
  notes?: string;
  workout_type: WorkoutType;
  routine_exercises: RoutineExercise[];
}

// Workout — aligned to server/data/models/workout.py
export interface CompletedSetEntry {
  weight_in_lbs: number;
  rep_count: number;
  duration_in_seconds: number;
  notes: string;
}

export interface ExerciseEntry {
  name: string;
  completed_sets: CompletedSetEntry[];
}

export interface Workout {
  id: number;
  user_id: number;
  workout_type: WorkoutType;
  workout_start_time: string;
  workout_end_time: string | null;
  routine_id: number | null;
  exercise_entries: ExerciseEntry[];
}

export interface CreateWorkoutRequest {
  workout_type: WorkoutType;
  user_id: number;
  routine_id?: number | null;
}

export interface LogWorkoutRequest {
  workout_end_time?: string | null;
  exercise_entries: ExerciseEntry[];
}

// ── API error shape ────────────────────────────────────────────────────────────

export interface ApiFieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors: ApiFieldError[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message = "Network request failed. Check your connection and try again.") {
    super(message);
    this.name = "NetworkError";
  }
}
