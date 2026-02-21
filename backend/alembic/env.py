"""
Alembic Environment Configuration.

Reads the database URL from app settings and imports all models
so autogenerate can detect schema changes.
"""

from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# ── App imports ──────────────────────────────────────────
from app.core.config import settings
from app.db.base import Base

# Import every model so Base.metadata sees them
from app.models import (  # noqa: F401
    User,
    Land,
    Analysis,
    Crop,
    Recommendation,
    MarketData,
)

# ── Alembic Config ───────────────────────────────────────
config = context.config

# Override sqlalchemy.url with the value from app settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# This is the MetaData that autogenerate will diff against
target_metadata = Base.metadata


# ── Offline (SQL script) mode ────────────────────────────

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode — emits SQL to stdout."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


# ── Online (live DB) mode ────────────────────────────────

def run_migrations_online() -> None:
    """Run migrations against a live database connection."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
