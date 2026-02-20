// Price Service Abstraction Layer
// Provides current market prices for live P&L calculations.
// Designed with a pluggable interface so real APIs can replace the mock layer.

const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';

// In-memory price cache (TTL: 30 seconds for active polling)
const priceCache = new Map();
const PRICE_CACHE_TTL = 30 * 1000; // 30 seconds

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
 * Fetch price from Alpha Vantage (real market data)
 */
async function fetchAlphaVantagePrice(symbol) {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `${ALPHA_VANTAGE_BASE}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${key}`
    );
    if (!res.ok) return null;

    const data = await res.json();
    if (data['Note'] || data['Error Message']) return null;

    const q = data['Global Quote'];
    if (!q || !q['05. price']) return null;

    return {
      price: parseFloat(q['05. price']),
      change: parseFloat(q['09. change'] || 0),
      changePct: parseFloat((q['10. change percent'] || '0').replace('%', '')),
      source: 'alpha_vantage',
    };
  } catch {
    return null;
  }
}

/**
 * Mock price generator — deterministic but varies over time
 * Used when real API is unavailable or rate-limited
 */
function generateMockPrice(symbol, entryPrice) {
  // Use symbol hash + time to create pseudo-random but stable-within-interval prices
  const hash = [...symbol].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const minuteBucket = Math.floor(Date.now() / 60000); // changes every minute
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
 * PUBLIC API — Get current price for a symbol
 *
 * Strategy:
 *  1. Return from cache if fresh
 *  2. Try Alpha Vantage (real data)
 *  3. Fall back to mock price
 *
 * @param {string} symbol  - Ticker symbol (e.g. "AAPL")
 * @param {number} [entryPrice] - Used to anchor mock prices when real data unavailable
 * @returns {Promise<{price: number, change: number, changePct: number, source: string}>}
 */
export async function getCurrentPrice(symbol, entryPrice = null) {
  if (!symbol) throw new Error('Symbol is required');
  const sym = symbol.toUpperCase();

  // 1. Cache hit
  const cached = getCachedPrice(sym);
  if (cached) return cached;

  // 2. Try real API
  const realPrice = await fetchAlphaVantagePrice(sym);
  if (realPrice) {
    setCachedPrice(sym, realPrice.price, realPrice.change, realPrice.changePct, realPrice.source);
    return realPrice;
  }

  // 3. Mock fallback
  const mock = generateMockPrice(sym, entryPrice);
  setCachedPrice(sym, mock.price, mock.change, mock.changePct, mock.source);
  return mock;
}

/**
 * Batch fetch prices for multiple symbols (used by active positions list)
 * @param {Array<{symbol: string, entryPrice?: number}>} items
 * @returns {Promise<Map<string, {price, change, changePct, source}>>}
 */
export async function getBatchPrices(items) {
  const results = new Map();
  // Parallelise all lookups
  await Promise.all(
    items.map(async ({ symbol, entryPrice }) => {
      try {
        const data = await getCurrentPrice(symbol, entryPrice);
        results.set(symbol.toUpperCase(), data);
      } catch {
        // On failure, use mock
        const mock = generateMockPrice(symbol, entryPrice);
        results.set(symbol.toUpperCase(), mock);
      }
    })
  );
  return results;
}

/**
 * Compute unrealised P&L for a single position
 */
export function computeUnrealisedPnL(type, entryPrice, currentPrice, quantity) {
  if (type === 'LONG') {
    return parseFloat(((currentPrice - entryPrice) * quantity).toFixed(2));
  }
  // SHORT
  return parseFloat(((entryPrice - currentPrice) * quantity).toFixed(2));
}

/**
 * Clear the price cache (useful after market hours / testing)
 */
export function clearPriceCache() {
  priceCache.clear();
}
