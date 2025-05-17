import React, { ReactNode } from 'react';
import Link from 'next/link';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className={`min-h-screen bg-white ${inter.className}`}>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-blue-600">AlphaXIV</span>
              </Link>
            </div>
            <nav className="flex space-x-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              <a
                href="https://github.com/AsyncFuncAI/alphaxiv-open"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                GitHub
              </a>
            </nav>
          </div>
        </div>
      </header>
      <main className="h-[calc(100vh-4rem)]">{children}</main>
    </div>
  );
};

export default MainLayout;
