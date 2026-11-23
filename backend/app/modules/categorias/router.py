from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.core.schemas import SOLO_ADMIN, errores
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.models import Rol
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/categorias", tags=["categorias"])

NO_ENCONTRADA = {404: "Categoría no encontrada o dada de baja"}
DUPLICADA = {409: "Ya existe una categoría con ese nombre"}

Admin = Annotated[UserPublic, Depends(require_role([Rol.ADMIN]))]


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


Service = Annotated[CategoriaService, Depends(get_categoria_service)]


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: Service) -> list[CategoriaRead]:
    return service.listar()


@router.get(
    "/{categoria_id}", response_model=CategoriaRead, responses=errores(NO_ENCONTRADA)
)
def obtener_categoria(categoria_id: int, service: Service) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    responses=errores({**SOLO_ADMIN, **DUPLICADA}),
)
def crear_categoria(
    data: CategoriaCreate, _admin: Admin, service: Service
) -> CategoriaRead:
    try:
        return service.crear(data)
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e)) from e


@router.put(
    "/{categoria_id}",
    response_model=CategoriaRead,
    responses=errores({**SOLO_ADMIN, **NO_ENCONTRADA, **DUPLICADA}),
)
def actualizar_categoria(
    categoria_id: int, data: CategoriaUpdate, _admin: Admin, service: Service
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e)) from e


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses=errores({**SOLO_ADMIN, **NO_ENCONTRADA}),
)
def eliminar_categoria(categoria_id: int, _admin: Admin, service: Service) -> Response:
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    return Response(status_code=status.HTTP_204_NO_CONTENT)
