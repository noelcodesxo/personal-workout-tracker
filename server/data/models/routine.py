from sqlmodel import SQLModel
from data.models.table_models import WorkoutType
from data.models.planned_set import PlannedSetRead, PlannedSetWrite

# --- Reads ------------------------------------------------------------------

class RoutineExerciseRead(SQLModel):
    name: str
    planned_sets: list[PlannedSetRead] = []

class RoutineRead(SQLModel):
    name: str
    notes: str = ""
    workout_type: WorkoutType
    routine_exercises: list[RoutineExerciseRead]

# --- Writes -----------------------------------------------------------------

class RoutineExerciseWrite(SQLModel):
    name: str
    planned_sets: list[PlannedSetWrite] = []

class RoutineWrite(SQLModel):
    name: str
    notes: str = ""
    workout_type: WorkoutType
    routine_exercises: list[RoutineExerciseWrite]
