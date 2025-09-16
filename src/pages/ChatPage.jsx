import ThreadView from '../components/chat/ThreadView'
import { useXMTP } from '../contexts/XMTPContext'

export default function ChatPage() {
  const { isLoading } = useXMTP()

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="h-screen">
      <ThreadView />
    </div>
  )
}