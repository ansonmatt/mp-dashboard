from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

import models
import schemas
from database import engine, get_db
import ai_service
import ranking_service

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="People's Priorities API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the People's Priorities API"}

@app.post("/api/login", response_model=schemas.LoginResponse)
def login(request: schemas.LoginRequest):
    # Hardcoded MVP authentication
    if request.username == "admin" and request.password == "admin":
        return {"token": "mock-jwt-token-12345", "message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/submissions/", response_model=schemas.SubmissionResponse)
def create_submission(submission: schemas.SubmissionCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # 1. Process submission with AI synchronously to get category and urgency
    ai_result = ai_service.process_submission(submission.text_content)
    
    # 2. Save to database
    db_submission = models.Submission(
        text_content=submission.text_content,
        extracted_theme=ai_result["category"],
        sentiment=ai_result["sentiment"],
        urgency_score=ai_result["urgency_score"],
        location_lat=submission.location_lat,
        location_lng=submission.location_lng
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    
    # 3. Trigger ranking recalculation in background
    background_tasks.add_task(ranking_service.recalculate_project_scores, db)
    
    return db_submission

@app.get("/submissions/", response_model=List[schemas.SubmissionResponse])
def get_submissions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Submission).order_by(models.Submission.created_at.desc()).offset(skip).limit(limit).all()

@app.get("/projects/", response_model=List[schemas.ProposedProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(models.ProposedProject).order_by(models.ProposedProject.total_score.desc()).all()

@app.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total = db.query(models.Submission).count()
    
    # Top themes
    theme_counts = db.query(
        models.Submission.extracted_theme, 
        func.count(models.Submission.id).label('count')
    ).group_by(models.Submission.extracted_theme).order_by(func.count(models.Submission.id).desc()).limit(5).all()
    
    top_themes = [{"theme": t[0], "count": t[1]} for t in theme_counts if t[0]]
    
    # Hotspots
    submissions_with_loc = db.query(models.Submission).filter(
        models.Submission.location_lat.isnot(None), 
        models.Submission.location_lng.isnot(None)
    ).all()
    
    hotspots = [
        {"lat": s.location_lat, "lng": s.location_lng, "weight": s.urgency_score * 10}
        for s in submissions_with_loc
    ]
    
    return schemas.DashboardStats(
        total_submissions=total,
        top_themes=top_themes,
        hotspot_locations=hotspots
    )
