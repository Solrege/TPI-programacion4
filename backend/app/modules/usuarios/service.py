from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    def __init__(self, user_id: int) -> None:
        super().__init__(f"Usuario {user_id} no encontrado")


class AutoDesactivacion(Exception):
    def __init__(self) -> None:
        super().__init__("Un administrador no puede desactivarse a sí mismo")


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.get_all()]

    def activar(self, user_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = self._obtener(uow, user_id)
            usuario.disabled = False
            return UserPublic.model_validate(usuario)

    def desactivar(self, user_id: int, admin_id: int) -> UserPublic:
        if user_id == admin_id:
            raise AutoDesactivacion()
        with self.uow as uow:
            usuario = self._obtener(uow, user_id)
            usuario.disabled = True
            return UserPublic.model_validate(usuario)

    @staticmethod
    def _obtener(uow: UsuarioUnitOfWork, user_id: int) -> Usuario:
        usuario = uow.usuarios.get_by_id(user_id)
        if usuario is None:
            raise UsuarioNoEncontrado(user_id)
        return usuario
