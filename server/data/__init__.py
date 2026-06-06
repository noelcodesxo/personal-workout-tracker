import os

from sqlmodel import create_engine, SQLModel
from data.models.models import *


def init_db():
    user = os.environ["POSTGRES_USER"]
    pw = os.environ["POSTGRES_PASSWORD"]

    url = str.format("postgresql://{}:{}@db:5432/postgres", user, pw)
    engine = create_engine(url, echo=True)
    SQLModel.metadata.create_all(engine)