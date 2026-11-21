from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyCookie

from app.core.config import COOKIE_NAME
from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"

cookie_scheme = APIKeyCookie(name=COOKIE_NAME, auto_error=False)


def get_usuario_uow() -> UsuarioUnitOfWork:
    return UsuarioUnitOfWork()


def get_current_user(
    uow: Annotated[UsuarioUnitOfWork, Depends(get_usuario_uow)],
    token: Annotated[str | None, Depends(cookie_scheme)] = None,
) -> UserPublic:
    no_autenticado = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado o sesión vencida",
    )
    payload = decode_access_token(token) if token else None
    if payload is None:
        raise no_autenticado
    with uow:
        usuario = uow.usuarios.get_by_username(payload["sub"])
        if usuario is None:
            raise no_autenticado
        return UserPublic.model_validate(usuario)


def get_current_active_user(
    current_user: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=CUENTA_DESACTIVADA
        )
    return current_user


def require_role(allowed_roles: list[str]) -> Callable[..., UserPublic]:
    def role_checker(
        current_user: Annotated[UserPublic, Depends(get_current_active_user)],
    ) -> UserPublic:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permisos insuficientes",
            )
        return current_user

    return role_checker
