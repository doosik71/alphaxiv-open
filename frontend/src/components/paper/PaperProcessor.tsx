import React, { useState } from 'react';
import { processPaper } from '@/lib/api';
import { ProcessPaperResponse } from '@/types';
import { ArrowPathIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface PaperProcessorProps {
  onPaperProcessed: (paperId: string) => void;
}

const PaperProcessor: React.FC<PaperProcessorProps> = ({ onPaperProcessed }) => {
  const [arxivInput, setArxivInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessPaperResponse | null>(null);
  const router = useRouter();

  // Extract arXiv ID from URL or direct ID input
  const extractArxivId = (input: string): string | null => {
    // Check if it's a URL
    if (input.includes('arxiv.org')) {
      // Extract ID from URL patterns like arxiv.org/abs/2201.08239 or arxiv.org/pdf/2201.08239.pdf
      const match = input.match(/arxiv\.org\/(?:abs|pdf)\/([0-9]+\.[0-9]+(?:v[0-9]+)?)/i);
      return match ? match[1] : null;
    }

    // Check if it's a direct arXiv ID (e.g., 2201.08239 or 2201.08239v1)
    const directIdMatch = input.match(/^([0-9]+\.[0-9]+(?:v[0-9]+)?)$/);
    return directIdMatch ? directIdMatch[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arxivInput.trim() || isProcessing) return;

    // Extract arXiv ID
    const arxivId = extractArxivId(arxivInput);

    if (!arxivId) {
      setError('Please enter a valid arXiv ID (e.g., 2201.08239) or URL (e.g., https://arxiv.org/abs/2201.08239)');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      // For the simplified version, we'll just navigate directly to the paper page
      // In a real implementation, you would call the API to process the paper first

      // Simulate API call delay
      setTimeout(() => {
        // Navigate to the paper page
        router.push(`/papers/${arxivId}`);
      }, 1000);

    } catch (error) {
      console.error('Error processing paper:', error);
      setError('An error occurred while processing the paper. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleViewDirectly = () => {
    if (!arxivInput.trim()) return;

    // Extract arXiv ID
    const arxivId = extractArxivId(arxivInput);

    if (!arxivId) {
      setError('Please enter a valid arXiv ID (e.g., 2201.08239) or URL (e.g., https://arxiv.org/abs/2201.08239)');
      return;
    }

    // Navigate directly to the paper page
    router.push(`/papers/${arxivId}`);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          View an arXiv Paper
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Enter an arXiv ID or URL to view and chat with a paper.
          </p>
        </div>
        <form className="mt-5 sm:flex sm:items-center" onSubmit={handleSubmit}>
          <div className="w-full sm:max-w-xs">
            <label htmlFor="arxiv-input" className="sr-only">
              arXiv ID or URL
            </label>
            <input
              type="text"
              name="arxiv-input"
              id="arxiv-input"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="2201.08239 or https://arxiv.org/abs/2201.08239"
              value={arxivInput}
              onChange={(e) => setArxivInput(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          <button
            type="submit"
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:ml-3 sm:mt-0 sm:w-auto disabled:opacity-50"
            disabled={isProcessing || !arxivInput.trim()}
          >
            {isProcessing ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                View Paper
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-sm text-red-600">
            <p>{error}</p>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p>
            Try with these example papers:
          </p>
          <ul className="mt-2 space-y-1">
            <li>
              <button
                onClick={() => setArxivInput('2201.08239')}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                2201.08239 - LLMs Get Lost In Multi-Turn Conversation
              </button>
            </li>
            <li>
              <button
                onClick={() => setArxivInput('2203.02155')}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                2203.02155 - Training language models to follow instructions
              </button>
            </li>
            <li>
              <button
                onClick={() => setArxivInput('2501.06713')}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                2501.06713 - Example of a paper that will show error handling
              </button>
            </li>
          </ul>
        </div>

        <div className="mt-6 text-xs text-gray-500 border-t border-gray-200 pt-4">
          <p className="font-medium text-gray-700">Accepted formats:</p>
          <ul className="mt-2 space-y-1 list-disc pl-4">
            <li>arXiv ID: <span className="font-mono">2201.08239</span></li>
            <li>arXiv URL: <span className="font-mono">https://arxiv.org/abs/2201.08239</span></li>
            <li>arXiv PDF URL: <span className="font-mono">https://arxiv.org/pdf/2201.08239.pdf</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaperProcessor;
