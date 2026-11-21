import app.db.models  # noqa: F401
from app.core.database import create_all_tables
from app.core.security import hash_password
from app.modules.usuarios.models import Rol, Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

ADMIN = {
    "username": "admin",
    "full_name": "Administrador",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}


def seed_admin() -> None:
    with UsuarioUnitOfWork() as uow:
        if uow.usuarios.get_by_username(ADMIN["username"]):
            print(f"Usuario '{ADMIN['username']}' ya existe")
            return
        uow.usuarios.add(
            Usuario(
                username=ADMIN["username"],
                full_name=ADMIN["full_name"],
                email=ADMIN["email"],
                hashed_password=hash_password(ADMIN["password"]),
                role=Rol.ADMIN,
            )
        )
        print(f"Usuario '{ADMIN['username']}' creado (rol admin)")


def main() -> None:
    create_all_tables()
    seed_admin()


if __name__ == "__main__":
    main()
