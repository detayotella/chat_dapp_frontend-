import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ThreadView = ({ conversationId, recipientAddress }) => {
  const { 
    getConversationMessages,
    sendMessage,
    isLoading,
    error,
    userId,
    loadConversationMessages
  } = useChat();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Get messages for this conversation
  const conversationMessages = getConversationMessages(recipientAddress) || [];

  console.log('🧵 ThreadView render:');
  console.log('  - recipientAddress:', recipientAddress);
  console.log('  - conversationMessages:', conversationMessages);
  console.log('  - userId:', userId);

  useEffect(() => {
    if (recipientAddress && userId) {
      console.log('📥 Loading conversation messages for:', recipientAddress);
      loadConversationMessages(recipientAddress);
    }
  }, [recipientAddress, userId, loadConversationMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content, attachments = []) => {
    if (!content.trim() && attachments.length === 0) return;
    if (!recipientAddress) {
      console.error('No recipient address provided');
      return;
    }

    try {
      setIsSending(true);
      console.log('📤 Sending message:', { content, recipientAddress });
      
      // Fixed parameter order: content first, then recipientAddress
      await sendMessage(content, recipientAddress);
      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (value) => {
    setInputValue(value);
    
    // Handle typing indicator
    if (value && !isTyping) {
      setIsTyping(true);
      // You could emit typing event to contract here if needed
    } else if (!value && isTyping) {
      setIsTyping(false);
    }
  };

  if (!recipientAddress) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.646-.4l-2.854 1.427a.5.5 0 01-.708-.708L8.219 17.146A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to Fire Chat
          </h2>
          <p className="text-gray-600">
            Select a contact from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-600 mb-2">
            Error loading conversation
          </h3>
          <p className="text-gray-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="border-b border-gray-200 px-6 py-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {recipientAddress.slice(2, 4).toUpperCase()}
            </div>
            
            {/* Contact Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
              </h2>
              <p className="text-sm text-gray-500">
                {conversationMessages.length} messages • FireChat Contract
              </p>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-gray-500">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : (
          <MessageList 
            messages={conversationMessages}
            currentUserId={userId}
            isLoading={isLoading}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white">
        <MessageInput
          value={inputValue}
          onChange={handleInputChange}
          onSend={handleSendMessage}
          placeholder={`Message ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`}
          disabled={isLoading || isSending}
        />
      </div>
    </div>
  );
};

export default ThreadView;
