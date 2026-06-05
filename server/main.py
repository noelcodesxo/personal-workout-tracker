from fastapi import FastAPI
from server.api.routes import (
    workout,
    exercise,
    routine,
    exercise_entry,
    set_entry,
    routine_exercise,
    planned_set,
)

app = FastAPI()

app.include_router(workout.router)
app.include_router(exercise.router)
app.include_router(routine.router)
app.include_router(exercise_entry.router)
app.include_router(set_entry.router)
app.include_router(routine_exercise.router)
app.include_router(planned_set.router)

@app.get("/health")
def main():
    return ""
