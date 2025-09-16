import { useState, useEffect, useCallback } from 'react'
import { useXMTP } from '../contexts/XMTPContext'

export function useReactions(conversation) {
  const { client } = useXMTP()
  const [reactions, setReactions] = useState({})

  // Send reaction
  const sendReaction = useCallback(async (messageId, emoji) => {
    if (!conversation) return

    try {
      await conversation.send('/reaction', {
        messageId,
        emoji
      })
    } catch (error) {
      console.error('Error sending reaction:', error)
    }
  }, [conversation])

  // Handle receiving reactions
  useEffect(() => {
    if (!conversation) return

    const handleMessage = (message) => {
      if (message.content === '/reaction') {
        const { messageId, emoji } = message
        if (messageId && emoji) {
          setReactions(prev => ({
            ...prev,
            [messageId]: {
              ...prev[messageId],
              [emoji]: [
                ...(prev[messageId]?.[emoji] || []),
                message.senderAddress
              ]
            }
          }))
        }
      }
    }

    const stream = conversation.streamMessages(handleMessage)

    return () => {
      stream.unsubscribe()
    }
  }, [conversation])

  // Remove reaction
  const removeReaction = useCallback(async (messageId, emoji) => {
    if (!conversation) return

    try {
      await conversation.send('/remove_reaction', {
        messageId,
        emoji
      })

      setReactions(prev => {
        const messageReactions = prev[messageId]
        if (!messageReactions) return prev

        const updatedReactions = {
          ...messageReactions,
          [emoji]: messageReactions[emoji].filter(
            address => address !== client?.address
          )
        }

        return {
          ...prev,
          [messageId]: updatedReactions
        }
      })
    } catch (error) {
      console.error('Error removing reaction:', error)
    }
  }, [conversation, client?.address])

  return {
    reactions,
    sendReaction,
    removeReaction
  }
}