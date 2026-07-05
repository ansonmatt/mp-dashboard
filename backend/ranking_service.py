from sqlalchemy.orm import Session
import models

def recalculate_project_scores(db: Session):
    projects = db.query(models.ProposedProject).all()
    submissions = db.query(models.Submission).all()
    
    for project in projects:
        # Calculate dynamic score based on submissions in the same category
        related_submissions = [s for s in submissions if s.extracted_theme == project.category]
        
        volume = len(related_submissions)
        urgency_sum = sum(s.urgency_score for s in related_submissions)
        
        # A simple formula:
        dynamic_score = (volume * 0.5) + (urgency_sum * 1.5)
        
        project.dynamic_score = dynamic_score
        project.total_score = project.base_score + project.dynamic_score
        
    db.commit()
