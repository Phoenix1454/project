from sqlalchemy import Column, Integer, String, Enum, Text
import enum
from .database import Base

class DifficultyLevel(str, enum.Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"

# --- Course Model ---
class Course(Base):
    __tablename__ = 'courses'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    thumbnail_url = Column(String)
    difficulty = Column(String)
    video_count = Column(Integer, default=0)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())

class CoursePurchase(Base):
    """Track individual course purchases"""
    __tablename__ = "course_purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    purchased_at = Column(String, default=lambda: datetime.utcnow().isoformat())
    stripe_payment_id = Column(String)
    amount_paid = Column(Float, default=2.0)  # £2 per course

# --- Video Model ---
class Video(Base):
    __tablename__ = 'videos'

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, default=1)  # FK to Course (default to first course)
    course_category = Column(String, nullable=True)  # e.g., "adulting_101", "diy_home"
    level_index = Column(Integer, nullable=True)  # e.g., 1, 2, 3, 4, 5 (Step number in UI)
    url = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, index=True, nullable=False)
    description = Column(Text)
    duration_seconds = Column(Integer)
    view_count = Column(Integer)
    like_count = Column(Integer)
    resolution_height = Column(Integer)
    
    # Curriculum Organization
    difficulty_level = Column(Enum(DifficultyLevel), nullable=True)
    cluster_name = Column(String, nullable=True) # e.g., "Basics", "Patterns"
    order_index = Column(Integer, nullable=True) # For manual sorting

    def __repr__(self):
        return f"<Video(title='{self.title}', difficulty='{self.difficulty_level}')>"

class UserProgress(Base):
    __tablename__ = 'user_progress'

    user_id = Column(String, primary_key=True, index=True) # Simple string ID for MVP
    video_id = Column(Integer, primary_key=True, index=True) # Composite PK (user_id, video_id)
    is_completed = Column(Integer, default=0) # 0 or 1 (Boolean in Postgres)
    completed_at = Column(String, nullable=True) # ISO format string for simplicity

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Integer, default=0) # 0=False, 1=True
    created_at = Column(String) # ISO format
    
    # Premium/Payment fields
    is_premium = Column(Integer, default=0) # 0=False, 1=True
    stripe_customer_id = Column(String, nullable=True)
    premium_expires_at = Column(String, nullable=True) # ISO format, None = lifetime

