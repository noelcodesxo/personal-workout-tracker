from datetime import datetime, timezone
from sqlmodel import Session, select
from data.models.workout import (
    WorkoutRead,
    WorkoutCreate,
    WorkoutLogWrite,
    ExerciseEntryRead,
    CompletedSetRead,
)
from data.models.table_models import (
    WorkoutType,
    Workout,
    Exercise,
    ExerciseEntry,
    CompletedSetEntry,
)

class WorkoutService():
    _session: Session

    def __init__(self, session: Session):
        self._session = session

    def create_workout(self, workout_create: WorkoutCreate) -> WorkoutRead | None:
        try:
            # Start time is owned here: use the client's value or stamp now. End time stays null.
            workout: Workout = Workout(
                workout_type=workout_create.workout_type,
                workout_start_time=workout_create.workout_start_time or datetime.now(timezone.utc),
                user_id=workout_create.user_id,
                routine_id=workout_create.routine_id,
            )
            self._session.add(workout)
            self._session.commit()
            return self._to_workout_read(workout)
        except Exception:
            print("Could not create workout. Rolling back")
            self._session.rollback()

    def log_workout(self, workout_id: int, workout_log: WorkoutLogWrite) -> WorkoutRead | None:
        workout: Workout | None = self._get_workout(workout_id)
        if workout == None:
            return None
        try:
            # Replace all: drop existing entries and their completed sets, then rebuild from payload.
            for exercise_entry in list(workout.exercise_entries):
                for completed_set in list(exercise_entry.completed_sets):
                    self._session.delete(completed_set)
                self._session.delete(exercise_entry)

            exercises_in_db: dict[str, Exercise] = {exercise.name: exercise for exercise in self._session.exec(select(Exercise)).all()}
            for exercise_entry_write in workout_log.exercise_entries:
                exercise: Exercise = exercises_in_db.get(exercise_entry_write.name, Exercise(name=exercise_entry_write.name))
                exercise_entry: ExerciseEntry = ExerciseEntry(workout=workout, exercise=exercise)
                for completed_set_write in exercise_entry_write.completed_sets:
                    exercise_entry.completed_sets.append(CompletedSetEntry(
                        weight_in_lbs=completed_set_write.weight_in_lbs,
                        rep_count=completed_set_write.rep_count,
                        duration_in_seconds=completed_set_write.duration_in_seconds,
                        notes=completed_set_write.notes,
                    ))
                self._session.add(exercise_entry)

            # Every log stamps the end time to now, unless the client provided one.
            workout.workout_end_time = workout_log.workout_end_time if workout_log.workout_end_time != None else datetime.now(timezone.utc)
            self._session.add(workout)
            self._session.commit()
            return self._to_workout_read(workout)
        except Exception:
            print("Could not log workout. Rolling back")
            self._session.rollback()

    def delete_workout(self, id: int) -> None:
        workout: Workout | None = self._get_workout(id)
        if workout != None:
            workout.active = False
            self._session.add(workout)
            self._session.commit()

    def get_workout_by_id(self, id: int) -> WorkoutRead | None:
        workout: Workout | None = self._get_workout(id)
        return self._to_workout_read(workout) if workout != None else None

    def get_workouts_by_type(self, workout_type: WorkoutType) -> list[WorkoutRead]:
        workouts: list[Workout] = self._session.exec(select(Workout).where(Workout.active == True).where(Workout.workout_type == workout_type)).all()
        return self._to_workouts_read(workouts)

    def get_workouts_by_range(self, start: datetime, end: datetime) -> list[WorkoutRead]:
        workouts: list[Workout] = self._session.exec(
            select(Workout)
            .where(Workout.active == True)
            .where(Workout.workout_start_time >= start)
            .where(Workout.workout_start_time <= end)
        ).all()
        return self._to_workouts_read(workouts)

    def get_all_workouts(self) -> list[WorkoutRead]:
        workouts: list[Workout] = self._session.exec(select(Workout).where(Workout.active == True)).all()
        return self._to_workouts_read(workouts)

    def _get_workout(self, id: int) -> Workout | None:
        return self._session.exec(select(Workout).where(Workout.active == True).where(Workout.id == id)).first()

    def _to_workouts_read(self, workouts: list[Workout]) -> list[WorkoutRead]:
        return [self._to_workout_read(workout) for workout in workouts]

    def _to_workout_read(self, workout: Workout) -> WorkoutRead:
        return WorkoutRead(
            id=workout.id,
            workout_type=workout.workout_type,
            workout_start_time=workout.workout_start_time,
            workout_end_time=workout.workout_end_time,
            user_id=workout.user_id,
            routine_id=workout.routine_id,
            exercise_entries=self._to_exercise_entries_read(workout.exercise_entries),
        )

    def _to_exercise_entries_read(self, exercise_entries: list[ExerciseEntry]) -> list[ExerciseEntryRead]:
        entries_read: list[ExerciseEntryRead] = []
        for exercise_entry in exercise_entries:
            completed_sets_read: list[CompletedSetRead] = [
                CompletedSetRead(
                    weight_in_lbs=completed_set.weight_in_lbs,
                    rep_count=completed_set.rep_count,
                    duration_in_seconds=completed_set.duration_in_seconds,
                    notes=completed_set.notes,
                )
                for completed_set in exercise_entry.completed_sets
            ]
            entries_read.append(ExerciseEntryRead(name=exercise_entry.exercise.name, completed_sets=completed_sets_read))
        return entries_read
