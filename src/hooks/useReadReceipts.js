import { useState, useCallback } from 'react'
import { useChat } from '../contexts/ChatContext'
import { useWriteContract } from 'wagmi'
import FireChatABI from '../contracts/abi/FireChat.json'

export function useReadReceipts() {
  const { userId } = useChat()
  const [readStatus, setReadStatus] = useState({})
  const { writeContract } = useWriteContract()

  // Send read receipt to contract
  const markAsRead = useCallback(async (messageId) => {
    if (!messageId || !userId) return

    try {
      await writeContract({
        address: import.meta.env.VITE_FIRE_CHAT_CONTRACT_ADDRESS,
        abi: FireChatABI.abi,
        functionName: 'markMessageAsRead',
        args: [messageId]
      })

      setReadStatus(prev => ({
        ...prev,
        [messageId]: true
      }))
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }, [userId, writeContract])

  // Mark multiple messages as read
  const markMessagesAsRead = useCallback(async (messages) => {
    if (!messages || messages.length === 0) return

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
