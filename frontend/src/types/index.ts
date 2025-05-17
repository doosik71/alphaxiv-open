// Paper processing types
export interface ProcessPaperRequest {
  arxiv_url: string;
}

export interface ProcessPaperResponse {
  paper_id: string;
  status: 'processing' | 'completed' | 'error' | 'already_processed';
  message: string;
}

// Chat types
export interface ChatRequest {
  paper_id: string;
  query: string;
}

export interface ChatResponse {
  paper_id: string;
  query: string;
  response: string;
  context: ContextItem[];
}

export interface ContextItem {
  content?: string;
  text?: string;
  metadata?: {
    page?: number;
    section?: string;
    [key: string]: any;
  };
  score?: number;
}

// Paper metadata
export interface PaperMetadata {
  paper_id: string;
  title?: string;
  authors?: string[];
  abstract?: string;
  published_date?: string;
  url?: string;
  pdf_url?: string;
  is_processed: boolean;
  processing_status: string;
  last_updated?: string;
}

// Chat message
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: ContextItem[]; // Optional context for assistant messages
}
