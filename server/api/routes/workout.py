from fastapi import APIRouter
from data.models.table_models import WorkoutType, Workout
router = APIRouter(prefix="/workout")

@router.post("/")
def post_workout(workout: Workout):
    # Save it to db
    return ""

@router.put("/{id}")
def put_workout(id: int):
    return str.format("put, {}", id)

@router.get("/{id}")
def get_workout_by_id(id: int):
    return str.format("get_id, {}", id)

@router.get("/type/{workout_type}")
def get_workout_by_type(workout_type: WorkoutType):
    return str.format("get_type, {}", workout_type)

@router.get("/user/{user_id}")
def get_workout_by_user(user_id: int):
    return str.format("get_user, {}", user_id)

@router.get("/routine/{routine_id}")
def get_workout_by_routine(routine_id: int):
    return str.format("get_routine, {}", routine_id)

@router.delete("/{id}")
def delete_workout(id: int):
    return str.format("delete, {}", id)

