from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import COOKIE_NAME, settings
from app.core.deps import get_current_active_user
from app.core.schemas import SESION, errores
from app.modules.auth.schemas import MessageResponse
from app.modules.auth.service import (
    AuthService,
    CredencialesInvalidas,
    CuentaDesactivada,
    UsuarioDuplicado,
)
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_SAMESITE = "lax"


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


Service = Annotated[AuthService, Depends(get_auth_service)]


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar usuario",
    responses=errores({409: "El username o el email ya existen"}),
)
def register(data: UserCreate, service: Service) -> UserPublic:
    try:
        return service.registrar(data)
    except UsuarioDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e)) from e


@router.post(
    "/token",
    response_model=MessageResponse,
    summary="Iniciar sesión",
    responses=errores(
        {401: "Credenciales incorrectas", 400: "Cuenta de usuario desactivada"}
    ),
)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: Service,
) -> MessageResponse:
    try:
        token = service.autenticar(form.username, form.password)
    except CredencialesInvalidas as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(e)) from e
    except CuentaDesactivada as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e)) from e
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/",
    )
    return MessageResponse(message="Login exitoso")


@router.post("/logout", response_model=MessageResponse, summary="Cerrar sesión")
def logout(response: Response) -> MessageResponse:
    response.delete_cookie(
        key=COOKIE_NAME,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/",
    )
    return MessageResponse(message="Logout exitoso")


@router.get(
    "/me",
    response_model=UserPublic,
    summary="Usuario autenticado",
    responses=errores({**SESION, 400: "Cuenta de usuario desactivada"}),
)
def me(
    current_user: Annotated[UserPublic, Depends(get_current_active_user)],
) -> UserPublic:
    return current_user
