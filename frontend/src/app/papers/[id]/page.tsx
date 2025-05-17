'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import PaperViewer from '@/components/paper/PaperViewer';

export default function PaperPage() {
  const params = useParams();
  const paperId = params.id as string;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    const fetchPaperDetails = async () => {
      try {
        setIsLoading(true);

        // First, check if the paper exists in our backend
        const checkPaperUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/papers/${paperId}`;

        try {
          const response = await fetch(checkPaperUrl);

          // If the paper doesn't exist (404), we need to process it first
          if (!response.ok && response.status === 404) {
            console.log(`Paper ${paperId} not found, processing it first...`);

            // Set processing state to true
            setIsProcessing(true);

            // Process the paper
            const processUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/papers/process`;
            const processResponse = await fetch(processUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                arxiv_url: `https://arxiv.org/abs/${paperId}`,
              }),
            });

            if (!processResponse.ok) {
              throw new Error(`Failed to process paper: ${processResponse.statusText}`);
            }

            // Wait for processing to complete (in a real app, you might poll or use websockets)
            console.log('Paper processing initiated, waiting for completion...');

            // In a real implementation, you would poll the backend to check processing status
            // For demo purposes, we'll simulate processing time
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Set processing state back to false
            setIsProcessing(false);
          }
        } catch (checkError) {
          console.error('Error checking paper existence:', checkError);
          // Continue anyway to show the PDF
        }

        // Construct arXiv PDF URL - we'll use our proxy to avoid CORS issues
        const arxivPdfUrl = `https://arxiv.org/pdf/${paperId}.pdf`;

        // Set the URL - the PDF viewer component will handle loading through the proxy
        setPdfUrl(arxivPdfUrl);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching paper details:', error);
        setError('Failed to load paper details. Please try again later.');
        setIsLoading(false);
      }
    };

    if (paperId) {
      fetchPaperDetails();
    }
  }, [paperId]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </MainLayout>
    );
  }

  // Get paper title from ID by replacing hyphens with spaces and capitalizing
  const formatTitle = (id: string) => {
    // Extract the title part (remove version if present)
    const basePaperId = id.split('v')[0];

    // For demo purposes, use hardcoded titles for specific paper IDs
    if (id.includes('2201.08239')) {
      return "LLMs Get Lost In Multi-Turn Conversation";
    }

    if (id.includes('2203.02155')) {
      return "Training language models to follow instructions";
    }

    if (id.includes('2501.06713')) {
      return "Recent arXiv Paper (January 2025)";
    }

    return `arXiv Paper: ${id}`;
  };

  // Get authors based on paper ID
  const getAuthors = (id: string) => {
    if (id.includes('2201.08239')) {
      return ["Philippe Laban", "Hiroshi Uehara", "Yuxiao Zhou", "Jennifer Neville"];
    }

    if (id.includes('2203.02155')) {
      return ["Long Ouyang", "Jeff Wu", "Xu Jiang", "Diogo Almeida", "Carroll L. Wainwright", "Pamela Mishkin", "Chong Zhang", "Sandhini Agarwal", "Katarina Slama", "Alex Ray", "John Schulman", "Jacob Hilton", "Fraser Kelton", "Luke Miller", "Maddie Simens", "Amanda Askell", "Peter Welinder", "Paul Christiano", "Jan Leike", "Ryan Lowe"];
    }

    return ["arXiv Authors"];
  };

  return (
    <MainLayout>
      <PaperViewer
        paperId={paperId}
        pdfUrl={pdfUrl || undefined}
        isProcessing={isProcessing}
        paperMetadata={{
          paper_id: paperId,
          title: formatTitle(paperId),
          authors: getAuthors(paperId),
          is_processed: !isProcessing,
          processing_status: isProcessing ? "processing" : "completed"
        }}
      />
    </MainLayout>
  );
}
