from app.core.clock import start_of_today
from app.modules.pedidos.models import DetallePedido, EstadoPedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Rol
from app.modules.usuarios.schemas import UserPublic

TRANSICIONES: dict[EstadoPedido, set[EstadoPedido]] = {
    EstadoPedido.PENDIENTE: {EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO},
    EstadoPedido.EN_PREPARACION: {EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO},
    EstadoPedido.ENTREGADO: set(),
    EstadoPedido.CANCELADO: set(),
}


class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int) -> None:
        super().__init__(f"Pedido {pedido_id} no encontrado")


class PedidoAjeno(Exception):
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class ProductoRepetido(Exception):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"El producto {producto_id} está repetido en el pedido")


class ProductoNoDisponible(Exception):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"'{nombre}' no está disponible")


class StockInsuficiente(Exception):
    def __init__(self, nombre: str, stock: int) -> None:
        super().__init__(f"Stock insuficiente de '{nombre}' (disponible: {stock})")


class TransicionInvalida(Exception):
    def __init__(self, actual: str, nuevo: str) -> None:
        super().__init__(f"No se puede pasar de {actual} a {nuevo}")


class PedidoNoCancelable(Exception):
    def __init__(self) -> None:
        super().__init__("Solo se puede cancelar un pedido en PENDIENTE")


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def crear(self, data: PedidoCreate, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            self._validar_sin_repetidos(data)
            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                )
            )
            ids = sorted(item.producto_id for item in data.items)
            productos = {pid: uow.productos.get_for_update(pid) for pid in ids}
            total = 0.0
            for item in data.items:
                producto = productos[item.producto_id]
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock)
                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal
            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(
        self,
        usuario: UserPublic,
        *,
        estado: EstadoPedido | None,
        skip: int,
        limit: int,
    ) -> PedidosPaginados:
        usuario_id = None if usuario.role == Rol.ADMIN else usuario.id
        with self.uow as uow:
            pedidos, total = uow.pedidos.list_by_usuario(
                usuario_id, estado=estado, skip=skip, limit=limit
            )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p) for p in pedidos],
            )

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if usuario.role != Rol.ADMIN and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo: EstadoPedido) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id, bloquear=True)
            self._aplicar_transicion(uow, pedido, nuevo)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id, bloquear=True)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != EstadoPedido.PENDIENTE:
                raise PedidoNoCancelable()
            self._aplicar_transicion(uow, pedido, EstadoPedido.CANCELADO)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=conteos.get(EstadoPedido.PENDIENTE, 0),
                en_preparacion=conteos.get(EstadoPedido.EN_PREPARACION, 0),
                entregados=conteos.get(EstadoPedido.ENTREGADO, 0),
                cancelados=conteos.get(EstadoPedido.CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_desde(start_of_today()),
                ingresos_entregados=uow.pedidos.sum_total_by_estado(
                    EstadoPedido.ENTREGADO
                ),
            )

    @staticmethod
    def _obtener(
        uow: PedidoUnitOfWork, pedido_id: int, *, bloquear: bool = False
    ) -> Pedido:
        if bloquear:
            pedido = uow.pedidos.get_for_update(pedido_id)
        else:
            pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    @staticmethod
    def _validar_sin_repetidos(data: PedidoCreate) -> None:
        vistos: set[int] = set()
        for item in data.items:
            if item.producto_id in vistos:
                raise ProductoRepetido(item.producto_id)
            vistos.add(item.producto_id)

    @staticmethod
    def _aplicar_transicion(
        uow: PedidoUnitOfWork, pedido: Pedido, nuevo: EstadoPedido
    ) -> None:
        actual = EstadoPedido(pedido.estado)
        if nuevo not in TRANSICIONES[actual]:
            raise TransicionInvalida(actual, nuevo)
        if nuevo == EstadoPedido.CANCELADO:
            for item in sorted(pedido.items, key=lambda i: i.producto_id):
                producto = uow.productos.get_for_update(item.producto_id)
                if producto is not None:
                    producto.stock += item.cantidad
        pedido.estado = nuevo
        uow.pedidos.add(pedido)
