import app.db.models  # noqa: F401
from app.core.database import create_all_tables
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Rol, Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

ADMIN = {
    "username": "admin",
    "full_name": "Administrador",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}

CATALOGO = {
    ("Pizzas", "Pizzas a la piedra"): [
        ("Pizza Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 9500, 20),
        ("Pizza Napolitana", "Muzzarella, tomate en rodajas y ajo", 10500, 15),
        ("Pizza Fugazzeta", "Muzzarella y cebolla", 10000, 0),
    ],
    ("Hamburguesas", "Hamburguesas caseras con papas"): [
        ("Hamburguesa Clásica", "Carne, lechuga, tomate y queso", 8500, 25),
        ("Hamburguesa Doble Cheddar", "Doble carne y doble cheddar", 11000, 18),
        ("Hamburguesa Veggie", "Medallón de lentejas y vegetales", 9000, 10),
    ],
    ("Bebidas", "Bebidas frías"): [
        ("Agua mineral 500 ml", "Sin gas", 1500, 50),
        ("Gaseosa cola 500 ml", None, 2200, 40),
        ("Cerveza artesanal 473 ml", "IPA", 4000, 30),
    ],
    ("Postres", "Postres caseros"): [
        ("Flan casero", "Con dulce de leche", 3500, 12),
        ("Brownie", "Con nueces", 3000, 15),
        ("Helado 1/4 kg", "Dos gustos a elección", 4500, 20),
    ],
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


def seed_catalogo() -> None:
    with ProductoUnitOfWork() as uow:
        for (nombre, descripcion), productos in CATALOGO.items():
            if uow.categorias.get_by_nombre(nombre):
                print(f"Categoría '{nombre}' ya existe")
                continue
            categoria = uow.categorias.add(
                Categoria(nombre=nombre, descripcion=descripcion)
            )
            for prod_nombre, prod_descripcion, precio, stock in productos:
                uow.productos.add(
                    Producto(
                        nombre=prod_nombre,
                        descripcion=prod_descripcion,
                        precio_base=precio,
                        stock=stock,
                        disponible=stock > 0,
                        categoria_id=categoria.id,
                    )
                )
            print(f"Categoría '{nombre}' creada con {len(productos)} productos")


def main() -> None:
    create_all_tables()
    seed_admin()
    seed_catalogo()


if __name__ == "__main__":
    main()
