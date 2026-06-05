from datetime import date
from enum import Enum
from pydantic.dataclasses import dataclass # with this I have the methods from the original @dataclass and validation/serialization

@dataclass
class User():
    name: str
    dob: date

@dataclass
class Exercise():
    name: str

class WorkoutType(str, Enum):
    PULL = "pull"
    PUSH = "push"
    LEGS = "legs"
    CARDIO = "cardio"
    CORE = "core"

@dataclass
class Routine():
    # Requires arguments have to be above non-required ones.
    name: str
    active: bool
    workout_type: WorkoutType
    notes: str = ""

@dataclass
class Workout():
    workout_type: WorkoutType
    user: User
    routine: Routine

@dataclass 
class ExerciseEntry():
    workout: Workout
    exercise: Exercise

@dataclass 
class CompletedSetEntry():
    weight_in_lbs: int
    rep_count: int
    duration_in_seconds: int
    exercise_entry: ExerciseEntry
    notes: str

@dataclass
class RoutineExercise():
    routine: Routine
    exercise: Exercise

@dataclass
class PlannedSets():
    planned_weight: int
    planned_reps: int
    planned_durations_in_seconds: int
    routine_exercise_id: int