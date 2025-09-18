import { useEffect, useCallback, useRef } from 'react'
import { usePriceFeeds } from './usePriceFeeds'
import { useChat } from '../contexts/ChatContext'
import { PRICE_UPDATE_INTERVALS } from '../config/chainlink'

export function usePriceBot() {
  const { prices, getFormattedPrices, getTopMovers, lastUpdate } = usePriceFeeds()
  const { sendMessage, addSystemMessage } = useChat()
  const intervalRef = useRef(null)
  const lastBroadcastRef = useRef(null)

  // Format price update message for chat
  const formatPriceUpdateMessage = useCallback(() => {
    const formattedPrices = getFormattedPrices()
    const { gainers, losers } = getTopMovers(3)
    
    if (formattedPrices.length === 0) return null

    // Create main price update
    const priceLines = formattedPrices.slice(0, 6).map(({ coin, symbol, formattedPrice, priceChangeFormatted, priceChangeEmoji }) => {
      const change = priceChangeFormatted ? ` (${priceChangeFormatted})` : ''
      return `${priceChangeEmoji} **${symbol}**: ${formattedPrice}${change}`
    }).join('\n')

    // Create top movers section
    let moversText = ''
    if (gainers.length > 0 || losers.length > 0) {
      moversText += '\n\n📊 **Top Movers:**\n'
      
      if (gainers.length > 0) {
        moversText += '🔥 **Gainers:** '
        moversText += gainers.slice(0, 3).map(([coin, data]) => 
          `${coin.split('/')[0]} ${data.priceChangeFormatted}`
        ).join(', ')
      }
      
      if (losers.length > 0) {
        if (gainers.length > 0) moversText += '\n'
        moversText += '❄️ **Losers:** '
        moversText += losers.slice(0, 3).map(([coin, data]) => 
          `${coin.split('/')[0]} ${data.priceChangeFormatted}`
        ).join(', ')
      }
    }

    const timestamp = new Date().toLocaleString()
    
    return `🤖 **Crypto Price Update** - ${timestamp}

💰 **Current Prices:**
${priceLines}${moversText}

*Powered by Chainlink Price Oracles*
*Next update in 6 hours*`
  }, [getFormattedPrices, getTopMovers])

  // Format quick price summary for smaller updates
  const formatQuickPriceSummary = useCallback(() => {
    const { gainers, losers } = getTopMovers(2)
    const totalCoins = Object.keys(prices).length
    
    if (totalCoins === 0) return null

    const gainersCount = gainers.length
    const losersCount = losers.length
    const neutralCount = totalCoins - gainersCount - losersCount

    let summary = '📈 **Market Summary**: '
    
    if (gainersCount > losersCount) {
      summary += `Bullish momentum with ${gainersCount} gainers vs ${losersCount} losers`
    } else if (losersCount > gainersCount) {
      summary += `Bearish sentiment with ${losersCount} losers vs ${gainersCount} gainers`
    } else {
      summary += `Mixed market with ${gainersCount} up, ${losersCount} down`
    }

    if (gainers.length > 0) {
      const topGainer = gainers[0]
      summary += `\n🚀 Top: ${topGainer[0].split('/')[0]} ${topGainer[1].priceChangeFormatted}`
    }

    return summary
  }, [getTopMovers, prices])

  // Send price update to chat
  const broadcastPriceUpdate = useCallback(async () => {
    try {
      const message = formatPriceUpdateMessage()
      if (message) {
        // Add as system message to avoid sending to blockchain
        addSystemMessage({
          content: message,
          type: 'price_update',
          timestamp: Date.now(),
          sender: 'PriceBot'
        })
        
        lastBroadcastRef.current = Date.now()
        console.log('Price update broadcast to chat')
      }
    } catch (error) {
      console.error('Failed to broadcast price update:', error)
    }
  }, [formatPriceUpdateMessage, addSystemMessage])

  // Send quick market summary
  const sendQuickSummary = useCallback(async () => {
    try {
      const summary = formatQuickPriceSummary()
      if (summary) {
        addSystemMessage({
          content: summary,
          type: 'market_summary',
          timestamp: Date.now(),
          sender: 'PriceBot'
        })
      }
    } catch (error) {
      console.error('Failed to send market summary:', error)
    }
  }, [formatQuickPriceSummary, addSystemMessage])

  // Setup 6-hour interval for price broadcasts
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Set up new interval for 6-hour broadcasts
    intervalRef.current = setInterval(() => {
      broadcastPriceUpdate()
    }, PRICE_UPDATE_INTERVALS.CHAT_BROADCAST)

    // Initial broadcast after 30 seconds (to let prices load)
    const initialTimeout = setTimeout(() => {
      if (Object.keys(prices).length > 0) {
        broadcastPriceUpdate()
      }
    }, 30000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      clearTimeout(initialTimeout)
    }
  }, [broadcastPriceUpdate, prices])

  // Manual controls for price bot
  const triggerPriceUpdate = useCallback(() => {
    broadcastPriceUpdate()
  }, [broadcastPriceUpdate])

  const triggerMarketSummary = useCallback(() => {
    sendQuickSummary()
  }, [sendQuickSummary])

  // Get time until next automatic update
  const getTimeUntilNextUpdate = useCallback(() => {
    if (!lastBroadcastRef.current) return PRICE_UPDATE_INTERVALS.CHAT_BROADCAST

    const elapsed = Date.now() - lastBroadcastRef.current
    const remaining = PRICE_UPDATE_INTERVALS.CHAT_BROADCAST - elapsed
    return Math.max(0, remaining)
  }, [])

  // Format time remaining as human readable
  const getFormattedTimeUntilNext = useCallback(() => {
    const ms = getTimeUntilNextUpdate()
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }, [getTimeUntilNextUpdate])

  return {
    triggerPriceUpdate,
    triggerMarketSummary,
    getTimeUntilNextUpdate,
    getFormattedTimeUntilNext,
    lastBroadcast: lastBroadcastRef.current,
    isActive: !!intervalRef.current
  }
}

// Hook for price commands in chat
export function usePriceCommands() {
  const { getPrice, getFormattedPrices, getTopMovers } = usePriceFeeds()
  const { addSystemMessage } = useChat()

  // Handle price command (e.g., "!price BTC" or "!price all")
  const handlePriceCommand = useCallback(async (command) => {
    const parts = command.toLowerCase().split(' ')
    
    if (parts[0] !== '!price') return false

    if (parts.length === 1 || parts[1] === 'all') {
      // Show all prices
      const prices = getFormattedPrices()
      if (prices.length === 0) {
        addSystemMessage({
          content: '❌ **Price data not available**\nTrying to fetch latest prices...',
          type: 'error',
          timestamp: Date.now(),
          sender: 'PriceBot'
        })
        return true
      }

      const priceList = prices.map(({ symbol, formattedPrice, priceChangeEmoji, priceChangeFormatted }) => {
        const change = priceChangeFormatted ? ` (${priceChangeFormatted})` : ''
        return `${priceChangeEmoji} **${symbol}**: ${formattedPrice}${change}`
      }).join('\n')

      addSystemMessage({
        content: `💰 **Current Crypto Prices:**\n\n${priceList}\n\n*Data from Chainlink Oracles*`,
        type: 'price_response',
        timestamp: Date.now(),
        sender: 'PriceBot'
      })
      return true
    }

    // Show specific coin price
    const coin = parts[1].toUpperCase()
    const coinPair = `${coin}/USD`
    const priceData = getPrice(coinPair)

    if (!priceData) {
      addSystemMessage({
        content: `❌ **Price not found for ${coin}**\nAvailable coins: BTC, ETH, SOL, BNB, ADA, XRP, DOT, DOGE, MATIC, AVAX`,
        type: 'error',
        timestamp: Date.now(),
        sender: 'PriceBot'
      })
      return true
    }

    const change = priceData.priceChangeFormatted ? ` (${priceData.priceChangeFormatted})` : ''
    addSystemMessage({
      content: `${priceData.priceChangeEmoji} **${coin}**: ${priceData.formattedPrice}${change}`,
      type: 'price_response',
      timestamp: Date.now(),
      sender: 'PriceBot'
    })

    return true
  }, [getPrice, getFormattedPrices, addSystemMessage])

  // Handle top movers command
  const handleTopMoversCommand = useCallback(async (command) => {
    if (command.toLowerCase() !== '!movers') return false

    const { gainers, losers } = getTopMovers(5)
    
    let response = '📊 **Top Market Movers:**\n\n'
    
    if (gainers.length > 0) {
      response += '🔥 **Top Gainers:**\n'
      response += gainers.map(([coin, data]) => 
        `${data.priceChangeEmoji} ${coin.split('/')[0]}: ${data.formattedPrice} (${data.priceChangeFormatted})`
      ).join('\n')
    }
    
    if (losers.length > 0) {
      if (gainers.length > 0) response += '\n\n'
      response += '❄️ **Top Losers:**\n'
      response += losers.map(([coin, data]) => 
        `${data.priceChangeEmoji} ${coin.split('/')[0]}: ${data.formattedPrice} (${data.priceChangeFormatted})`
      ).join('\n')
    }

    if (gainers.length === 0 && losers.length === 0) {
      response += 'No significant price movements detected.'
    }

    addSystemMessage({
      content: response,
      type: 'movers_response',
      timestamp: Date.now(),
      sender: 'PriceBot'
    })

    return true
  }, [getTopMovers, addSystemMessage])

  // Main command processor
  const processCommand = useCallback(async (message) => {
    const content = message.trim()
    
    // Check for price commands
    if (await handlePriceCommand(content)) return true
    if (await handleTopMoversCommand(content)) return true
    
    return false
  }, [handlePriceCommand, handleTopMoversCommand])

  return {
    processCommand,
    handlePriceCommand,
    handleTopMoversCommand
  }
}