from datetime import datetime
from enum import StrEnum
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.core.clock import utc_now

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


class Rol(StrEnum):
    USER = "user"
    ADMIN = "admin"


class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    full_name: str
    email: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = Field(default=Rol.USER)
    disabled: bool = Field(default=False)
    created_at: datetime = Field(
        default_factory=utc_now, sa_type=DateTime(timezone=True)
    )

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
