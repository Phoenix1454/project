"""
Curriculum Configuration for Life Skills Platform
Defines the course catalog with search queries for content ingestion
"""

COURSE_CATALOG = {
    "adulting_101": {
        "title": "Adulting 101: The Survival Guide",
        "levels": [
            {"level": 1, "topic": "Laundry Basics", "search_query": "how to do laundry for beginners symbols sorting"},
            {"level": 2, "topic": "Kitchen Skills", "search_query": "basic knife skills and boiling an egg tutorial"},
            {"level": 3, "topic": "Basic Repairs", "search_query": "how to sew a button and iron a shirt"},
            {"level": 4, "topic": "Deep Cleaning", "search_query": "how to deep clean bathroom and unblock sink"},
            {"level": 5, "topic": "Meal Prep", "search_query": "weekly meal prep on a budget for beginners"}
        ]
    },
    "diy_home": {
        "title": "DIY Home Repair",
        "levels": [
            {"level": 1, "topic": "Toolbox Essentials", "search_query": "essential tools for homeowners beginners"},
            {"level": 2, "topic": "Wall Fixes", "search_query": "how to patch drywall nail holes tutorial"},
            {"level": 3, "topic": "Plumbing Basics", "search_query": "fix running toilet and unclog drain diy"},
            {"level": 4, "topic": "Furniture Assembly", "search_query": "how to assemble flat pack furniture tips"},
            {"level": 5, "topic": "Electrical Safety", "search_query": "how to change a light fixture safety"}
        ]
    },
    "finance_101": {
        "title": "Financial Literacy",
        "levels": [
            {"level": 1, "topic": "Budgeting", "search_query": "50 30 20 rule budgeting explained"},
            {"level": 2, "topic": "Banking", "search_query": "checking vs savings account explained"},
            {"level": 3, "topic": "Taxes", "search_query": "how to file taxes for beginners simple"},
            {"level": 4, "topic": "Investing", "search_query": "compound interest explained simply"},
            {"level": 5, "topic": "Credit", "search_query": "how credit scores work for beginners"}
        ]
    },
    "office_skills": {
        "title": "Office Survival",
        "levels": [
            {"level": 1, "topic": "Email Etiquette", "search_query": "professional email writing tips for work"},
            {"level": 2, "topic": "Spreadsheets", "search_query": "excel vlookup and pivot tables for beginners"},
            {"level": 3, "topic": "Cyber Security", "search_query": "phishing email awareness training"},
            {"level": 4, "topic": "Presentations", "search_query": "powerpoint design tips for non designers"}
        ]
    },
    "car_basics": {
        "title": "Car Maintenance",
        "levels": [
            {"level": 1, "topic": "Dashboard Lights", "search_query": "car dashboard warning lights meaning"},
            {"level": 2, "topic": "Fluids", "search_query": "how to check oil and coolant level car"},
            {"level": 3, "topic": "Tyres", "search_query": "how to check tyre pressure and tread depth"},
            {"level": 4, "topic": "Emergency", "search_query": "how to jump start a car battery safely"}
        ]
    }
}

# Mapping of course IDs to database course IDs (will be populated after courses are created)
COURSE_ID_MAP = {
    "adulting_101": 1,
    "diy_home": 2,
    "finance_101": 3,
    "office_skills": 4,
    "car_basics": 5
}
