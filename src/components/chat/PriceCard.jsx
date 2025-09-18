import React from 'react'
import { formatPrice, formatPriceChange, getPriceChangeColor, getPriceChangeEmoji } from '../../config/chainlink'

export default function PriceCard({ coin, priceData, variant = 'default' }) {
  if (!priceData) return null

  const {
    price,
    formattedPrice,
    priceChange,
    priceChangeFormatted,
    priceChangeColor,
    priceChangeEmoji,
    lastFetched,
    isStale
  } = priceData

  const symbol = coin.split('/')[0]
  const baseAsset = coin.split('/')[1]

  // Compact variant for inline display
  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-fire-gray-200 rounded-lg px-3 py-2 shadow-sm">
        <span className="text-lg">{priceChangeEmoji}</span>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-fire-gray-900">{symbol}</span>
          <span className="text-fire-gray-700">{formattedPrice}</span>
          {priceChangeFormatted && (
            <span className={`text-sm font-medium ${priceChangeColor}`}>
              {priceChangeFormatted}
            </span>
          )}
        </div>
      </div>
    )
  }

  // Mini variant for system messages
  if (variant === 'mini') {
    return (
      <span className="inline-flex items-center space-x-1 text-sm">
        <span>{priceChangeEmoji}</span>
        <span className="font-medium">{symbol}</span>
        <span>{formattedPrice}</span>
        {priceChangeFormatted && (
          <span className={priceChangeColor}>({priceChangeFormatted})</span>
        )}
      </span>
    )
  }

  // Full card variant
  return (
    <div className="card hover:shadow-lg transition-all duration-200 border-l-4 border-l-fire-orange-500">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{priceChangeEmoji}</span>
          <div>
            <h3 className="font-bold text-fire-gray-900 text-lg">{symbol}</h3>
            <p className="text-fire-gray-500 text-sm">{coin}</p>
          </div>
        </div>
        {isStale && (
          <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
            Stale
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-fire-gray-900">
            {formattedPrice}
          </span>
          {priceChangeFormatted && (
            <div className="text-right">
              <span className={`text-lg font-semibold ${priceChangeColor}`}>
                {priceChangeFormatted}
              </span>
              <p className="text-xs text-fire-gray-500">24h change</p>
            </div>
          )}
        </div>

        {lastFetched && (
          <p className="text-xs text-fire-gray-400">
            Updated {new Date(lastFetched).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  )
}

// Price grid component for multiple coins
export function PriceGrid({ prices, variant = 'default' }) {
  if (!prices || Object.keys(prices).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-fire-gray-500">Loading price data...</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(prices).map(([coin, priceData]) => (
        <PriceCard
          key={coin}
          coin={coin}
          priceData={priceData}
          variant={variant}
        />
      ))}
    </div>
  )
}

// Top movers component
export function TopMovers({ gainers = [], losers = [] }) {
  return (
    <div className="card">
      <h3 className="font-bold text-fire-gray-900 mb-4 flex items-center">
        <span className="text-xl mr-2">📊</span>
        Top Market Movers
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gainers.length > 0 && (
          <div>
            <h4 className="font-semibold text-green-600 mb-3 flex items-center">
              <span className="mr-2">🔥</span>
              Top Gainers
            </h4>
            <div className="space-y-2">
              {gainers.map(([coin, data]) => (
                <div key={coin} className="flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-fire-gray-900">
                    {coin.split('/')[0]}
                  </span>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {data.priceChangeFormatted}
                    </p>
                    <p className="text-sm text-fire-gray-600">
                      {data.formattedPrice}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {losers.length > 0 && (
          <div>
            <h4 className="font-semibold text-red-600 mb-3 flex items-center">
              <span className="mr-2">❄️</span>
              Top Losers
            </h4>
            <div className="space-y-2">
              {losers.map(([coin, data]) => (
                <div key={coin} className="flex justify-between items-center py-2 px-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-fire-gray-900">
                    {coin.split('/')[0]}
                  </span>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">
                      {data.priceChangeFormatted}
                    </p>
                    <p className="text-sm text-fire-gray-600">
                      {data.formattedPrice}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Market summary widget
export function MarketSummary({ prices }) {
  if (!prices || Object.keys(prices).length === 0) return null

  const pricesArray = Object.values(prices)
  const gainers = pricesArray.filter(p => p.priceChange > 0)
  const losers = pricesArray.filter(p => p.priceChange < 0)
  const neutral = pricesArray.filter(p => p.priceChange === 0)

  const avgChange = pricesArray.reduce((sum, p) => sum + (p.priceChange || 0), 0) / pricesArray.length

  return (
    <div className="card border-l-4 border-l-blue-500">
      <h3 className="font-bold text-fire-gray-900 mb-4 flex items-center">
        <span className="text-xl mr-2">📈</span>
        Market Summary
      </h3>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{gainers.length}</p>
          <p className="text-sm text-fire-gray-600">Gainers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{losers.length}</p>
          <p className="text-sm text-fire-gray-600">Losers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-fire-gray-600">{neutral.length}</p>
          <p className="text-sm text-fire-gray-600">Neutral</p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-fire-gray-500 mb-1">Average Change</p>
        <p className={`text-lg font-semibold ${getPriceChangeColor(avgChange)}`}>
          {formatPriceChange(avgChange)} {getPriceChangeEmoji(avgChange)}
        </p>
      </div>
    </div>
  )
}

// Price ticker component for header/sidebar
export function PriceTicker({ prices, maxCoins = 5 }) {
  if (!prices || Object.keys(prices).length === 0) return null

  const priceEntries = Object.entries(prices).slice(0, maxCoins)

  return (
    <div className="bg-gradient-to-r from-fire-orange-50 to-fire-red-50 p-3 rounded-lg border border-fire-orange-200">
      <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide">
        {priceEntries.map(([coin, data]) => (
          <PriceCard
            key={coin}
            coin={coin}
            priceData={data}
            variant="compact"
          />
        ))}
      </div>
    </div>
  )
}

// Price alert component
export function PriceAlert({ alert, onDismiss }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <span className="text-yellow-500 text-xl mr-3">🔔</span>
          <div>
            <h4 className="font-semibold text-yellow-800">Price Alert Triggered!</h4>
            <p className="text-yellow-700">
              {alert.coin.split('/')[0]} is now {alert.type} ${alert.targetPrice}
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={() => onDismiss(alert.id)}
            className="text-yellow-500 hover:text-yellow-700 text-xl"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}