from sqlmodel import col, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        stmt = select(Categoria).where(Categoria.nombre == nombre)
        return self.session.exec(stmt).first()

    def list_activas(self) -> list[Categoria]:
        stmt = (
            select(Categoria)
            .where(col(Categoria.activo).is_(True))
            .order_by(Categoria.nombre)
        )
        return list(self.session.exec(stmt).all())
