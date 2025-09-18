import React, { createContext, useContext, useEffect } from 'react'
import { usePriceFeeds } from '../hooks/usePriceFeeds'
import { usePriceBot, usePriceCommands } from '../hooks/usePriceBot'
import { useChat } from './ChatContext'

const PriceBotContext = createContext(null)

export function PriceBotProvider({ children }) {
  const priceFeeds = usePriceFeeds()
  const priceBot = usePriceBot()
  const priceCommands = usePriceCommands()
  const { processCommand: chatProcessCommand } = useChat()

  // Enhanced command processor that integrates with chat
  const processMessage = async (messageContent) => {
    try {
      // Try to process as a price command
      const wasProcessed = await priceCommands.processCommand(messageContent)
      
      if (wasProcessed) {
        console.log('📊 Price command processed:', messageContent)
        return true
      }

      // Try other chat commands
      return await chatProcessCommand(messageContent)
    } catch (error) {
      console.error('Error processing command:', error)
      return false
    }
  }

  const value = {
    // Price feeds data
    ...priceFeeds,
    
    // Price bot controls
    ...priceBot,
    
    // Command processing
    processMessage,
    
    // Direct access to command handlers
    priceCommands
  }

  return (
    <PriceBotContext.Provider value={value}>
      {children}
    </PriceBotContext.Provider>
  )
}

export function usePriceBotContext() {
  const context = useContext(PriceBotContext)
  if (!context) {
    throw new Error('usePriceBotContext must be used within a PriceBotProvider')
  }
  return context
}

// Higher-order component to wrap chat with price bot functionality
export function withPriceBot(Component) {
  return function PriceBotWrappedComponent(props) {
    return (
      <PriceBotProvider>
        <Component {...props} />
      </PriceBotProvider>
    )
  }
}