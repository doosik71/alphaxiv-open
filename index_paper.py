#!/usr/bin/env python3
"""
Script to index a paper with MiniRAG.
"""

import os
import sys
import json
import httpx
from pathlib import Path

def main():
    """Main function to index a paper with MiniRAG."""
    if len(sys.argv) < 2:
        print("Usage: python index_paper.py <paper_id>")
        sys.exit(1)

    paper_id = sys.argv[1]

    # Get the paper content
    paper_path = Path(f"data/index/{paper_id}/{paper_id}_content.md")

    if not paper_path.exists():
        print(f"Paper content not found at {paper_path}")
        sys.exit(1)

    # Read the paper content
    with open(paper_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Index the paper with MiniRAG
    try:
        # Check if MiniRAG server is running
        response = httpx.get("http://localhost:9721/health", timeout=5)
        if response.status_code != 200:
            print("MiniRAG server is not running")
            sys.exit(1)

        # Index the paper
        response = httpx.post(
            "http://localhost:9721/documents/text",
            json={
                "text": content,
                "description": f"Paper {paper_id}"
            },
            timeout=60
        )

        print(f"Response status: {response.status_code}")
        print(f"Response text: {response.text}")

        if response.status_code != 200:
            print(f"Error indexing paper: {response.text}")
            sys.exit(1)

        # For async processing, we need to wait and then list documents
        print("Document submitted for processing. Waiting for processing to complete...")
        import time

        # Get the document ID from the processing queue
        max_attempts = 10
        document_id = None

        for attempt in range(max_attempts):
            print(f"Checking document status (attempt {attempt+1}/{max_attempts})...")

            # Get document statuses
            response = httpx.get("http://localhost:9721/documents/status", timeout=10)
            if response.status_code != 200:
                print(f"Error getting document status: {response.text}")
                time.sleep(5)
                continue

            statuses = response.json()
            print(f"Status response: {json.dumps(statuses, indent=2)}")

            # Check for processing documents
            processing_docs = statuses.get("statuses", {}).get("processing", [])
            completed_docs = statuses.get("statuses", {}).get("completed", [])

            # First check if any document is still processing
            for doc in processing_docs:
                if isinstance(doc, dict) and doc.get("content_summary", "").startswith("LLMS GET LOST IN MULTI-TURN CONVERSATION"):
                    document_id = doc.get("id")
                    print(f"Found document in processing queue with ID: {document_id}")
                    break

            # Then check completed documents
            if not document_id:
                for doc in completed_docs:
                    if isinstance(doc, dict) and doc.get("content_summary", "").startswith("LLMS GET LOST IN MULTI-TURN CONVERSATION"):
                        document_id = doc.get("id")
                        print(f"Found document in completed queue with ID: {document_id}")
                        break

            if document_id:
                break

            print("Document still processing, waiting 5 seconds...")
            time.sleep(5)

        if not document_id:
            print("No document ID found for this paper")
            sys.exit(1)

        # Save the document ID
        with open(Path(f"data/index/{paper_id}/document_id.txt"), 'w') as f:
            f.write(document_id)

        print(f"Paper {paper_id} indexed successfully with document ID {document_id}")

    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
