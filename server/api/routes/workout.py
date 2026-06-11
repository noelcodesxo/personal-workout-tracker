from datetime import datetime
from fastapi import APIRouter
from data import DBClient
from data.models.table_models import WorkoutType
from data.models.workout import WorkoutCreate, WorkoutLogWrite
from data.services.workout_service import WorkoutService

router = APIRouter(prefix="/workout")

db_client = DBClient()
with db_client.get_session() as _session:
    workout_service = WorkoutService(_session)

@router.post("/")
def post_workout(workout: WorkoutCreate):
    return workout_service.create_workout(workout)

@router.put("/{id}")
def put_workout(id: int, workout_log: WorkoutLogWrite):
    return workout_service.log_workout(id, workout_log)

@router.get("/")
def get_all_workouts():
    return workout_service.get_all_workouts()

@router.get("/range")
def get_workouts_by_range(start: datetime, end: datetime):
    return workout_service.get_workouts_by_range(start, end)

@router.get("/type/{workout_type}")
def get_workouts_by_type(workout_type: WorkoutType):
    return workout_service.get_workouts_by_type(workout_type)

@router.get("/{id}")
def get_workout_by_id(id: int):
    return workout_service.get_workout_by_id(id)

@router.delete("/{id}")
def delete_workout(id: int):
    return workout_service.delete_workout(id)
