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
        (
            "Pizza Muzzarella",
            "Salsa de tomate, muzzarella y orégano",
            9500,
            20,
            "pizza-muzzarella",
        ),
        (
            "Pizza Napolitana",
            "Muzzarella, tomate en rodajas y albahaca",
            10500,
            15,
            "pizza-napolitana",
        ),
        (
            "Pizza Fugazzeta",
            "Muzzarella y cebolla caramelizada",
            10000,
            0,
            "pizza-fugazzeta",
        ),
        (
            "Pizza Cuatro Quesos",
            "Muzzarella, roquefort, provolone y parmesano",
            11500,
            12,
            "pizza-cuatro-quesos",
        ),
        ("Pizza Pepperoni", "Muzzarella y pepperoni", 11000, 18, "pizza-pepperoni"),
    ],
    ("Hamburguesas", "Hamburguesas caseras"): [
        (
            "Hamburguesa Clásica",
            "Carne, lechuga, tomate, cebolla y queso",
            8500,
            25,
            "hamburguesa-clasica",
        ),
        (
            "Hamburguesa Doble Cheddar",
            "Doble carne y doble cheddar",
            11000,
            18,
            "hamburguesa-doble-cheddar",
        ),
        (
            "Hamburguesa Veggie",
            "Medallón de lentejas, rúcula y queso",
            9000,
            10,
            "hamburguesa-veggie",
        ),
        (
            "Hamburguesa BBQ",
            "Doble carne, panceta y salsa barbacoa",
            11500,
            15,
            "hamburguesa-bbq",
        ),
        (
            "Hamburguesa Jalapeños",
            "Carne, cheddar y jalapeños",
            10000,
            12,
            "hamburguesa-jalapenos",
        ),
    ],
    ("Empanadas", "Empanadas al horno, por media docena"): [
        ("Empanadas de Carne", "Carne cortada a cuchillo", 7200, 30, "empanadas-carne"),
        (
            "Empanadas de Jamón y Queso",
            "Jamón cocido y muzzarella",
            6900,
            30,
            "empanadas-jamon-queso",
        ),
        ("Empanadas de Pollo", "Pollo, cebolla y morrón", 7000, 30, "empanadas-pollo"),
    ],
    ("Ensaladas", "Ensaladas frescas"): [
        (
            "Ensalada César",
            "Lechuga, croutons, parmesano y aderezo César",
            7500,
            15,
            "ensalada-cesar",
        ),
        (
            "Ensalada Caprese",
            "Tomate, muzzarella fresca y albahaca",
            7000,
            15,
            "ensalada-caprese",
        ),
        (
            "Ensalada Mixta",
            "Lechuga, tomate, zanahoria y aceitunas",
            5500,
            20,
            "ensalada-mixta",
        ),
    ],
    ("Entradas", "Para compartir"): [
        ("Nuggets de Pollo", "Ocho unidades con salsa", 6000, 20, "nuggets"),
        (
            "Papas con Cheddar",
            "Papas fritas, cheddar, panceta y verdeo",
            6500,
            20,
            "papas-cheddar",
        ),
        ("Tequeños", "Seis unidades con salsa de queso", 5800, 16, "tequenos"),
    ],
    ("Bebidas", "Bebidas frías"): [
        ("Agua Mineral 500 ml", "Sin gas", 1500, 50, "agua-mineral"),
        ("Gaseosa Cola 500 ml", None, 2200, 40, "gaseosa-cola"),
        ("Gaseosa Lima-Limón 500 ml", None, 2200, 40, "gaseosa-lima-limon"),
        ("Jugo de Naranja 1 L", None, 2800, 25, "jugo-naranja"),
    ],
    ("Postres", "Postres caseros"): [
        ("Brownie", "Con nueces", 3000, 15, "brownie"),
        ("Helado 1/4 kg", "Dos gustos a elección", 4500, 20, "helado"),
        ("Torta Rogel", "Hojaldre, dulce de leche y merengue", 4200, 10, "torta-rogel"),
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
            for prod_nombre, prod_descripcion, precio, stock, imagen in productos:
                uow.productos.add(
                    Producto(
                        nombre=prod_nombre,
                        descripcion=prod_descripcion,
                        precio_base=precio,
                        imagen_url=f"/img/productos/{imagen}.webp",
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
