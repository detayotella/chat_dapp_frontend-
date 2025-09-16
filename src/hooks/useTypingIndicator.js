import { useState, useCallback, useEffect } from 'react'
import { useXMTP } from '../contexts/XMTPContext'

const TYPING_TIMEOUT = 3000 // 3 seconds

export function useTypingIndicator(conversation) {
  const { client } = useXMTP()
  const [isTyping, setIsTyping] = useState(false)
  const [peerIsTyping, setPeerIsTyping] = useState(false)

  // Send typing indicator
  const sendTypingIndicator = useCallback(async () => {
    if (!conversation) return

    try {
      await conversation.send('/typing', { ephemeral: true })
    } catch (error) {
      console.error('Error sending typing indicator:', error)
    }
  }, [conversation])

  // Handle receiving typing indicators
  useEffect(() => {
    if (!conversation) return

    let timeout
    const handleMessage = (message) => {
      if (message.content === '/typing' && message.senderAddress !== client?.address) {
        setPeerIsTyping(true)
        
        // Clear previous timeout
        if (timeout) clearTimeout(timeout)
        
        // Set new timeout
        timeout = setTimeout(() => {
          setPeerIsTyping(false)
        }, TYPING_TIMEOUT)
      }
    }

    const stream = conversation.streamMessages(handleMessage)

    return () => {
      if (timeout) clearTimeout(timeout)
      stream.unsubscribe()
    }
  }, [conversation, client?.address])

  return {
    isTyping,
    peerIsTyping,
    sendTypingIndicator
  }
}