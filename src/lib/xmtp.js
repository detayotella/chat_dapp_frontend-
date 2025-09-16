import { Client } from '@xmtp/xmtp-js'

const XMTP_OPTIONS = {
  env: 'production',
  version: '3',  // Explicitly set V3
  appVersion: '1.0.0'  // Recommended in V3
}

let xmtpClient = null

export const initializeXMTP = async (signer) => {
  try {
    // Create a new XMTP client with the wallet using V3
    xmtpClient = await Client.create(signer, XMTP_OPTIONS)
    return xmtpClient
  } catch (error) {
    console.error('Error initializing XMTP client:', error)
    throw error
  }
}

export const getXMTPClient = () => {
  return xmtpClient
}

// Function to check if an address can be messaged via XMTP
export const canMessage = async (address) => {
  try {
    if (!xmtpClient) throw new Error('XMTP client not initialized')
    return await xmtpClient.canMessage(address)
  } catch (error) {
    console.error('Error checking if address can be messaged:', error)
    throw error
  }
}

// Function to get or create a conversation with an address
export const getOrCreateConversation = async (peerAddress) => {
  try {
    if (!xmtpClient) throw new Error('XMTP client not initialized')
    // Use the updated method in V3 to get or create a conversation
    const conversation = await xmtpClient.conversations.newConversation({
      peerAddress,
      metadata: {},  // Optional metadata for the conversation
      conversationId: undefined // Optional: Allows separating multiple conversations with the same peer
    })
    return conversation
  } catch (error) {
    console.error('Error getting or creating conversation:', error)
    throw error
  }
}

// Function to list all conversations
export const listConversations = async () => {
  try {
    if (!xmtpClient) throw new Error('XMTP client not initialized')
    return await xmtpClient.conversations.list()
  } catch (error) {
    console.error('Error listing conversations:', error)
    throw error
  }
}

// Function to stream messages for a conversation
export const streamMessages = (conversation, onMessage) => {
  try {
    if (!xmtpClient) throw new Error('XMTP client not initialized')
    return conversation.streamMessages(onMessage)
  } catch (error) {
    console.error('Error streaming messages:', error)
    throw error
  }
}