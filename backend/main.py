from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker, Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta

from .models import Base, Video, UserProgress, DifficultyLevel, User, Course
from . import auth
from .database import engine, SessionLocal, get_db

# --- Database Setup (SQLite for MVP) ---
Base.metadata.create_all(bind=engine)

# --- Pydantic Models ---
class VideoResponse(BaseModel):
    id: int
    title: str
    status: str # 'locked', 'active', 'completed'
    x: int = 0
    y: int = 0
    video_url: str

class ProgressRequest(BaseModel):
    video_id: int

class UserCreate(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    email: str
    is_admin: bool
    is_premium: bool

class CourseResponse(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    video_count: int

# --- FastAPI App ---
app = FastAPI()

# Enable CORS for frontend
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when using "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Auth Endpoints ---

@app.post("/auth/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        created_at=datetime.utcnow().isoformat(),
        is_admin=0 # Default to normal user
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = auth.create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(auth.get_current_user)):
    return UserResponse(id=current_user.id, email=current_user.email, is_admin=bool(current_user.is_admin), is_premium=bool(current_user.is_premium))

# --- Application Endpoints ---

# Course Endpoints
@app.get("/courses", response_model=List[CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    """Get all available courses"""
    courses = db.query(Course).all()
    
    # Update video counts
    for course in courses:
        count = db.query(Video).filter(Video.course_id == course.id).count()
        course.video_count = count
    
    db.commit()
    
    return [
        CourseResponse(
            id=c.id,
            title=c.title,
            description=c.description,
            difficulty=c.difficulty,
            video_count=c.video_count
        ) for c in courses
    ]

@app.get("/courses/{course_id}/path", response_model=List[VideoResponse])
def get_course_path(course_id: int, current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """
    Returns the curriculum for a specific course.
    """
    # Get all videos for this course
    videos = db.query(Video).filter(Video.course_id == course_id).order_by(Video.id).all()
    
    if not videos:
        raise HTTPException(status_code=404, detail="Course not found or has no videos")
    
    # Get user's completed videos for this course
    completed_progress = db.query(UserProgress).filter(
        UserProgress.user_id == str(current_user.id),
        UserProgress.is_completed == 1
    ).all()
    completed_video_ids = {int(p.video_id) for p in completed_progress}
    
    # Build response
    result = []
    first_incomplete_found = False
    
    for idx, video in enumerate(videos):
        # Determine status
        if video.id in completed_video_ids:
            status = "completed"
        elif current_user.is_admin or current_user.is_premium:
            status = "active"
        elif not first_incomplete_found:
            status = "active"
            first_incomplete_found = True
        else:
            status = "locked"
        
        result.append(VideoResponse(
            id=video.id,
            title=video.title,
            status=status,
            x=400 + (100 if idx % 2 == 0 else -100),
            y=(idx + 1) * 160,
            video_url=video.url
        ))
    
    return result

@app.get("/path", response_model=List[VideoResponse])
def get_path(current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """
    Returns the full curriculum for the logged-in user.
    """
    # 1. Fetch all videos ordered by order_index
    videos = db.query(Video).order_by(Video.order_index).all()
    
    # 2. Fetch user progress
    progress_records = db.query(UserProgress).filter(UserProgress.user_id == str(current_user.id)).all()
    completed_video_ids = {p.video_id for p in progress_records if p.is_completed}

    response = []
    first_incomplete_found = False

    for i, video in enumerate(videos):
        status = "locked"
        
        if video.id in completed_video_ids:
            status = "completed"
        elif current_user.is_admin or current_user.is_premium:
            # God Mode: Admins and Premium users see everything as active (unlocked)
            status = "active"
        elif not first_incomplete_found:
            # The first video that isn't completed is the "active" one
            status = "active"
            first_incomplete_found = True
        
        # Mock positions for the UI (Sine wave pattern)
        NODE_SPACING = 160
        PATH_WIDTH = 200
        CENTER_X = 400
        y = (i + 1) * NODE_SPACING
        x = CENTER_X + (PATH_WIDTH * (1 if i % 2 == 0 else -1) * 0.5) 
        
        response.append(VideoResponse(
            id=video.id,
            title=video.title,
            status=status,
            x=int(x),
            y=y,
            video_url=video.url
        ))
        
    return response

@app.post("/progress/complete")
def complete_video(req: ProgressRequest, current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """
    Marks a video as completed for the logged-in user.
    """
    # Check if video exists
    video = db.query(Video).filter(Video.id == req.video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Check/Update progress
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == str(current_user.id), 
        UserProgress.video_id == req.video_id
    ).first()

    if not progress:
        progress = UserProgress(
            user_id=str(current_user.id), 
            video_id=req.video_id, 
            is_completed=1, 
            completed_at=datetime.utcnow().isoformat()
        )
        db.add(progress)
    else:
        progress.is_completed = 1
        progress.completed_at = datetime.utcnow().isoformat()
    
    db.commit()
    return {"message": "Progress saved"}

# --- Admin Endpoints ---

@app.get("/admin/dashboard")
def admin_dashboard(current_user: User = Depends(auth.get_current_admin), db: Session = Depends(get_db)):
    """
    Admin-only endpoint to view platform stats.
    """
    user_count = db.query(User).count()
    video_count = db.query(Video).count()
    users = db.query(User).all()
    
    return {
        "message": f"Welcome Admin {current_user.email}",
        "stats": {
            "total_users": user_count,
            "total_videos": video_count
        },
        "users": [{"id": u.id, "email": u.email, "is_admin": u.is_admin} for u in users]
    }

# --- Payment Endpoints ---

from fastapi import Request
from .stripe_handler import StripeHandler

class CheckoutRequest(BaseModel):
    plan: str  # "one_time" or "monthly"

@app.post("/payment/create-checkout")
async def create_checkout(
    req: CheckoutRequest,
    current_user: User = Depends(auth.get_current_user)
):
    """Create a Stripe checkout session"""
    # Determine price ID based on plan
    price_id = StripeHandler.PRICE_ONE_TIME if req.plan == "one_time" else StripeHandler.PRICE_MONTHLY
    
    # Create checkout session
    checkout_url = StripeHandler.create_checkout_session(
        user_email=current_user.email,
        user_id=current_user.id,
        price_id=price_id,
        success_url="http://localhost:3000/payment/success",
        cancel_url="http://localhost:3000/pricing"
    )
    
    return {"checkout_url": checkout_url}

@app.post("/payment/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = StripeHandler.verify_webhook_signature(payload, sig_header)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Handle successful payment
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_data = StripeHandler.handle_successful_payment(session)
        
        # Update user in database
        user = db.query(User).filter(User.id == user_data['user_id']).first()
        if user:
            user.is_premium = 1
            user.stripe_customer_id = user_data['stripe_customer_id']
            user.premium_expires_at = user_data['premium_expires_at']
            db.commit()
    
    return {"status": "success"}

@app.get("/payment/status")
def get_payment_status(current_user: User = Depends(auth.get_current_user)):
    """Get user's premium status"""
    return {
        "is_premium": bool(current_user.is_premium),
        "expires_at": current_user.premium_expires_at
    }

# --- Profile Endpoint ---

@app.get("/profile")
def get_profile(current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """Get user profile with stats"""
    # Get total videos
    total_videos = db.query(Video).count()
    
    # Get completed videos count
    completed_count = db.query(UserProgress).filter(
        UserProgress.user_id == str(current_user.id),
        UserProgress.is_completed == 1
    ).count()
    
    # Calculate progress percentage
    progress_percentage = (completed_count / total_videos * 100) if total_videos > 0 else 0
    
    # Get recently completed videos
    recent_completions = db.query(UserProgress).filter(
        UserProgress.user_id == str(current_user.id),
        UserProgress.is_completed == 1
    ).order_by(UserProgress.completed_at.desc()).limit(5).all()
    
    recent_videos = []
    for progress in recent_completions:
        video = db.query(Video).filter(Video.id == int(progress.video_id)).first()
        if video:
            recent_videos.append({
                "title": video.title,
                "completed_at": progress.completed_at
            })
    
    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "is_premium": bool(current_user.is_premium),
            "is_admin": bool(current_user.is_admin),
            "created_at": current_user.created_at,
            "premium_expires_at": current_user.premium_expires_at
        },
        "stats": {
            "total_videos": total_videos,
            "completed_videos": completed_count,
            "progress_percentage": round(progress_percentage, 1),
            "recent_completions": recent_videos
        }
    }

# --- Seed Data (For Demo) ---
@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    # Seed Videos if empty (handled by seed_content.py usually, but keeping fallback)
    if db.query(Video).count() == 0:
        pass 
        
    # Seed Admin User
    admin_email = "admin@example.com"
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if not existing_admin:
        print("Seeding Admin User...")
        admin_user = User(
            email=admin_email,
            hashed_password=auth.get_password_hash("admin123"),
            is_admin=1,
            created_at=datetime.utcnow().isoformat()
        )
        db.add(admin_user)
        db.commit()
        
    db.close()
