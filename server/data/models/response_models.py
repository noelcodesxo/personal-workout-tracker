from sqlmodel import SQLModel
from typing import List
from data.models.table_models import WorkoutType

class ExerciseRead(SQLModel):
    name: str

class RoutineRead(SQLModel):
    name: str
    notes: str = ""
    workout_type: WorkoutType
    routine_exercises: List[ExerciseRead]

