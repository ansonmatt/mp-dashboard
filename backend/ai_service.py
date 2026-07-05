import os
import re
from dotenv import load_dotenv

load_dotenv()  # Loads GEMINI_API_KEY from backend/.env automatically
from google import genai
from google.genai import types

def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        # Fallback to dummy data if no key is provided during testing
        return None
    return genai.Client(api_key=api_key)

def process_submission(text: str):
    client = get_gemini_client()
    if not client:
        print("Warning: GEMINI_API_KEY not set. Using fallback categorizer.")
        return fallback_categorize(text)
        
    prompt = f"""
    Analyze the following citizen request for a local MP.
    Extract the following information:
    1. Category (choose ONE: Education, Health, Infrastructure, Water, Electricity, Public Safety, Other)
    2. Sentiment (Positive, Neutral, Negative)
    3. Urgency Score (a float between 0.0 and 1.0, where 1.0 is critically urgent)

    Format your response EXACTLY as:
    Category: [Category]
    Sentiment: [Sentiment]
    Urgency: [Score]
    
    Request: "{text}"
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        content = response.text
        
        category = "Other"
        sentiment = "Neutral"
        urgency = 0.5
        
        cat_match = re.search(r"Category:\s*([^\n]+)", content)
        if cat_match:
            category = cat_match.group(1).strip()
            
        sent_match = re.search(r"Sentiment:\s*([^\n]+)", content)
        if sent_match:
            sentiment = sent_match.group(1).strip()
            
        urg_match = re.search(r"Urgency:\s*([0-9.]+)", content)
        if urg_match:
            try:
                urgency = float(urg_match.group(1).strip())
            except:
                pass
                
        return {
            "category": category,
            "sentiment": sentiment,
            "urgency_score": urgency
        }
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return fallback_categorize(text)

def fallback_categorize(text: str):
    text_lower = text.lower()
    category = "Other"
    urgency = 0.5
    if any(word in text_lower for word in ["school", "education", "teacher", "college"]):
        category = "Education"
    elif any(word in text_lower for word in ["hospital", "doctor", "health", "clinic"]):
        category = "Health"
    elif any(word in text_lower for word in ["road", "bridge", "pothole", "infrastructure"]):
        category = "Infrastructure"
        
    if "urgent" in text_lower or "emergency" in text_lower:
        urgency = 0.9
        
    return {
        "category": category,
        "sentiment": "Neutral",
        "urgency_score": urgency
    }
