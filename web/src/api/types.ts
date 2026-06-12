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

// Workout
export interface CompletedSetEntry {
  id: number;
  exercise_entry_id: number;
  weight_in_lbs?: number | null;
  rep_count?: number | null;
  duration_in_seconds?: number | null;
  notes?: string | null;
}

export interface CreateCompletedSetRequest {
  weight_in_lbs?: number | null;
  rep_count?: number | null;
  duration_in_seconds?: number | null;
  notes?: string | null;
}

export interface UpdateCompletedSetRequest {
  weight_in_lbs?: number | null;
  rep_count?: number | null;
  duration_in_seconds?: number | null;
  notes?: string | null;
}

export interface ExerciseEntry {
  id: number;
  workout_id: number;
  exercise_id: number;
  exercise?: Exercise;
  completed_sets: CompletedSetEntry[];
}

export interface Workout {
  id: number;
  user_id: string;
  workout_type: WorkoutType;
  workout_start_time: string;
  workout_end_time?: string | null;
  routine_id?: number | null;
  active: boolean;
  exercise_entries: ExerciseEntry[];
}

export interface CreateWorkoutRequest {
  workout_type: WorkoutType;
  routine_id?: number;
}

export interface UpdateWorkoutRequest {
  workout_type?: WorkoutType;
  workout_start_time?: string;
  workout_end_time?: string | null;
  active?: boolean;
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
