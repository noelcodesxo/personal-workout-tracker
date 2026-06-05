from fastapi import APIRouter
from server.data.models.models import ExerciseEntry

router = APIRouter(prefix="/exercise-entry")

@router.post("/")
def post_exercise_entry(entry: ExerciseEntry):
    return "post"

@router.get("/workout/{workout_id}")
def get_exercise_entries_by_workout(workout_id: int):
    return str.format("get_workout, {}", workout_id)

@router.get("/exercise/{exercise_id}")
def get_exercise_entries_by_exercise(exercise_id: int):
    return str.format("get_exercise, {}", exercise_id)

@router.put("/{id}")
def put_exercise_entry(id: int):
    return str.format("put, {}", id)

@router.delete("/{id}")
def delete_exercise_entry(id: int):
    return str.format("delete, {}", id)
