from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.db.models  # noqa: F401
from app.core.config import API_PREFIX, settings
from app.core.database import create_all_tables
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="API REST del sistema de pedidos de comida Food Store.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix=API_PREFIX)


@api_router.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


api_router.include_router(usuarios_router)

app.include_router(api_router)
