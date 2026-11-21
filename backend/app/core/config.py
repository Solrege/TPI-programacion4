from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"

API_PREFIX = "/api/v1"
COOKIE_NAME = "access_token"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str = Field(description="Cadena de conexión de SQLAlchemy")
    SECRET_KEY: str = Field(min_length=32, description="Clave de firma del JWT")
    ALGORITHM: str = Field(default="HS256", description="Algoritmo del JWT")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30, gt=0, description="Expiración del token y de la cookie"
    )
    FRONTEND_ORIGIN: str = Field(
        default="http://localhost:5173", description="Origen permitido en CORS"
    )
    COOKIE_SECURE: bool = Field(
        default=False, description="Cookie solo por HTTPS (true en producción)"
    )


settings = Settings()
