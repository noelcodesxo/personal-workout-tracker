import uvicorn
from fastapi import FastAPI
from api.routes import (
    workout,
    exercise,
    routine
)
from data import DBClient

app = FastAPI()

app.include_router(workout.router)
app.include_router(exercise.router)
app.include_router(routine.router)

@app.get("/health")
def health():
    return ""

if __name__ == "__main__":
    db_client = DBClient()
    db_client.init_db()
    uvicorn.run(app, host="0.0.0.0", port=8000)