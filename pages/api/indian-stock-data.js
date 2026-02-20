// API endpoint for fetching Indian stock data from screener.in
import { authenticate } from '../../lib/auth';
import https from 'https';
import * as cheerio from 'cheerio';

// Scrape stock data from screener.in
function scrapeScreenerData(symbol) {
  return new Promise((resolve, reject) => {
    const url = `https://www.screener.in/company/${symbol}/consolidated/`;
    
    https.get(url, (res) => {
      let html = '';
      
      res.on('data', (chunk) => {
        html += chunk;
      });
      
      res.on('end', () => {
        try {
          const $ = cheerio.load(html);
          
          // Extract key financial metrics
          const data = {
            symbol: symbol.toUpperCase(),
            companyName: $('h1').text().trim() || 'N/A',
            currentPrice: $('[data-source="price"] .number').text().trim() || 'N/A',
            marketCap: $('span:contains("Market Cap")').parent().find('.number').text().trim() || 'N/A',
            peRatio: $('span:contains("Stock P/E")').parent().find('.number').text().trim() || 'N/A',
            bookValue: $('span:contains("Book Value")').parent().find('.number').text().trim() || 'N/A',
            dividendYield: $('span:contains("Dividend Yield")').parent().find('.number').text().trim() || 'N/A',
            roe: $('span:contains("ROE")').parent().find('.number').text().trim() || 'N/A',
            debtToEquity: $('span:contains("Debt to equity")').parent().find('.number').text().trim() || 'N/A',
            sales: $('span:contains("Sales")').parent().find('.number').first().text().trim() || 'N/A',
            profit: $('span:contains("Net Profit")').parent().find('.number').first().text().trim() || 'N/A',
            // Extract quarterly results if available
            quarterlyGrowth: $('span:contains("Sales growth")').parent().find('.number').text().trim() || 'N/A',
            profitGrowth: $('span:contains("Profit growth")').parent().find('.number').text().trim() || 'N/A',
            source: 'screener.in'
          };
          
          resolve(data);
        } catch (error) {
          console.error('Error parsing screener.in data:', error);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.error('Error fetching from screener.in:', error);
      reject(error);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Authenticate the request
  const auth = await authenticate(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const { symbol, exchange } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Stock symbol is required' });
  }

  // Check if it's an Indian exchange
  if (!['NSE', 'BSE'].includes(exchange)) {
    return res.status(400).json({ 
      error: 'This endpoint only supports Indian stocks (NSE/BSE). Use Alpha Vantage for other exchanges.' 
    });
  }

  try {
    console.log(`[screener] Fetching data for ${symbol} from screener.in`);
    const stockData = await scrapeScreenerData(symbol);
    
    // If data is not found (empty values), return appropriate error
    if (stockData.companyName === 'N/A' || !stockData.currentPrice || stockData.currentPrice === 'N/A') {
      return res.status(404).json({
        error: `Stock symbol '${symbol}' not found on screener.in. Please verify the symbol.`,
        suggestion: 'Try searching on screener.in directly to get the correct symbol.'
      });
    }
    
    console.log(`[screener] Successfully fetched data for ${symbol}`);
    res.status(200).json({
      success: true,
      data: stockData,
      source: 'screener.in',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[screener] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stock data from screener.in',
      details: error.message 
    });
  }
}