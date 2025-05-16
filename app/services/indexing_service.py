import os
import logging
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import tempfile
import shutil
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class IndexingService:
    """Service for indexing papers using MiniRAG."""

    def __init__(self):
        """Initialize the IndexingService."""
        self.index_dir = Path("data/index")
        self.index_dir.mkdir(parents=True, exist_ok=True)

        self.storage_dir = Path("data/storage")
        self.storage_dir.mkdir(parents=True, exist_ok=True)

        # Get MiniRAG configuration from environment variables
        embedding_model = os.getenv("MINIRAG_EMBEDDING_MODEL", "text-embedding-3-small")

        # Set embedding dimension based on the model
        embedding_dim = 1536  # Default for text-embedding-3-small
        if embedding_model == "text-embedding-3-large":
            embedding_dim = 3072

        self.minirag_config = {
            "working_dir": str(self.storage_dir),
            "chunk_size": int(os.getenv("MINIRAG_CHUNK_SIZE", "1000")),
            "chunk_overlap_size": int(os.getenv("MINIRAG_CHUNK_OVERLAP_SIZE", "200")),
            "embedding_dim": int(os.getenv("MINIRAG_EMBEDDING_DIM", str(embedding_dim))),
            "cosine_threshold": float(os.getenv("MINIRAG_COSINE_THRESHOLD", "0.4")),
            "top_k": int(os.getenv("MINIRAG_TOP_K", "10")),
            "embedding_binding": os.getenv("MINIRAG_EMBEDDING_BINDING", "openai"),
            "embedding_model": embedding_model
        }

        # Initialize MiniRAG server if not already running
        self._ensure_minirag_server()

    def _ensure_minirag_server(self) -> None:
        """
        Check if the MiniRAG server is running.

        Note: This method no longer attempts to start the server automatically.
        The server should be started manually before running the application.
        """
        try:
            import httpx
            response = httpx.get("http://localhost:9721/health", timeout=2)
            if response.status_code == 200:
                logger.info("MiniRAG server is already running")
                return
        except Exception:
            # Build the command to start MiniRAG server
            command = (
                f"python start_minirag.py "
                f"--working-dir {str(self.storage_dir)} "
                f"--cosine-threshold {str(self.minirag_config['cosine_threshold'])} "
                f"--top-k {str(self.minirag_config['top_k'])} "
                f"--embedding-binding {self.minirag_config['embedding_binding']} "
                f"--embedding-model {self.minirag_config['embedding_model']} "
                f"--llm-binding openai "
                f"--llm-model gpt-3.5-turbo"
            )

            # Add OpenAI API key if using OpenAI embeddings
            if self.minirag_config['embedding_binding'] == 'openai':
                openai_api_key = os.getenv("OPENAI_API_KEY", "")
                if openai_api_key:
                    command += f" --openai-api-key {openai_api_key}"
                else:
                    logger.warning("OPENAI_API_KEY environment variable not set")

            logger.warning(
                "MiniRAG server is not running. Please start it manually with:\n%s",
                command
            )
            logger.warning(
                "Continuing without MiniRAG server. Some functionality may be limited."
            )

    def index_paper(self, paper_id: str, markdown_path: str) -> None:
        """
        Index a paper using MiniRAG.

        Args:
            paper_id: ID of the paper
            markdown_path: Path to the markdown file
        """
        try:
            logger.info(f"Indexing paper {paper_id}")

            # Create a directory for this paper
            paper_index_dir = self.index_dir / paper_id
            paper_index_dir.mkdir(exist_ok=True)

            # Read the markdown content
            with open(markdown_path, 'r', encoding='utf-8') as f:
                markdown_content = f.read()

            # Try to use MiniRAG API to index the content
            try:
                import httpx

                # Check if MiniRAG server is running
                try:
                    response = httpx.get("http://localhost:9721/health", timeout=2)
                    if response.status_code != 200:
                        raise Exception("MiniRAG server is not running")
                except Exception:
                    raise Exception("MiniRAG server is not running")

                # Insert the text into MiniRAG
                response = httpx.post(
                    "http://localhost:9721/documents/text",
                    json={
                        "text": markdown_content,
                        "description": f"Paper {paper_id}"
                    }
                )
                response.raise_for_status()

                # Get the document ID from the response
                document_id = response.json().get("id")

                # Save the document ID for future reference
                with open(paper_index_dir / "document_id.txt", 'w') as f:
                    f.write(document_id)

                logger.info(f"Paper {paper_id} indexed successfully with document ID {document_id}")

            except Exception as e:
                logger.warning(f"Could not index paper with MiniRAG: {str(e)}")
                logger.warning("Saving markdown content for manual indexing later")

                # Save the markdown content for later indexing
                with open(paper_index_dir / f"{paper_id}_content.md", 'w', encoding='utf-8') as f:
                    f.write(markdown_content)

                logger.info(f"Markdown content saved for paper {paper_id}")

        except Exception as e:
            logger.error(f"Error indexing paper {paper_id}: {str(e)}")
            # Don't raise the exception, just log it
            # This allows the process to continue even if indexing fails

    def retrieve_context(self, paper_id: str, query: str) -> List[Dict[str, Any]]:
        """
        Retrieve context for a query using MiniRAG.

        Args:
            paper_id: ID of the paper
            query: User query

        Returns:
            List of context chunks
        """
        try:
            logger.info(f"Retrieving context for paper {paper_id} with query: {query}")

            # Get the paper index directory
            paper_index_dir = self.index_dir / paper_id

            if not paper_index_dir.exists():
                logger.error(f"Index directory for paper {paper_id} not found")
                return []

            # Try to use MiniRAG API to retrieve context
            try:
                import httpx

                # Check if MiniRAG server is running
                try:
                    response = httpx.get("http://localhost:9721/health", timeout=2)
                    if response.status_code != 200:
                        raise Exception("MiniRAG server is not running")
                except Exception:
                    raise Exception("MiniRAG server is not running")

                # Check if we have a document ID
                document_id_path = paper_index_dir / "document_id.txt"

                if not document_id_path.exists():
                    # If we don't have a document ID but have content, try to index it now
                    content_path = paper_index_dir / f"{paper_id}_content.md"
                    if content_path.exists():
                        logger.info(f"Found content for paper {paper_id}, trying to index it now")

                        with open(content_path, 'r', encoding='utf-8') as f:
                            content = f.read()

                        # Insert the text into MiniRAG
                        response = httpx.post(
                            "http://localhost:9721/documents/text",
                            json={
                                "text": content,
                                "description": f"Paper {paper_id}"
                            }
                        )
                        response.raise_for_status()

                        # Get the document ID from the response
                        document_id = response.json().get("id")

                        # Save the document ID for future reference
                        with open(document_id_path, 'w') as f:
                            f.write(document_id)

                        logger.info(f"Paper {paper_id} indexed successfully with document ID {document_id}")
                    else:
                        logger.error(f"Document ID for paper {paper_id} not found and no content available")
                        return []

                # Try to query MiniRAG for context
                try:
                    response = httpx.post(
                        "http://localhost:9721/query",
                        json={
                            "query": query,
                            "mode": "hybrid"
                        }
                    )
                    response.raise_for_status()

                    # Extract context from the response
                    result = response.json()
                    context = result.get("context", [])

                    # If we got an empty context or an error, raise an exception to use the fallback
                    if not context or "error" in result or "detail" in result:
                        logger.warning(f"MiniRAG returned empty context or error: {result}")
                        raise Exception("Empty context or error from MiniRAG")

                except Exception as e:
                    logger.warning(f"Error querying MiniRAG: {str(e)}")
                    # Force using the fallback method
                    raise Exception("Using fallback method")

                # Format the context
                formatted_context = []
                for chunk in context:
                    formatted_context.append({
                        "text": chunk.get("text", ""),
                        "score": chunk.get("score", 0.0)
                    })

                logger.info(f"Retrieved {len(formatted_context)} context chunks for paper {paper_id}")

                return formatted_context

            except Exception as e:
                logger.warning(f"Could not retrieve context with MiniRAG: {str(e)}")

                # Fallback: Try to find the markdown content and extract relevant sections
                content_path = paper_index_dir / f"{paper_id}_content.md"
                if content_path.exists():
                    logger.info(f"Using fallback context retrieval for paper {paper_id}")

                    with open(content_path, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Simple keyword-based retrieval
                    # Split content into paragraphs
                    paragraphs = content.split('\n\n')

                    # Filter paragraphs that contain query keywords
                    query_keywords = query.lower().split()
                    relevant_paragraphs = []

                    for paragraph in paragraphs:
                        paragraph_lower = paragraph.lower()
                        score = sum(1 for keyword in query_keywords if keyword in paragraph_lower)
                        if score > 0:
                            relevant_paragraphs.append({
                                "text": paragraph,
                                "score": score / len(query_keywords)
                            })

                    # Sort by relevance score
                    relevant_paragraphs.sort(key=lambda x: x["score"], reverse=True)

                    # Return top 10 paragraphs
                    return relevant_paragraphs[:10]
                else:
                    logger.error(f"No content found for paper {paper_id}")
                    return []

        except Exception as e:
            logger.error(f"Error retrieving context for paper {paper_id}: {str(e)}")
            return []
