import httpx
import base64
import json
import os
from io import BytesIO
from groq import AsyncGroq

# GROQ API KEY
GROQ_API_KEY = os.getenv("GROQ_API_KEY") # Use environment variable in production
client = AsyncGroq(api_key=GROQ_API_KEY)

async def classify_text(title, description):
    """
    Classifies the text content of a complaint using Llama-3.3-70b.
    """
    prompt = f"""
You are a strict civic complaint classifier.
Title: {title}
Description: {description}

Classify into EXACTLY one of these categories:
- roads: potholes, road damage, footpath, traffic signals
- water: leakage, pipe burst, water shortage, drainage
- electricity: street lights, power cuts, fallen wires, electric poles
- sanitation: garbage, sewage, cleanliness, waste

Rules:
- Street lights → electricity
- Traffic signals → roads
- Drainage → sanitation
- If unclear → use best matching category

Return ONLY JSON:
{{
  "category": "roads/water/electricity/sanitation",
  "priority": "low/medium/high",
  "department": "roads/water/electricity/sanitation",
  "confidence": 0.0
}}

    """
    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content.strip())
    except Exception as e:
        print(f"TEXT CLASSIFICATION ERROR: {e}")
        return {"category": "other", "priority": "low", "department": "other", "confidence": 0.0}

async def classify_image(image_url):
    """
    Analyzes the image to see if it matches a civic issue using Llama-3.2 Vision.
    """
    prompt = """
You are a strict civic image classifier.
Look at this image carefully.

Classify into EXACTLY one of these:
- roads: damaged road, pothole, broken footpath, traffic signal
- water: water leakage, flooding, broken pipe
- electricity: street light, electric pole, fallen wire, transformer
- sanitation: garbage, waste, sewage

Rules:
- If you see a street light or lamp post → electricity
- If unclear → return "unclear"

Return ONLY JSON:
{
  "category": "roads/water/electricity/sanitation/unclear",
  "confidence": 0.0
}
"""
    try:
        async with httpx.AsyncClient() as http:
            img_response = await http.get(image_url)
            if img_response.status_code != 200:
                return {"category": "unclear", "confidence": 0.0}
            
        image_data = base64.b64encode(img_response.content).decode("utf-8")

        response = await client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}}
                    ]
                }
            ],
            max_tokens=200,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content.strip())
    except Exception as e:
        print(f"IMAGE CLASSIFICATION ERROR: {e}")
        return {"category": "unclear", "confidence": 0.0}

async def classify_complaint(title, description, image_url):
    """
    Hybrid classifier that validates image against text.
    """
    try:
        # Run both classifications
        text_result = await classify_text(title, description)
        image_result = await classify_image(image_url)

        print(f"DEBUG - Text: {text_result}")
        print(f"DEBUG - Image: {image_result}")

        text_category = text_result.get("category", "other").lower()
        image_category = image_result.get("category", "unclear").lower()

        # Logic for image match
        # We allow a match if they are exactly the same, or if the text says 'roads' and image says 'roads', etc.
        is_match = False
        if image_category != "unclear" and image_category != "other":
            if text_category == image_category:
                is_match = True
            elif text_category == "other": # Trust image more if text is vague
                is_match = True
        
        # Calculate combined confidence
        confidence = (text_result.get("confidence", 0.5) + image_result.get("confidence", 0.5)) / 2

        return {
            "image_match": is_match,
            "category": image_category if is_match else text_category,
            "priority": text_result.get("priority", "medium"),
            "department": text_result.get("department", text_category),
            "confidence": confidence
        }

    except Exception as e:
        print(f"AI SYSTEM ERROR: {e}")
        return {
            "image_match": False,
            "category": "other",
            "priority": "low",
            "department": "other",
            "confidence": 0.0
        }