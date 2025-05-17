import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ContextItem } from '@/types';
import { chatWithPaper } from '@/lib/api';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import ContextSection from './ContextSection';

interface ChatPanelProps {
  paperId: string;
  messages: ChatMessage[];
  onSendMessage: (message: ChatMessage) => void;
  selectedText?: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  paperId,
  messages,
  onSendMessage,
  selectedText,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set input value when selected text changes
  useEffect(() => {
    if (selectedText) {
      setInputValue(`What does this mean: "${selectedText.substring(0, 100)}${selectedText.length > 100 ? '...' : ''}"`);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [selectedText]);

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    // Reset height to auto to get the correct scrollHeight
    e.target.style.height = 'auto';
    // Set the height to scrollHeight
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    // Add user message to chat
    onSendMessage(userMessage);
    setInputValue('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsLoading(true);

    try {
      // Send message to API
      const response = await chatWithPaper(paperId, inputValue);

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        context: response.context, // Include the context from the response
      };

      // Add assistant message to chat
      onSendMessage(assistantMessage);
    } catch (error) {
      console.error('Error sending message:', error);

      // Create error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date(),
      };

      // Add error message to chat
      onSendMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <p className="text-sm">Ask questions about this paper</p>
            <div className="mt-4 space-y-2 text-xs">
              <p className="font-medium">Example questions:</p>
              <p className="bg-gray-100 p-2 rounded-md">"What is the main contribution of this paper?"</p>
              <p className="bg-gray-100 p-2 rounded-md">"Explain the methodology in simple terms"</p>
              <p className="bg-gray-100 p-2 rounded-md">"What are the limitations of this approach?"</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs sm:max-w-md md:max-w-lg rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                } ${message.role === 'assistant' ? 'markdown-bubble' : ''}`}
              >
                {message.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="text-sm">
                    <div className="markdown-content">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    {message.context && message.context.length > 0 && (
                      <ContextSection context={message.context} />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex items-end">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleTextareaChange}
            placeholder="Ask a question about the paper..."
            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 resize-none min-h-[40px] max-h-[150px]"
            disabled={isLoading}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            className="ml-2 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex-shrink-0"
            disabled={isLoading || !inputValue.trim()}
          >
            <PaperAirplaneIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </form>
        {isLoading && (
          <div className="text-xs text-gray-500 mt-2 flex items-center">
            <div className="animate-pulse mr-2">●</div>
            Generating response...
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
