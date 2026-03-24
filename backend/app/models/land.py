"""
Land / Farm parcel model.
"""

from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class Land(Base, TimestampMixin):
    __tablename__ = "lands"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)

    # Location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation = Column(Float, nullable=True)

    # Size
    size = Column(Float, nullable=False, comment="Size in hectares")

    # Soil properties
    soil_type = Column(String(100), nullable=True)
    soil_ph = Column(Float, nullable=True)
    organic_matter = Column(Float, nullable=True, comment="Percentage")
    nitrogen = Column(Float, nullable=True, comment="kg/ha")
    phosphorus = Column(Float, nullable=True, comment="kg/ha")
    potassium = Column(Float, nullable=True, comment="kg/ha")

    # Infrastructure
    irrigation_available = Column(Boolean, default=False, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="lands")
    analyses = relationship("Analysis", back_populates="land", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Land id={self.id} name={self.name!r} ({self.latitude}, {self.longitude})>"
