from datetime import datetime

from sqlalchemy.orm import selectinload
from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import EstadoPedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def list_by_usuario(
        self,
        usuario_id: int | None,
        *,
        estado: EstadoPedido | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Pedido], int]:
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)

        total = self.session.exec(
            select(func.count()).select_from(Pedido).where(*filtros)
        ).one()
        stmt = (
            select(Pedido)
            .where(*filtros)
            .options(selectinload(Pedido.items))
            .order_by(col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        )
        return list(self.session.exec(stmt).all()), total

    def count_by_estado(self) -> dict[str, int]:
        stmt = select(Pedido.estado, func.count()).group_by(Pedido.estado)
        return dict(self.session.exec(stmt).all())

    def count_desde(self, desde: datetime) -> int:
        stmt = (
            select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        )
        return self.session.exec(stmt).one()

    def sum_total_by_estado(self, estado: EstadoPedido) -> float:
        stmt = select(func.coalesce(func.sum(Pedido.total), 0)).where(
            Pedido.estado == estado
        )
        return float(self.session.exec(stmt).one())
