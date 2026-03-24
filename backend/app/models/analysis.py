"""
Analysis model — a single land-analysis run.
"""

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String, JSON
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class Analysis(Base, TimestampMixin):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    land_id = Column(Integer, ForeignKey("lands.id", ondelete="CASCADE"), nullable=False, index=True)

    # Status
    status = Column(
        String(20),
        default="pending",
        nullable=False,
        index=True,
        comment="pending | processing | completed | failed",
    )

    # Timestamps
    analysis_date = Column(DateTime(timezone=True), nullable=True)

    # Data
    input_data = Column(JSON, nullable=True, comment="Raw input snapshot")
    results = Column(JSON, nullable=True, comment="Analysis output")

    # Relationships
    user = relationship("User", back_populates="analyses")
    land = relationship("Land", back_populates="analyses")
    recommendations = relationship("Recommendation", back_populates="analysis", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Analysis id={self.id} status={self.status!r}>"
