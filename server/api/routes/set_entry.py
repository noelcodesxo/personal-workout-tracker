from fastapi import APIRouter

router = APIRouter(prefix="/set-entry")

@router.post("/")
def post_set_entry():
    return "post"

@router.put("/{id}")
def put_set_entry(id: int):
    return str.format("put, {}", id)

@router.get("/exercise-entry/{exercise_entry_id}")
def get_sets_by_exercise_entry(exercise_entry_id: int):
    return str.format("get_exercise_entry, {}", exercise_entry_id)

@router.get("/exercise/{exercise_id}")
def get_sets_by_exercise(exercise_id: int):
    return str.format("get_exercise, {}", exercise_id)

@router.delete("/{id}")
def delete_set_entry(id: int):
    return str.format("delete, {}", id)
