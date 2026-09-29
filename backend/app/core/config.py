import os
from pathlib import Path
from dotenv import load_dotenv

# Automatically load .env from backend directory or project root
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv() # Fallback to standard local .env

class Settings:
    PROJECT_NAME: str = "Aegis-Kernel"
    API_V1_STR: str = "/api/v1"
    
    # Nebius Token Factory
    NEBIUS_API_KEY: str = os.getenv("NEBIUS_API_KEY", "")
    NEBIUS_BASE_URL: str = os.getenv("NEBIUS_BASE_URL", "https://api.tokenfactory.nebius.ai/v1")
    NEMOTRON_ULTRA_MODEL: str = os.getenv("NEMOTRON_ULTRA_MODEL", "nvidia/nemotron-3-ultra")
    NEMOTRON_NANO_MODEL: str = os.getenv("NEMOTRON_NANO_MODEL", "nvidia/nemotron-nano")
    
    # Tavily
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
    
    # Sandbox Settings
    SANDBOX_MODE: str = os.getenv("SANDBOX_MODE", "auto")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./aegis_kernel.db")

settings = Settings()
