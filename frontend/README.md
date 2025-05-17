# AlphaXIV Frontend

This is the frontend for the AlphaXIV project, a web application that allows users to chat with arXiv papers using RAG and Gemini.

## Features

- View arXiv papers directly in the browser
- Chat with papers using AI-powered responses
- Simple and clean interface with PDF viewer and chat panel

## Technology Stack

- Next.js for the frontend framework
- React for UI components
- Tailwind CSS for styling
- react-pdf for PDF rendering
- Axios for API communication

## Getting Started

### Prerequisites

- Node.js 18.x or higher (Note: The current implementation may work with Node.js 16.x with some modifications)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:

```bash
npm install
# or
yarn install
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

- `src/app`: Next.js app router pages
- `src/components`: React components
- `src/lib`: Utility functions and API client
- `src/types`: TypeScript type definitions

## Main Components

- `PaperViewer`: Displays the PDF and chat interface
- `ChatPanel`: Handles the chat functionality
- `PaperProcessor`: Form for entering arXiv paper IDs

## API Integration

The frontend communicates with the backend API for:

- Processing papers
- Chatting with papers

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
