from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SubmissionCreate(BaseModel):
    text_content: str
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None

class SubmissionResponse(SubmissionCreate):
    id: int
    original_language: str
    extracted_theme: Optional[str]
    sentiment: Optional[str]
    urgency_score: float
    created_at: datetime

    class Config:
        from_attributes = True

class ProposedProjectResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    location_lat: float
    location_lng: float
    base_score: float
    dynamic_score: float
    total_score: float

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_submissions: int
    top_themes: List[dict]
    hotspot_locations: List[dict] # {lat, lng, weight}

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    message: str
