import { useState, useEffect, useCallback } from 'react'
import { useXMTP } from '../contexts/XMTPContext'
import { getOrCreateConversation, streamMessages } from '../lib/xmtp'

export function useConversation(peerAddress) {
  const { client } = useXMTP()
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Initialize or fetch existing conversation
  useEffect(() => {
    if (!client || !peerAddress) return

    const initConversation = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const convo = await getOrCreateConversation(peerAddress)
        setConversation(convo)

        // Load existing messages
        const msgs = await convo.messages()
        setMessages(msgs)
      } catch (err) {
        console.error('Error initializing conversation:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    initConversation()
  }, [client, peerAddress])

  // Stream new messages
  useEffect(() => {
    if (!conversation) return

    const stream = streamMessages(conversation, (message) => {
      setMessages((prev) => [...prev, message])
    })

    return () => {
      stream.unsubscribe()
    }
  }, [conversation])

  // Send message function
  const sendMessage = useCallback(async (content) => {
    if (!conversation) {
      throw new Error('Conversation not initialized')
    }

    try {
      await conversation.send(content)
    } catch (err) {
      console.error('Error sending message:', err)
      throw err
    }
  }, [conversation])

  return {
    conversation,
    messages,
    isLoading,
    error,
    sendMessage
  }
}