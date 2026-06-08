from sqlmodel import Session, select
from data.models.response_models import RoutineRead, ExerciseRead
from data.models.table_models import WorkoutType, Routine, Exercise, RoutineExercise

class RoutineService():
    _session: Session = None
    
    def __init__(self, session: Session):
        self._session = session
    
    def get_all_routines(self) -> list[RoutineRead]:
        return self._get_routines_read(self._session.exec(select(Routine)).all())

    def get_routine_by_name(self, routine_name: str) -> RoutineRead:
        return self._get_routine_read(self._session.exec(select(Routine).where(Routine.name == routine_name)).one())
    
    def get_routines_by_type(self, routine_workout_type: WorkoutType) -> list[RoutineRead]:
        return self._get_routines_read(self._session.exec(select(Routine).where(Routine.workout_type == routine_workout_type)).all())
    
    def _get_routines_read(self, routines: list[Routine]) -> list[RoutineRead]:
        routines_resp: list[RoutineRead] = []
        for routine in routines:
            routines_resp.append(self._get_routine_read(routine))
        return routines_resp

    def _get_routine_read(self, routine: Routine) -> RoutineRead:
        routine_exercises: list[RoutineExercise] = (self._session.exec(select(RoutineExercise).where(RoutineExercise.routine_id == routine.id)).all())
        exercises_read: list[ExerciseRead] = []
        for routine_exercise in routine_exercises:
            exercise: Exercise = self._session.exec(select(Exercise).where(Exercise.id == routine_exercise.exercise_id)).one()
            exercises_read.append(ExerciseRead(name=exercise.name))
        return RoutineRead(name=routine.name, notes=routine.notes, workout_type=routine.workout_type, routine_exercises=exercises_read)
    