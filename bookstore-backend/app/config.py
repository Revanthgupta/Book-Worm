from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # ignore unknown env vars (e.g. DB_PASSWORD helper var)
    )

    database_url: str = "postgresql://user:pass@localhost:5432/bookstore"
    test_database_url: str = "postgresql://user:pass@localhost:5432/bookstore_test"
    secret_key: str = "change-me"
    access_token_expire_days: int = 7
    frontend_origin: str = "http://localhost:5173"


settings = Settings()
