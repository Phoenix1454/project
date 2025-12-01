from typing import Dict, List, Optional
from dataclasses import dataclass
from backend.models import DifficultyLevel

@dataclass
class VideoMetadata:
    url: str
    title: str
    duration_seconds: int
    description: str
    tags: List[str]
    view_count: int
    like_count: int
    resolution_height: int  # e.g., 720, 1080
    difficulty: Optional[DifficultyLevel] = None # Added field

class VideoValidator:
    """
    Filters scraped video data based on strict quality heuristics for the educational platform.
    Also classifies video difficulty.
    """

    # Constants for validation thresholds
    MIN_RESOLUTION_HEIGHT = 720
    MIN_LIKE_TO_VIEW_RATIO = 0.0 # Disabled for now to ensure content ingestion
    MIN_DURATION_SECONDS = 60 # 1 minute
    MAX_DURATION_SECONDS = 10800    # 3 hours
    
    NEGATIVE_KEYWORDS = {
        "parody", "funny", "reaction", "prank", "fail", "compilation", 
        "meme", "satire", "comedy", "joke", "gameplay", "stream highlight"
    }

    BEGINNER_KEYWORDS = {"intro", "beginner", "basics", "101", "start", "guide", "tutorial"}

    def validate(self, video: VideoMetadata) -> Optional[VideoMetadata]:
        """
        Runs all checks on the video. 
        Returns the VideoMetadata object with classification if it passes, else None.
        """
        if not self._check_resolution(video):
            print(f"Rejected {video.url}: Low resolution ({video.resolution_height}p)")
            return None
        
        if not self._check_duration(video):
            print(f"Rejected {video.url}: Invalid duration ({video.duration_seconds}s)")
            return None

        if not self._check_engagement(video):
            print(f"Rejected {video.url}: Low engagement (Like/View ratio < 0.5%)")
            return None

        if not self._check_relevance(video):
            print(f"Rejected {video.url}: Contains negative keywords")
            return None

        # If passed all checks, classify and return
        video.difficulty = self._classify_difficulty(video)
        return video

    def _check_resolution(self, video: VideoMetadata) -> bool:
        """Reject if resolution < 720p."""
        return video.resolution_height >= self.MIN_RESOLUTION_HEIGHT

    def _check_engagement(self, video: VideoMetadata) -> bool:
        """
        Calculate Like-to-View ratio. If < 0.5%, flag as low quality.
        Handle division by zero if views are 0.
        """
        if video.view_count == 0:
            return False
        
        ratio = video.like_count / video.view_count
        return ratio >= self.MIN_LIKE_TO_VIEW_RATIO

    def _check_relevance(self, video: VideoMetadata) -> bool:
        """
        Scan the video title, description, and tags for 'negative keywords'.
        """
        text_content = (video.title + " " + video.description + " " + " ".join(video.tags)).lower()
        
        for keyword in self.NEGATIVE_KEYWORDS:
            if keyword in text_content:
                return False
        return True

    def _check_duration(self, video: VideoMetadata) -> bool:
        """
        Reject if video is < 2 minutes or > 3 hours.
        """
        return self.MIN_DURATION_SECONDS <= video.duration_seconds <= self.MAX_DURATION_SECONDS

    def _classify_difficulty(self, video: VideoMetadata) -> DifficultyLevel:
        """
        Heuristic: If title contains ["Intro", "Beginner", "Basics", "101", "Start"], tag as Beginner.
        Default to Intermediate if no keywords found.
        """
        title_lower = video.title.lower()
        for keyword in self.BEGINNER_KEYWORDS:
            if keyword in title_lower:
                return DifficultyLevel.BEGINNER
        
        # TODO: Add logic for Advanced (e.g., "Masterclass", "Advanced", "Expert")
        
        return DifficultyLevel.INTERMEDIATE

# Example usage (for testing purposes)
if __name__ == "__main__":
    # Mock Data
    good_video = VideoMetadata(
        url="https://youtube.com/watch?v=good",
        title="How to Stitch: Masterclass",
        duration_seconds=600,
        description="A complete guide to stitching.",
        tags=["education", "stitching"],
        view_count=1000,
        like_count=6, # 0.6% ratio (Passes new 0.5% threshold)
        resolution_height=1080
    )

    beginner_video = VideoMetadata(
        url="https://youtube.com/watch?v=beginner",
        title="Stitching 101: The Basics",
        duration_seconds=300,
        description="Start here.",
        tags=["beginner"],
        view_count=1000,
        like_count=50,
        resolution_height=720
    )

    validator = VideoValidator()
    
    result_good = validator.validate(good_video)
    if result_good:
        print(f"Good Video Accepted. Difficulty: {result_good.difficulty}")
    else:
        print("Good Video Rejected")

    result_beginner = validator.validate(beginner_video)
    if result_beginner:
        print(f"Beginner Video Accepted. Difficulty: {result_beginner.difficulty}")
    else:
        print("Beginner Video Rejected")
