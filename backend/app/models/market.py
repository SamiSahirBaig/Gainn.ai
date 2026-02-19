"""
Market data model — price snapshots for crops.
"""

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class MarketData(Base, TimestampMixin):
    __tablename__ = "market_data"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"), nullable=False, index=True)

    price = Column(Float, nullable=False, comment="₹ per quintal")
    unit = Column(String(50), default="quintal", nullable=False)
    market_name = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    recorded_at = Column(DateTime(timezone=True), nullable=False)

    # Relationships
    crop = relationship("Crop", back_populates="market_data")

    def __repr__(self):
        return f"<MarketData id={self.id} crop_id={self.crop_id} price={self.price}>"
