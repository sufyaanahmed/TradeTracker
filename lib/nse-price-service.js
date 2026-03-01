// NSE India Price Service
// Fetches real-time stock prices from NSE India (no API key required)

const NSE_BASE = 'https://www.nseindia.com';
const PRICE_CACHE_TTL = 60 * 60 * 1000; // 1 hour cache
const priceCache = new Map();

/**
 * Get cached price if fresh enough
 */
function getCachedPrice(symbol) {
  const entry = priceCache.get(symbol);
  if (entry && Date.now() - entry.timestamp < PRICE_CACHE_TTL) {
    return entry;
  }
  return null;
}

/**
 * Set price in cache
 */
function setCachedPrice(symbol, price, change, changePct, source) {
  priceCache.set(symbol, {
    price,
    change,
    changePct,
    source,
    timestamp: Date.now(),
  });
}

/**
 * Fetch price from NSE India
 * @param {string} symbol - Stock symbol (e.g., 'RELIANCE', 'TCS', 'INFY')
 * @returns {Object|null} Price data or null
 */
async function fetchNSEPrice(symbol) {
  try {
    // NSE requires proper headers to avoid 403
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://www.nseindia.com/',
    };

    // First, get cookies by visiting the homepage
    await fetch(NSE_BASE, { headers });

    // Now fetch the quote data
    const quoteUrl = `${NSE_BASE}/api/quote-equity?symbol=${symbol.toUpperCase()}`;
    const response = await fetch(quoteUrl, { headers });

    if (!response.ok) {
      console.log(`NSE API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.priceInfo) {
      console.log('No price info available for', symbol);
      return null;
    }

    const priceInfo = data.priceInfo;
    const lastPrice = priceInfo.lastPrice;
    const change = priceInfo.change;
    const pChange = priceInfo.pChange;

    return {
      price: parseFloat(lastPrice),
      change: parseFloat(change || 0),
      changePct: parseFloat(pChange || 0),
      source: 'nse_india',
    };
  } catch (error) {
    console.error('NSE fetch error:', error.message);
    return null;
  }
}

/**
 * Mock price generator for testing/fallback
 */
function generateMockPrice(symbol, entryPrice) {
  const hash = [...symbol].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const minuteBucket = Math.floor(Date.now() / 60000);
  const seed = (hash * 31 + minuteBucket) % 10000;
  const drift = ((seed % 200) - 100) / 1000; // -10% to +10%

  const base = entryPrice || 100;
  const price = parseFloat((base * (1 + drift)).toFixed(2));
  const change = parseFloat((price - base).toFixed(2));
  const changePct = parseFloat(((change / base) * 100).toFixed(2));

  return {
    price,
    change,
    changePct,
    source: 'mock',
  };
}

/**
 * Get current price for a symbol
 * Falls back to mock if NSE is unavailable
 */
export async function getCurrentPrice(symbol, entryPrice) {
  // Check cache first
  const cached = getCachedPrice(symbol);
  if (cached) {
    return cached;
  }

  // Try NSE India
  const nseData = await fetchNSEPrice(symbol);
  if (nseData) {
    setCachedPrice(symbol, nseData.price, nseData.change, nseData.changePct, nseData.source);
    return nseData;
  }

  // Fallback to mock
  console.log(`Using mock price for ${symbol}`);
  const mockData = generateMockPrice(symbol, entryPrice);
  setCachedPrice(symbol, mockData.price, mockData.change, mockData.changePct, mockData.source);
  return mockData;
}

/**
 * Get prices for multiple symbols (batch)
 */
export async function getBatchPrices(trades) {
  const results = [];
  
  for (const trade of trades) {
    const priceData = await getCurrentPrice(trade.symbol, trade.entryPrice);
    results.push({
      symbol: trade.symbol,
      ...priceData,
    });
  }
  
  return results;
}

/**
 * Compute unrealized P&L for a position
 */
export function computeUnrealisedPnL(currentPrice, entryPrice, quantity) {
  if (!currentPrice || !entryPrice || !quantity) return 0;
  return (currentPrice - entryPrice) * quantity;
}

/**
 * Clear the price cache (useful for testing)
 */
export function clearCache() {
  priceCache.clear();
}

// Export for backwards compatibility
export default {
  getCurrentPrice,
  getBatchPrices,
  computeUnrealisedPnL,
  clearCache,
};
