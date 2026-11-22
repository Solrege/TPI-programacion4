from typing import ClassVar

from sqlmodel import Field, SQLModel

from app.core.schemas import PartialUpdate


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = None


class CategoriaUpdate(PartialUpdate):
    campos_obligatorios: ClassVar[tuple[str, ...]] = ("nombre",)

    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool
