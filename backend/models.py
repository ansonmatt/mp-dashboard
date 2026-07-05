from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    text_content = Column(Text, nullable=False)
    original_language = Column(String, default="en")
    extracted_theme = Column(String, nullable=True) # e.g. "Education", "Roads"
    sentiment = Column(String, nullable=True)
    urgency_score = Column(Float, default=0.0)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ProposedProject(Base):
    __tablename__ = "proposed_projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    category = Column(String)
    location_lat = Column(Float)
    location_lng = Column(Float)
    base_score = Column(Float, default=0.0) # From demographic/infrastructure needs
    dynamic_score = Column(Float, default=0.0) # From citizen submissions
    total_score = Column(Float, default=0.0) # Final ranking score

class MockDemographic(Base):
    __tablename__ = "mock_demographics"
    
    id = Column(Integer, primary_key=True, index=True)
    region_name = Column(String)
    population = Column(Integer)
    avg_income = Column(Float)
    infrastructure_gap_score = Column(Float) # 0 to 10 (higher means worse infrastructure)
