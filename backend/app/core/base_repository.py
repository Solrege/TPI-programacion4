from typing import Generic, TypeVar

from sqlalchemy import inspect
from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    model: type[T]

    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_id(self, entity_id: int) -> T | None:
        return self.session.get(self.model, entity_id)

    def get_for_update(self, entity_id: int) -> T | None:
        return self.session.get(
            self.model, entity_id, with_for_update=True, populate_existing=True
        )

    def get_all(self, skip: int = 0, limit: int | None = None) -> list[T]:
        stmt = (
            select(self.model)
            .order_by(*inspect(self.model).primary_key)
            .offset(skip)
            .limit(limit)
        )
        return list(self.session.exec(stmt).all())

    def add(self, entity: T) -> T:
        self.session.add(entity)
        self.session.flush()
        return entity

    def refresh(self, entity: T, attributes: list[str] | None = None) -> None:
        self.session.refresh(entity, attributes)

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()
