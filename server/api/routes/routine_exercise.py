from fastapi import APIRouter

router = APIRouter(prefix="/routine-exercise")

@router.post("/")
def post_routine_exercise():
    return "post"

@router.get("/routine/{routine_id}")
def get_routine_exercises(routine_id: int):
    return str.format("get_routine, {}", routine_id)

@router.put("/routine/{routine_id}")
def put_routine_exercise(routine_id: int):
    return str.format("put_routine, {}", routine_id)

@router.delete("/{id}")
def delete_routine_exercise(id: int):
    return str.format("delete, {}", id)
