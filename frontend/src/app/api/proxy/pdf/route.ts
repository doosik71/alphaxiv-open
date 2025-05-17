import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to proxy PDF requests to avoid CORS issues
 * This endpoint fetches PDFs from external sources and serves them with appropriate headers
 */
export async function GET(request: NextRequest) {
  // Get the URL from the query parameters
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch the PDF from the external source
    const response = await fetch(url, {
      headers: {
        // Some sites check for a user agent
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch PDF: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the PDF data as an array buffer
    const pdfData = await response.arrayBuffer();

    // Create a response with the PDF data and appropriate headers
    return new NextResponse(pdfData, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error proxying PDF:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PDF' },
      { status: 500 }
    );
  }
}
