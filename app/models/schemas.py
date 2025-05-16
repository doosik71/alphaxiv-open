from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any


class ProcessPaperRequest(BaseModel):
    """Request model for processing an arXiv paper."""
    arxiv_url: str = Field(
        ..., 
        description="URL of the arXiv paper to process"
    )


class ProcessPaperResponse(BaseModel):
    """Response model for paper processing."""
    paper_id: str = Field(
        ..., 
        description="ID of the processed paper"
    )
    status: str = Field(
        ..., 
        description="Status of the processing (processing, completed, error, already_processed)"
    )
    message: str = Field(
        ..., 
        description="Message describing the processing status"
    )


class ChatRequest(BaseModel):
    """Request model for chatting with a paper."""
    paper_id: str = Field(
        ..., 
        description="ID of the paper to chat with"
    )
    query: str = Field(
        ..., 
        description="User query about the paper"
    )


class ChatResponse(BaseModel):
    """Response model for chat."""
    paper_id: str = Field(
        ..., 
        description="ID of the paper"
    )
    query: str = Field(
        ..., 
        description="User query"
    )
    response: str = Field(
        ..., 
        description="Generated response"
    )
    context: List[Dict[str, Any]] = Field(
        ..., 
        description="Context used for generating the response"
    )


class PaperMetadata(BaseModel):
    """Model for paper metadata."""
    paper_id: str
    title: Optional[str] = None
    authors: Optional[List[str]] = None
    abstract: Optional[str] = None
    published_date: Optional[str] = None
    url: Optional[str] = None
    pdf_url: Optional[str] = None
    is_processed: bool = False
    processing_status: str = "not_started"
    last_updated: Optional[str] = None
