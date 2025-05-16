import os
import logging
from typing import List, Dict, Any
import google.generativeai as genai

logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with Google's Gemini API."""

    def __init__(self):
        """Initialize the GeminiService."""
        # Get API key from environment variable
        api_key = os.getenv("GOOGLE_API_KEY")

        if not api_key:
            logger.warning("GOOGLE_API_KEY environment variable not set")

        # Initialize Gemini client
        genai.configure(api_key=api_key)

        # Set default model
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

        # Initialize model
        self.model = genai.GenerativeModel(self.model_name)

    def generate_response(
        self,
        query: str,
        context: List[Dict[str, Any]]
    ) -> str:
        """
        Generate a response using Gemini.

        Args:
            query: User query
            context: Context retrieved from MiniRAG

        Returns:
            Generated response
        """
        try:
            logger.info(f"Generating response for query: {query}")

            # Format context for the prompt
            formatted_context = self._format_context(context)

            # Create the prompt
            prompt = self._create_prompt(query, formatted_context)

            # Generate response
            generation_config = {
                "temperature": 1,
                "top_p": 0.95,
                "top_k": 40,
            }

            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )

            # Extract and return the response text
            response_text = response.text

            logger.info(f"Response generated successfully")

            return response_text

        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return f"Error generating response: {str(e)}"

    def _format_context(self, context: List[Dict[str, Any]]) -> str:
        """
        Format context for the prompt.

        Args:
            context: Context retrieved from MiniRAG

        Returns:
            Formatted context
        """
        if not context:
            return "No relevant context found."

        formatted_context = "Here is the relevant context from the paper:\n\n"

        for i, chunk in enumerate(context, 1):
            formatted_context += f"Context {i}:\n{chunk['text']}\n\n"

        return formatted_context

    def _create_prompt(self, query: str, formatted_context: str) -> str:
        """
        Create a prompt for Gemini.

        Args:
            query: User query
            formatted_context: Formatted context

        Returns:
            Prompt for Gemini
        """
        prompt = f"""You are an AI assistant that helps users understand academic papers.
You have been provided with relevant sections from a paper to answer the user's question.

{formatted_context}

User question: {query}

Please provide a comprehensive and accurate answer based on the provided context.
If the context doesn't contain enough information to answer the question,
acknowledge this limitation and provide the best possible answer with the available information.
"""

        return prompt
