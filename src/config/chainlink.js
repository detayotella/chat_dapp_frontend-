// Chainlink Price Feed Addresses for Sepolia Testnet and Mainnet
export const CHAINLINK_PRICE_FEEDS = {
  // Ethereum Mainnet
  1: {
    'BTC/USD': '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
    'ETH/USD': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    'SOL/USD': '0x4ffC43a60e009B551865A93d232E33Fce9f01507',
    'BNB/USD': '0x14e613AC84a31f709eadbdF89C6CC390fDc9540A',
    'ADA/USD': '0xAE48c91dF1fE419994FFDa27da09D5aC69c30f55',
    'XRP/USD': '0xCed2660c6Dd1Ffd856A5A82C67f3482d88C50b12',
    'DOT/USD': '0x1C07AFb8E2B827c5A4739C6d59C3Df52a5e90c1e',
    'DOGE/USD': '0x2465CefD3b488BE410b941b1d4b2767088e2A028',
    'MATIC/USD': '0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676',
    'AVAX/USD': '0xFF3EEb22B5E3dE6e705b44749C2559d704923FD7'
  },
  // Sepolia Testnet
  11155111: {
    'BTC/USD': '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43',
    'ETH/USD': '0x694AA1769357215DE4FAC081bf1f309aDC325306',
    'SOL/USD': '0x4ffC43a60e009B551865A93d232E33Fce9f01507', // Note: May not be available on testnet
    'BNB/USD': '0x14e613AC84a31f709eadbdF89C6CC390fDc9540A', // Note: May not be available on testnet
    'LINK/USD': '0xc59E3633BAAC79493d908e63626716e204A45EdF',
    'USDC/USD': '0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E'
  }
}

// Chainlink Aggregator ABI (minimal for price reading)
export const CHAINLINK_AGGREGATOR_ABI = [
  {
    "inputs": [],
    "name": "latestRoundData",
    "outputs": [
      {"internalType": "uint80", "name": "roundId", "type": "uint80"},
      {"internalType": "int256", "name": "answer", "type": "int256"},
      {"internalType": "uint256", "name": "startedAt", "type": "uint256"},
      {"internalType": "uint256", "name": "updatedAt", "type": "uint256"},
      {"internalType": "uint80", "name": "answeredInRound", "type": "uint80"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "description",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
]

// Default coins to track
export const DEFAULT_TRACKED_COINS = [
  'BTC/USD',
  'ETH/USD', 
  'SOL/USD',
  'BNB/USD',
  'ADA/USD',
  'XRP/USD',
  'DOT/USD',
  'DOGE/USD',
  'MATIC/USD',
  'AVAX/USD'
]

// Price update intervals
export const PRICE_UPDATE_INTERVALS = {
  REAL_TIME: 30000, // 30 seconds
  REGULAR: 300000, // 5 minutes
  CHAT_BROADCAST: 21600000 // 6 hours
}

// Formatting helpers
export const formatPrice = (price, decimals = 2) => {
  if (price >= 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(price)
  } else {
    // For very small prices, show more decimals
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6
    }).format(price)
  }
}

export const formatPriceChange = (change) => {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

export const getPriceChangeColor = (change) => {
  if (change > 0) return 'text-green-600'
  if (change < 0) return 'text-red-600'
  return 'text-gray-600'
}

export const getPriceChangeEmoji = (change) => {
  if (change > 5) return '🚀'
  if (change > 2) return '📈'
  if (change > 0) return '🟢'
  if (change < -5) return '💥'
  if (change < -2) return '📉'
  if (change < 0) return '🔴'
  return '➡️'
}