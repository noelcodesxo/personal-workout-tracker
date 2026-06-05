from fastapi import APIRouter
from server.data.models.models import Exercise

router = APIRouter(prefix="/exercise")

@router.post("/")
def post_exercise(exercise: Exercise):
    return "post"

@router.put("/{id}")
def put_exercise(id: int):
    return str.format("put, {}", id)

@router.get("/{id}")
def get_exercise_by_id(id: int):
    return str.format("get_id, {}", id)

@router.get("/name/{name}")
def get_exercise_by_name(name: str):
    return str.format("get_name, {}", name)

@router.delete("/{id}")
def delete_exercise(id: int):
    return str.format("delete, {}", id)
