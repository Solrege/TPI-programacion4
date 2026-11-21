from app.core.deps import CUENTA_DESACTIVADA
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Rol, Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioDuplicado(Exception):
    def __init__(self, campo: str) -> None:
        super().__init__(f"Ya existe un usuario con ese {campo}")


class CredencialesInvalidas(Exception):
    def __init__(self) -> None:
        super().__init__("Credenciales incorrectas")


class CuentaDesactivada(Exception):
    def __init__(self) -> None:
        super().__init__(CUENTA_DESACTIVADA)


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username):
                raise UsuarioDuplicado("username")
            if uow.usuarios.get_by_email(data.email):
                raise UsuarioDuplicado("email")
            usuario = uow.usuarios.add(
                Usuario(
                    username=data.username,
                    full_name=data.full_name,
                    email=data.email,
                    hashed_password=hash_password(data.password),
                    role=Rol.USER,
                )
            )
            return UserPublic.model_validate(usuario)

    def autenticar(self, username: str, password: str) -> str:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(
                password, usuario.hashed_password
            ):
                raise CredencialesInvalidas()
            if usuario.disabled:
                raise CuentaDesactivada()
            return create_access_token({"sub": usuario.username, "role": usuario.role})
