import os
import logging
from pathlib import Path
from markitdown import MarkItDown

logger = logging.getLogger(__name__)

class MarkdownService:
    """Service for converting PDFs to markdown using markitdown."""
    
    def __init__(self):
        """Initialize the MarkdownService."""
        self.markdown_dir = Path("data/papers/markdown")
        self.markdown_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize markitdown
        self.markitdown = MarkItDown(enable_plugins=True)
    
    def convert_to_markdown(self, pdf_path: str) -> str:
        """
        Convert a PDF to markdown.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            The markdown content
        """
        try:
            logger.info(f"Converting PDF {pdf_path} to markdown")
            
            # Convert PDF to markdown using markitdown
            result = self.markitdown.convert(pdf_path)
            
            # Get the markdown content
            markdown_content = result.text_content
            
            logger.info(f"PDF {pdf_path} converted to markdown successfully")
            
            return markdown_content
        
        except Exception as e:
            logger.error(f"Error converting PDF {pdf_path} to markdown: {str(e)}")
            raise
    
    def save_markdown(self, paper_id: str, markdown_content: str) -> str:
        """
        Save markdown content to a file.
        
        Args:
            paper_id: ID of the paper
            markdown_content: Markdown content to save
            
        Returns:
            Path to the saved markdown file
        """
        try:
            # Create directory for this paper's markdown
            paper_markdown_dir = self.markdown_dir / paper_id
            paper_markdown_dir.mkdir(exist_ok=True)
            
            # Path to save the markdown
            markdown_path = paper_markdown_dir / f"{paper_id}.md"
            
            # Save the markdown
            with open(markdown_path, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            
            logger.info(f"Markdown for paper {paper_id} saved to {markdown_path}")
            
            return str(markdown_path)
        
        except Exception as e:
            logger.error(f"Error saving markdown for paper {paper_id}: {str(e)}")
            raise
    
    def get_markdown_path(self, paper_id: str) -> str:
        """
        Get the path to a paper's markdown file.
        
        Args:
            paper_id: ID of the paper
            
        Returns:
            Path to the markdown file
        """
        return str(self.markdown_dir / paper_id / f"{paper_id}.md")
