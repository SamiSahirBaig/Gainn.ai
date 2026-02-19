"""
Crop model — reference data for all crop types.
"""

from sqlalchemy import Column, Float, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class Crop(Base, TimestampMixin):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    scientific_name = Column(String(255), nullable=True)
    category = Column(String(100), nullable=True, index=True, comment="e.g. cereal, pulse, oilseed")
    description = Column(Text, nullable=True)

    # Growing conditions
    optimal_temp_min = Column(Float, nullable=True, comment="°C")
    optimal_temp_max = Column(Float, nullable=True, comment="°C")
    water_requirement = Column(Float, nullable=True, comment="mm per season")
    growth_duration = Column(Integer, nullable=True, comment="Days from sowing to harvest")

    # Ideal soil
    optimal_ph_min = Column(Float, nullable=True)
    optimal_ph_max = Column(Float, nullable=True)
    preferred_soil_types = Column(String(255), nullable=True, comment="Comma-separated")

    # Relationships
    recommendations = relationship("Recommendation", back_populates="crop")
    market_data = relationship("MarketData", back_populates="crop", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Crop id={self.id} name={self.name!r}>"
