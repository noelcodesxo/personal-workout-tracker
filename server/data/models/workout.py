from datetime import datetime
from sqlmodel import SQLModel
from data.models.table_models import WorkoutType

# --- Reads ------------------------------------------------------------------

class CompletedSetRead(SQLModel):
    weight_in_lbs: int = 0
    rep_count: int = 0
    duration_in_seconds: int = 0
    notes: str = ""

class ExerciseEntryRead(SQLModel):
    name: str
    completed_sets: list[CompletedSetRead] = []

class WorkoutRead(SQLModel):
    # id is kept here: a workout has no other handle to reference it by.
    id: int
    workout_type: WorkoutType
    workout_start_time: datetime
    workout_end_time: datetime | None = None
    user_id: int
    routine_id: int | None = None
    exercise_entries: list[ExerciseEntryRead] = []

# --- Writes -----------------------------------------------------------------

class WorkoutCreate(SQLModel):
    workout_type: WorkoutType
    workout_start_time: datetime | None = None
    user_id: int
    routine_id: int | None = None

class CompletedSetWrite(SQLModel):
    weight_in_lbs: int = 0
    rep_count: int = 0
    duration_in_seconds: int = 0
    notes: str = ""

class ExerciseEntryWrite(SQLModel):
    name: str
    completed_sets: list[CompletedSetWrite] = []

class WorkoutLogWrite(SQLModel):
    # id comes from the path; end time is optional (server auto-stamps when omitted).
    workout_end_time: datetime | None = None
    exercise_entries: list[ExerciseEntryWrite] = []
