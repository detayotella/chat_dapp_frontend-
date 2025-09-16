import { Client } from '@xmtp/xmtp-js'

let xmtpClient = null

export const initializeXMTP = async (signer) => {
  try {
    if (!signer) throw new Error('No signer provided')
    
    // Create a client with the wallet signer
    xmtpClient = await Client.create(signer, { 
      env: 'production'
    })
    
    return xmtpClient
  } catch (error) {
    console.error('Error initializing XMTP client:', error)
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