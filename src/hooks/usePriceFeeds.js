import { useReadContracts, useChainId } from 'wagmi'
import { useState, useEffect, useCallback } from 'react'
import { 
  CHAINLINK_PRICE_FEEDS, 
  CHAINLINK_AGGREGATOR_ABI, 
  DEFAULT_TRACKED_COINS,
  PRICE_UPDATE_INTERVALS,
  formatPrice,
  formatPriceChange,
  getPriceChangeColor,
  getPriceChangeEmoji
} from '../config/chainlink'

export function usePriceFeeds() {
  const chainId = useChainId()
  const [prices, setPrices] = useState({})
  const [priceHistory, setPriceHistory] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  // Get available price feeds for current chain
  const availableFeeds = CHAINLINK_PRICE_FEEDS[chainId] || CHAINLINK_PRICE_FEEDS[1]
  
  // Filter coins that are available on current chain
  const trackedCoins = DEFAULT_TRACKED_COINS.filter(coin => availableFeeds[coin])

  // Prepare contracts for reading
  const contracts = trackedCoins.map(coin => ({
    address: availableFeeds[coin],
    abi: CHAINLINK_AGGREGATOR_ABI,
    functionName: 'latestRoundData'
  }))

  const { data: priceData, isError, isLoading: isReading, refetch } = useReadContracts({
    contracts,
    query: {
      refetchInterval: PRICE_UPDATE_INTERVALS.REGULAR,
      staleTime: 60000 // 1 minute
    }
  })

  // Process price data
  const processPriceData = useCallback((data) => {
    if (!data) return

    const newPrices = {}
    const currentTime = Date.now()

    trackedCoins.forEach((coin, index) => {
      const result = data[index]
      if (result?.status === 'success' && result.result) {
        const [roundId, answer, startedAt, updatedAt, answeredInRound] = result.result
        
        // Convert price from Chainlink format (8 decimals for most feeds)
        const price = Number(answer) / Math.pow(10, 8)
        
        newPrices[coin] = {
          price,
          formattedPrice: formatPrice(price),
          roundId: Number(roundId),
          updatedAt: Number(updatedAt) * 1000, // Convert to milliseconds
          lastFetched: currentTime,
          isStale: currentTime - (Number(updatedAt) * 1000) > 3600000 // 1 hour
        }
      }
    })

    return newPrices
  }, [trackedCoins])

  // Calculate price changes
  const calculatePriceChanges = useCallback((currentPrices, previousPrices) => {
    const pricesWithChanges = {}
    
    Object.keys(currentPrices).forEach(coin => {
      const current = currentPrices[coin]
      const previous = previousPrices[coin]
      
      if (current && previous) {
        const change = ((current.price - previous.price) / previous.price) * 100
        pricesWithChanges[coin] = {
          ...current,
          priceChange: change,
          priceChangeFormatted: formatPriceChange(change),
          priceChangeColor: getPriceChangeColor(change),
          priceChangeEmoji: getPriceChangeEmoji(change),
          previousPrice: previous.price
        }
      } else {
        pricesWithChanges[coin] = current
      }
    })
    
    return pricesWithChanges
  }, [])

  // Update prices when data changes
  useEffect(() => {
    if (priceData && !isReading) {
      const newPrices = processPriceData(priceData)
      if (newPrices && Object.keys(newPrices).length > 0) {
        // Calculate changes from previous prices
        const pricesWithChanges = calculatePriceChanges(newPrices, prices)
        
        setPrices(pricesWithChanges)
        
        // Store price history for trend analysis
        setPriceHistory(prev => {
          const updated = { ...prev }
          Object.keys(pricesWithChanges).forEach(coin => {
            if (!updated[coin]) updated[coin] = []
            updated[coin].push({
              price: pricesWithChanges[coin].price,
              timestamp: Date.now()
            })
            // Keep only last 24 hours of data
            updated[coin] = updated[coin].filter(
              entry => Date.now() - entry.timestamp < 86400000
            )
          })
          return updated
        })
        
        setLastUpdate(Date.now())
        setIsLoading(false)
        setError(null)
      }
    }
  }, [priceData, isReading, processPriceData, calculatePriceChanges, prices])

  // Handle errors
  useEffect(() => {
    if (isError) {
      setError('Failed to fetch price data from Chainlink oracles')
      setIsLoading(false)
    }
  }, [isError])

  // Manual refresh function
  const refreshPrices = useCallback(async () => {
    setIsLoading(true)
    try {
      await refetch()
    } catch (err) {
      setError('Failed to refresh price data')
    }
  }, [refetch])

  // Get price for specific coin
  const getPrice = useCallback((coin) => {
    return prices[coin] || null
  }, [prices])

  // Get top gainers/losers
  const getTopMovers = useCallback((count = 5) => {
    const pricesWithChanges = Object.entries(prices)
      .filter(([_, data]) => data.priceChange !== undefined)
      .sort(([, a], [, b]) => Math.abs(b.priceChange) - Math.abs(a.priceChange))
    
    return {
      gainers: pricesWithChanges
        .filter(([_, data]) => data.priceChange > 0)
        .slice(0, count),
      losers: pricesWithChanges
        .filter(([_, data]) => data.priceChange < 0)
        .slice(0, count)
    }
  }, [prices])

  // Format all prices for display
  const getFormattedPrices = useCallback(() => {
    return Object.entries(prices).map(([coin, data]) => ({
      coin,
      symbol: coin.split('/')[0],
      ...data
    }))
  }, [prices])

  return {
    prices,
    priceHistory,
    isLoading,
    error,
    lastUpdate,
    trackedCoins,
    refreshPrices,
    getPrice,
    getTopMovers,
    getFormattedPrices,
    availableFeeds: Object.keys(availableFeeds)
  }
}

// Custom hook for price alerts
export function usePriceAlerts() {
  const [alerts, setAlerts] = useState([])
  const { prices } = usePriceFeeds()

  const addAlert = useCallback((coin, targetPrice, type = 'above') => {
    const newAlert = {
      id: Date.now(),
      coin,
      targetPrice,
      type, // 'above' or 'below'
      createdAt: Date.now(),
      isActive: true
    }
    setAlerts(prev => [...prev, newAlert])
    return newAlert.id
  }, [])

  const removeAlert = useCallback((alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }, [])

  const checkAlerts = useCallback(() => {
    const triggeredAlerts = []
    
    alerts.forEach(alert => {
      if (!alert.isActive) return
      
      const currentPrice = prices[alert.coin]?.price
      if (!currentPrice) return
      
      const shouldTrigger = 
        (alert.type === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.type === 'below' && currentPrice <= alert.targetPrice)
      
      if (shouldTrigger) {
        triggeredAlerts.push(alert)
        // Deactivate the alert
        setAlerts(prev => prev.map(a => 
          a.id === alert.id ? { ...a, isActive: false } : a
        ))
      }
    })
    
    return triggeredAlerts
  }, [alerts, prices])

  useEffect(() => {
    const triggered = checkAlerts()
    if (triggered.length > 0) {
      // Handle triggered alerts (could emit events, show notifications, etc.)
      triggered.forEach(alert => {
        console.log(`Price alert triggered: ${alert.coin} ${alert.type} ${alert.targetPrice}`)
      })
    }
  }, [checkAlerts])

  return {
    alerts: alerts.filter(a => a.isActive),
    addAlert,
    removeAlert,
    checkAlerts
  }
}