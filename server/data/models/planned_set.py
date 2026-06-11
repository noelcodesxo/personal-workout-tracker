from sqlmodel import SQLModel

class PlannedSetRead(SQLModel):
    planned_weight: int | None = None
    planned_reps: int | None = None
    planned_durations_in_seconds: int | None = None

class PlannedSetWrite(SQLModel):
    planned_weight: int | None = None
    planned_reps: int | None = None
    planned_durations_in_seconds: int | None = None
