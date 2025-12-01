#!/usr/bin/env python3
"""
Seed script to create sample courses
"""

from backend.database import SessionLocal, engine
from backend.models import Base, Course
from datetime import datetime

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Create sample courses
courses = [
    {
        "title": "Stitching Mastery",
        "description": "Master the fundamentals of stitching from beginner to advanced techniques",
        "difficulty": "Beginner",
        "thumbnail_url": None,
        "video_count": 0,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "title": "Advanced Embroidery",
        "description": "Take your embroidery skills to the next level with advanced patterns and techniques",
        "difficulty": "Advanced",
        "thumbnail_url": None,
        "video_count": 0,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "title": "Pattern Making Basics",
        "description": "Learn to create your own sewing patterns from scratch",
        "difficulty": "Intermediate",
        "thumbnail_url": None,
        "video_count": 0,
        "created_at": datetime.utcnow().isoformat()
    }
]

for course_data in courses:
    existing = db.query(Course).filter(Course.title == course_data["title"]).first()
    if not existing:
        course = Course(**course_data)
        db.add(course)
        print(f"✅ Created course: {course_data['title']}")
    else:
        print(f"⏭️  Course already exists: {course_data['title']}")

db.commit()
print("\n✨ Course seeding complete!")
db.close()
