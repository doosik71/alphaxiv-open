
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function processPaper(arxivUrl: string) {
  const response = await fetch(`${API_URL}/api/papers/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ arxiv_url: arxivUrl }),
  });

  if (!response.ok) {
    throw new Error('Failed to process paper');
  }

  return await response.json();
}

export async function chatWithPaper(paperId: string, query: string) {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paper_id: paperId, query }),
  });

  if (!response.ok) {
    throw new Error('Failed to chat with paper');
  }

  return await response.json();
}
