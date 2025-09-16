import { useState, useEffect, useCallback } from 'react'
import { useXMTP } from '../contexts/XMTPContext'

export function useReadReceipts(conversation) {
  const { client } = useXMTP()
  const [readStatus, setReadStatus] = useState({})

  // Send read receipt
  const markAsRead = useCallback(async (messageId) => {
    if (!conversation) return

    try {
      await conversation.send('/read', { 
        ephemeral: true,
        messageId
      })
    } catch (error) {
      console.error('Error sending read receipt:', error)
    }
  }, [conversation])

  // Handle receiving read receipts
  useEffect(() => {
    if (!conversation) return

    const handleMessage = (message) => {
      if (message.content === '/read' && message.senderAddress !== client?.address) {
        const { messageId } = message
        if (messageId) {
          setReadStatus(prev => ({
            ...prev,
            [messageId]: true
          }))
        }
      }
    }

    const stream = conversation.streamMessages(handleMessage)

    return () => {
      stream.unsubscribe()
    }
  }, [conversation, client?.address])

  // Batch mark messages as read
  const markMessagesAsRead = useCallback(async (messages) => {
    if (!messages?.length) return

    for (const message of messages) {
      await markAsRead(message.id)
    }
  }, [markAsRead])

  return {
    readStatus,
    markAsRead,
    markMessagesAsRead
  }
}