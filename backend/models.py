"""
models.py — SQLAlchemy ORM models.
"""
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text
from database import Base


class AnalysisCase(Base):
    __tablename__ = "analysis_cases"

    case_id         = Column(String,  primary_key=True, index=True)
    image_status    = Column(String,  nullable=False)
    confidence_score = Column(Float,  nullable=False)
    forensic_score  = Column(Float,   nullable=False)
    risk_level      = Column(String,  nullable=False)
    face_manipulation = Column(Float, default=0.0)
    splice_detection  = Column(Float, default=0.0)
    metadata_anomaly  = Column(Float, default=0.0)
    noise_analysis    = Column(Float, default=0.0)
    ela_image_data    = Column(Text,  nullable=True)
    timestamp         = Column(DateTime, default=datetime.utcnow)


class IncidentReport(Base):
    __tablename__ = "incident_reports"

    case_id      = Column(String,   primary_key=True, index=True)
    name         = Column(String,   nullable=False)
    email        = Column(String,   nullable=False)
    gender       = Column(String,   nullable=False)
    age          = Column(String,   nullable=False)
    location     = Column(String,   nullable=False)
    contact      = Column(String,   nullable=False)
    description  = Column(Text,     nullable=False)
    status       = Column(String,   default="Filed")
    submitted_at = Column(DateTime, default=datetime.utcnow)
