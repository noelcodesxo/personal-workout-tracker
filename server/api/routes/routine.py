from fastapi import APIRouter
from server.data.models.models import WorkoutType

router = APIRouter(prefix="/routine")

@router.post("/")
def post_routine():
    return "post"

@router.put("/{id}")
def put_routine(id: int):
    return str.format("put, {}", id)

@router.get("/name/{name}")
def get_routine_by_name(name: str):
    return str.format("get_name, {}", name)

@router.get("/type/{routine_type}")
def get_routine_by_type(routine_type: WorkoutType):
    return str.format("get_type, {}", routine_type)

@router.delete("/{id}")
def delete_routine(id: int):
    return str.format("delete, {}", id)
