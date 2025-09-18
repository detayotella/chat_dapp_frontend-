import { useRef, useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useReadReceipts } from '../../hooks/useReadReceipts'
import { useReactions } from '../../hooks/useReactions'

import ReactionPicker from './ReactionPicker'
import { FaceSmileIcon } from '@heroicons/react/24/outline'

function Message({ message, isFromMe, isRead, reactions, onReaction, onRemoveReaction }) {
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const messageReactions = reactions[message.id] || {}
  return (
    <div className={`group flex ${isFromMe ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="relative">
        <div
          className={`rounded-lg px-4 py-2 max-w-[70%] break-words ${
            isFromMe
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <div className="flex items-center justify-end gap-1 mt-1">
            <span 
              className="text-xs opacity-75"
              title={new Date(message.sent).toLocaleString()}
            >
              {formatDistanceToNow(new Date(message.sent), { addSuffix: true })}
            </span>
            {isFromMe && (
              <span 
                className="text-xs"
                title={isRead ? "Read" : "Delivered"}
              >
                {isRead ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.707 12.293a1 1 0 010 1.414l-2 2a1 1 0 01-1.414 0l-1-1a1 1 0 011.414-1.414L7 13.586l1.293-1.293a1 1 0 011.414 0z" />
                    <path d="M15.707 12.293a1 1 0 010 1.414l-2 2a1 1 0 01-1.414 0l-1-1a1 1 0 011.414-1.414L13 13.586l1.293-1.293a1 1 0 011.414 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.707 12.293a1 1 0 010 1.414l-2 2a1 1 0 01-1.414 0l-1-1a1 1 0 011.414-1.414L7 13.586l1.293-1.293a1 1 0 011.414 0z" />
                  </svg>
                )}
              </span>
            )}
          </div>

          {/* Reactions */}
          {Object.entries(messageReactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(messageReactions).map(([emoji, users]) => (
                users.length > 0 && (
                  <button
                    key={emoji}
                    onClick={() => onRemoveReaction(message.id, emoji)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-600"
                    title={`${users.length} ${users.length === 1 ? 'reaction' : 'reactions'}`}
                  >
                    <span>{emoji}</span>
                    <span className="text-xs">{users.length}</span>
                  </button>
                )
              ))}
            </div>
          )}
        </div>

        {/* Reaction button */}
        <div className="absolute top-0 -left-8 hidden group-hover:flex items-center h-full">
          <button
            onClick={() => setShowReactionPicker(true)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Add reaction"
          >
            <FaceSmileIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Reaction picker */}
        {showReactionPicker && (
          <div className="relative">
            <ReactionPicker
              onSelect={(emoji) => onReaction(message.id, emoji)}
              onClose={() => setShowReactionPicker(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function DateDivider({ date }) {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-gray-300 dark:bg-gray-600 h-px flex-grow"></div>
      <span className="px-4 text-sm text-gray-500 dark:text-gray-400">
        {date}
      </span>
      <div className="bg-gray-300 dark:bg-gray-600 h-px flex-grow"></div>
    </div>
  )
}

export default function MessageList({ messages, currentUserId, isLoading }) {
  const containerRef = useRef(null)
  const endOfMessagesRef = useRef(null)
  const [wasAtBottom, setWasAtBottom] = useState(true)
  
  const { readStatus, markMessagesAsRead } = useReadReceipts()
  const { reactions, sendReaction, removeReaction } = useReactions()

  console.log('🔍 MessageList render:')
  console.log('  - messages prop:', messages)
  console.log('  - messages.length:', messages.length)
  console.log('  - currentUserId:', currentUserId)
  console.log('  - isLoading:', isLoading)

  // Track when messages prop changes
  useEffect(() => {
    console.log('🔄 MessageList: messages prop changed!')
    console.log('  - New messages:', messages)
    console.log('  - New messages length:', messages.length)
  }, [messages])

  // Check if user was at bottom before new message
  useEffect(() => {
    if (containerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = containerRef.current
      setWasAtBottom(scrollHeight - scrollTop - clientHeight < 10)
    }
  }, [messages])

  // Auto-scroll to bottom when new messages arrive if user was already at bottom
  useEffect(() => {
    if (wasAtBottom) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, wasAtBottom])

  // Mark messages as read when they become visible
  useEffect(() => {
    if (!messages.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleMessages = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => messages.find(m => m.id === entry.target.dataset.messageId))
          .filter(message => message && message.sender !== currentUserId)

        if (visibleMessages.length) {
          markMessagesAsRead(visibleMessages)
        }
      },
      {
        root: containerRef.current,
        threshold: 0.5
      }
    )

    const messageElements = document.querySelectorAll('[data-message-id]')
    messageElements.forEach(el => observer.observe(el))

    return () => {
      messageElements.forEach(el => observer.unobserve(el))
    }
  }, [messages, currentUserId, markMessagesAsRead])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 animate-pulse">
          Loading messages...
        </div>
      </div>
    )
  }

  // Group messages by date
  const messagesByDate = messages.reduce((groups, message) => {
    // Ensure we have a valid date
    let messageDate;
    if (message.sent) {
      messageDate = new Date(message.sent);
    } else if (message.timestamp) {
      messageDate = new Date(message.timestamp);
    } else {
      messageDate = new Date(); // fallback to now
    }
    
    const date = messageDate.toLocaleDateString()
    
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  console.log('🔍 MessagesByDate result:')
  console.log('  - messagesByDate:', messagesByDate)
  console.log('  - Object.keys(messagesByDate):', Object.keys(messagesByDate))
  console.log('  - Total date groups:', Object.keys(messagesByDate).length)

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 scroll-smooth"
    >
      
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <div className="text-gray-500 dark:text-gray-400">
            No messages yet
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Start the conversation by sending a message!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(messagesByDate).map(([date, msgs]) => (
            <div key={date}>
              <DateDivider date={date} />
              {msgs.map((message, index) => {
                console.log('🎨 Rendering message:', message);
                return (
                  <div 
                    key={`${message.id}-${index}`}
                    data-message-id={message.id}
                  >
                    <Message
                      message={message}
                      isFromMe={message.sender === currentUserId}
                      isRead={readStatus[message.id]}
                      reactions={reactions}
                      onReaction={sendReaction}
                      onRemoveReaction={removeReaction}
                    />
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={endOfMessagesRef} />
        </div>
      )}
    </div>
  )
}