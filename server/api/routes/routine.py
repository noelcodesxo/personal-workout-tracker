from fastapi import APIRouter
from data import DBClient, Session
from sqlmodel import select
from data.models.table_models import WorkoutType, Routine, Exercise, RoutineExercise
from data.models.response_models import RoutineRead, ExerciseRead

from data.services.routine_service import RoutineService

router = APIRouter(prefix="/routine")

db_client = DBClient()
with db_client.get_session() as _session:
    routine_service = RoutineService(_session)

@router.post("/")
def post_routine(routine: Routine, exercises: list[Exercise]):
    _session.add(routine)
    try: 
        _session.commit()
    except:
        Session.rollback(_session)
        print("Error saving routine")

    routine_id = routine.id
    for exercise in exercises:
        exercise_id = _session.exec(select(Exercise).where(Exercise.name == exercise.name)).one().id
        _session.add(RoutineExercise(routine_id=routine_id, exercise_id=exercise_id))
    try:
        _session.commit()
        # TODO think if you want to return the routine that was created using the logic from get all routines.
    except:
        Session.rollback(_session)
        print("Error saving routine exercises. Rolling back")

@router.get("/")
def get_all_routines():
    return routine_service.get_all_routines()

@router.put("/{id}")
def put_routine(id: int):
    return ""

@router.get("/name/{name}")
def get_routine_by_name(name: str):
    return routine_service.get_routine_by_name(name)

@router.get("/type/{routine_type}")
def get_routine_by_type(routine_type: WorkoutType):
    return routine_service.get_routines_by_type(routine_type)

@router.delete("/{id}")
def delete_routine(id: int):
    return str.format("delete, {}", id)
