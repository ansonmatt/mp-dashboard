from database import SessionLocal, engine
import models

def seed_db():
    # Only seed if empty
    db = SessionLocal()
    
    if db.query(models.ProposedProject).count() > 0:
        print("Database already seeded.")
        return
        
    print("Seeding database with mock projects...")
    projects = [
        models.ProposedProject(
            title="New High School in North District",
            description="Build a new high school to alleviate overcrowding.",
            category="Education",
            location_lat=28.7041,
            location_lng=77.1025,
            base_score=15.0
        ),
        models.ProposedProject(
            title="Highway Overpass Repair",
            description="Repair the crumbling overpass on Main Street.",
            category="Infrastructure",
            location_lat=28.6139,
            location_lng=77.2090,
            base_score=20.0
        ),
        models.ProposedProject(
            title="Community Health Center Expansion",
            description="Add more beds and a trauma unit to the community center.",
            category="Health",
            location_lat=28.5355,
            location_lng=77.2410,
            base_score=18.0
        ),
        models.ProposedProject(
            title="Water Treatment Plant Upgrade",
            description="Upgrade plant to handle increased capacity.",
            category="Water",
            location_lat=28.6500,
            location_lng=77.2300,
            base_score=12.0
        )
    ]
    
    db.add_all(projects)
    db.commit()
    print("Seeding complete.")

if __name__ == "__main__":
    models.Base.metadata.create_all(bind=engine)
    seed_db()
