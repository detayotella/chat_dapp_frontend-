import { Client } from '@xmtp/xmtp-js'

let xmtpClient = null

export const initializeXMTP = async (signer) => {
  try {
    if (!signer) throw new Error('No signer provided')
    
    console.log('🔄 Attempting to create XMTP client...')
    
    // Create a client with the wallet signer - use dev environment for now
    xmtpClient = await Client.create(signer, { 
      env: 'dev', // Use dev environment to avoid V2 deprecation issues
      skipContactPublishing: true, // Skip contact publishing for faster initialization
      persistConversations: false // Don't persist conversations for now
    })
    
    console.log('✅ XMTP client created successfully')
    return xmtpClient
  } catch (error) {
    console.error('❌ Error initializing XMTP client:', error)
    
    // If it's the V2 deprecation error, provide helpful message
    if (error.message.includes('XMTP V2 is no longer available')) {
      console.log('💡 XMTP V2 is deprecated. Consider upgrading to XMTP V3 SDK.')
    }
    
    throw error
  }
}

export const getXMTPClient = () => {
  return xmtpClient
}

export const canMessage = async (address) => {
  try {
    if (!xmtpClient) throw new Error('XMTP client not initialized')
    return await Client.canMessage(address)
  } catch (error) {
    console.error('Error checking if address can be messaged:', error)
    throw error
  }
}

export const startConversation = async (peerAddress) => {
  try {
    if (!xmtpClient) throw new Error('XMTP client not initialized')
    const conversation = await xmtpClient.conversations.newConversation(peerAddress)
    return conversation
  } catch (error) {
    console.error('Error starting conversation:', error)
    throw error
  }
}

export const listConversations = async () => {
  try {
    if (!xmtpClient) throw new Error('XMTP client not initialized')
    const allConversations = await xmtpClient.conversations.list()
    // Sort conversations by latest message
    return allConversations.sort((a, b) => {
      const aTime = a.messages[a.messages.length - 1]?.sentAt || new Date(0)
      const bTime = b.messages[b.messages.length - 1]?.sentAt || new Date(0)
      return bTime - aTime
    })
  } catch (error) {
    console.error('Error listing conversations:', error)
    throw error
  }
}

export const sendMessage = async (conversation, message) => {
  try {
    if (!xmtpClient) throw new Error('XMTP client not initialized')
    return await conversation.send(message)
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

export const streamMessages = (conversation, onMessage) => {
  try {
    if (!xmtpClient) throw new Error('XMTP client not initialized')
    return conversation.streamMessages(onMessage)
  } catch (error) {
    console.error('Error streaming messages:', error)
    throw error
  }
}