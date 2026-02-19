"""
Recommendation model — a crop suggestion from an analysis.
"""

from sqlalchemy import Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class Recommendation(Base, TimestampMixin):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"), nullable=False, index=True)

    # Scores
    suitability_score = Column(Float, nullable=False, comment="0–100")
    predicted_yield = Column(Float, nullable=True, comment="tons/ha")
    estimated_profit = Column(Float, nullable=True, comment="₹ per acre")
    confidence_level = Column(Float, nullable=True, comment="0–1")

    # Rank within the analysis
    rank = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    analysis = relationship("Analysis", back_populates="recommendations")
    crop = relationship("Crop", back_populates="recommendations")

    def __repr__(self):
        return f"<Recommendation id={self.id} crop_id={self.crop_id} score={self.suitability_score}>"
