#!/usr/bin/env python3
"""
Robust YouTube Content Scraper for Life Skills Platform
Uses yt-dlp to search and filter educational videos
"""

import yt_dlp
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal
from backend.models import Video, Course
from backend.ingestion.curriculum_config import COURSE_CATALOG, COURSE_ID_MAP

class LifeSkillsScraper:
    """Scrapes YouTube for life skills educational content"""
    
    # Filtration constants
    MIN_DURATION = 120  # 2 minutes
    MAX_DURATION = 1200  # 20 minutes
    MAX_VIDEO_AGE_YEARS = 4
    BLACKLIST_WORDS = ["prank", "reaction", "funny", "fail", "compilation"]
    RESULTS_PER_QUERY = 10
    
    def __init__(self):
        self.db = SessionLocal()
        self.stats = {
            "searched": 0,
            "filtered": 0,
            "added": 0,
            "rejected": 0
        }
    
    def search_videos(self, query: str, max_results: int = 10) -> List[Dict]:
        """Search YouTube using yt-dlp"""
        ydl_opts = {
            'quiet': False,
            'no_warnings': False,
            'extract_flat': 'in_playlist',
            'playlistend': max_results,
        }
        
        try:
            search_url = f"ytsearch{max_results}:{query}"
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                result = ydl.extract_info(search_url, download=False)
                if result and 'entries' in result:
                    return [entry for entry in result['entries'] if entry]
        except Exception as e:
            print(f"❌ Search error for '{query}': {e}")
        
        return []
    
    def get_video_details(self, video_url: str) -> Optional[Dict]:
        """Get full video details"""
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
        }
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)
                return info
        except Exception as e:
            print(f"❌ Error fetching details for {video_url}: {e}")
            return None
    
    def passes_filters(self, video_info: Dict) -> tuple[bool, str]:
        """Check if video passes all filters. Returns (passes, reason)"""
        
        # Duration check
        duration = video_info.get('duration', 0)
        if duration < self.MIN_DURATION:
            return False, f"Too short ({duration}s)"
        if duration > self.MAX_DURATION:
            return False, f"Too long ({duration}s)"
        
        # Upload date check
        upload_date_str = video_info.get('upload_date')
        if upload_date_str:
            try:
                upload_date = datetime.strptime(upload_date_str, '%Y%m%d')
                cutoff_date = datetime.now() - timedelta(days=365 * self.MAX_VIDEO_AGE_YEARS)
                if upload_date < cutoff_date:
                    return False, f"Too old ({upload_date.year})"
            except:
                pass
        
        # Blacklist check
        title = video_info.get('title', '').lower()
        description = video_info.get('description', '').lower()
        
        for word in self.BLACKLIST_WORDS:
            if word in title or word in description:
                return False, f"Contains blacklisted word: {word}"
        
        return True, "OK"
    
    def scrape_course(self, course_key: str, course_data: Dict):
        """Scrape all levels for a specific course"""
        print(f"\n{'='*60}")
        print(f"📚 Scraping: {course_data['title']}")
        print(f"{'='*60}")
        
        course_id = COURSE_ID_MAP.get(course_key, 1)
        
        for level_data in course_data['levels']:
            level = level_data['level']
            topic = level_data['topic']
            query = level_data['search_query']
            
            print(f"\n🔍 Level {level}: {topic}")
            print(f"   Query: '{query}'")
            
            # Search YouTube
            search_results = self.search_videos(query, self.RESULTS_PER_QUERY)
            self.stats['searched'] += len(search_results)
            
            added_count = 0
            for entry in search_results:
                if added_count >= 3:  # Limit to 3 videos per level
                    break
                
                video_id = entry.get('id')
                if not video_id:
                    continue
                
                video_url = f"https://www.youtube.com/watch?v={video_id}"
                
                # Check if already exists
                existing = self.db.query(Video).filter(Video.url == video_url).first()
                if existing:
                    print(f"   ⏭️  Already exists: {entry.get('title', 'Unknown')[:50]}")
                    continue
                
                # Get full details
                video_info = self.get_video_details(video_url)
                if not video_info:
                    continue
                
                # Apply filters
                passes, reason = self.passes_filters(video_info)
                if not passes:
                    self.stats['rejected'] += 1
                    print(f"   ❌ Rejected: {reason} - {video_info.get('title', 'Unknown')[:50]}")
                    continue
                
                # Add to database
                video = Video(
                    course_id=course_id,
                    course_category=course_key,
                    level_index=level,
                    url=video_url,
                    title=video_info.get('title', 'Unknown'),
                    description=video_info.get('description', '')[:500] if video_info.get('description') else '',
                    duration_seconds=video_info.get('duration', 0),
                    view_count=video_info.get('view_count', 0),
                    like_count=video_info.get('like_count', 0),
                    resolution_height=video_info.get('height', 0),
                    difficulty_level=self._map_level_to_difficulty_enum(level)
                )
                
                self.db.add(video)
                self.stats['added'] += 1
                added_count += 1
                print(f"   ✅ Added: {video.title[:60]}")
            
            self.db.commit()
    
    def _map_level_to_difficulty_enum(self, level: int):
        """Map level index to difficulty enum"""
        from backend.models import DifficultyLevel
        if level <= 2:
            return DifficultyLevel.BEGINNER
        elif level <= 4:
            return DifficultyLevel.INTERMEDIATE
        else:
            return DifficultyLevel.ADVANCED
    
    def run(self):
        """Run the full scraping process"""
        print("\n" + "="*60)
        print("🚀 LIFE SKILLS CONTENT INGESTION ENGINE")
        print("="*60)
        
        for course_key, course_data in COURSE_CATALOG.items():
            self.scrape_course(course_key, course_data)
        
        # Print summary
        print("\n" + "="*60)
        print("📊 INGESTION SUMMARY")
        print("="*60)
        print(f"Videos searched: {self.stats['searched']}")
        print(f"Videos added: {self.stats['added']}")
        print(f"Videos rejected: {self.stats['rejected']}")
        print("="*60)
        
        self.db.close()

if __name__ == "__main__":
    scraper = LifeSkillsScraper()
    scraper.run()
