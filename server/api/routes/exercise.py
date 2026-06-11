from fastapi import APIRouter
from data import DBClient
from data.models.exercise import ExerciseWrite
from data.services.exercise_service import ExerciseService

router = APIRouter(prefix="/exercise")

db_client = DBClient()
with db_client.get_session() as _session:
    exercise_service = ExerciseService(_session)

@router.post("/")
def post_exercise(exercise: ExerciseWrite):
    return exercise_service.create_exercise(exercise.name)

@router.get("/")
def get_all_exercises():
    return exercise_service.get_all_exercises()

@router.put("/{name}")
def put_exercise(name: str, new_name: str):
    return exercise_service.update_exercise(name=name, new_name=new_name)

@router.get("/{name}")
def get_exercise_by_name(name: str):
    return exercise_service.get_exercise_by_name(name)

@router.delete("/{name}")
def delete_exercise(name: str):
    return exercise_service.delete_exercise(name)
