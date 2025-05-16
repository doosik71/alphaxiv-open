import requests
import json
import time
import argparse

def test_process_paper(base_url, arxiv_url):
    """Test the process paper endpoint."""
    print(f"Testing process paper endpoint with arXiv URL: {arxiv_url}")
    
    response = requests.post(
        f"{base_url}/api/papers/process",
        json={"arxiv_url": arxiv_url}
    )
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        return response.json()["paper_id"]
    else:
        return None

def test_chat(base_url, paper_id, query):
    """Test the chat endpoint."""
    print(f"Testing chat endpoint with paper ID: {paper_id} and query: {query}")
    
    response = requests.post(
        f"{base_url}/api/chat",
        json={"paper_id": paper_id, "query": query}
    )
    
    print(f"Response status code: {response.status_code}")
    
    if response.status_code == 200:
        print(f"Response body: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"Error: {response.text}")

def main():
    parser = argparse.ArgumentParser(description="Test the AlphaXIV API")
    parser.add_argument("--url", default="http://localhost:8000", help="Base URL of the API")
    parser.add_argument("--arxiv", default="https://arxiv.org/abs/2201.08239", help="arXiv URL to process")
    parser.add_argument("--query", default="What is the main contribution of this paper?", help="Query to ask about the paper")
    parser.add_argument("--wait", type=int, default=30, help="Time to wait for processing (seconds)")
    
    args = parser.parse_args()
    
    # Test process paper endpoint
    paper_id = test_process_paper(args.url, args.arxiv)
    
    if paper_id:
        print(f"Paper ID: {paper_id}")
        print(f"Waiting {args.wait} seconds for processing to complete...")
        time.sleep(args.wait)
        
        # Test chat endpoint
        test_chat(args.url, paper_id, args.query)
    else:
        print("Failed to process paper")

if __name__ == "__main__":
    main()
