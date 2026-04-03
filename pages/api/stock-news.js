// GET /api/stock-news?symbol=AAPL
// Fetches latest news for a stock symbol
// Uses Alpha Vantage NEWS_SENTIMENT for US stocks, Google News RSS for Indian stocks

import { authenticate } from '../../lib/auth';

const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';

// Simple in-memory cache (15 min TTL)
const newsCache = new Map();
const CACHE_TTL = 15 * 60 * 1000;

function getCachedNews(symbol) {
  const entry = newsCache.get(symbol);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  return null;
}

function setCachedNews(symbol, data) {
  newsCache.set(symbol, { data, timestamp: Date.now() });
  // Evict old entries to prevent memory leaks
  if (newsCache.size > 100) {
    const oldest = [...newsCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    if (oldest) newsCache.delete(oldest[0]);
  }
}

/**
 * Classify sentiment score to label
 */
function classifySentiment(score) {
  if (score === null || score === undefined) return 'Neutral';
  if (score >= 0.15) return 'Bullish';
  if (score <= -0.15) return 'Bearish';
  return 'Neutral';
}

/**
 * Format date string from Alpha Vantage format (20240101T120000)
 */
function formatDate(dateStr) {
  if (!dateStr || dateStr.length < 8) return '';
  try {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Fetch news from Alpha Vantage NEWS_SENTIMENT
 */
async function fetchAlphaVantageNews(symbol) {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) return null;

  try {
    const url = `${ALPHA_VANTAGE_BASE}?function=NEWS_SENTIMENT&tickers=${symbol}&limit=10&apikey=${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();

    if (data['Note']) {
      console.warn('[news] Alpha Vantage rate limit hit');
      return null;
    }

    if (!data.feed || !Array.isArray(data.feed)) return null;

    return data.feed.slice(0, 8).map(item => {
      // Find sentiment specific to requested ticker
      const tickerSentiment = item.ticker_sentiment?.find(
        ts => ts.ticker === symbol
      );
      const sentimentScore = tickerSentiment
        ? parseFloat(tickerSentiment.ticker_sentiment_score)
        : parseFloat(item.overall_sentiment_score) || null;

      return {
        title: item.title,
        url: item.url,
        summary: item.summary ? item.summary.substring(0, 200) + (item.summary.length > 200 ? '...' : '') : '',
        source: item.source || 'Unknown',
        sentiment: classifySentiment(sentimentScore),
        sentimentScore,
        timePublished: formatDate(item.time_published),
        bannerImage: item.banner_image || null,
      };
    });
  } catch (err) {
    console.error('[news] Alpha Vantage news error:', err.message);
    return null;
  }
}

/**
 * Fetch news from Google News RSS (works for any stock, no API key needed)
 */
async function fetchGoogleNews(symbol, companyName) {
  try {
    const query = encodeURIComponent(`${symbol} ${companyName || ''} stock`);
    const url = `https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const xml = await res.text();

    // Simple XML parsing for RSS items
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
      const itemXml = match[1];
      const title = itemXml.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || '';
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || '';
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      const source = itemXml.match(/<source.*?>(.*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || 'Google News';

      if (title && link) {
        items.push({
          title: decodeHTMLEntities(title),
          url: link,
          summary: '',
          source: decodeHTMLEntities(source),
          sentiment: null,
          sentimentScore: null,
          timePublished: pubDate ? new Date(pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
          bannerImage: null,
        });
      }
    }

    return items.length > 0 ? items : null;
  } catch (err) {
    console.error('[news] Google News RSS error:', err.message);
    return null;
  }
}

function decodeHTMLEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const auth = await authenticate(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const { symbol } = req.query;
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  const cleanSymbol = symbol.toUpperCase().trim();

  // Check cache
  const cached = getCachedNews(cleanSymbol);
  if (cached) {
    console.log(`[news] Cache hit for ${cleanSymbol}`);
    return res.status(200).json({ articles: cached, source: 'cache' });
  }

  console.log(`[news] Fetching news for ${cleanSymbol}`);

  // Try Alpha Vantage first (better for US stocks, includes sentiment)
  let articles = await fetchAlphaVantageNews(cleanSymbol);

  // Fallback to Google News RSS (works for all stocks including Indian)
  if (!articles || articles.length === 0) {
    console.log(`[news] Alpha Vantage empty, falling back to Google News for ${cleanSymbol}`);
    articles = await fetchGoogleNews(cleanSymbol);
  }

  if (!articles || articles.length === 0) {
    return res.status(200).json({ articles: [], message: 'No news found' });
  }

  setCachedNews(cleanSymbol, articles);
  return res.status(200).json({ articles, source: 'fresh' });
}
