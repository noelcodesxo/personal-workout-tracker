from sqlmodel import Session, select
from data.models.response_models import RoutineRead, ExerciseRead
from data.models.table_models import WorkoutType, Routine, Exercise, RoutineExercise

# TODO Check if sqlmodel or fastAPI allow you to return custom HTTP errors, try to come up with an error handler or a cool way to manage exceptions.
class RoutineService():
    _session: Session
    
    def __init__(self, session: Session):
        self._session = session
    
    def get_all_routines(self) -> list[RoutineRead]:
        return self._to_routines_read(self._session.exec(select(Routine).where(Routine.active == True)).all())

    def get_routine_by_name(self, routine_name: str) -> RoutineRead | None:
        routine: Routine | None = self._get_routine(routine_name=routine_name)
        if routine == None:
            return None
        return self._to_routine_read(routine)
    
    def get_routines_by_type(self, routine_workout_type: WorkoutType) -> list[RoutineRead] | None:
        routines: list[Routine] | None = self._session.exec(select(Routine).where(Routine.active == True).where(Routine.workout_type == routine_workout_type)).all()
        if routines == None or len(routines) == 0:
            return None
        return self._to_routines_read(routines)
    
    def _to_routines_read(self, routines: list[Routine]) -> list[RoutineRead]:
        routines_resp: list[RoutineRead] = []
        for routine in routines:
            routines_resp.append(self._to_routine_read(routine))
        return routines_resp

    def _to_routine_read(self, routine: Routine) -> RoutineRead:
        routine_exercises: list[RoutineExercise] = routine.routine_exercises
        exercises_read: list[ExerciseRead] = []
        for routine_exercise in routine_exercises:
            exercise: Exercise = routine_exercise.exercise
            exercises_read.append(ExerciseRead(name=exercise.name))
        return RoutineRead(name=routine.name, notes=routine.notes, workout_type=routine.workout_type, routine_exercises=exercises_read)
    
    def _get_routine(self, routine_name: str) -> Routine | None:
        return self._session.exec(select(Routine).where(Routine.active == True).where(Routine.name == routine_name)).first()
    
    def delete_routine(self, name: str) -> None: 
        routine_to_delete: Routine | None = self._get_routine(routine_name=name)
        if routine_to_delete != None:
            routine_to_delete.active = False
            self._session.add(routine_to_delete)
            self._session.commit()
    
    def save_routine(self, routine: Routine, exercises: list[Exercise]) -> RoutineRead | None:
        try: 
            # Add to session exercises not yet in the database so alchemy can insert them.
            exercises_in_db: dict[str, Exercise] = {exercise.name: exercise for exercise in self._session.exec(select(Exercise)).all()}
            for exercise in exercises:
                # Alchemy will insert routine and exercises first, and then it'll create the relationship, can do all of that by setting RoutineExercise directly
                self._session.add(RoutineExercise(routine=routine, exercise=exercises_in_db.get(exercise.name, exercise)))

            self._session.commit()
            exercises_read = self._get_routine_exercises_read(routine.routine_exercises)
            return RoutineRead(name=routine.name, notes=routine.notes, workout_type=routine.workout_type, routine_exercises=exercises_read)
        except:
            print("Error saving routine exercises. Rolling back")
            Session.rollback(self._session)

    def _get_routine_exercises_read(self, routine_exercises: list[RoutineExercise]) -> list[ExerciseRead]:
        exercises_read: list[ExerciseRead] = []
        for routine_exercise in routine_exercises:
            exercise: Exercise = routine_exercise.exercise
            exercises_read.append(ExerciseRead(name=exercise.name))
        return exercises_read
    
    def update_routine(self, routine: Routine, exercises: list[Exercise]) -> Routine | None:
        routine_original: Routine | None = self._get_routine(routine.name)
        if routine_original == None:
            raise ValueError(str.format("No routine with name: {} was found to update", routine.name))
        try:
            exercises_kept: set[str] = set()
            active_routine_exercises: list[RoutineExercise] = self._session.exec(select(RoutineExercise).where(RoutineExercise.routine == routine_original)).all()
            exercises_names = {exercise.name for exercise in exercises}
            
            for active_exercise in active_routine_exercises:
                if active_exercise.exercise.name not in exercises_names:
                    self._session.delete(active_exercise)
                else:
                    exercises_kept.add(active_exercise.exercise.name)
                    
            for exercise in exercises:
                # Already in db and already with routine_exercise relationship.
                if exercise.name in exercises_kept:
                    continue
                else:
                    # If not found in db, add it to session so it can be created. Else existing one to list of exercises so the relationship can be created
                    # if exercise exists in db, alchemy will create the RoutineExercise only and the relationship (foreign key), otherwise it will create exercise first, then relationship.
                    db_exercise: Exercise | None = self._session.exec(select(Exercise).where(Exercise.name == exercise.name)).first()
                    routine_exercise: RoutineExercise = RoutineExercise(routine=routine_original, exercise=db_exercise if db_exercise != None else exercise)
                    self._session.add(routine_exercise)

            routine_original.name = routine.name
            routine_original.notes = routine.notes
            routine_original.workout_type = routine.workout_type
            self._session.commit()
        except:
            print("Something went wrong with the update. Rolling back.")
            Session.rollback(self._session)            
