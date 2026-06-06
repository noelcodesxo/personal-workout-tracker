from datetime import date, datetime
from enum import Enum
from sqlmodel import SQLModel, Field

# How to use this? It's not a table
class WorkoutType(str, Enum):
    PULL = "pull"
    PUSH = "push"
    LEGS = "legs"
    CARDIO = "cardio"
    CORE = "core"

class User(SQLModel, table=True):
    __tablename__ = "users"
    id: int | None = Field(default=None, primary_key=True)
    name: str
    dob: date


class Exercise(SQLModel, table=True):
    __tablename__ = "exercises"
    id: int | None = Field(default=None, primary_key=True)
    name: str


class Routine(SQLModel, table=True):
    __tablename__ = "routines"
    id: int | None = Field(default=None, primary_key=True)
    name: str
    notes: str = ""
    active: bool = True
    workout_type: WorkoutType


class Workout(SQLModel, table=True):
    __tablename__ = "workouts"
    id: int | None = Field(default=None, primary_key=True)
    workout_type: WorkoutType
    workout_start_time: datetime = Field(default_factory=datetime.utcnow)
    workout_end_time: datetime = None
    user_id: int = Field(foreign_key="users.id")
    routine_id: int | None = Field(default=None, foreign_key="routines.id")


class ExerciseEntry(SQLModel, table=True):
    __tablename__ = "exercise_entries"
    id: int | None = Field(default=None, primary_key=True)
    workout_id: int = Field(foreign_key="workouts.id")
    exercise_id: int = Field(foreign_key="exercises.id")


class CompletedSetEntry(SQLModel, table=True):
    __tablename__ = "completed_set_entries"
    id: int | None = Field(default=None, primary_key=True)
    weight_in_lbs: int = 0
    rep_count: int = 0
    duration_in_seconds: int = 0
    exercise_entry_id: int = Field(foreign_key="exercise_entries.id")
    notes: str = ""


class RoutineExercise(SQLModel, table=True):
    __tablename__ = "routine_exercises"
    id: int | None = Field(default=None, primary_key=True)
    routine_id: int = Field(foreign_key="routines.id")
    exercise_id: int = Field(foreign_key="exercises.id")


class PlannedSet(SQLModel, table=True):
    __tablename__ = "planned_sets"
    id: int | None = Field(default=None, primary_key=True)
    planned_weight: int = None
    planned_reps: int = None
    planned_durations_in_seconds: int = None
    routine_exercise_id: int = Field(foreign_key="routine_exercises.id")
