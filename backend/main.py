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
import requests
import base64
import json

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

class JiraGenerateRequest(BaseModel):
    subject: str
    rough_description: str
    ticket_type: str
    priority: str = "Medium"

class JiraSettings(BaseModel):
    jira_url: str
    username: str
    api_token: str
    project_key: str

class JiraCreateRequest(BaseModel):
    subject: str
    content: str
    ticket_type: str
    priority: str
    jira_settings: JiraSettings

class CommunicationRequest(BaseModel):
    content_type: str
    subject: str
    details: Optional[str] = None
    tone: str
    style: str
    additional_info: Optional[str] = None

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

@app.post("/api/jira/generate")
async def generate_jira_content(request: JiraGenerateRequest):
    try:
        # Generate Jira ticket content
        result = generate_jira_ticket_content(
            request.subject,
            request.rough_description,
            request.ticket_type,
            request.priority
        )
        
        return {
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/jira/create")
async def create_jira_ticket(request: JiraCreateRequest):
    try:
        # Create Jira ticket
        ticket_url = create_jira_ticket_in_instance(
            request.subject,
            request.content,
            request.ticket_type,
            request.priority,
            request.jira_settings
        )
        
        return {
            "ticket_url": ticket_url,
            "message": "Jira ticket created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/communication/generate")
async def generate_communication(request: CommunicationRequest):
    try:
        # Generate communication content
        result = generate_communication_content(
            request.content_type,
            request.subject,
            request.details,
            request.tone,
            request.style,
            request.additional_info
        )
        
        return {
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ... keep existing code (helper functions for YouTube, social media, etc.)

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

def generate_jira_ticket_content(subject: str, rough_description: str, ticket_type: str, priority: str) -> str:
    """Generate professional Jira ticket content using OpenAI API."""
    
    # Create ticket type specific prompts
    ticket_prompts = {
        "epic": "Create a comprehensive Epic description that includes business value, scope, and acceptance criteria",
        "story": "Create a detailed User Story following the format: 'As a [user], I want [goal] so that [benefit]', include acceptance criteria and definition of done",
        "task": "Create a clear Task description with specific steps, requirements, and deliverables",
        "bug": "Create a detailed Bug report with steps to reproduce, expected vs actual behavior, and environment details",
        "improvement": "Create an Improvement description explaining the current state, proposed enhancement, and expected benefits",
        "feature": "Create a Feature description with user requirements, functional specifications, and acceptance criteria"
    }
    
    ticket_prompt = ticket_prompts.get(ticket_type, ticket_prompts["task"])
    
    prompt = f"""
    {ticket_prompt} for a Jira ticket.
    
    Subject: {subject}
    Priority: {priority}
    Rough Description: {rough_description}
    
    Format the response professionally with clear sections and use markdown formatting where appropriate.
    Include relevant sections like:
    - Description/Summary
    - Acceptance Criteria (where applicable)
    - Steps to Reproduce (for bugs)
    - Requirements
    - Notes/Additional Information
    
    Make it comprehensive but concise, suitable for a development team.
    """
    
    # Call OpenAI API
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert at creating professional Jira tickets and project management documentation."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1200,
        temperature=0.7
    )
    
    return response.choices[0].message.content

def generate_communication_content(content_type: str, subject: str, details: Optional[str], tone: str, style: str, additional_info: Optional[str] = None) -> str:
    """Generate communication content using OpenAI API."""
    
    # Create content type specific prompts
    content_prompts = {
        "meeting-agenda": "Create a professional meeting agenda",
        "meeting-description": "Create a comprehensive meeting description",
        "slack-message": "Create an engaging Slack message"
    }
    
    # Create tone specific guidelines
    tone_guidelines = {
        "professional": "using formal business language and structure",
        "casual": "using friendly, relaxed language",
        "friendly": "using warm, approachable language",
        "urgent": "using direct, action-oriented language that conveys importance",
        "informative": "using clear, educational language that explains well",
        "collaborative": "using inclusive language that encourages participation"
    }
    
    # Create style specific formatting
    style_guidelines = {
        "concise": "Keep it brief and to the point",
        "detailed": "Provide comprehensive information with thorough explanations",
        "bullet-points": "Use bullet points and structured formatting",
        "structured": "Use clear sections and organized formatting",
        "action-oriented": "Focus on actionable items and next steps"
    }
    
    base_prompt = content_prompts.get(content_type, "Create professional communication content")
    tone_guide = tone_guidelines.get(tone, "using appropriate professional language")
    style_guide = style_guidelines.get(style, "with clear formatting")
    
    # Build the main prompt
    prompt = f"{base_prompt} {tone_guide} and {style_guide}.\n\n"
    prompt += f"Subject/Title: {subject}\n"
    
    if details:
        prompt += f"Context/Details: {details}\n"
    
    # Add specific instructions based on content type
    if content_type == "meeting-agenda":
        prompt += "\nInclude: Meeting objectives, agenda items with time allocations, attendees/roles, and action items. Format it professionally."
    elif content_type == "meeting-description":
        prompt += "\nInclude: Meeting purpose, expected outcomes, key discussion points, and participant expectations."
    elif content_type == "slack-message":
        prompt += "\nMake it appropriate for team communication, engaging, and clear. Include relevant emojis if the tone allows."
    
    if additional_info:
        prompt += f"\nAdditional Requirements: {additional_info}"
    
    # Call OpenAI API
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert at creating professional business communication content."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1000,
        temperature=0.7
    )
    
    return response.choices[0].message.content

def create_jira_ticket_in_instance(subject: str, content: str, ticket_type: str, priority: str, jira_settings: JiraSettings) -> str:
    """Create a Jira ticket in the specified Jira instance."""
    
    # Map ticket types to Jira issue types
    jira_issue_types = {
        "epic": "Epic",
        "story": "Story",
        "task": "Task",
        "bug": "Bug",
        "improvement": "Improvement",
        "feature": "New Feature"
    }
    
    issue_type = jira_issue_types.get(ticket_type, "Task")
    
    # Prepare authentication
    auth_string = f"{jira_settings.username}:{jira_settings.api_token}"
    auth_bytes = auth_string.encode('ascii')
    auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
    
    # Prepare headers
    headers = {
        'Authorization': f'Basic {auth_b64}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    # Prepare the issue data
    issue_data = {
        "fields": {
            "project": {
                "key": jira_settings.project_key
            },
            "summary": subject,
            "description": content,
            "issuetype": {
                "name": issue_type
            },
            "priority": {
                "name": priority
            }
        }
    }
    
    # API endpoint
    url = f"{jira_settings.jira_url.rstrip('/')}/rest/api/3/issue"
    
    try:
        # Make the API call
        response = requests.post(url, headers=headers, data=json.dumps(issue_data))
        
        if response.status_code == 201:
            # Success - return the ticket URL
            response_data = response.json()
            ticket_key = response_data.get('key')
            ticket_url = f"{jira_settings.jira_url.rstrip('/')}/browse/{ticket_key}"
            return ticket_url
        else:
            # Error
            error_detail = response.json() if response.content else {"error": "Unknown error"}
            raise Exception(f"Failed to create Jira ticket: {response.status_code} - {error_detail}")
    
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to connect to Jira: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
