import sys
import os

# Add parent directory to path to allow importing from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.ingestion.scraper import YouTubeScraper
from backend.ingestion.validator import VideoValidator
from backend.models import Video, Base, DifficultyLevel
from backend.main import SessionLocal, engine
from sqlalchemy.orm import Session

def seed_content():
    print("Initializing Content Ingestion...")
    
    scraper = YouTubeScraper()
    validator = VideoValidator()
    db = SessionLocal()
    
    # Define search queries to target different difficulties
    queries = [
        ("Stitching for absolute beginners", DifficultyLevel.BEGINNER),
        ("Basic embroidery stitches", DifficultyLevel.BEGINNER),
        ("Intermediate embroidery techniques", DifficultyLevel.INTERMEDIATE),
        ("Advanced stitching masterclass", DifficultyLevel.INTERMEDIATE) # Mapping to Intermediate for now as per validator logic
    ]
    
    total_added = 0
    
    for query, target_difficulty in queries:
        print(f"\n--- Processing Query: '{query}' ---")
        # Fetch more than we need because validator will filter some out
        raw_videos = scraper.search_videos(query, max_results=10)
        
        for vid_meta in raw_videos:
            # 1. Validate
            validated_video = validator.validate(vid_meta)
            
            if validated_video:
                # 2. Check for duplicates
                existing = db.query(Video).filter(Video.url == validated_video.url).first()
                if existing:
                    print(f"Skipping duplicate: {validated_video.title}")
                    continue
                
                # 3. Save to DB
                # Determine order index (simple auto-increment for now)
                count = db.query(Video).count()
                
                new_video = Video(
                    title=validated_video.title,
                    url=validated_video.url,
                    description=validated_video.description[:500] if validated_video.description else "",
                    duration_seconds=validated_video.duration_seconds,
                    view_count=validated_video.view_count,
                    like_count=validated_video.like_count,
                    resolution_height=validated_video.resolution_height,
                    difficulty_level=validated_video.difficulty, # Validator sets this
                    cluster_name="General Stitching",
                    order_index=count + 1
                )
                
                db.add(new_video)
                db.commit()
                print(f"[ADDED] {validated_video.title} ({validated_video.difficulty})")
                total_added += 1
            else:
                print(f"[REJECTED] {vid_meta.title}")

    print(f"\n\nIngestion Complete! Added {total_added} new videos.")
    db.close()

if __name__ == "__main__":
    seed_content()
