import uvicorn
from fastapi import FastAPI
from api.routes import (
    workout,
    exercise,
    routine,
    exercise_entry,
    set_entry,
    routine_exercise,
    planned_set,
)
from data import init_db

app = FastAPI()

app.include_router(workout.router)
app.include_router(exercise.router)
app.include_router(routine.router)
app.include_router(exercise_entry.router)
app.include_router(set_entry.router)
app.include_router(routine_exercise.router)
app.include_router(planned_set.router)

@app.get("/health")
def health():
    return ""

if __name__ == "__main__":
    init_db()
    uvicorn.run(app, host="0.0.0.0", port=8000)