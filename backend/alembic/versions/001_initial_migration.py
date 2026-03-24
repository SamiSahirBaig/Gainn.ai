"""Initial migration — all tables.

Revision ID: 001
Revises: None
Create Date: 2025-02-20

Creates tables: users, lands, crops, analyses, recommendations, market_data.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users ────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255)),
        sa.Column("phone", sa.String(20)),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("is_superuser", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # ── lands ────────────────────────────────────────────
    op.create_table(
        "lands",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("latitude", sa.Float),
        sa.Column("longitude", sa.Float),
        sa.Column("size", sa.Float),
        sa.Column("elevation", sa.Float),
        sa.Column("soil_type", sa.String(50)),
        sa.Column("soil_ph", sa.Float),
        sa.Column("organic_matter", sa.Float),
        sa.Column("nitrogen", sa.Float),
        sa.Column("phosphorus", sa.Float),
        sa.Column("potassium", sa.Float),
        sa.Column("irrigation_available", sa.Boolean, default=False),
        sa.Column("water_source", sa.String(50)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("ix_lands_user_id", "lands", ["user_id"])

    # ── crops ────────────────────────────────────────────
    op.create_table(
        "crops",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("name", sa.String(100), unique=True, nullable=False),
        sa.Column("category", sa.String(50)),
        sa.Column("scientific_name", sa.String(200)),
        sa.Column("growth_duration", sa.Integer),
        sa.Column("min_temperature", sa.Float),
        sa.Column("max_temperature", sa.Float),
        sa.Column("min_rainfall", sa.Float),
        sa.Column("max_rainfall", sa.Float),
        sa.Column("min_ph", sa.Float),
        sa.Column("max_ph", sa.Float),
        sa.Column("preferred_soil_types", sa.JSON),
        sa.Column("nitrogen_requirement", sa.Float),
        sa.Column("phosphorus_requirement", sa.Float),
        sa.Column("potassium_requirement", sa.Float),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # ── analyses ─────────────────────────────────────────
    op.create_table(
        "analyses",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("land_id", sa.Integer, sa.ForeignKey("lands.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(20), default="pending"),
        sa.Column("analysis_date", sa.DateTime(timezone=True)),
        sa.Column("input_data", sa.JSON),
        sa.Column("results", sa.JSON),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("ix_analyses_user_id", "analyses", ["user_id"])
    op.create_index("ix_analyses_land_id", "analyses", ["land_id"])

    # ── recommendations ──────────────────────────────────
    op.create_table(
        "recommendations",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("analysis_id", sa.Integer, sa.ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False),
        sa.Column("crop_id", sa.Integer, sa.ForeignKey("crops.id", ondelete="CASCADE"), nullable=False),
        sa.Column("suitability_score", sa.Float),
        sa.Column("predicted_yield", sa.Float),
        sa.Column("estimated_profit", sa.Float),
        sa.Column("confidence", sa.Float),
        sa.Column("rank", sa.Integer),
        sa.Column("details", sa.JSON),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("ix_recommendations_analysis_id", "recommendations", ["analysis_id"])

    # ── market_data ──────────────────────────────────────
    op.create_table(
        "market_data",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("crop_id", sa.Integer, sa.ForeignKey("crops.id", ondelete="CASCADE"), nullable=False),
        sa.Column("price_per_unit", sa.Float),
        sa.Column("unit", sa.String(20)),
        sa.Column("market_name", sa.String(100)),
        sa.Column("date_recorded", sa.DateTime(timezone=True)),
        sa.Column("source", sa.String(100)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("ix_market_data_crop_id", "market_data", ["crop_id"])


def downgrade() -> None:
    op.drop_table("market_data")
    op.drop_table("recommendations")
    op.drop_table("analyses")
    op.drop_table("crops")
    op.drop_table("lands")
    op.drop_table("users")
