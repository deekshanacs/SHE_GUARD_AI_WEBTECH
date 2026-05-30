"""
database.py — SQLAlchemy session factory.

Priority order for DATABASE_URL:
  1. DATABASE_URL env var  →  Render Postgres (production)
  2. Fallback              →  local SQLite file (development)

SQLite note: Render's free-tier filesystem is ephemeral — data is lost on
every redeploy.  Always use a Render Postgres database in production.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL: str = os.environ.get(
    "DATABASE_URL",
    "sqlite:///./sheguard.db",          # local dev fallback
)

# Render Postgres connection strings start with "postgres://" but
# SQLAlchemy 1.4+ requires "postgresql://".
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
