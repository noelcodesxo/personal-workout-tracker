import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import (
    workout,
    exercise,
    routine
)
from data import DBClient

origins = [
    "http://localhost:3000"
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_headers=["*"],
    allow_methods=["*"]
)

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