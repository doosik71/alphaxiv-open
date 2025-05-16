import os
import re
import json
import httpx
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class ArxivService:
    """Service for interacting with arXiv papers."""
    
    def __init__(self):
        """Initialize the ArxivService."""
        self.papers_dir = Path("data/papers")
        self.papers_dir.mkdir(parents=True, exist_ok=True)
        
        self.metadata_dir = Path("data/papers/metadata")
        self.metadata_dir.mkdir(parents=True, exist_ok=True)
    
    def extract_paper_id(self, arxiv_url: str) -> Optional[str]:
        """
        Extract the arXiv paper ID from a URL.
        
        Args:
            arxiv_url: URL of the arXiv paper
            
        Returns:
            The paper ID if found, None otherwise
        """
        # Pattern to match arXiv IDs in URLs
        patterns = [
            r'arxiv\.org/abs/(\d+\.\d+)',  # arxiv.org/abs/1234.5678
            r'arxiv\.org/pdf/(\d+\.\d+)',   # arxiv.org/pdf/1234.5678
            r'arxiv\.org/ps/(\d+\.\d+)',    # arxiv.org/ps/1234.5678
            r'arxiv\.org/e-print/(\d+\.\d+)', # arxiv.org/e-print/1234.5678
            r'ar[xX]iv:(\d+\.\d+)'          # arxiv:1234.5678 or arXiv:1234.5678
        ]
        
        for pattern in patterns:
            match = re.search(pattern, arxiv_url)
            if match:
                return match.group(1)
        
        return None
    
    def is_paper_processed(self, paper_id: str) -> bool:
        """
        Check if a paper has been processed.
        
        Args:
            paper_id: ID of the paper
            
        Returns:
            True if the paper has been processed, False otherwise
        """
        metadata_path = self.metadata_dir / f"{paper_id}.json"
        
        if not metadata_path.exists():
            return False
        
        try:
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            
            return metadata.get('is_processed', False)
        
        except Exception as e:
            logger.error(f"Error checking if paper {paper_id} is processed: {str(e)}")
            return False
    
    def download_paper(self, paper_id: str, arxiv_url: str) -> str:
        """
        Download a paper from arXiv.
        
        Args:
            paper_id: ID of the paper
            arxiv_url: URL of the arXiv paper
            
        Returns:
            Path to the downloaded PDF
        """
        # Create directory for this paper
        paper_dir = self.papers_dir / paper_id
        paper_dir.mkdir(exist_ok=True)
        
        # Path to save the PDF
        pdf_path = paper_dir / f"{paper_id}.pdf"
        
        # If PDF already exists, return its path
        if pdf_path.exists():
            logger.info(f"PDF for paper {paper_id} already exists")
            return str(pdf_path)
        
        # Ensure the URL points to the PDF
        if 'pdf' not in arxiv_url:
            arxiv_url = f"https://arxiv.org/pdf/{paper_id}.pdf"
        
        # Download the PDF
        try:
            logger.info(f"Downloading PDF for paper {paper_id} from {arxiv_url}")
            
            with httpx.Client() as client:
                response = client.get(arxiv_url, follow_redirects=True)
                response.raise_for_status()
                
                with open(pdf_path, 'wb') as f:
                    f.write(response.content)
            
            logger.info(f"PDF for paper {paper_id} downloaded successfully")
            
            # Save initial metadata
            self._save_metadata(paper_id, {
                'paper_id': paper_id,
                'url': arxiv_url,
                'pdf_url': arxiv_url,
                'is_processed': False,
                'processing_status': 'downloading',
                'last_updated': datetime.now().isoformat()
            })
            
            return str(pdf_path)
        
        except Exception as e:
            logger.error(f"Error downloading paper {paper_id}: {str(e)}")
            raise
    
    def mark_paper_as_processed(self, paper_id: str) -> None:
        """
        Mark a paper as processed.
        
        Args:
            paper_id: ID of the paper
        """
        try:
            metadata_path = self.metadata_dir / f"{paper_id}.json"
            
            if metadata_path.exists():
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
            else:
                metadata = {'paper_id': paper_id}
            
            metadata.update({
                'is_processed': True,
                'processing_status': 'completed',
                'last_updated': datetime.now().isoformat()
            })
            
            self._save_metadata(paper_id, metadata)
            
            logger.info(f"Paper {paper_id} marked as processed")
        
        except Exception as e:
            logger.error(f"Error marking paper {paper_id} as processed: {str(e)}")
            raise
    
    def _save_metadata(self, paper_id: str, metadata: Dict[str, Any]) -> None:
        """
        Save paper metadata.
        
        Args:
            paper_id: ID of the paper
            metadata: Metadata to save
        """
        metadata_path = self.metadata_dir / f"{paper_id}.json"
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
