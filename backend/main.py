
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv
import openai
from youtube_transcript_api import YouTubeTranscriptApi
from pytube import YouTube
import re

# Load environment variables
load_dotenv()

# Setup OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="AI Toolbox API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input models
class YouTubeRequest(BaseModel):
    video_url: str
    output_type: str
    language: str = "english"
    custom_prompt: Optional[str] = None

class TranscriptRequest(BaseModel):
    transcript: str
    output_type: str
    language: str = "english"
    custom_prompt: Optional[str] = None

class SocialMediaRequest(BaseModel):
    topic: str
    platform: str
    writing_style: str
    custom_instructions: Optional[str] = None

class CommentRequest(BaseModel):
    content: str
    platform: str
    tone: str
    custom_instructions: Optional[str] = None

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Toolbox API"}

@app.post("/api/youtube/summarize")
async def summarize_youtube(request: YouTubeRequest):
    try:
        # Extract video ID from URL
        video_id = extract_youtube_id(request.video_url)
        if not video_id:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL")
        
        # Get video details
        video_details = get_video_details(video_id)
        
        # Get transcript
        transcript = get_youtube_transcript(video_id, request.language)
        
        # Generate content based on output type
        result = generate_content_from_transcript(
            transcript, 
            request.output_type, 
            video_details, 
            request.custom_prompt
        )
        
        return {
            "result": result,
            "video_details": video_details
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/transcript/analyze")
async def analyze_transcript(request: TranscriptRequest):
    try:
        # Generate content from provided transcript
        result = generate_content_from_transcript(
            request.transcript, 
            request.output_type,
            {"title": "Custom Transcript"}, 
            request.custom_prompt
        )
        
        return {
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/social/generate")
async def generate_social(request: SocialMediaRequest):
    try:
        # Generate social media post
        result = generate_social_media_post(
            request.topic,
            request.platform,
            request.writing_style,
            request.custom_instructions
        )
        
        return {
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/comments/generate")
async def generate_comment(request: CommentRequest):
    try:
        # Generate comment
        result = generate_comment_for_content(
            request.content,
            request.platform,
            request.tone,
            request.custom_instructions
        )
        
        return {
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def extract_youtube_id(url: str) -> str:
    """Extract the YouTube video ID from a URL."""
    # Handle different YouTube URL formats
    patterns = [
        r'(?:youtube\.com/watch\?v=|youtu\.be/)([^&\?]+)',
        r'youtube\.com/embed/([^/\?]+)',
        r'youtube\.com/v/([^/\?]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def get_youtube_transcript(video_id: str, language: str = "english") -> str:
    """Get the transcript of a YouTube video."""
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(
            video_id, 
            languages=[language] if language != "english" else ['en']
        )
        
        # Combine all transcript parts
        full_transcript = " ".join([part["text"] for part in transcript_list])
        return full_transcript
    except Exception as e:
        raise Exception(f"Failed to get transcript: {str(e)}")

def get_video_details(video_id: str) -> dict:
    """Get video details using pytube."""
    try:
        yt = YouTube(f"https://www.youtube.com/watch?v={video_id}")
        return {
            "title": yt.title,
            "author": yt.author,
            "length": yt.length,
            "views": yt.views,
            "publish_date": str(yt.publish_date),
            "thumbnail_url": yt.thumbnail_url
        }
    except Exception as e:
        # Return minimal details if unable to fetch
        return {
            "title": "YouTube Video",
            "author": "Unknown"
        }

def generate_content_from_transcript(transcript: str, output_type: str, video_details: dict, custom_prompt: Optional[str] = None) -> str:
    """Generate content from transcript using OpenAI API."""
    # Truncate transcript if too long (OpenAI has token limits)
    max_tokens = 4000  # Adjust based on your model
    transcript = transcript[:max_tokens]
    
    # Create appropriate prompt based on output type
    if output_type == "summary":
        prompt = f"Summarize the main points of this YouTube video titled '{video_details.get('title', 'YouTube Video')}'. Transcript:\n\n{transcript}"
    elif output_type == "notes":
        prompt = f"Create detailed notes in bullet point format from this YouTube video titled '{video_details.get('title', 'YouTube Video')}'. Transcript:\n\n{transcript}"
    elif output_type == "explanation":
        prompt = f"Explain the content of this YouTube video titled '{video_details.get('title', 'YouTube Video')}' in simple terms that are easy to understand. Transcript:\n\n{transcript}"
    elif output_type == "questions":
        prompt = f"Generate important questions and answers based on the content of this YouTube video titled '{video_details.get('title', 'YouTube Video')}'. Transcript:\n\n{transcript}"
    elif output_type == "custom" and custom_prompt:
        prompt = f"{custom_prompt}\n\nVideo Title: '{video_details.get('title', 'YouTube Video')}'\nTranscript:\n\n{transcript}"
    else:
        prompt = f"Analyze the content of this YouTube video titled '{video_details.get('title', 'YouTube Video')}'. Transcript:\n\n{transcript}"
    
    # Call OpenAI API
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert at analyzing and summarizing content."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1000,
        temperature=0.7
    )
    
    # Return the generated content
    return response.choices[0].message.content

def generate_social_media_post(topic: str, platform: str, writing_style: str, custom_instructions: Optional[str] = None) -> str:
    """Generate a social media post using OpenAI API."""
    # Create prompt based on platform and style
    platform_guides = {
        "linkedin": "professional post for LinkedIn that includes bullet points, some emojis, and relevant hashtags",
        "twitter": "concise tweet for X (Twitter) within 280 characters, with relevant hashtags",
        "youtube": "engaging community post for YouTube that encourages interaction",
        "instagram": "visually descriptive caption for Instagram with appropriate emojis and hashtags"
    }
    
    style_guides = {
        "professional": "in a formal, business-oriented tone",
        "casual": "in a friendly, conversational approach",
        "inspirational": "in a motivational and uplifting style",
        "educational": "in an informative and teaching-focused manner",
        "humorous": "with light-hearted appropriate humor",
        "thought-provoking": "that encourages discussion and reflection"
    }
    
    platform_guide = platform_guides.get(platform, platform_guides["linkedin"])
    style_guide = style_guides.get(writing_style, style_guides["professional"])
    
    prompt = f"Create a {platform_guide} {style_guide} about the topic: {topic}."
    
    if custom_instructions:
        prompt += f"\n\nAdditional instructions: {custom_instructions}"
    
    # Call OpenAI API
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert at creating engaging social media content."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=800,
        temperature=0.8
    )
    
    # Return the generated post
    return response.choices[0].message.content

def generate_comment_for_content(content: str, platform: str, tone: str, custom_instructions: Optional[str] = None) -> str:
    """Generate a comment for the given content using OpenAI API."""
    # Create prompt based on platform and tone
    prompt = f"Generate a thoughtful {tone} comment for the following {platform} content:\n\n{content}"
    
    if custom_instructions:
        prompt += f"\n\nAdditional instructions: {custom_instructions}"
    
    # Call OpenAI API
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert at creating engaging and authentic comments."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=300,
        temperature=0.7
    )
    
    # Return the generated comment
    return response.choices[0].message.content

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
