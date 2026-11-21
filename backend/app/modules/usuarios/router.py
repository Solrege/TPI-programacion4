from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.modules.usuarios.models import Rol
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    AutoDesactivacion,
    UsuarioNoEncontrado,
    UsuarioService,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])

Admin = Annotated[UserPublic, Depends(require_role([Rol.ADMIN]))]


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


Service = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=list[UserPublic])
def listar_usuarios(_admin: Admin, service: Service) -> list[UserPublic]:
    return service.listar()


@router.post("/{user_id}/activar", response_model=UserPublic)
def activar_usuario(user_id: int, _admin: Admin, service: Service) -> UserPublic:
    try:
        return service.activar(user_id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.post("/{user_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(user_id: int, admin: Admin, service: Service) -> UserPublic:
    try:
        return service.desactivar(user_id, admin_id=admin.id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    except AutoDesactivacion as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e)) from e
