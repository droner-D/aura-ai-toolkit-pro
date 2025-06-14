
# AI Toolbox Backend

This is the Python FastAPI backend for AI Toolbox, providing endpoints for:
- YouTube video summarization
- Social media post generation
- Comment generation

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to the `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Run the server

```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

Once the server is running, you can access the auto-generated Swagger docs at:
http://localhost:8000/docs
