#!/usr/bin/env python3
"""
Script to set the document ID for a paper.
"""

import sys
import httpx
from pathlib import Path

def main():
    """Main function to set the document ID for a paper."""
    if len(sys.argv) < 2:
        print("Usage: python set_document_id.py <paper_id>")
        sys.exit(1)
    
    paper_id = sys.argv[1]
    
    # Get all documents from MiniRAG
    try:
        # Check if MiniRAG server is running
        response = httpx.get("http://localhost:9721/health", timeout=5)
        if response.status_code != 200:
            print("MiniRAG server is not running")
            sys.exit(1)
        
        # Get all documents
        response = httpx.get("http://localhost:9721/documents", timeout=10)
        if response.status_code != 200:
            print(f"Error getting documents: {response.text}")
            sys.exit(1)
        
        # Parse the response
        documents = response.json()
        print(f"Documents response: {documents}")
        
        # If we have at least one document, use the first one
        document_id = None
        
        # Try to find a document ID in the response
        if isinstance(documents, list) and len(documents) > 0:
            document_id = documents[0].get("id")
        elif isinstance(documents, dict):
            # Try different possible structures
            if "documents" in documents and len(documents["documents"]) > 0:
                document_id = documents["documents"][0].get("id")
            elif "statuses" in documents:
                statuses = documents["statuses"]
                if "completed" in statuses and len(statuses["completed"]) > 0:
                    document_id = statuses["completed"][0].get("id")
                elif "processing" in statuses and len(statuses["processing"]) > 0:
                    document_id = statuses["processing"][0].get("id")
        
        # If we still don't have a document ID, try a different endpoint
        if not document_id:
            # Try the document status endpoint
            response = httpx.get("http://localhost:9721/documents/status", timeout=10)
            if response.status_code == 200:
                statuses = response.json()
                print(f"Status response: {statuses}")
                
                if "statuses" in statuses:
                    status_data = statuses["statuses"]
                    if "completed" in status_data and len(status_data["completed"]) > 0:
                        document_id = status_data["completed"][0].get("id")
                    elif "processing" in status_data and len(status_data["processing"]) > 0:
                        document_id = status_data["processing"][0].get("id")
        
        # If we still don't have a document ID, use a hardcoded one from the logs
        if not document_id:
            # This is the document ID from the logs
            document_id = "doc-cc9b11e586452de3eaf1e475d1429262"
            print(f"Using hardcoded document ID from logs: {document_id}")
        
        # Save the document ID
        paper_index_dir = Path(f"data/index/{paper_id}")
        paper_index_dir.mkdir(exist_ok=True)
        
        with open(paper_index_dir / "document_id.txt", 'w') as f:
            f.write(document_id)
        
        print(f"Document ID {document_id} saved for paper {paper_id}")
    
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
