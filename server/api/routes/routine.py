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
    return routine_service.save_routine(routine=routine, exercises=exercises)

@router.get("/")
def get_all_routines():
    return routine_service.get_all_routines()

@router.put("/")
def put_routine(routine: Routine, exercises: list[Exercise]):
    return routine_service.update_routine(routine=routine, exercises=exercises)

@router.get("/{name}")
def get_routine_by_name(name: str):
    return routine_service.get_routine_by_name(name)

@router.get("/type/{routine_type}")
def get_routine_by_type(routine_type: WorkoutType):
    return routine_service.get_routines_by_type(routine_type)

@router.delete("/{name}")
def delete_routine(name: str):
    return routine_service.delete_routine(name)
