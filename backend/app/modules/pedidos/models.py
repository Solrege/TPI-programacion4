from datetime import datetime
from enum import StrEnum
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

from app.core.clock import utc_now

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


class EstadoPedido(StrEnum):
    PENDIENTE = "PENDIENTE"
    EN_PREPARACION = "EN_PREPARACION"
    ENTREGADO = "ENTREGADO"
    CANCELADO = "CANCELADO"


class FormaPago(StrEnum):
    EFECTIVO = "EFECTIVO"
    TRANSFERENCIA = "TRANSFERENCIA"


class Pedido(SQLModel, table=True):
    __tablename__ = "pedidos"

    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id", index=True)
    estado: str = Field(default=EstadoPedido.PENDIENTE, index=True)
    forma_pago: str
    direccion_entrega: str = Field(max_length=200)
    notas: str | None = Field(default=None)
    total: float = Field(default=0.0)
    created_at: datetime = Field(
        default_factory=utc_now, sa_type=DateTime(timezone=True)
    )
    updated_at: datetime = Field(
        default_factory=utc_now,
        sa_type=DateTime(timezone=True),
        sa_column_kwargs={"onupdate": utc_now},
    )

    usuario: "Usuario" = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(
        back_populates="pedido",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "order_by": "DetallePedido.id",
        },
    )


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalles_pedido"
    __table_args__ = (UniqueConstraint("pedido_id", "producto_id"),)

    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", index=True)
    producto_id: int = Field(foreign_key="productos.id", index=True)
    cantidad: int
    nombre_producto: str
    precio_unitario: float
    subtotal: float

    pedido: Pedido = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="detalles")
