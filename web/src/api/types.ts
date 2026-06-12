// ── Domain types (aligned to server/data/models/table_models.py) ──────────────

export type WorkoutType = "pull" | "push" | "legs" | "cardio" | "core";

// Exercise
export interface Exercise {
  id: number;
  name: string;
  active: boolean;
}

export interface CreateExerciseRequest {
  name: string;
}

export interface UpdateExerciseRequest {
  name?: string;
  active?: boolean;
}

// Routine
export interface PlannedSet {
  id: number;
  routine_exercise_id: number;
  planned_weight?: number | null;
  planned_reps?: number | null;
  planned_duration_in_seconds?: number | null;
}

export interface CreatePlannedSetRequest {
  planned_weight?: number | null;
  planned_reps?: number | null;
  planned_duration_in_seconds?: number | null;
}

export interface RoutineExercise {
  id: number;
  routine_id: number;
  exercise_id: number;
  exercise?: Exercise;
  planned_sets: PlannedSet[];
}

export interface Routine {
  id: number;
  name: string;
  workout_type: WorkoutType;
  notes?: string | null;
  active: boolean;
  routine_exercises: RoutineExercise[];
}

export interface CreateRoutineRequest {
  name: string;
  workout_type: WorkoutType;
  notes?: string;
  exercise_ids?: number[];
  planned_sets?: CreatePlannedSetRequest[][];
}

export interface UpdateRoutineRequest {
  name?: string;
  workout_type?: WorkoutType;
  notes?: string | null;
  active?: boolean;
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
