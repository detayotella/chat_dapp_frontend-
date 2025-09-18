import { useState, useCallback } from 'react'
import { useChat } from '../contexts/ChatContext'
import { useWriteContract } from 'wagmi'
import FireChatABI from '../contracts/abi/FireChat.json'

export function useReactions() {
  const { userId } = useChat()
  const [reactions, setReactions] = useState({})
  const { writeContract } = useWriteContract()

  // Send reaction to contract
  const sendReaction = useCallback(async (messageId, emoji) => {
    if (!messageId || !emoji || !userId) return

    try {
      await writeContract({
        address: import.meta.env.VITE_FIRE_CHAT_CONTRACT_ADDRESS,
        abi: FireChatABI.abi,
        functionName: 'reactToMessage',
        args: [messageId, emoji]
      })

      setReactions(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          [emoji]: [...(prev[messageId]?.[emoji] || []), userId]
        }
      }))
    } catch (error) {
      console.error('Error sending reaction:', error)
    }
  }, [userId, writeContract])

  // Remove reaction
  const removeReaction = useCallback(async (messageId, emoji) => {
    if (!messageId || !emoji || !userId) return

    try {
      // This would require a contract function to remove reactions
      // For now, just update local state
      setReactions(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          [emoji]: (prev[messageId]?.[emoji] || []).filter(user => user !== userId)
        }
      }))
    } catch (error) {
      console.error('Error removing reaction:', error)
    }
  }, [userId])

  return {
    reactions,
    sendReaction,
    removeReaction
  }
}
