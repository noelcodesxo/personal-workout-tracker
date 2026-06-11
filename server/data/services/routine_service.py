from sqlmodel import Session, select
from data.models.routine import RoutineRead, RoutineExerciseRead, RoutineWrite
from data.models.planned_set import PlannedSetRead, PlannedSetWrite
from data.models.table_models import WorkoutType, Routine, Exercise, RoutineExercise, PlannedSet

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

    def delete_routine(self, name: str) -> None:
        routine_to_delete: Routine | None = self._get_routine(routine_name=name)
        if routine_to_delete != None:
            routine_to_delete.active = False
            self._session.add(routine_to_delete)
            self._session.commit()

    def save_routine(self, routine_write: RoutineWrite) -> RoutineRead | None:
        try:
            routine = Routine(name=routine_write.name, notes=routine_write.notes, workout_type=routine_write.workout_type)
            # Reuse exercises already in the db (name is unique) so alchemy inserts only what's new.
            exercises_in_db: dict[str, Exercise] = {exercise.name: exercise for exercise in self._session.exec(select(Exercise)).all()}
            for routine_exercise_write in routine_write.routine_exercises:
                exercise: Exercise = exercises_in_db.get(routine_exercise_write.name, Exercise(name=routine_exercise_write.name))
                # Setting the relationship lets alchemy insert routine, exercise (if new) and the link in order.
                routine_exercise: RoutineExercise = RoutineExercise(routine=routine, exercise=exercise)
                self._add_planned_sets(routine_exercise, routine_exercise_write.planned_sets)
                self._session.add(routine_exercise)

            self._session.commit()
            return self._to_routine_read(routine)
        except Exception:
            print("Error saving routine. Rolling back")
            self._session.rollback()

    def update_routine(self, routine_write: RoutineWrite) -> RoutineRead | None:
        routine_original: Routine | None = self._get_routine(routine_write.name)
        if routine_original == None:
            raise ValueError(str.format("No routine with name: {} was found to update", routine_write.name))
        try:
            exercises_in_db: dict[str, Exercise] = {exercise.name: exercise for exercise in self._session.exec(select(Exercise)).all()}
            incoming_routine_exercises_names: set[str] = {routine_exercise.name for routine_exercise in routine_write.routine_exercises}
            existing_routine_exercises_by_name: dict[str, RoutineExercise] = {routine_exercise.exercise.name: routine_exercise for routine_exercise in routine_original.routine_exercises}

            # Drop routine exercises (and their planned sets) no longer in the payload.
            for name, routine_exercise in existing_routine_exercises_by_name.items():
                if name not in incoming_routine_exercises_names:
                    self._delete_planned_sets(routine_exercise)
                    self._session.delete(routine_exercise)

            for routine_exercise_write in routine_write.routine_exercises:
                routine_exercise: RoutineExercise | None = existing_routine_exercises_by_name.get(routine_exercise_write.name)
                if routine_exercise == None:
                    exercise: Exercise = exercises_in_db.get(routine_exercise_write.name, Exercise(name=routine_exercise_write.name))
                    routine_exercise = RoutineExercise(routine=routine_original, exercise=exercise)
                    self._session.add(routine_exercise)
                else:
                    # Replace the planned sets for exercises that are kept.
                    self._delete_planned_sets(routine_exercise)
                self._add_planned_sets(routine_exercise, routine_exercise_write.planned_sets)

            routine_original.notes = routine_write.notes
            routine_original.workout_type = routine_write.workout_type
            self._session.commit()
            return self._to_routine_read(routine_original)
        except Exception:
            print("Something went wrong with the update. Rolling back.")
            self._session.rollback()

    def _add_planned_sets(self, routine_exercise: RoutineExercise, planned_sets: list[PlannedSetWrite]) -> None:
        for planned_set in planned_sets:
            routine_exercise.planned_sets.append(PlannedSet(
                planned_weight=planned_set.planned_weight,
                planned_reps=planned_set.planned_reps,
                planned_durations_in_seconds=planned_set.planned_durations_in_seconds,
            ))

    def _delete_planned_sets(self, routine_exercise: RoutineExercise) -> None:
        for planned_set in list(routine_exercise.planned_sets):
            self._session.delete(planned_set)
        routine_exercise.planned_sets = []

    def _get_routine(self, routine_name: str) -> Routine | None:
        return self._session.exec(select(Routine).where(Routine.active == True).where(Routine.name == routine_name)).first()

    def _to_routines_read(self, routines: list[Routine]) -> list[RoutineRead]:
        return [self._to_routine_read(routine) for routine in routines]

    def _to_routine_read(self, routine: Routine) -> RoutineRead:
        return RoutineRead(
            name=routine.name,
            notes=routine.notes,
            workout_type=routine.workout_type,
            routine_exercises=self._get_routine_exercises_read(routine.routine_exercises),
        )

    def _get_routine_exercises_read(self, routine_exercises: list[RoutineExercise]) -> list[RoutineExerciseRead]:
        exercises_read: list[RoutineExerciseRead] = []
        for routine_exercise in routine_exercises:
            planned_sets_read: list[PlannedSetRead] = [
                PlannedSetRead(
                    planned_weight=planned_set.planned_weight,
                    planned_reps=planned_set.planned_reps,
                    planned_durations_in_seconds=planned_set.planned_durations_in_seconds,
                )
                for planned_set in routine_exercise.planned_sets
            ]
            exercises_read.append(RoutineExerciseRead(name=routine_exercise.exercise.name, planned_sets=planned_sets_read))
        return exercises_read
