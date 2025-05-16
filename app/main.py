from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from dotenv import load_dotenv

from app.models.schemas import (
    ProcessPaperRequest,
    ProcessPaperResponse,
    ChatRequest,
    ChatResponse
)
from app.services.arxiv_service import ArxivService
from app.services.markdown_service import MarkdownService
from app.services.indexing_service import IndexingService
from app.services.gemini_service import GeminiService

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AlphaXIV API",
    description="API for chatting with arXiv papers using RAG and Gemini",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
arxiv_service = ArxivService()
markdown_service = MarkdownService()
indexing_service = IndexingService()
gemini_service = GeminiService()

@app.get("/")
async def root():
    """Root endpoint to check if the API is running."""
    return {"message": "Welcome to AlphaXIV API"}

@app.post("/api/papers/process", response_model=ProcessPaperResponse)
async def process_paper(
    request: ProcessPaperRequest,
    background_tasks: BackgroundTasks
):
    """
    Process an arXiv paper URL:
    1. Download the PDF
    2. Convert to markdown
    3. Index the content
    """
    try:
        # Extract paper ID from URL
        paper_id = arxiv_service.extract_paper_id(request.arxiv_url)
        if not paper_id:
            raise HTTPException(status_code=400, detail="Invalid arXiv URL")

        # Check if paper is already processed
        if arxiv_service.is_paper_processed(paper_id):
            return ProcessPaperResponse(
                paper_id=paper_id,
                status="already_processed",
                message="Paper already processed and indexed"
            )

        # Download the PDF in the background
        background_tasks.add_task(
            process_paper_task,
            paper_id,
            request.arxiv_url
        )

        return ProcessPaperResponse(
            paper_id=paper_id,
            status="processing",
            message="Paper processing started. Note: MiniRAG server may not be running, but the paper will still be processed and can be queried."
        )

    except Exception as e:
        logger.error(f"Error processing paper: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_paper(request: ChatRequest):
    """
    Chat with a processed arXiv paper:
    1. Retrieve relevant context using MiniRAG
    2. Generate a response using Gemini
    """
    try:
        # Check if paper exists and is processed
        if not arxiv_service.is_paper_processed(request.paper_id):
            raise HTTPException(
                status_code=404,
                detail="Paper not found or not yet processed"
            )

        # Retrieve context using MiniRAG
        context = indexing_service.retrieve_context(
            request.paper_id,
            request.query
        )

        # Generate response using Gemini
        response = gemini_service.generate_response(
            request.query,
            context
        )

        return ChatResponse(
            paper_id=request.paper_id,
            query=request.query,
            response=response,
            context=context
        )

    except Exception as e:
        logger.error(f"Error chatting with paper: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_paper_task(paper_id: str, arxiv_url: str):
    """Background task to process a paper."""
    try:
        # Download the PDF
        pdf_path = arxiv_service.download_paper(paper_id, arxiv_url)
        logger.info(f"Downloaded PDF for paper {paper_id} to {pdf_path}")

        try:
            # Convert to markdown
            markdown_content = markdown_service.convert_to_markdown(pdf_path)
            logger.info(f"Converted PDF for paper {paper_id} to markdown")

            # Save markdown content
            markdown_path = markdown_service.save_markdown(paper_id, markdown_content)
            logger.info(f"Saved markdown for paper {paper_id} to {markdown_path}")

            try:
                # Index the content
                indexing_service.index_paper(paper_id, markdown_path)
                logger.info(f"Indexed paper {paper_id}")
            except Exception as e:
                logger.error(f"Error indexing paper {paper_id}: {str(e)}")
                # Continue processing even if indexing fails

            # Mark paper as processed
            arxiv_service.mark_paper_as_processed(paper_id)
            logger.info(f"Paper {paper_id} processed successfully")

        except Exception as e:
            logger.error(f"Error converting PDF for paper {paper_id}: {str(e)}")
            # Don't mark as processed if conversion fails

    except Exception as e:
        logger.error(f"Error downloading paper {paper_id}: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
