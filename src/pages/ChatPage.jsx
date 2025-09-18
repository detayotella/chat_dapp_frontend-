import { useState } from 'react'
import { useAccount } from 'wagmi'
import ChatSidebar from '../components/chat/ChatSidebar'
import { useChat } from '../contexts/ChatContext'

export default function ChatPage() {
  const { address } = useAccount()

  return (
    <div className="h-full">
      {/* ChatSidebar now takes the full screen */}
      <ChatSidebar />
    </div>
  )
}