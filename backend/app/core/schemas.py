from typing import ClassVar, Self

from pydantic import model_validator
from sqlmodel import SQLModel


class PartialUpdate(SQLModel):
    campos_obligatorios: ClassVar[tuple[str, ...]] = ()

    @model_validator(mode="after")
    def rechazar_nulos(self) -> Self:
        nulos = [
            campo
            for campo in self.campos_obligatorios
            if campo in self.model_fields_set and getattr(self, campo) is None
        ]
        if nulos:
            raise ValueError(f"Estos campos no pueden ser null: {', '.join(nulos)}")
        return self
