'use client';

import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import PaperProcessor from '@/components/paper/PaperProcessor';

export default function Home() {
  const router = useRouter();

  const handlePaperProcessed = (paperId: string) => {
    // Navigate to the paper page
    router.push(`/papers/${paperId}`);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900">AlphaXIV</h1>
            <p className="mt-4 text-xl text-gray-500">
              Chat with arXiv papers using RAG and Gemini
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <PaperProcessor onPaperProcessed={handlePaperProcessed} />

            <div className="mt-8 bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  About AlphaXIV
                </h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>
                    AlphaXIV is an open-source implementation that allows users to chat with arXiv
                    papers. This project uses FastAPI for the backend, markitdown for PDF conversion,
                    MiniRAG for indexing, and Google's Gemini API for chat completions.
                  </p>
                  <p className="mt-2">
                    The graph-based indexing provided by MiniRAG helps maintain relationships between
                    equations and their explanations, providing more coherent responses to technical
                    questions.
                  </p>
                </div>
                <div className="mt-5">
                  <a
                    href="https://github.com/AsyncFuncAI/alphaxiv-open"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    View on GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
