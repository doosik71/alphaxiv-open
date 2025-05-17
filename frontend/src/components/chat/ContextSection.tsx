import React, { useState } from 'react';
import { ContextItem } from '@/types';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

interface ContextSectionProps {
  context: ContextItem[];
}

const ContextSection: React.FC<ContextSectionProps> = ({ context }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!context || context.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 border-t border-gray-200 pt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-xs text-gray-500 hover:text-gray-700 w-full justify-between"
      >
        <span>
          {isExpanded ? 'Hide context sources' : 'Show context sources'} ({context.length})
        </span>
        {isExpanded ? (
          <ChevronUpIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2 text-xs">
          {context.map((item, index) => (
            <div key={index} className="bg-gray-50 p-2 rounded-md">
              <div className="flex justify-between mb-1">
                <span className="font-medium">
                  {item.metadata && item.metadata.section ? item.metadata.section : 'Context'}
                  {item.metadata && item.metadata.page !== undefined && ` (Page ${item.metadata.page})`}
                </span>
                {item.score !== undefined && (
                  <span className="text-xs text-gray-500">
                    Relevance: {(item.score * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className="text-gray-600 whitespace-pre-wrap">{item.content || item.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContextSection;
