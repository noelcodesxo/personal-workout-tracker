import os

from sqlmodel import create_engine, SQLModel, Session
from data.models.table_models import *

class DBClient():
    engine = None

    def __init__(self):
        self.engine = self._get_engine()

    def _get_engine(self):
        if self.engine is None:
            user = os.environ["POSTGRES_USER"]
            pw = os.environ["POSTGRES_PASSWORD"]

            url = str.format("postgresql://{}:{}@db:5432/postgres", user, pw)
            self.engine = create_engine(url, echo=True)
        return self.engine

    def init_db(self):
        SQLModel.metadata.create_all(self._get_engine())

    def get_session(self) -> Session:
        return Session(self._get_engine())