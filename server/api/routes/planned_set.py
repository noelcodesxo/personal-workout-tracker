from fastapi import APIRouter
from data.models.models import PlannedSet

router = APIRouter(prefix="/planned-set")

@router.post("/")
def post_planned_set(planned_set: PlannedSet):
    return "post"

@router.get("/{id}")
def get_planned_set_by_id(id: int):
    return str.format("get_id, {}", id)

@router.get("/routine-exercise/{routine_exercise_id}")
def get_planned_sets_by_routine_exercise(routine_exercise_id: int):
    return str.format("get_routine_exercise, {}", routine_exercise_id)

@router.put("/{id}")
def put_planned_set(id: int):
    return str.format("put, {}", id)

@router.delete("/{id}")
def delete_planned_set(id: int):
    return str.format("delete, {}", id)
