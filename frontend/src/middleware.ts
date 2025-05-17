import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;

  // Only add CORS headers for PDF worker files
  if (pathname.includes('pdf.worker')) {
    // Clone the response and add CORS headers
    const response = NextResponse.next();
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
  }

  // Continue with the request for other paths
  return NextResponse.next();
}

// Configure the middleware to run only for specific paths
export const config = {
  matcher: [
    // Match all PDF worker files
    '/pdf.worker.min.js',
    '/pdf.worker.js',
    '/pdf.worker.mjs',
    '/pdf.worker.min.mjs',
  ],
};
