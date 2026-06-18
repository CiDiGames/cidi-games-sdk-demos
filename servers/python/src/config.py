from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppSettings(BaseSettings):
    port: int = Field(default=3001, alias="PORT")
    cidi_base_url: str = Field(default="https://openapi-tst.cidi.games", alias="CIDI_BASE_URL")
    cidi_api_key: str = Field(alias="CIDI_API_KEY")
    cidi_api_secret: str = Field(alias="CIDI_API_SECRET")
    cidi_callback_secret: str = Field(default="", alias="CIDI_CALLBACK_SECRET")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def normalized_cidi_base_url(self) -> str:
        return self.cidi_base_url.rstrip("/")


@lru_cache
def get_settings() -> AppSettings:
    return AppSettings()
