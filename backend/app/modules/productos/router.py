from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Rol
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/productos", tags=["productos"])

Admin = Annotated[UserPublic, Depends(require_role([Rol.ADMIN]))]


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


Service = Annotated[ProductoService, Depends(get_producto_service)]


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: Service,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[str | None, Query(description="Busca en el nombre")] = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
) -> ProductosPaginados:
    return service.listar(
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
        skip=skip,
        limit=limit,
    )


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, service: Service) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(
    data: ProductoCreate, _admin: Admin, service: Service
) -> ProductoRead:
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int, data: ProductoUpdate, _admin: Admin, service: Service
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int, data: ProductoStockUpdate, _admin: Admin, service: Service
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(producto_id: int, _admin: Admin, service: Service) -> Response:
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    return Response(status_code=status.HTTP_204_NO_CONTENT)
