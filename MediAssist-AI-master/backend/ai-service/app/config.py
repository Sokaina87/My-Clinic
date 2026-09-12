from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Identité du service (Eureka)
    app_name: str = "AI-SERVICE"
    instance_port: int = 8000

    # Eureka
    eureka_server: str = "http://eureka_server:8761/eureka"
    eureka_enabled: bool = True

    # Auth-Service (pour récupérer un JWT technique)
    auth_service_client_id: str = ""
    auth_service_client_secret: str = ""

    # Validation du JWT utilisateur transmis par le Gateway
    jwt_public_key: str = ""

    # LLM (Gemini)
    google_api_key: str = ""
    gemini_model: str = "gemini-3.6-flash"  # Recommended model by Google API
    gemini_fallback_model: str = "gemini-3.5-flash"

    # Catalogue local de médicaments (PostgreSQL + pgvector)
    medication_database_url: str = "postgresql://mediassist_user:mediassist_password@localhost:5438/medication_db"
    doctor_database_url: str = "postgresql://mediassist_user:mediassist_password@localhost:5434/doctor_db"
    appointment_database_url: str = "postgresql://mediassist_user:mediassist_password@localhost:5435/appointment_db"

    class Config:
        env_file = ".env"


settings = Settings()
