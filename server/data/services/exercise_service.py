from sqlmodel import Session, select
from data.models.table_models import Exercise
from data.models.exercise import ExerciseRead

class ExerciseService():
    _session: Session

    def __init__(self, session: Session):
        self._session = session

    def get_all_exercises(self) -> list[ExerciseRead]:
        exercises: list[Exercise] = self._session.exec(select(Exercise).where(Exercise.active == True)).all()
        return [ExerciseRead(name=exercise.name) for exercise in exercises]

    def get_exercise_by_name(self, name: str) -> ExerciseRead | None:
        exercise: Exercise | None = self._get_exercise(name=name)
        if exercise == None or not exercise.active:
            return None
        return ExerciseRead(name=exercise.name)

    def create_exercise(self, name: str) -> ExerciseRead | None:
        try:
            # Name is unique; if a soft-deleted exercise exists, reactivate it instead of inserting.
            existing: Exercise | None = self._get_exercise(name=name)
            if existing != None and not existing.active:
                existing.active = True
                self._session.add(existing)
                self._session.commit()
                return ExerciseRead(name=existing.name)

            exercise: Exercise = Exercise(name=name)
            self._session.add(exercise)
            self._session.commit()
            return ExerciseRead(name=exercise.name)
        except Exception:
            print("Could not create exercise. Rolling back")
            self._session.rollback()

    def update_exercise(self, name: str, new_name: str) -> ExerciseRead | None:
        exercise: Exercise | None = self._get_exercise(name=name)
        if exercise == None:
            return None
        try:
            exercise.name = new_name
            self._session.add(exercise)
            self._session.commit()
            return ExerciseRead(name=exercise.name)
        except Exception:
            print("Could not update exercise. Rolling back")
            self._session.rollback()

    def delete_exercise(self, name: str) -> None:
        exercise: Exercise | None = self._get_exercise(name=name)
        if exercise != None:
            exercise.active = False
            self._session.add(exercise)
            self._session.commit()

    def _get_exercise(self, name: str) -> Exercise | None:
        return self._session.exec(select(Exercise).where(Exercise.name == name)).first()
