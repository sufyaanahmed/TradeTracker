# Alpha Vantage Rate Limit Strategy

## Problem
Alpha Vantage free tier: **25 requests per day**  
Previous behavior: Dashboard polled every 10 seconds with 30-second cache → hitting limit quickly

## Solutions Implemented

### 1. **Disabled Auto-Polling** ✅
- **File**: `pages/dashboard.js`
- **Change**: `POLL_INTERVAL = null` (was 10 seconds)
- **Impact**: No automatic price refreshes, users must manually refresh
- **To re-enable**: Set `POLL_INTERVAL = 5 * 60 * 1000` (5 minutes) for minimal usage

### 2. **Extended Price Cache** ✅
- **File**: `lib/price-service.js`
- **Change**: `PRICE_CACHE_TTL = 1 hour` (was 30 seconds)
- **Impact**: Prices cached for 1 hour, max ~24 API calls per day per symbol
- **Trade-off**: Less real-time accuracy for development

## Alternative Data Sources (Future Enhancement)

### Option A: Web Scraping (Manual Implementation Needed)
```bash
npm install cheerio axios
```

**Example Implementation** (lib/web-scraper.js):
```javascript
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeYahooFinance(symbol) {
  try {
    const url = `https://finance.yahoo.com/quote/${symbol}`;
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const $ = cheerio.load(data);
    const price = $('[data-symbol="${symbol}"][data-field="regularMarketPrice"]').text();
    const change = $('[data-symbol="${symbol}"][data-field="regularMarketChange"]').text();
    
    return {
      symbol,
      price: parseFloat(price),
      change: parseFloat(change),
      source: 'yahoo-scrape'
    };
  } catch (err) {
    console.error('Scraping failed:', err);
    return null;
  }
}
```

**Integration**: Replace Alpha Vantage calls in `lib/price-service.js` with scraper

**Risks**:
- Yahoo/Google may block scraping
- HTML structure changes break parser
- Slower than API calls
- May violate Terms of Service

### Option B: Indian Market Free APIs
- **NSE India**: https://www.nseindia.com/api/quote-equity?symbol=XXX
- **BSE India**: Free data with registration
- **Groww/Zerodha Kite**: APIs available with brokerage account

### Option C: Manual Price Entry
- Add "Update Price" button in dashboard
- Store last-known prices in database
- User enters prices from broker app
- Best for infrequent trading

### Option D: Upgrade Alpha Vantage
- Premium tier: $49.99/month → 75 requests/minute
- Only needed if real-time monitoring required

## Recommended Approach for Development

1. **Keep current setup** (1-hour cache, no polling)
2. **Use mock/sample prices** for UI testing
3. **Manually refresh** when needed during development
4. **Before production**: Implement scraping OR upgrade Alpha Vantage

## Testing with Current Setup

```bash
npm run dev
# Prices will be cached for 1 hour
# No auto-refresh
# Click refresh manually to fetch new data (counts as 1 API call)
```

## Monitor API Usage

Check Alpha Vantage dashboard: https://www.alphavantage.co/support/#api-key

If hitting limit:
1. Increase `PRICE_CACHE_TTL` to 24 hours
2. Disable price fetching entirely (use mock data)
3. Implement one of the alternatives above
