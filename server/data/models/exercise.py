from sqlmodel import SQLModel

# Ids are intentionally not exposed to the client; the server resolves name -> id.
class ExerciseRead(SQLModel):
    name: str

class ExerciseWrite(SQLModel):
    name: str
