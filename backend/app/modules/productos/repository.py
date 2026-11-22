from sqlalchemy.orm import selectinload
from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def search(
        self,
        *,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Producto], int]:
        filtros = [col(Producto.activo).is_(True)]
        if search:
            filtros.append(col(Producto.nombre).ilike(f"%{search}%"))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(col(Producto.disponible).is_(disponible))

        total = self.session.exec(
            select(func.count()).select_from(Producto).where(*filtros)
        ).one()
        stmt = (
            select(Producto)
            .where(*filtros)
            .options(selectinload(Producto.categoria))
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )
        return list(self.session.exec(stmt).all()), total
