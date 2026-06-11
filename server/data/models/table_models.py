from datetime import date, datetime, timezone
from enum import Enum
from sqlalchemy import Column, DateTime
from sqlmodel import SQLModel, Field, Relationship

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
    name: str = Field(unique=True)
    active: bool = True

class Routine(SQLModel, table=True):
    __tablename__ = "routines"
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True)
    notes: str = ""
    active: bool = True
    workout_type: WorkoutType
    routine_exercises: list["RoutineExercise"] = Relationship(back_populates="routine")

class Workout(SQLModel, table=True):
    __tablename__ = "workouts"
    id: int | None = Field(default=None, primary_key=True)
    workout_type: WorkoutType
    # Start time is owned by the service (set explicitly on create), not the DB.
    workout_start_time: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    # End time is stamped by the service on each log update (now, unless the client passes one).
    workout_end_time: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )
    user_id: int = Field(foreign_key="users.id")
    routine_id: int | None = Field(default=None, foreign_key="routines.id")
    active: bool = True
    exercise_entries: list["ExerciseEntry"] = Relationship(back_populates="workout")

class ExerciseEntry(SQLModel, table=True):
    __tablename__ = "exercise_entries"
    id: int | None = Field(default=None, primary_key=True)
    workout_id: int = Field(foreign_key="workouts.id")
    exercise_id: int = Field(foreign_key="exercises.id")
    workout: Workout = Relationship(back_populates="exercise_entries")
    exercise: Exercise = Relationship()
    completed_sets: list["CompletedSetEntry"] = Relationship(back_populates="exercise_entry")

class CompletedSetEntry(SQLModel, table=True):
    __tablename__ = "completed_set_entries"
    id: int | None = Field(default=None, primary_key=True)
    weight_in_lbs: int = 0
    rep_count: int = 0
    duration_in_seconds: int = 0
    exercise_entry_id: int = Field(foreign_key="exercise_entries.id")
    notes: str = ""
    exercise_entry: ExerciseEntry = Relationship(back_populates="completed_sets")

class RoutineExercise(SQLModel, table=True):
    __tablename__ = "routine_exercises"
    id: int | None = Field(default=None, primary_key=True)
    routine_id: int = Field(foreign_key="routines.id")
    exercise_id: int = Field(foreign_key="exercises.id")
    routine: Routine = Relationship(back_populates="routine_exercises") # I'm choosing to NOT have a ON DELETE CASCASE here in order to preserve history overtime. Can always edit this later.
    exercise: Exercise = Relationship()
    planned_sets: list["PlannedSet"] = Relationship(back_populates="routine_exercise")

class PlannedSet(SQLModel, table=True):
    __tablename__ = "planned_sets"
    id: int | None = Field(default=None, primary_key=True)
    planned_weight: int | None = None
    planned_reps: int | None = None
    planned_durations_in_seconds: int | None = None
    routine_exercise_id: int | None = Field(default=None, foreign_key="routine_exercises.id")
    routine_exercise: RoutineExercise = Relationship(back_populates="planned_sets")
