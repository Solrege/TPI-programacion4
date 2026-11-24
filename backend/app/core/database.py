from sqlalchemy import event
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings


def _database_url(url: str) -> str:
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


_url = _database_url(settings.DATABASE_URL)
_connect_args = {"check_same_thread": False} if _url.startswith("sqlite") else {}

engine = create_engine(
    _url,
    connect_args=_connect_args,
    pool_pre_ping=True,
)


def _translate(texto: str | None, desde: str, hacia: str) -> str | None:
    return texto.translate(str.maketrans(desde, hacia)) if texto else texto


if _url.startswith("sqlite"):

    @event.listens_for(engine, "connect")
    def _registrar_funciones_sqlite(conexion, _registro) -> None:
        conexion.create_function("translate", 3, _translate, deterministic=True)


def create_all_tables() -> None:
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine)
