import React, { useState } from 'react';
import { ChatMessage, PaperMetadata } from '@/types';
import ChatPanel from '../chat/ChatPanel';

interface PaperViewerProps {
  paperId: string;
  paperContent?: string; // Made optional since it's not used currently
  paperMetadata?: PaperMetadata;
  pdfUrl?: string;
  isProcessing?: boolean; // Added to show processing state
}

const PaperViewer: React.FC<PaperViewerProps> = ({
  paperId,
  paperMetadata,
  pdfUrl,
  isProcessing = false,
}) => {
  const [selectedText, setSelectedText] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [pdfLoadError, setPdfLoadError] = useState<boolean>(false);

  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
    }
  };

  // Add a new message to the chat
  const addMessage = (message: ChatMessage) => {
    setChatMessages((prev) => [...prev, message]);
  };

  // For demo purposes, use a sample PDF if no URL is provided
  // Use a proxy to avoid CORS issues
  const createProxyUrl = (arxivId: string) => `/api/proxy/pdf?url=https://arxiv.org/pdf/${arxivId}.pdf`;

  // Use the proxy URL instead of direct arXiv URL
  const pdfToShow = pdfUrl ?
    (pdfUrl.includes('arxiv.org') ? `/api/proxy/pdf?url=${encodeURIComponent(pdfUrl)}` : pdfUrl) :
    createProxyUrl('2201.08239');

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* PDF Viewer (Left side) */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200 min-w-0">
        {/* Paper header */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {paperMetadata?.title || 'Paper Title'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {paperMetadata?.authors?.join(', ') || 'Authors'}
              </p>
            </div>
            <a
              href={`https://arxiv.org/abs/${paperId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View on arXiv
            </a>
          </div>
        </div>

        {/* PDF content */}
        <div className="flex-1 overflow-hidden flex" onMouseUp={handleTextSelection}>
          <div className="h-full w-full flex-1">
            {isProcessing ? (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <div className="text-lg font-medium text-gray-900 mb-2">Processing Paper</div>
                  <div className="text-gray-600">
                    <p>We&apos;re currently processing this paper. This may take a moment...</p>
                    <p className="mt-2">The paper will be available for viewing and AI-powered chat once processing is complete.</p>
                  </div>
                </div>
              </div>
            ) : pdfLoadError ? (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-center max-w-3xl">
                  <div className="text-red-500 mb-4 text-xl">Failed to load PDF</div>
                  <div className="text-gray-600 mb-6">
                    <p>This could be due to one of the following reasons:</p>
                    <ul className="list-disc text-left mt-2 pl-8">
                      <li>The paper is very recent and not yet available on arXiv</li>
                      <li>The paper ID format is incorrect</li>
                      <li>There might be temporary issues with the arXiv server</li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-700 mb-2">You can try:</p>
                    <a
                      href={`https://arxiv.org/abs/${paperId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Viewing the abstract page on arXiv
                    </a>
                  </div>
                  <button
                    onClick={() => setPdfLoadError(false)}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex">
                <object
                  title="PDF Document"
                  type="application/pdf"
                  data={pdfToShow}
                  className="w-full h-full flex-1"
                >
                  <div className="p-4 text-center">
                    <p className="text-red-500 mb-2">Your browser doesn&apos;t support PDF preview.</p>
                    <a
                      href={pdfToShow}
                      download={`${paperId}.pdf`}
                      className="text-blue-600 hover:underline"
                    >
                      Download PDF
                    </a>
                  </div>
                </object>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Panel (Right side) */}
      <div className="w-96 bg-white flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Ask about this paper</h2>
          <p className="text-sm text-gray-500">
            Ask questions about the paper and get AI-powered answers
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatPanel
            paperId={paperId}
            messages={chatMessages}
            onSendMessage={addMessage}
            selectedText={selectedText}
          />
        </div>
      </div>
    </div>
  );
};

export default PaperViewer;
