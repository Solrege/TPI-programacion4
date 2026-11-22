from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.models import EstadoPedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoCancelable,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Rol
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/pedidos", tags=["pedidos"])

Usuario = Annotated[UserPublic, Depends(get_current_active_user)]
Admin = Annotated[UserPublic, Depends(require_role([Rol.ADMIN]))]


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


Service = Annotated[PedidoService, Depends(get_pedido_service)]


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, usuario: Usuario, service: Service) -> PedidoRead:
    try:
        return service.crear(data, usuario)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    except (ProductoRepetido, ProductoNoDisponible, StockInsuficiente) as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e)) from e


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: Usuario,
    service: Service,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
) -> PedidosPaginados:
    return service.listar(usuario, estado=estado, skip=skip, limit=limit)


@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_admin: Admin, service: Service) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: int, usuario: Usuario, service: Service) -> PedidoRead:
    try:
        return service.obtener(pedido_id, usuario)
    except PedidoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    except PedidoAjeno as e:
        raise HTTPException(status.HTTP_403_FORBIDDEN, str(e)) from e


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(
    pedido_id: int, data: CambioEstado, _admin: Admin, service: Service
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except PedidoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    except TransicionInvalida as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e)) from e


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: int, usuario: Usuario, service: Service) -> PedidoRead:
    try:
        return service.cancelar(pedido_id, usuario)
    except PedidoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    except PedidoAjeno as e:
        raise HTTPException(status.HTTP_403_FORBIDDEN, str(e)) from e
    except PedidoNoCancelable as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e)) from e
