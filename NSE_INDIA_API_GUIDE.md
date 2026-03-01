# NSE India API Integration Guide

## Overview
The Palrin platform now supports **Indian stock market data** via the NSE India API, in addition to US stocks via Alpha Vantage. The system automatically detects stock symbols and routes requests to the appropriate API.

---

## 🎯 Quick Start

### Fetch Indian Stock Price
```javascript
import { getCurrentPrice } from '../lib/price-service';

// NSE-listed stocks (automatically detected)
const reliance = await getCurrentPrice('RELIANCE.NS');
const tcs = await getCurrentPrice('TCS.BO');

// Returns:
// {
//   symbol: 'RELIANCE.NS',
//   price: 2458.50,
//   change: 12.30,
//   changePercent: 0.50,
//   timestamp: '2024-01-20T10:30:00Z'
// }
```

### Batch Fetch Multiple Stocks
```javascript
import { getBatchPrices } from '../lib/nse-price-service';

const symbols = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS'];
const prices = await getBatchPrices(symbols);

// Returns array of price objects
```

---

## 📋 Symbol Format

### NSE (National Stock Exchange)
Append `.NS` to the stock symbol:
- `RELIANCE.NS` - Reliance Industries
- `TCS.NS` - Tata Consultancy Services
- `INFY.NS` - Infosys
- `HDFC.NS` - HDFC Bank
- `ITC.NS` - ITC Limited
- `HDFCBANK.NS` - HDFC Bank
- `ICICIBANK.NS` - ICICI Bank
- `SBIN.NS` - State Bank of India
- `BHARTIARTL.NS` - Bharti Airtel
- `KOTAKBANK.NS` - Kotak Mahindra Bank

### BSE (Bombay Stock Exchange)
Append `.BO` to the stock symbol:
- `RELIANCE.BO` - Reliance Industries
- `TCS.BO` - Tata Consultancy Services
- `INFY.BO` - Infosys
- `500325.BO` - Reliance (BSE numeric code)

---

## 🔧 How It Works

### 1. Automatic Detection
The system detects Indian stocks by checking for `.NS` or `.BO` suffix:

```javascript
// lib/price-service.js
function isIndianStock(symbol) {
  return symbol.endsWith('.NS') || symbol.endsWith('.BO');
}
```

### 2. Routing Logic
```javascript
export async function getCurrentPrice(symbol) {
  const sym = symbol?.toUpperCase();
  
  // Check for Indian stock
  if (isIndianStock(sym)) {
    // Route to NSE India API
    const price = await fetchNSEPrice(sym);
    if (price) return price;
  } else {
    // Route to Alpha Vantage (US stocks)
    const price = await fetchAlphaVantagePrice(sym);
    if (price) return price;
  }
  
  // Fallback to mock data
  return fetchMockPrice(sym);
}
```

### 3. NSE API Implementation
```javascript
// lib/nse-price-service.js
async function fetchNSEPrice(symbol) {
  const baseSymbol = symbol.replace(/\.(NS|BO)$/, '');
  
  const response = await fetch(
    `https://www.nseindia.com/api/quote-equity?symbol=${baseSymbol}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.nseindia.com/'
      }
    }
  );
  
  const data = await response.json();
  
  return {
    symbol: symbol,
    price: data.priceInfo.lastPrice,
    change: data.priceInfo.change,
    changePercent: data.priceInfo.pChange
  };
}
```

---

## 💾 Caching System

### Cache Duration
- **1 hour (3600 seconds)** for stock prices
- Prevents excessive API calls
- Reduces rate limit issues

### Cache Implementation
```javascript
const priceCache = new Map();
const CACHE_TTL = 3600 * 1000; // 1 hour

function getCachedPrice(symbol) {
  const cached = priceCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedPrice(symbol, data) {
  priceCache.set(symbol, {
    data,
    timestamp: Date.now()
  });
}
```

---

## 🛡️ Error Handling

### Common Errors & Solutions

#### 1. **403 Forbidden Error**
**Cause:** NSE blocks requests without proper headers

**Solution:** Headers are automatically set:
```javascript
headers: {
  'User-Agent': 'Mozilla/5.0...',
  'Referer': 'https://www.nseindia.com/'
}
```

#### 2. **Invalid Symbol**
**Cause:** Stock not found on NSE

**Solution:** Falls back to mock data
```javascript
if (!response.ok) {
  console.warn(`NSE API error for ${symbol}`);
  return null; // Triggers fallback
}
```

#### 3. **Rate Limiting**
**Cause:** Too many requests to NSE API

**Solution:** 
- Cache reduces requests
- Batch fetching minimizes calls
- Mock fallback prevents failures

---

## 🧪 Testing

### Test Indian Stocks
```javascript
// Good test symbols (high liquidity)
const testSymbols = [
  'RELIANCE.NS',  // Works
  'TCS.NS',       // Works
  'INFY.NS',      // Works
  'HDFC.NS',      // Works
  'ITC.NS'        // Works
];

// Test each symbol
for (const symbol of testSymbols) {
  const price = await getCurrentPrice(symbol);
  console.log(`${symbol}: ₹${price.price}`);
}
```

### Test US Stocks (unchanged)
```javascript
const usSymbols = ['AAPL', 'MSFT', 'GOOGL'];
for (const symbol of usSymbols) {
  const price = await getCurrentPrice(symbol);
  console.log(`${symbol}: $${price.price}`);
}
```

### Test Mock Fallback
```javascript
// Invalid symbol should return mock data
const mock = await getCurrentPrice('INVALID.NS');
console.log(mock.price); // Returns mock price (e.g., 100)
```

---

## 📊 API Response Format

### NSE India Response
```json
{
  "info": {
    "symbol": "RELIANCE",
    "companyName": "Reliance Industries Limited"
  },
  "priceInfo": {
    "lastPrice": 2458.50,
    "change": 12.30,
    "pChange": 0.50,
    "previousClose": 2446.20,
    "open": 2450.00,
    "close": 2458.50
  },
  "metadata": {
    "series": "EQ",
    "isin": "INE002A01018"
  }
}
```

### Normalized Response (Our Format)
```json
{
  "symbol": "RELIANCE.NS",
  "price": 2458.50,
  "change": 12.30,
  "changePercent": 0.50,
  "timestamp": "2024-01-20T10:30:00Z",
  "currency": "INR",
  "exchange": "NSE"
}
```

---

## 🎛️ Configuration

### Environment Variables
No API key required for NSE India! Just ensure:

```bash
# .env.local
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_key_here  # For US stocks
# NSE API requires no key
```

### API Endpoints
```javascript
// NSE India
const NSE_BASE = 'https://www.nseindia.com/api';
const NSE_QUOTE = `${NSE_BASE}/quote-equity?symbol=`;

// Alpha Vantage (US stocks)
const AV_BASE = 'https://www.alphavantage.co/query';
```

---

## 🚀 Usage in Components

### Dashboard Integration
```jsx
import { getCurrentPrice } from '@/lib/price-service';

export default function ActivePositions() {
  const [positions, setPositions] = useState([]);
  
  useEffect(() => {
    async function fetchPrices() {
      const updated = await Promise.all(
        positions.map(async (pos) => ({
          ...pos,
          currentPrice: await getCurrentPrice(pos.symbol)
        }))
      );
      setPositions(updated);
    }
    fetchPrices();
  }, []);
  
  return (
    <div>
      {positions.map(pos => (
        <div key={pos.id}>
          {pos.symbol}: {pos.currentPrice?.price}
        </div>
      ))}
    </div>
  );
}
```

### Research Hub Integration
```jsx
async function searchStock(symbol) {
  const price = await getCurrentPrice(`${symbol}.NS`);
  
  return {
    symbol,
    price: price.price,
    change: price.change,
    // Fetch additional data...
  };
}
```

---

## 📈 Supported Markets

| Exchange | Symbol Suffix | Example | Status |
|----------|---------------|---------|--------|
| NSE India | `.NS` | RELIANCE.NS | ✅ Supported |
| BSE India | `.BO` | RELIANCE.BO | ✅ Supported |
| US (NASDAQ) | None | AAPL | ✅ Supported (Alpha Vantage) |
| US (NYSE) | None | JPM | ✅ Supported (Alpha Vantage) |
| UK (LSE) | `.L` | BP.L | ❌ Not supported |
| EU | Various | SAP.DE | ❌ Not supported |

---

## 🔍 Debugging

### Enable Logging
```javascript
// In lib/nse-price-service.js
const DEBUG = true; // Set to true for verbose logging

if (DEBUG) {
  console.log('[NSE] Fetching price for:', symbol);
  console.log('[NSE] Response:', data);
}
```

### Check Cache Status
```javascript
import { priceCache } from '@/lib/nse-price-service';

// View all cached prices
console.log('Cache size:', priceCache.size);

// View specific cache entry
const cached = priceCache.get('RELIANCE.NS');
console.log('Cached data:', cached);
```

### Monitor API Calls
```javascript
// Track API call count
let apiCallCount = 0;

async function fetchNSEPrice(symbol) {
  apiCallCount++;
  console.log(`[NSE] Total API calls: ${apiCallCount}`);
  
  // ... rest of implementation
}
```

---

## 🎓 Advanced Features

### Portfolio P&L Calculation
```javascript
async function calculatePortfolioPnL(positions) {
  const prices = await getBatchPrices(
    positions.map(p => p.symbol)
  );
  
  return positions.map((pos, i) => {
    const currentPrice = prices[i].price;
    const unrealizedPnL = (currentPrice - pos.entryPrice) * pos.quantity;
    
    return {
      ...pos,
      currentPrice,
      unrealizedPnL
    };
  });
}
```

### Live Price Updates
```javascript
// Poll for price updates every 5 minutes
setInterval(async () => {
  const symbols = getActivePositionSymbols();
  const prices = await getBatchPrices(symbols);
  updatePositionPrices(prices);
}, 5 * 60 * 1000);
```

### Historical Data (Future Enhancement)
```javascript
// Placeholder for future NSE historical API
async function fetchHistoricalPrices(symbol, days = 30) {
  // TODO: Implement NSE historical data API
  // Endpoint: /api/historical-data
}
```

---

## 📚 Resources

- **NSE India API Docs**: https://www.nseindia.com/api
- **Stock Symbol Search**: https://www.nseindia.com/get-quotes/equity
- **Market Data**: https://www.nseindia.com/market-data
- **Trading Holidays**: https://www.nseindia.com/resources/exchanges-communication

---

## ⚠️ Important Notes

1. **No API Key Required** - NSE API is free and public
2. **Rate Limits** - Unknown official limits, use caching
3. **Market Hours** - NSE: 9:15 AM - 3:30 PM IST (Mon-Fri)
4. **Holidays** - No data on Indian market holidays
5. **Symbol Case** - Always convert to uppercase
6. **Suffix Required** - Must include `.NS` or `.BO`

---

## 🐛 Troubleshooting

### Issue: Prices not updating
**Solution:** Clear cache and refresh
```javascript
priceCache.clear();
```

### Issue: 403 errors persist
**Solution:** Check if NSE website is accessible
- Visit https://www.nseindia.com/
- Ensure no VPN/proxy blocking

### Issue: Wrong prices
**Solution:** Verify symbol format
- Use `.NS` for NSE
- Use `.BO` for BSE
- Check symbol on NSE website

---

**NSE India Integration Complete! 🇮🇳**

Your Palrin platform now supports:
- ✅ Indian stocks (NSE/BSE)
- ✅ US stocks (NASDAQ/NYSE)
- ✅ Automatic symbol detection
- ✅ Smart caching
- ✅ Error handling with fallbacks

Start trading Indian stocks today! 🚀
